import { NewsCardData, InspirationCardData, Source, NewsData, InspirationData, ContentTier, PlatformTip } from '@/types';

/**
 * Aggregate sources from multiple items, removing duplicates
 */
export function aggregateSources(items: Array<{ sources: Array<{ name: string; url: string }> }>): Source[] {
  const sourceMap = new Map<string, Source>();
  
  items.forEach((item) => {
    item.sources.forEach((source, index) => {
      const key = source.name.toLowerCase();
      if (!sourceMap.has(key)) {
        sourceMap.set(key, {
          id: `source-${sourceMap.size}`,
          name: source.name,
          url: source.url,
        });
      }
    });
  });
  
  return Array.from(sourceMap.values());
}

/**
 * Generate a slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Format timestamp to relative time or date string
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  } catch {
    return timestamp;
  }
}

/**
 * Generate a unified title from multiple items
 */
function generateUnifiedTitle(items: Array<{ title: string }>, category: string): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0].title;
  
  // For multiple items, use the first title as base and indicate aggregation
  const firstTitle = items[0].title;
  // If title is too long, truncate and add context
  if (firstTitle.length > 100) {
    return firstTitle.substring(0, 97) + '...';
  }
  return firstTitle;
}

/**
 * Generate a unified summary/body from multiple items
 */
function generateUnifiedSummary(items: Array<{ title: string; description?: string }>): string {
  if (items.length === 0) return '';
  if (items.length === 1) {
    return items[0].description || items[0].title.substring(0, 150);
  }
  
  // Combine descriptions or titles
  const summaries = items
    .map((item) => item.description || item.title)
    .filter(Boolean)
    .slice(0, 3); // Limit to first 3 items
  
  if (summaries.length === 0) return '';
  if (summaries.length === 1) return summaries[0].substring(0, 200);
  
  // Combine summaries
  const combined = summaries.join(' • ').substring(0, 200);
  return combined + (combined.length >= 200 ? '...' : '');
}

/**
 * Determine content tier based on available data
 * - Items with articlePath = 'featured' (full Perplexity research)
 * - Items with aiSummary = 'summary' (AI-generated summary)
 * - Everything else = 'quick' (RSS description + external link)
 */
function determineTier(update: {
  tier?: ContentTier;
  articlePath?: string;
  aiSummary?: string;
}): ContentTier {
  // If tier is explicitly set in JSON, use it
  if (update.tier) return update.tier;
  
  // Auto-assign based on available fields
  if (update.articlePath) return 'featured';
  if (update.aiSummary) return 'summary';
  return 'quick';
}

/**
 * Process news data from JSON files
 */
export function processNewsData(data: NewsData): NewsCardData[] {
  if (!data.updates || data.updates.length === 0) return [];
  
  // Group updates into cards (can be 1-4 items per card)
  const cards: NewsCardData[] = [];
  
  // Process each update as a potential card
  data.updates.forEach((update, index) => {
    const sources: Source[] = update.sources.map((source, idx) => ({
      id: `source-${index}-${idx}`,
      name: source.name,
      url: source.url,
    }));
    
    // Use description if available, otherwise fall back to a truncated title
    const summary = update.description 
      ? update.description.split('\n')[0] // Use first paragraph as summary
      : update.title.substring(0, 200);
    
    // Determine tier based on available data
    const tier = determineTier(update);
    
    // For quick tier, use first source URL as the external link
    const sourceUrl = tier === 'quick' && sources.length > 0 
      ? sources[0].url 
      : update.sourceUrl;
    
    const card: NewsCardData = {
      id: `news-${data.type}-${index}`,
      slug: generateSlug(update.title),
      title: update.title,
      summary,
      content: update.description ? update.description.split('\n\n') : undefined,
      sources,
      publishedAt: formatTimestamp(update.timestamp),
      category: data.type,
      // Tiered content fields
      tier,
      articlePath: update.articlePath,
      aiSummary: update.aiSummary,
      sourceUrl,
      // Topic categorization
      topicCategory: update.topicCategory,
    };
    
    cards.push(card);
  });
  
  return cards;
}

/**
 * Process inspiration data from JSON files
 * Inspiration items are content PROMPTS - they display as non-clickable cards
 * with a "Generate Brief" action that sends to the chat interface
 * Now supports rich creative brief fields (hooks, platformTips, etc.)
 */
export function processInspirationData(data: InspirationData): InspirationCardData[] {
  if (!data.ideas || data.ideas.length === 0) return [];
  
  return data.ideas.map((idea, index) => {
    const sources: Source[] = idea.sources.map((source, idx) => ({
      id: `source-${index}-${idx}`,
      name: source.name,
      url: source.url,
    }));
    
    return {
      id: `inspiration-${data.type}-${index}`,
      slug: generateSlug(idea.title),
      title: idea.title,
      description: idea.description,
      sources,
      publishedAt: formatTimestamp(data.date),
      category: data.type,
      starred: idea.starred,
      isPrompt: true as const, // Always true - inspiration items are content prompts
      // Rich creative brief fields (optional for backwards compatibility)
      hooks: idea.hooks,
      platformTips: idea.platformTips as PlatformTip[] | undefined,
      visualDirection: idea.visualDirection,
      exampleOutline: idea.exampleOutline,
      hashtags: idea.hashtags,
    };
  });
}

/**
 * Load news data from JSON file
 */
export async function loadNewsData(type: 'weekly-update' | 'monthly-outlook'): Promise<NewsCardData[]> {
  try {
    const response = await fetch(`/data/news/${type}/latest.json`);
    if (!response.ok) {
      console.error(`Failed to load ${type} data:`, response.statusText);
      return [];
    }
    const data: NewsData = await response.json();
    return processNewsData(data);
  } catch (error) {
    console.error(`Error loading ${type} data:`, error);
    return [];
  }
}

/**
 * Load inspiration data from JSON file
 */
export async function loadInspirationData(type: 'short-form' | 'long-form' | 'blog'): Promise<InspirationCardData[]> {
  try {
    const response = await fetch(`/data/weekly-ideas/${type}/latest.json`);
    if (!response.ok) {
      console.error(`Failed to load ${type} data:`, response.statusText);
      return [];
    }
    const data: InspirationData = await response.json();
    return processInspirationData(data);
  } catch (error) {
    console.error(`Error loading ${type} data:`, error);
    return [];
  }
}

/**
 * Generate card data in layout pattern (1 featured + 3 compact)
 */
export function generateCardGroups<T extends NewsCardData | InspirationCardData>(
  cards: T[]
): Array<{ featured: T; compact: T[] }> {
  const groups: Array<{ featured: T; compact: T[] }> = [];
  
  for (let i = 0; i < cards.length; i += 4) {
    const featured = cards[i];
    const compact = cards.slice(i + 1, i + 4);
    
    if (featured) {
      groups.push({ featured, compact });
    }
  }
  
  return groups;
}

