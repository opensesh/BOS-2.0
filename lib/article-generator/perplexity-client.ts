/**
 * Perplexity API Client for Article Generation
 * Gathers sources and generates content for discover articles
 */

import { generateText } from 'ai';
import { perplexity } from '@ai-sdk/perplexity';

interface SourceInfo {
  id: string;
  name: string;
  url: string;
  favicon: string;
  title?: string;
}

interface GeneratedSection {
  title?: string;
  paragraphs: Array<{
    content: string;
    sourceIds: string[];
  }>;
}

interface ArticleGenerationResult {
  title: string;
  sections: GeneratedSection[];
  allSources: SourceInfo[];
  heroImageUrl?: string;
}

/**
 * Extract domain name from URL for source naming
 */
function getDomainName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'source';
  }
}

/**
 * Get favicon URL for a domain
 */
function getFaviconUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return '';
  }
}

/**
 * Search Perplexity for sources on a topic
 * Returns citations from the search
 */
async function searchForSources(
  topic: string,
  existingUrls: Set<string>
): Promise<{ text: string; sources: SourceInfo[] }> {
  const result = await generateText({
    model: perplexity('sonar-pro'),
    prompt: `Search for the latest comprehensive news and analysis about: "${topic}"
    
    Provide detailed information with specific facts, quotes, and data points.
    Include multiple perspectives and viewpoints from different sources.
    Focus on recent developments and breaking news.`,
  });

  // Extract citations from Perplexity response
  // Access provider metadata (type assertion for Perplexity-specific fields)
  const providerMetadata = (result as { experimental_providerMetadata?: Record<string, unknown> }).experimental_providerMetadata;
  const perplexityData = providerMetadata?.perplexity as {
    citations?: string[];
  } | undefined;
  const citationUrls = perplexityData?.citations || [];

  const sources: SourceInfo[] = [];
  for (const url of citationUrls) {
    if (!existingUrls.has(url)) {
      existingUrls.add(url);
      sources.push({
        id: `source-${sources.length + 1}`,
        name: getDomainName(url),
        url,
        favicon: getFaviconUrl(url),
      });
    }
  }

  return { text: result.text, sources };
}

/**
 * Generate article content with dynamic sections based on topic
 */
async function generateArticleContent(
  topic: string,
  sources: SourceInfo[],
  searchResults: string[]
): Promise<{ sections: GeneratedSection[]; sidebarSections: string[] }> {
  // Build context from search results
  const context = searchResults.join('\n\n---\n\n');
  
  // Create source reference list for the prompt
  const sourceList = sources
    .slice(0, 40)
    .map((s, i) => `[${i + 1}] ${s.name}: ${s.url}`)
    .join('\n');

  const result = await generateText({
    model: perplexity('sonar-pro'),
    prompt: `You are a news synthesizer creating a comprehensive article about: "${topic}"

Based on the following research:
${context}

Available sources for citation (use the numbers in brackets):
${sourceList}

Write a well-structured news article following this EXACT format:

TITLE: [Compelling news headline about ${topic}]

INTRO_PARAGRAPH_1: [First intro paragraph - 3-4 sentences summarizing the main news. End with citation numbers like [1][2][3]]

INTRO_PARAGRAPH_2: [Second intro paragraph - 3-4 sentences with more details. End with citation numbers like [4][5]]

SUBHEADING_1: [A contextually relevant sub-heading based on the topic - NOT generic like "Background"]

SECTION1_PARAGRAPH_1: [First paragraph under subheading 1 - 3-4 sentences. End with citation numbers like [6][7][8]]

SECTION1_PARAGRAPH_2: [Second paragraph under subheading 1 - 3-4 sentences. End with citation numbers like [9][10]]

SUBHEADING_2: [Another contextually relevant sub-heading based on the topic]

SECTION2_PARAGRAPH_1: [First paragraph under subheading 2 - 3-4 sentences. End with citation numbers like [11][12][13]]

SECTION2_PARAGRAPH_2: [Second paragraph under subheading 2 - 3-4 sentences. End with citation numbers like [14][15]]

IMPORTANT:
- Sub-headings must be specific to the topic (e.g., for "AI Legislation": "Regulatory Framework", "Industry Pushback")
- Each paragraph must cite 2-5 DIFFERENT sources using [number] format
- Do NOT reuse the same citation across different paragraphs
- Each paragraph should have UNIQUE sources
- Write in professional news style
- Be factual and specific`,
  });

  // Parse the generated content
  const text = result.text;
  const sections: GeneratedSection[] = [];
  const sidebarSections: string[] = [];

  // Parse intro section
  const intro1Match = text.match(/INTRO_PARAGRAPH_1:\s*([\s\S]*?)(?=INTRO_PARAGRAPH_2:|$)/i);
  const intro2Match = text.match(/INTRO_PARAGRAPH_2:\s*([\s\S]*?)(?=SUBHEADING_1:|$)/i);
  
  const introSection: GeneratedSection = {
    paragraphs: [],
  };

  if (intro1Match) {
    const { content, sourceIds } = extractCitations(intro1Match[1].trim());
    introSection.paragraphs.push({ content, sourceIds });
  }
  if (intro2Match) {
    const { content, sourceIds } = extractCitations(intro2Match[1].trim());
    introSection.paragraphs.push({ content, sourceIds });
  }
  
  if (introSection.paragraphs.length > 0) {
    sections.push(introSection);
  }

  // Parse subheading 1 and its paragraphs
  const subheading1Match = text.match(/SUBHEADING_1:\s*(.*?)(?=SECTION1_PARAGRAPH_1:|$)/i);
  const section1p1Match = text.match(/SECTION1_PARAGRAPH_1:\s*([\s\S]*?)(?=SECTION1_PARAGRAPH_2:|$)/i);
  const section1p2Match = text.match(/SECTION1_PARAGRAPH_2:\s*([\s\S]*?)(?=SUBHEADING_2:|$)/i);

  if (subheading1Match) {
    const title = subheading1Match[1].trim().replace(/^\[|\]$/g, '');
    sidebarSections.push(title);
    
    const section1: GeneratedSection = {
      title,
      paragraphs: [],
    };

    if (section1p1Match) {
      const { content, sourceIds } = extractCitations(section1p1Match[1].trim());
      section1.paragraphs.push({ content, sourceIds });
    }
    if (section1p2Match) {
      const { content, sourceIds } = extractCitations(section1p2Match[1].trim());
      section1.paragraphs.push({ content, sourceIds });
    }

    if (section1.paragraphs.length > 0) {
      sections.push(section1);
    }
  }

  // Parse subheading 2 and its paragraphs
  const subheading2Match = text.match(/SUBHEADING_2:\s*(.*?)(?=SECTION2_PARAGRAPH_1:|$)/i);
  const section2p1Match = text.match(/SECTION2_PARAGRAPH_1:\s*([\s\S]*?)(?=SECTION2_PARAGRAPH_2:|$)/i);
  const section2p2Match = text.match(/SECTION2_PARAGRAPH_2:\s*([\s\S]*?)$/i);

  if (subheading2Match) {
    const title = subheading2Match[1].trim().replace(/^\[|\]$/g, '');
    sidebarSections.push(title);
    
    const section2: GeneratedSection = {
      title,
      paragraphs: [],
    };

    if (section2p1Match) {
      const { content, sourceIds } = extractCitations(section2p1Match[1].trim());
      section2.paragraphs.push({ content, sourceIds });
    }
    if (section2p2Match) {
      const { content, sourceIds } = extractCitations(section2p2Match[1].trim());
      section2.paragraphs.push({ content, sourceIds });
    }

    if (section2.paragraphs.length > 0) {
      sections.push(section2);
    }
  }

  return { sections, sidebarSections };
}

