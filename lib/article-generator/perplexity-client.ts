/**
 * Perplexity API Client for Article Generation
 * Gathers sources and generates content for discover articles
 * 
 * Uses direct Perplexity API calls for reliability in script environments.
 * 
 * Structure: 6 paragraphs total
 * - Intro: 2 paragraphs (no title)
 * - Section 1: subheading + 2 paragraphs
 * - Section 2: subheading + 2 paragraphs
 */

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

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
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
 * Call Perplexity API directly
 * @param prompt - User prompt
 * @param systemPrompt - Optional system prompt
 * @param model - Model to use: 'sonar' (cheaper) or 'sonar-pro' (better quality)
 * @param maxTokens - Maximum output tokens
 */
async function callPerplexity(
  prompt: string,
  systemPrompt?: string,
  model: string = 'sonar-pro',
  maxTokens: number = 2500
): Promise<{ text: string; citations: string[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not set');
  }
  
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      return_citations: true,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText.substring(0, 200)}`);
  }
  
  const data: PerplexityResponse = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const citations = data.citations || [];
  
  return { text, citations };
}

/**
 * Search Perplexity for sources on a topic (uses cheaper 'sonar' model)
 * Returns citations from the search
 */
async function searchForSources(
  topic: string,
  existingUrls: Set<string>
): Promise<{ text: string; sources: SourceInfo[] }> {
  // Use cheaper 'sonar' model for source discovery
  const { text, citations } = await callPerplexity(
    `Search for the latest comprehensive news and analysis about: "${topic}"
    
    Provide detailed information with specific facts, quotes, and data points.
    Include multiple perspectives and viewpoints from different sources.
    Focus on recent developments and breaking news.
    
    IMPORTANT: Cite as many different sources as possible (aim for 10+ unique sources).
    Include mainstream news outlets, tech publications, industry blogs, and expert analysis.
    Every claim should be cited with [number] format.`,
    undefined,
    'sonar', // Use cheaper model for searches
    2000  // Increased token limit for more sources
  );

  const sources: SourceInfo[] = [];
  for (const url of citations) {
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

  return { text, sources };
}

/**
 * The article generation prompt - structured for reliable parsing
 */
const ARTICLE_GENERATION_PROMPT = `You are a professional news writer creating a well-researched article. Follow this EXACT structure with clear section markers.

OUTPUT FORMAT (use these exact markers):
===TITLE===
[Write a compelling headline]

===INTRO_P1===
[Write 3-4 sentences summarizing the main news. Include specific facts and context.]
SOURCES: [1][2][3]

===INTRO_P2===
[Write 3-4 sentences with additional key details and implications.]
SOURCES: [4][5]

===SECTION1_TITLE===
[Write a specific subheading relevant to this topic - NOT generic like "Background" or "Details"]

===SECTION1_P1===
[Write 3-4 sentences exploring this aspect of the story. Include quotes or data if available.]
SOURCES: [6][7][8]

===SECTION1_P2===
[Write 3-4 sentences continuing the analysis with different information.]
SOURCES: [9][10]

===SECTION2_TITLE===
[Write another specific subheading for a different angle on the topic]

===SECTION2_P1===
[Write 3-4 sentences covering this aspect. Include expert opinions or reactions.]
SOURCES: [11][12][13]

===SECTION2_P2===
[Write 3-4 sentences wrapping up this section with forward-looking insights.]
SOURCES: [14][15]

CRITICAL RULES:
- Each paragraph MUST have 3-4 complete sentences
- Each paragraph MUST cite 2-5 DIFFERENT sources using [number] format
- NEVER reuse the same source number in different paragraphs
- Subheadings must be specific to the topic content, not generic
- Write in professional, clear news style
- Be factual and avoid speculation`;

/**
 * Generate article content with robust parsing
 */
async function generateArticleContent(
  topic: string,
  sources: SourceInfo[],
  searchResults: string[]
): Promise<{ sections: GeneratedSection[]; sidebarSections: string[]; title: string }> {
  // Build context from search results
  const context = searchResults.slice(0, 3).join('\n\n---\n\n'); // Limit context to save tokens
  
  // Create source reference list for the prompt
  const sourceList = sources
    .slice(0, 40)
    .map((s, i) => `[${i + 1}] ${s.name}: ${s.url}`)
    .join('\n');

  const prompt = `Write a comprehensive article about: "${topic}"

