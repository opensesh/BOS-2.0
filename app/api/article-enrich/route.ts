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

// Parse the AI response into structured sections
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
  let currentParagraph = '';
  let paragraphSources: ParagraphSource[] = [];

  const flushParagraph = () => {
    if (currentParagraph.trim() && currentSection) {
      // Extract citation numbers from paragraph and remove them
      const citationPattern = /\[(\d+)\]/g;
      const matches = currentParagraph.match(citationPattern);
      const cleanedContent = currentParagraph.replace(citationPattern, '').trim();

      if (matches) {
        matches.forEach((match) => {
          const num = parseInt(match.slice(1, -1));
          const source = sourceMap.get(num);
          if (source && !paragraphSources.find((s) => s.id === source.id)) {
            paragraphSources.push(source);
          }
        });
      }

      if (cleanedContent) {
        currentSection.paragraphs.push({
          content: cleanedContent,
          sources: paragraphSources.length > 0 ? [...paragraphSources] : [],
        });
      }
      currentParagraph = '';
      paragraphSources = [];
    }
  };

  const flushSection = () => {
    flushParagraph();
    if (currentSection && currentSection.paragraphs.length > 0) {
      sections.push(currentSection);
    }
  };

  for (const line of lines) {
    // Check for section headers (## or ###)
    if (line.startsWith('## ') || line.startsWith('### ')) {
      flushSection();
      currentSection = {
        id: `section-${sections.length + 1}`,
        title: line.replace(/^#+\s*/, '').trim(),
        paragraphs: [],
      };
    } else if (line.startsWith('# ')) {
      // Skip main title
      continue;
    } else if (line.trim()) {
      // Regular paragraph content
      if (!currentSection) {
        currentSection = {
          id: 'section-intro',
          paragraphs: [],
        };
      }

      // Check if this continues the current paragraph or starts a new one
      if (currentParagraph && !line.startsWith('-') && !line.startsWith('*')) {
        // If line is short, likely a new paragraph
        if (currentParagraph.length > 200) {
          flushParagraph();
        }
        currentParagraph += ' ' + line;
      } else if (line.startsWith('-') || line.startsWith('*')) {
        // Bullet points - treat each as a mini-paragraph
        flushParagraph();
        currentParagraph = line.replace(/^[-*]\s*/, '');
        flushParagraph();
      } else {
        currentParagraph = line;
      }
    } else {
      // Empty line - flush current paragraph
      flushParagraph();
    }
  }

  flushSection();

  // Ensure we have at least one section
  if (sections.length === 0) {
    sections.push({
      id: 'section-1',
      paragraphs: [
        {
          content: text.replace(/\[(\d+)\]/g, '').trim(),
          sources: allSources.slice(0, 3),
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
      return new Response(
        JSON.stringify({
          sections: [
            {
              id: 'section-1',
              paragraphs: [
                {
                  content: `${title}. This article explores the latest developments and insights in this area.`,
                  sources: existingSources.map((s, idx) => ({
                    id: `source-${idx}`,
                    name: getDomainName(s.url),
                    url: s.url,
                    favicon: getFaviconUrl(s.url),
                  })),
                },
              ],
            },
          ],
          relatedQueries: [],
          allSources: existingSources.map((s, idx) => ({
            id: `source-${idx}`,
            name: getDomainName(s.url),
            url: s.url,
            favicon: getFaviconUrl(s.url),
          })),
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
    // Perplexity returns sources in the response metadata
    const providerMetadata = result.experimental_providerMetadata;
    const perplexityData = providerMetadata?.perplexity as {
      citations?: string[];
    } | undefined;
    const citationUrls = perplexityData?.citations || [];

    // Build citations array
    const citations = citationUrls.map((url: string) => ({
      url,
      title: undefined,
    }));

    // Parse the response into structured sections
    const { sections, allSources } = parseEnrichedContent(result.text, citations);

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

