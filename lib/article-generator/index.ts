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
 * Creates a single chip with primary source and additional sources
 */
function distributeSourcesToChips(
  paragraphSourceIds: string[],
  allSources: Array<{ id: string; name: string; url: string; favicon: string }>,
  usedSourceIds: Set<string>
): CitationChip[] {
  const chips: CitationChip[] = [];
  
  // Find available sources for this paragraph (not used elsewhere)
  let availableSources = paragraphSourceIds
    .filter(id => !usedSourceIds.has(id))
    .map(id => allSources.find(s => s.id === id))
    .filter((s): s is typeof allSources[0] => s !== undefined);

  // If no unique sources, use some that might be duplicates (better than nothing)
  if (availableSources.length === 0) {
    availableSources = paragraphSourceIds
      .map(id => allSources.find(s => s.id === id))
      .filter((s): s is typeof allSources[0] => s !== undefined);
  }

  // Still no sources? Use fallback from allSources
  if (availableSources.length === 0) {
    // Find sources not yet used at all
    const unusedSources = allSources.filter(s => !usedSourceIds.has(s.id)).slice(0, 3);
    if (unusedSources.length > 0) {
      availableSources = unusedSources;
    } else {
      // Last resort: just use first few sources
      availableSources = allSources.slice(0, 3);
    }
  }

  if (availableSources.length === 0) {
    return chips;
  }

  // Mark these sources as used
  availableSources.forEach(s => usedSourceIds.add(s.id));

  // Create a single chip with all sources for this paragraph
  const primarySource = availableSources[0];
  const additionalSources = availableSources.slice(1);

  chips.push({
    primarySource,
    additionalCount: additionalSources.length,
    additionalSources,
  });

  return chips;
}

/**
 * Pre-distribute sources across all paragraphs to ensure uniqueness
 * Returns a map of paragraph index to source IDs
 */
function preDistributeSources(
  rawSections: Array<{ paragraphs: Array<{ sourceIds: string[] }> }>,
  allSources: Array<{ id: string; name: string; url: string; favicon: string }>
): Map<string, string[]> {
  const distribution = new Map<string, string[]>();
  const usedSourceIds = new Set<string>();
  const totalParagraphs = rawSections.reduce((sum, s) => sum + s.paragraphs.length, 0);
  const sourcesPerParagraph = Math.max(2, Math.floor(allSources.length / totalParagraphs));
  
  let sourceIndex = 0;
  
  rawSections.forEach((section, sectionIdx) => {
    section.paragraphs.forEach((para, paraIdx) => {
      const key = `${sectionIdx}-${paraIdx}`;
      const sources: string[] = [];
      
      // First, try to use the sources assigned by the LLM
      for (const sourceId of para.sourceIds) {
        if (!usedSourceIds.has(sourceId) && sources.length < sourcesPerParagraph) {
          sources.push(sourceId);
          usedSourceIds.add(sourceId);
        }
      }
      
      // If we need more sources, grab unused ones sequentially
      while (sources.length < Math.min(3, sourcesPerParagraph)) {
        // Find next unused source
        while (sourceIndex < allSources.length && usedSourceIds.has(allSources[sourceIndex].id)) {
          sourceIndex++;
        }
        
        if (sourceIndex < allSources.length) {
          sources.push(allSources[sourceIndex].id);
          usedSourceIds.add(allSources[sourceIndex].id);
          sourceIndex++;
        } else {
          break; // No more sources available
        }
      }
      
      distribution.set(key, sources);
    });
  });
  
  return distribution;
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

  // Pre-distribute sources across all paragraphs for uniqueness
  const sourceDistribution = preDistributeSources(rawSections, allSources);
  
  // Track used sources for citation chip building
  const usedSourceIds = new Set<string>();

  // Transform sections
  const sections: DiscoverSection[] = rawSections.map((rawSection, sectionIdx) => {
    const paragraphs: DiscoverParagraph[] = rawSection.paragraphs.map((rawPara, paraIdx) => {
      const key = `${sectionIdx}-${paraIdx}`;
      
      // Get pre-distributed sources for this paragraph
      const sourceIdsToUse = sourceDistribution.get(key) || rawPara.sourceIds;

      // Build citation chips with tracking
      const citations = distributeSourcesToChips(sourceIdsToUse, allSources, usedSourceIds);

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