RESEARCH CONTEXT:
${context}

AVAILABLE SOURCES (cite by number):
${sourceList}

${ARTICLE_GENERATION_PROMPT}`;

  const { text } = await callPerplexity(
    prompt,
    'You are a professional journalist who writes clear, well-sourced articles. Always follow the exact output format requested.',
    'sonar-pro',
    2500
  );

  // Parse the generated content with robust regex patterns
  const result = parseArticleContent(text);
  
  return result;
}

/**
 * Robust parser for the generated article content
 * Handles various formats and edge cases
 */
function parseArticleContent(text: string): { sections: GeneratedSection[]; sidebarSections: string[]; title: string } {
  const sections: GeneratedSection[] = [];
  const sidebarSections: string[] = [];
  
  // Extract title
  const titleMatch = text.match(/===TITLE===\s*([\s\S]*?)(?====|$)/i) ||
                     text.match(/TITLE:\s*([\s\S]*?)(?=\n===|\n\n)/i);
  const title = titleMatch ? cleanText(titleMatch[1]) : 'News Update';

  // Parse intro paragraphs
  const intro1Match = text.match(/===INTRO_P1===\s*([\s\S]*?)(?=SOURCES:|===|$)/i);
  const intro1Sources = text.match(/===INTRO_P1===[\s\S]*?SOURCES:\s*(\[[\d\]\[]+)/i);
  
  const intro2Match = text.match(/===INTRO_P2===\s*([\s\S]*?)(?=SOURCES:|===|$)/i);
  const intro2Sources = text.match(/===INTRO_P2===[\s\S]*?SOURCES:\s*(\[[\d\]\[]+)/i);

  const introSection: GeneratedSection = { paragraphs: [] };
  
  if (intro1Match) {
    const content = cleanText(intro1Match[1]);
    const sourceIds = extractSourceIds(intro1Sources ? intro1Sources[1] : intro1Match[1]);
    if (content.length > 50) {
      introSection.paragraphs.push({ content, sourceIds });
    }
  }
  
  if (intro2Match) {
    const content = cleanText(intro2Match[1]);
    const sourceIds = extractSourceIds(intro2Sources ? intro2Sources[1] : intro2Match[1]);
    if (content.length > 50) {
      introSection.paragraphs.push({ content, sourceIds });
    }
  }
  
  if (introSection.paragraphs.length > 0) {
    sections.push(introSection);
  }

  // Parse Section 1
  const section1Title = text.match(/===SECTION1_TITLE===\s*([\s\S]*?)(?====|$)/i);
  const section1P1 = text.match(/===SECTION1_P1===\s*([\s\S]*?)(?=SOURCES:|===|$)/i);
  const section1P1Sources = text.match(/===SECTION1_P1===[\s\S]*?SOURCES:\s*(\[[\d\]\[]+)/i);
  const section1P2 = text.match(/===SECTION1_P2===\s*([\s\S]*?)(?=SOURCES:|===|$)/i);
  const section1P2Sources = text.match(/===SECTION1_P2===[\s\S]*?SOURCES:\s*(\[[\d\]\[]+)/i);

  if (section1Title) {
    const title = cleanText(section1Title[1]);
    if (title.length > 3) {
      sidebarSections.push(title);
      const section1: GeneratedSection = { title, paragraphs: [] };
      
      if (section1P1) {
        const content = cleanText(section1P1[1]);
        const sourceIds = extractSourceIds(section1P1Sources ? section1P1Sources[1] : section1P1[1]);
        if (content.length > 50) {
          section1.paragraphs.push({ content, sourceIds });
        }
      }
      
      if (section1P2) {
        const content = cleanText(section1P2[1]);
        const sourceIds = extractSourceIds(section1P2Sources ? section1P2Sources[1] : section1P2[1]);
        if (content.length > 50) {
          section1.paragraphs.push({ content, sourceIds });
        }
      }
      
      if (section1.paragraphs.length > 0) {
        sections.push(section1);
      }
    }
  }

  // Parse Section 2
  const section2Title = text.match(/===SECTION2_TITLE===\s*([\s\S]*?)(?====|$)/i);
  const section2P1 = text.match(/===SECTION2_P1===\s*([\s\S]*?)(?=SOURCES:|===|$)/i);
  const section2P1Sources = text.match(/===SECTION2_P1===[\s\S]*?SOURCES:\s*(\[[\d\]\[]+)/i);
  const section2P2 = text.match(/===SECTION2_P2===\s*([\s\S]*?)(?=SOURCES:|===|$)/i);
  const section2P2Sources = text.match(/===SECTION2_P2===[\s\S]*?SOURCES:\s*(\[[\d\]\[]+)/i);

  if (section2Title) {
    const title = cleanText(section2Title[1]);
    if (title.length > 3) {
      sidebarSections.push(title);
      const section2: GeneratedSection = { title, paragraphs: [] };
      
      if (section2P1) {
        const content = cleanText(section2P1[1]);
        const sourceIds = extractSourceIds(section2P1Sources ? section2P1Sources[1] : section2P1[1]);
        if (content.length > 50) {
          section2.paragraphs.push({ content, sourceIds });
        }
      }
      
      if (section2P2) {
        const content = cleanText(section2P2[1]);
        const sourceIds = extractSourceIds(section2P2Sources ? section2P2Sources[1] : section2P2[1]);
        if (content.length > 50) {
          section2.paragraphs.push({ content, sourceIds });
        }
      }
      
      if (section2.paragraphs.length > 0) {
        sections.push(section2);
      }
    }
  }

  // Fallback parsing if structured markers didn't work
  if (sections.length === 0 || getTotalParagraphs(sections) < 4) {
    console.log('  ⚠️ Structured parsing failed, attempting fallback parsing...');
    return fallbackParsing(text, title);
  }

  return { sections, sidebarSections, title };
}

/**
 * Fallback parsing for when structured markers aren't present
 * Attempts to extract content from unstructured text
 */
function fallbackParsing(text: string, defaultTitle: string): { sections: GeneratedSection[]; sidebarSections: string[]; title: string } {
  const sections: GeneratedSection[] = [];
  const sidebarSections: string[] = [];
  
  // Try to extract title from various formats
  const titlePatterns = [
    /^#\s*(.+)$/m,
    /^##\s*(.+)$/m,
    /TITLE:\s*(.+)$/mi,
    /^\*\*(.+)\*\*$/m,
  ];
  
  let title = defaultTitle;
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      title = cleanText(match[1]);
      break;
    }
  }

  // Split text into paragraphs and extract citations
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 100 && !p.startsWith('===') && !p.startsWith('SOURCES:'));

  if (paragraphs.length >= 4) {
    // Create intro section with first 2 paragraphs
    const introSection: GeneratedSection = {
      paragraphs: paragraphs.slice(0, 2).map((p, idx) => ({
        content: cleanText(p.replace(/\[\d+\]/g, '')),
        sourceIds: extractSourceIds(p) || generateFallbackSourceIds(idx * 2, 3),
      })),
    };
    sections.push(introSection);

    // Create section 1 with next 2 paragraphs
    if (paragraphs.length >= 4) {
      const section1: GeneratedSection = {
        title: 'Key Developments',
        paragraphs: paragraphs.slice(2, 4).map((p, idx) => ({
          content: cleanText(p.replace(/\[\d+\]/g, '')),
          sourceIds: extractSourceIds(p) || generateFallbackSourceIds(4 + idx * 2, 3),
        })),
      };
      sections.push(section1);
      sidebarSections.push('Key Developments');
    }

    // Create section 2 with remaining paragraphs
    if (paragraphs.length >= 6) {
      const section2: GeneratedSection = {
        title: 'Looking Ahead',
        paragraphs: paragraphs.slice(4, 6).map((p, idx) => ({
          content: cleanText(p.replace(/\[\d+\]/g, '')),
          sourceIds: extractSourceIds(p) || generateFallbackSourceIds(8 + idx * 2, 3),
        })),
      };
      sections.push(section2);
      sidebarSections.push('Looking Ahead');
    }
  }

  return { sections, sidebarSections, title };
}

/**
 * Clean text by removing markers, extra whitespace, and formatting
 */
function cleanText(text: string): string {
  return text
    .replace(/===\w+===\s*/gi, '')
    .replace(/SOURCES:\s*\[[\d\]\[]+\s*/gi, '')
    .replace(/\[\d+\]\s*/g, '')
    .replace(/^\[|\]$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract source IDs from text containing [number] citations
 */
function extractSourceIds(text: string): string[] {
  if (!text) return [];
  
  const citationPattern = /\[(\d+)\]/g;
  const sourceIds: string[] = [];
  let match;

  while ((match = citationPattern.exec(text)) !== null) {
    const id = `source-${match[1]}`;
    if (!sourceIds.includes(id)) {
      sourceIds.push(id);
    }
  }

  return sourceIds;
}

/**
 * Generate fallback source IDs when parsing fails
 */
function generateFallbackSourceIds(startIndex: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `source-${startIndex + i + 1}`);
}

/**
 * Count total paragraphs across all sections
 */
function getTotalParagraphs(sections: GeneratedSection[]): number {
  return sections.reduce((sum, section) => sum + section.paragraphs.length, 0);
}

/**
 * Validate article has minimum required content
 */
function validateArticle(sections: GeneratedSection[]): boolean {
  const totalParagraphs = getTotalParagraphs(sections);
  const hasSections = sections.length >= 2;
  const hasEnoughContent = totalParagraphs >= 4;
  
  return hasSections && hasEnoughContent;
}

/**
 * Generate a complete discover article for a topic
 */
export async function generateDiscoverArticle(
  topic: string,
  seedSources: Array<{ name: string; url: string; thumbnailUrl?: string }> = []
): Promise<ArticleGenerationResult> {
  console.log(`Generating article for: "${topic}"`);
  
  const allSources: SourceInfo[] = [];
  const existingUrls = new Set<string>();
  const searchResults: string[] = [];

  // Add seed sources first
  for (const seed of seedSources) {
    if (!existingUrls.has(seed.url)) {
      existingUrls.add(seed.url);
      allSources.push({
        id: `source-${allSources.length + 1}`,
        name: seed.name,
        url: seed.url,
        favicon: getFaviconUrl(seed.url),
        title: topic,
      });
    }
  }

  // Run searches to gather more sources (using cheaper 'sonar' model)
  // Multiple queries to get diverse sources from different angles
  const searchQueries = [
    topic,
    `${topic} latest news today`,
    `${topic} analysis opinions`,
    `${topic} impact implications`,
    `${topic} expert commentary`,
    `${topic} industry reaction`,
  ];

  for (const query of searchQueries) {
    try {
      console.log(`  Searching: ${query}`);
      const result = await searchForSources(query, existingUrls);
      
      // Re-ID sources to ensure sequential IDs
      for (const source of result.sources) {
        source.id = `source-${allSources.length + 1}`;
        allSources.push(source);
      }
      
      searchResults.push(result.text);
      
      // Target 40+ sources for comprehensive coverage
      if (allSources.length >= 40) {
        console.log(`  Reached ${allSources.length} sources, stopping search`);
        break;
      }
      
      // Small delay between API calls
      await new Promise(r => setTimeout(r, 300));
    } catch (error) {
      console.warn(`  Search failed for "${query}":`, error);
    }
  }

  console.log(`  Total sources gathered: ${allSources.length}`);

  if (allSources.length < 5) {
    throw new Error(`Only gathered ${allSources.length} sources - not enough for a rich article`);
  }

  // Generate article content using sonar-pro
  const { sections, sidebarSections, title } = await generateArticleContent(
    topic,
    allSources,
    searchResults
  );

  // Validate the generated content
  if (!validateArticle(sections)) {
    console.warn(`  ⚠️ Article validation failed: ${sections.length} sections, ${getTotalParagraphs(sections)} paragraphs`);
    throw new Error('Generated article does not meet minimum content requirements');
  }

  console.log(`  ✓ Generated ${sections.length} sections with ${getTotalParagraphs(sections)} paragraphs`);

  // Find a hero image from seed sources
  let heroImageUrl: string | undefined;
  for (const seed of seedSources) {
    if (seed.thumbnailUrl) {
      heroImageUrl = seed.thumbnailUrl;
      break;
    }
  }

  return {
    title: title || topic,
    sections,
    allSources,
    heroImageUrl,
  };
}


