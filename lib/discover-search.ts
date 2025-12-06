/**
 * Discover Search - Search across RSS feed content
 * 
 * Searches the pre-generated news data from RSS feeds to find
 * relevant content based on user queries.
 */

import { NewsCardData } from '@/types';
import { ALL_RSS_SOURCES, CATEGORY_KEYWORDS, RSSSource } from './content-generator/rss-sources';

export interface DiscoverSearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  sourceName: string;
  category: string;
  publishedAt?: string;
  relevanceScore: number;
}

export interface DiscoverSearchResponse {
  results: DiscoverSearchResult[];
  query: string;
  searchedCategories: string[];
  totalResults: number;
}

/**
 * Get relevant RSS source categories based on query keywords
 */
export function getRelevantCategories(query: string): string[] {
  const queryLower = query.toLowerCase();
  const relevantCategories: { category: string; score: number }[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += keyword.length > 5 ? 2 : 1;
      }
    }
    if (score > 0) {
      relevantCategories.push({ category, score });
    }
  }

  // Sort by score and return top categories
  relevantCategories.sort((a, b) => b.score - a.score);
  
  // If no categories matched, return all design/branding related ones
  if (relevantCategories.length === 0) {
    return ['design-ux', 'branding', 'ai-creative', 'social-trends'];
  }

  return relevantCategories.slice(0, 4).map(c => c.category);
}

/**
 * Get RSS sources for relevant categories
 */
export function getSourcesForQuery(query: string): RSSSource[] {
  const relevantCategories = getRelevantCategories(query);
  return ALL_RSS_SOURCES.filter(source => 
    relevantCategories.includes(source.category) && source.priority <= 2
  );
}

/**
 * Calculate relevance score for a news item against a query
 */
function calculateRelevance(
  item: NewsCardData,
  query: string,
  queryTerms: string[]
): number {
  const titleLower = item.title.toLowerCase();
  const summaryLower = item.summary?.toLowerCase() || '';
  let score = 0;

  for (const term of queryTerms) {
    const termLower = term.toLowerCase();
    // Title matches worth more
    if (titleLower.includes(termLower)) {
      score += term.length > 4 ? 10 : 5;
    }
    // Summary matches
    if (summaryLower.includes(termLower)) {
      score += term.length > 4 ? 5 : 2;
    }
  }

  // Boost for exact phrase match
  if (titleLower.includes(query.toLowerCase())) {
    score += 20;
  }

  return score;
}

/**
 * Search through loaded news data
 */
export function searchNewsData(
  newsData: NewsCardData[],
  query: string,
  options: {
    maxResults?: number;
    minRelevance?: number;
    categories?: string[];
  } = {}
): DiscoverSearchResult[] {
  const { maxResults = 5, minRelevance = 5, categories } = options;
  
  // Parse query into searchable terms
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 2);

  // Score and filter results
  const scoredResults: (NewsCardData & { relevanceScore: number })[] = [];

  for (const item of newsData) {
    // Filter by category if specified
    if (categories && categories.length > 0 && item.topicCategory) {
      if (!categories.includes(item.topicCategory)) {
        continue;
      }
    }

    const score = calculateRelevance(item, query, queryTerms);
    if (score >= minRelevance) {
      scoredResults.push({ ...item, relevanceScore: score });
    }
  }

  // Sort by relevance score
  scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Convert to search results format
  return scoredResults.slice(0, maxResults).map(item => ({
    id: item.id,
    title: item.title,
    snippet: item.summary || item.title.slice(0, 150),
    url: item.sourceUrl || '#',
    sourceName: item.sources?.[0]?.name || 'Unknown Source',
    category: item.topicCategory || item.category || 'general-tech',
    publishedAt: item.publishedAt,
    relevanceScore: item.relevanceScore,
  }));
}

/**
 * Get category label for display
 */
export const CATEGORY_LABELS: Record<string, string> = {
  'design-ux': 'Design & UX',
  'branding': 'Branding',
  'ai-creative': 'AI & Creative',
  'social-trends': 'Social Trends',
  'general-tech': 'Tech',
  'startup-business': 'Business',
};

/**
 * Format discover search results as context for AI
 */
export function formatDiscoverResultsForAI(results: DiscoverSearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  const formattedResults = results.map((result, idx) => {
    const categoryLabel = CATEGORY_LABELS[result.category] || result.category;
    return `[${idx + 1}] ${result.title}
   Source: ${result.sourceName} (${categoryLabel})
   ${result.snippet}
   ${result.publishedAt ? `Published: ${result.publishedAt}` : ''}`;
  }).join('\n\n');

  return `\n\n## Relevant Content from Your News Sources:\n${formattedResults}`;
}