/**
 * Extract citation numbers from text and clean the content
 */
function extractCitations(text: string): { content: string; sourceIds: string[] } {
  const citationPattern = /\[(\d+)\]/g;
  const sourceIds: string[] = [];
  let match;

  while ((match = citationPattern.exec(text)) !== null) {
    const id = `source-${match[1]}`;
    if (!sourceIds.includes(id)) {
      sourceIds.push(id);
    }
  }

  const content = text.replace(citationPattern, '').trim();
  return { content, sourceIds };
}

/**
 * Generate a complete discover article for a topic
 */
export async function generateDiscoverArticle(
  topic: string,
  seedSources: Array<{ name: string; url: string }> = []
): Promise<ArticleGenerationResult> {
  console.log(`Generating article for: "${topic}"`);
  
  const allSources: SourceInfo[] = [];
  const existingUrls = new Set<string>();
  const searchResults: string[] = [];

  // Add seed sources
  for (const seed of seedSources) {
    if (!existingUrls.has(seed.url)) {
      existingUrls.add(seed.url);
      allSources.push({
        id: `source-${allSources.length + 1}`,
        name: seed.name,
        url: seed.url,
        favicon: getFaviconUrl(seed.url),
      });
    }
  }

  // Run multiple searches to gather 40+ sources
  const searchQueries = [
    topic,
    `${topic} latest news analysis`,
    `${topic} industry reaction`,
    `${topic} expert opinion`,
  ];

  for (const query of searchQueries) {
    try {
      console.log(`  Searching: ${query}`);
      const result = await searchForSources(query, existingUrls);
      
      // Re-ID sources to ensure uniqueness
      for (const source of result.sources) {
        source.id = `source-${allSources.length + 1}`;
        allSources.push(source);
      }
      
      searchResults.push(result.text);
      
      // Stop if we have enough sources
      if (allSources.length >= 40) {
        console.log(`  Reached ${allSources.length} sources, stopping search`);
        break;
      }
    } catch (error) {
      console.warn(`  Search failed for "${query}":`, error);
    }
  }

  console.log(`  Total sources gathered: ${allSources.length}`);

  // Generate article content
  const { sections, sidebarSections } = await generateArticleContent(
    topic,
    allSources,
    searchResults
  );

  // Extract title from topic or generate one
  const titleMatch = searchResults[0]?.match(/^#\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1] : topic;

  return {
    title,
    sections,
    allSources,
    heroImageUrl: undefined, // Could be enhanced to find images
  };
}

