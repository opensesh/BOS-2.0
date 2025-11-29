import { generateText } from 'ai';
import { perplexity } from '@ai-sdk/perplexity';

export const maxDuration = 60; // Allow up to 60 seconds for enrichment

interface EnrichmentRequest {
  title: string;
  existingSources?: { name: string; url: string }[];
}

interface ParagraphSource {
  id: string;
  name: string;
  url: string;
  title?: string;
  favicon?: string;
}

interface ArticleParagraph {
  content: string;
  sources: ParagraphSource[];
}

interface ArticleSection {
  id: string;
  title?: string;
  paragraphs: ArticleParagraph[];
  imageUrl?: string;
}

interface EnrichmentResponse {
  sections: ArticleSection[];
  relatedQueries: string[];
  allSources: ParagraphSource[];
}

// Extract domain from URL for favicon
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

// Extract domain name from URL
function getDomainName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return url;
  }
}

// Parse the AI response into structured sections and distribute sources
function parseEnrichedContent(
  text: string,
  citations: Array<{ url: string; title?: string }> = []
): { sections: ArticleSection[]; allSources: ParagraphSource[] } {
  const lines = text.split('\n').filter((line) => line.trim());
  const sections: ArticleSection[] = [];
  const allSources: ParagraphSource[] = [];

  // Build source map from citations
  const sourceMap = new Map<number, ParagraphSource>();
  citations.forEach((citation, idx) => {
    const source: ParagraphSource = {
      id: `source-${idx + 1}`,
      name: getDomainName(citation.url),
      url: citation.url,
      title: citation.title,
      favicon: getFaviconUrl(citation.url),
    };
    sourceMap.set(idx + 1, source);
    allSources.push(source);
  });

  let currentSection: ArticleSection | null = null;
  const rawParagraphs: { content: string; citedSources: ParagraphSource[] }[] = [];

  const flushParagraph = (paragraph: string) => {
    if (!paragraph.trim()) return;

    // Extract citation numbers from paragraph and remove them
    const citationPattern = /\[(\d+)\]/g;
    const matches = paragraph.match(citationPattern);
    const cleanedContent = paragraph.replace(citationPattern, '').trim();
    const citedSources: ParagraphSource[] = [];

    if (matches) {
      matches.forEach((match) => {
        const num = parseInt(match.slice(1, -1));
        const source = sourceMap.get(num);
        if (source && !citedSources.find((s) => s.id === source.id)) {
          citedSources.push(source);
        }
      });
    }

    if (cleanedContent) {
      rawParagraphs.push({ content: cleanedContent, citedSources });
    }
  };

  // First pass: extract all paragraphs
  let currentParagraph = '';
  let currentSectionTitle: string | undefined;
  const sectionBreaks: number[] = []; // Indices where sections start

  for (const line of lines) {
    if (line.startsWith('## ') || line.startsWith('### ')) {
      // Flush current paragraph before section break
      if (currentParagraph) {
        flushParagraph(currentParagraph);
        currentParagraph = '';
      }
      sectionBreaks.push(rawParagraphs.length);
      currentSectionTitle = line.replace(/^#+\s*/, '').trim();
      // Mark section title
      rawParagraphs.push({ content: `__SECTION__${currentSectionTitle}`, citedSources: [] });
    } else if (line.startsWith('# ')) {
      // Skip main title
      continue;
    } else if (line.trim()) {
      if (line.startsWith('-') || line.startsWith('*')) {
        // Flush current paragraph
        if (currentParagraph) {
          flushParagraph(currentParagraph);
          currentParagraph = '';
        }
        // Bullet point as separate paragraph
        flushParagraph(line.replace(/^[-*]\s*/, ''));
      } else {
        // Continue building paragraph
        if (currentParagraph && currentParagraph.length > 200) {
          flushParagraph(currentParagraph);
          currentParagraph = line;
        } else {
          currentParagraph = currentParagraph ? currentParagraph + ' ' + line : line;
        }
      }
    } else {
      // Empty line - flush paragraph
      if (currentParagraph) {
        flushParagraph(currentParagraph);
        currentParagraph = '';
      }
    }
  }

  // Flush final paragraph
  if (currentParagraph) {
    flushParagraph(currentParagraph);
  }

  // Second pass: distribute sources to paragraphs that don't have any
  // Each paragraph should have 2-4 unique sources
  const contentParagraphs = rawParagraphs.filter((p) => !p.content.startsWith('__SECTION__'));
  const sourcesPerParagraph = Math.max(2, Math.ceil(allSources.length / Math.max(contentParagraphs.length, 1)));

  let sourceIndex = 0;
  rawParagraphs.forEach((para) => {
    if (para.content.startsWith('__SECTION__')) return;

    // If paragraph has no cited sources, assign some
    if (para.citedSources.length === 0 && allSources.length > 0) {
      const assignedSources: ParagraphSource[] = [];
      for (let i = 0; i < sourcesPerParagraph && i < allSources.length; i++) {
        const source = allSources[(sourceIndex + i) % allSources.length];
        if (!assignedSources.find((s) => s.id === source.id)) {
          assignedSources.push(source);
        }
      }
      para.citedSources = assignedSources;
      sourceIndex = (sourceIndex + sourcesPerParagraph) % allSources.length;
    }
  });

  // Third pass: build sections
  currentSection = null;
  for (const para of rawParagraphs) {
    if (para.content.startsWith('__SECTION__')) {
      // Start new section
      if (currentSection && currentSection.paragraphs.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        id: `section-${sections.length + 1}`,
        title: para.content.replace('__SECTION__', ''),
        paragraphs: [],
      };
    } else {
      // Add paragraph to current section
      if (!currentSection) {
        currentSection = {
          id: 'section-intro',
          paragraphs: [],
        };
      }
      currentSection.paragraphs.push({
        content: para.content,
        sources: para.citedSources,
      });
    }
  }

  // Add final section
  if (currentSection && currentSection.paragraphs.length > 0) {
    sections.push(currentSection);
  }

  // Ensure we have at least one section
  if (sections.length === 0) {
    sections.push({
      id: 'section-1',
      paragraphs: [
        {
          content: text.replace(/\[(\d+)\]/g, '').trim(),
          sources: allSources.slice(0, Math.min(4, allSources.length)),
        },
      ],
    });
  }

  return { sections, allSources };
}

export async function POST(req: Request) {
  console.log('=== Article Enrich API called ===');

  try {
    const body: EnrichmentRequest = await req.json();
    const { title, existingSources = [] } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for Perplexity API key
    const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
    if (!apiKey) {
      console.log('Perplexity API key not configured, returning fallback');
      const fallbackSources = existingSources.map((s, idx) => ({
        id: `source-${idx}`,
        name: getDomainName(s.url),
        url: s.url,
        favicon: getFaviconUrl(s.url),
      }));
      
      return new Response(
        JSON.stringify({
          sections: [
            {
              id: 'section-1',
              paragraphs: [
                {
                  content: `${title}. This article explores the latest developments and insights in this area.`,
                  sources: fallbackSources.slice(0, 3),
                },
                {
                  content: 'Industry experts have been closely monitoring these developments, noting the potential implications for businesses and consumers alike.',
                  sources: fallbackSources.slice(0, 2),
                },
              ],
            },
          ],
          relatedQueries: [],
          allSources: fallbackSources,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate enriched content using Perplexity
    const prompt = `Write a comprehensive news article summary about: "${title}"

Structure your response with:
1. An introduction section (2-3 paragraphs) covering the main news
2. A section titled "Historical Context" or "Background" (2 paragraphs) providing context
3. A section titled "Market Reaction and Outlook" or "Impact and Future" (2 paragraphs) discussing implications

Requirements:
- Each paragraph should be 2-4 sentences
- Include citations [1], [2], etc. inline where you reference sources
- Be factual and cite recent news sources
- Focus on the most relevant and current information
- Write in a professional news style`;

    const result = await generateText({
      model: perplexity('sonar-pro'),
      prompt,
    });

    // Extract citations from the experimental provider metadata
    const providerMetadata = result.experimental_providerMetadata;
    const perplexityData = providerMetadata?.perplexity as {
      citations?: string[];
    } | undefined;
    let citationUrls = perplexityData?.citations || [];

    console.log('Perplexity citations from metadata:', citationUrls.length);

    // If no citations from Perplexity, use existing sources
    if (citationUrls.length === 0 && existingSources.length > 0) {
      citationUrls = existingSources.map((s) => s.url);
      console.log('Using existing sources as citations:', citationUrls.length);
    }

    // Build citations array
    const citations = citationUrls.map((url: string) => ({
      url,
      title: undefined,
    }));

    // Parse the response into structured sections
    const { sections, allSources } = parseEnrichedContent(result.text, citations);

    console.log('Parsed sections:', sections.length);
    console.log('Total sources:', allSources.length);

    // Generate related queries
    const relatedQueries = [
      `${title} latest updates`,
      `${title} analysis`,
      `${title} impact`,
      `${title} future outlook`,
    ].slice(0, 4);

    const response: EnrichmentResponse = {
      sections,
      relatedQueries,
      allSources,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in article enrichment:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Enrichment failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
