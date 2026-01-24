/**
 * RSS Feed Fetcher for Discover Articles
 * Fetches trending topics from tech news RSS feeds
 */

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  source: string;
}

interface TrendingTopic {
  title: string;
  sources: Array<{ name: string; url: string }>;
  firstSeen: string;
}

// RSS feeds to monitor for trending topics
const RSS_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
  { name: '9to5Mac', url: 'https://9to5mac.com/feed/' },
  { name: 'MacRumors', url: 'https://feeds.macrumors.com/MacRumors-All' },
  { name: 'Android Central', url: 'https://www.androidcentral.com/feed' },
];

/**
 * Parse RSS XML into items
 */
function parseRSS(xml: string, sourceName: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Simple XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i);
    const dateMatch = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/i);
    
    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].trim().replace(/<[^>]+>/g, ''),
        link: linkMatch[1].trim(),
        pubDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
        description: descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : undefined,
        source: sourceName,
      });
    }
  }
  
  return items;
}

/**
 * Fetch items from a single RSS feed
 */
async function fetchFeed(feed: { name: string; url: string }): Promise<RSSItem[]> {
  try {
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'BOS-ArticleGenerator/1.0',
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${feed.name}: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    return parseRSS(xml, feed.name);
  } catch (error) {
    console.warn(`Error fetching ${feed.name}:`, error);
    return [];
  }
}

/**
 * Group similar articles into trending topics
 * Uses simple keyword matching to find related stories
 */
function groupIntoTopics(items: RSSItem[]): TrendingTopic[] {
  const topics = new Map<string, TrendingTopic>();
  
  // Sort by date (newest first)
  items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  
  // Take recent items (last 24 hours)
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recentItems = items.filter(item => new Date(item.pubDate).getTime() > cutoff);
  
  for (const item of recentItems) {
    // Extract key terms from title (simple approach)
    const words = item.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);
    
    // Create a topic key from main keywords
    const keyWords = words.slice(0, 4).sort().join('_');
    
    if (!keyWords) continue;
    
    // Find existing topic or create new
    let matched = false;
    for (const [key, topic] of topics) {
      const topicWords = key.split('_');
      const overlap = words.filter(w => topicWords.includes(w)).length;
      
      if (overlap >= 2) {
        // Add to existing topic
        topic.sources.push({ name: item.source, url: item.link });
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      topics.set(keyWords, {
        title: item.title,
        sources: [{ name: item.source, url: item.link }],
        firstSeen: item.pubDate,
      });
    }
  }
  
  // Return topics with 2+ sources (indicates actual trending topic)
  return Array.from(topics.values())
    .filter(t => t.sources.length >= 2)
    .sort((a, b) => b.sources.length - a.sources.length)
    .slice(0, 10); // Top 10 trending topics
}

/**
 * Fetch trending topics from all RSS feeds
 */
export async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
  console.log('Fetching RSS feeds...');
  
  const allItems: RSSItem[] = [];
  
  // Fetch all feeds in parallel
  const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
  
  for (const items of results) {
    allItems.push(...items);
  }
  
  console.log(`Fetched ${allItems.length} items from ${RSS_FEEDS.length} feeds`);
  
  // Group into trending topics
  const topics = groupIntoTopics(allItems);
  
  console.log(`Found ${topics.length} trending topics`);
  
  return topics;
}

/**
 * Get a list of seed topics for article generation
 * Falls back to predefined topics if RSS fails
 */
export async function getTopicsForGeneration(): Promise<Array<{ title: string; seedSources: Array<{ name: string; url: string }> }>> {
  try {
    const trending = await fetchTrendingTopics();
    
    if (trending.length > 0) {
      return trending.map(t => ({
        title: t.title,
        seedSources: t.sources,
      }));
    }
  } catch (error) {
    console.warn('RSS fetch failed, using fallback topics:', error);
  }
  
  // Fallback topics if RSS fails
  return [
    {
      title: 'AI Design Tools and Creative Workflows',
      seedSources: [
        { name: 'TechCrunch', url: 'https://techcrunch.com/ai' },
        { name: 'The Verge', url: 'https://www.theverge.com/ai-artificial-intelligence' },
      ],
    },
    {
      title: 'Latest Developments in Large Language Models',
      seedSources: [
        { name: 'Wired', url: 'https://www.wired.com/tag/artificial-intelligence/' },
        { name: 'Ars Technica', url: 'https://arstechnica.com/ai/' },
      ],
    },
  ];
}

