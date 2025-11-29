/**
 * Discover Article Generator
 * Main entry point for generating pre-built discover articles
 */

import { getTopicsForGeneration } from './rss-fetcher';
import { generateDiscoverArticle } from './perplexity-client';
import type {
  DiscoverArticle,
  DiscoverSection,
  DiscoverParagraph,
  CitationChip,
  SourceCard,
  DiscoverArticleManifest,
} from '@/types';

/**
 * Generate a URL-safe slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

/**
 * Distribute sources into citation chips for paragraphs
 * Ensures each paragraph gets unique sources not used elsewhere
 */
function distributeSourcesToChips(
  paragraphSourceIds: string[],
  allSources: Array<{ id: string; name: string; url: string; favicon: string }>
): CitationChip[] {
  const chips: CitationChip[] = [];
  const usedSources = paragraphSourceIds
    .map(id => allSources.find(s => s.id === id))
    .filter((s): s is typeof allSources[0] => s !== undefined);

  if (usedSources.length === 0) {
    // Fallback: assign some sources if none were found
    const fallbackSources = allSources.slice(0, 3);
    if (fallbackSources.length > 0) {
      chips.push({
        primarySource: fallbackSources[0],
        additionalCount: fallbackSources.length - 1,
        additionalSources: fallbackSources.slice(1),
      });
    }
    return chips;
  }

  // Group sources into 1-2 chips per paragraph
  // Primary source + additional sources
  const primarySource = usedSources[0];
  const additionalSources = usedSources.slice(1);

  chips.push({
    primarySource,
    additionalCount: additionalSources.length,
    additionalSources,
  });

  // If we have many sources (5+), create a second chip
  if (usedSources.length >= 5) {
    const secondGroup = additionalSources.slice(2);
    if (secondGroup.length > 0) {
      chips.push({
        primarySource: secondGroup[0],
        additionalCount: secondGroup.length - 1,
        additionalSources: secondGroup.slice(1),
      });
    }
  }

  return chips;
}

/**
 * Build source cards for horizontal scroll display
 */
function buildSourceCards(
  allSources: Array<{ id: string; name: string; url: string; favicon: string; title?: string }>
): SourceCard[] {
  return allSources.slice(0, 6).map(source => ({
    id: source.id,
    name: source.name,
    url: source.url,
    favicon: source.favicon,
    title: source.title || source.name,
    imageUrl: undefined, // Could fetch OG images
  }));
}

/**
 * Transform generated content into the DiscoverArticle format
 */
function buildDiscoverArticle(
  topic: string,
  generatedResult: Awaited<ReturnType<typeof generateDiscoverArticle>>
): DiscoverArticle {
  const { title, sections: rawSections, allSources, heroImageUrl } = generatedResult;
  const slug = generateSlug(title);
  const now = new Date().toISOString();

  // Track used sources to ensure uniqueness across paragraphs
  const usedSourceIds = new Set<string>();

  // Transform sections
  const sections: DiscoverSection[] = rawSections.map((rawSection, sectionIdx) => {
    const paragraphs: DiscoverParagraph[] = rawSection.paragraphs.map((rawPara, paraIdx) => {
      // Filter to only unused sources for this paragraph
      const availableSourceIds = rawPara.sourceIds.filter(id => !usedSourceIds.has(id));
      
      // If no unique sources, use the original (better than nothing)
      const sourceIdsToUse = availableSourceIds.length > 0 
        ? availableSourceIds 
        : rawPara.sourceIds;

      // Mark sources as used
      sourceIdsToUse.forEach(id => usedSourceIds.add(id));

      // Build citation chips
      const citations = distributeSourcesToChips(sourceIdsToUse, allSources);

      return {
        id: `para-${sectionIdx}-${paraIdx}`,
        content: rawPara.content,
        citations,
      };
    });

    return {
      id: `section-${sectionIdx}`,
      title: rawSection.title,
      paragraphs,
    };
  });

  // Build sidebar sections (sub-heading titles)
  const sidebarSections = sections
    .filter(s => s.title)
    .map(s => s.title!);

  return {
    id: `article-${Date.now()}`,
    slug,
    title,
    publishedAt: now,
    generatedAt: now,
    totalSources: allSources.length,
    sections,
    sourceCards: buildSourceCards(allSources),
    allSources: allSources.map(s => ({
      id: s.id,
      name: s.name,
      url: s.url,
      favicon: s.favicon,
      title: s.title,
    })),
    heroImage: heroImageUrl ? { url: heroImageUrl } : undefined,
    sidebarSections,
    relatedArticles: [],
  };
}

/**
 * Generate discover articles from trending topics
 * Returns array of generated articles
 */
export async function generateArticles(
  maxArticles: number = 5
): Promise<DiscoverArticle[]> {
  console.log('=== Starting Discover Article Generation ===');
  
  // Get topics to generate
  const topics = await getTopicsForGeneration();
  console.log(`Found ${topics.length} topics, generating up to ${maxArticles} articles`);

  const articles: DiscoverArticle[] = [];

  for (const topic of topics.slice(0, maxArticles)) {
    try {
      console.log(`\nGenerating article: "${topic.title}"`);
      
      const result = await generateDiscoverArticle(topic.title, topic.seedSources);
      const article = buildDiscoverArticle(topic.title, result);
      
      articles.push(article);
      console.log(`  ✓ Generated: ${article.title} (${article.totalSources} sources)`);
    } catch (error) {
      console.error(`  ✗ Failed to generate article for "${topic.title}":`, error);
    }
  }

  console.log(`\n=== Generation Complete: ${articles.length} articles ===`);
  return articles;
}

/**
 * Build a manifest of all generated articles
 */
export function buildManifest(articles: DiscoverArticle[]): DiscoverArticleManifest {
  return {
    generatedAt: new Date().toISOString(),
    articles: articles.map(a => ({
      slug: a.slug,
      title: a.title,
      publishedAt: a.publishedAt,
      totalSources: a.totalSources,
      heroImageUrl: a.heroImage?.url,
      sidebarSections: a.sidebarSections,
    })),
  };
}

export { getTopicsForGeneration } from './rss-fetcher';
export { generateDiscoverArticle } from './perplexity-client';

