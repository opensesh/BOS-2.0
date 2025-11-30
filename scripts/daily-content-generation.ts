#!/usr/bin/env npx tsx

/**
 * Daily Content Generation Script
 * 
 * Runs daily at 8AM PST via GitHub Actions to generate:
 * 1. 12 news summaries from trending topics across all sources
 * 2. 15 content ideas (5 short-form, 5 long-form, 5 blog)
 * 
 * Usage:
 *   npx tsx scripts/daily-content-generation.ts
 *   npx tsx scripts/daily-content-generation.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import { getSourcesForDailyFetch, RSSSource, CATEGORY_KEYWORDS } from '../lib/content-generator/rss-sources';
import { generateIdeasBatch } from '../lib/content-generator/ideas-generator';
import type { NewsData, IdeaData, NewsUpdateItem, IdeaItem, NewsTopicCategory } from '../types';

// ===========================================
// Configuration
// ===========================================

const DATA_DIR = path.join(process.cwd(), 'public/data');
const NEWS_DIR = path.join(DATA_DIR, 'news');
const IDEAS_DIR = path.join(DATA_DIR, 'weekly-ideas');

// Target counts - these should ALWAYS be met
const TARGET_NEWS_COUNT = 12;
const TARGET_IDEAS_PER_CATEGORY = 5;

// Number of sonic line textures available (1-13)
const SONIC_LINE_TEXTURE_COUNT = 13;

// Parse arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// ===========================================
// RSS Fetching
// ===========================================

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  source: string;
  sourceCategory: NewsTopicCategory;
}

/**
 * Parse RSS XML into items (supports both RSS and Atom formats)
 */
function parseRSS(xml: string, source: RSSSource): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Try RSS format first
  const rssItemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = rssItemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) ||
                      itemXml.match(/<link[^>]*href="([^"]+)"/i);
    const dateMatch = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i) ||
                      itemXml.match(/<dc:date[^>]*>(.*?)<\/dc:date>/i);
    const descMatch = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    
    if (titleMatch) {
      const title = titleMatch[1].trim().replace(/<[^>]+>/g, '').substring(0, 200);
      const link = linkMatch ? (linkMatch[1] || linkMatch[0]).trim() : source.url;
      const description = descMatch 
        ? descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 500)
        : undefined;
      
      if (title.length > 10) { // Skip very short/empty titles
        items.push({
          title,
          link,
          pubDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
          description,
          source: source.name,
          sourceCategory: source.category,
        });
      }
    }
  }
  
  // Try Atom format if no RSS items found
  if (items.length === 0) {
    const atomEntryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    while ((match = atomEntryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      
      const titleMatch = entryXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = entryXml.match(/<link[^>]*href="([^"]+)"/i);
      const dateMatch = entryXml.match(/<published[^>]*>(.*?)<\/published>/i) ||
                        entryXml.match(/<updated[^>]*>(.*?)<\/updated>/i);
      const summaryMatch = entryXml.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i) ||
                           entryXml.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i);
      
      if (titleMatch) {
        const title = titleMatch[1].trim().replace(/<[^>]+>/g, '').substring(0, 200);
        const link = linkMatch ? linkMatch[1].trim() : source.url;
        const description = summaryMatch 
          ? summaryMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 500)
          : undefined;
        
        if (title.length > 10) {
          items.push({
            title,
            link,
            pubDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
            description,
            source: source.name,
            sourceCategory: source.category,
          });
        }
      }
    }
  }
  
  return items;
}

/**
 * Fetch items from a single RSS feed
 */
async function fetchFeed(source: RSSSource): Promise<RSSItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BOSContentBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      console.warn(`  ⚠️ ${source.name}: HTTP ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    const items = parseRSS(xml, source);
    console.log(`  ✓ ${source.name}: ${items.length} items`);
    return items;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('abort')) {
      console.warn(`  ⚠️ ${source.name}: Timeout`);
    } else {
      console.warn(`  ⚠️ ${source.name}: ${errorMessage.substring(0, 50)}`);
    }
    return [];
  }
}

/**
 * Fetch all RSS feeds and return combined items
 */
async function fetchAllFeeds(): Promise<RSSItem[]> {
  console.log('\n📡 Fetching RSS feeds...');
  
  const sources = getSourcesForDailyFetch();
  console.log(`  Sources to fetch: ${sources.length}`);
  
  const allItems: RSSItem[] = [];
  
  // Fetch in parallel with batching
  const batchSize = 8;
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fetchFeed));
    results.forEach(items => allItems.push(...items));
  }
  
  console.log(`\n📊 Total items fetched: ${allItems.length}`);
  return allItems;
}

// ===========================================
// Content Scoring & Selection
// ===========================================

/**
 * Score an item for relevance to OPEN SESSION's focus areas
 */
function scoreItem(item: RSSItem): number {
  let score = 0;
  const text = `${item.title} ${item.description || ''}`.toLowerCase();
  
  // High-value keywords
  const highValueKeywords = [
    'design', 'brand', 'creative', 'ai', 'figma', 'ux', 'ui',
    'typography', 'logo', 'visual', 'strategy', 'workflow',
    'midjourney', 'dall-e', 'gpt', 'claude', 'gemini',
    'instagram', 'tiktok', 'content', 'creator',
  ];
  
  for (const keyword of highValueKeywords) {
    if (text.includes(keyword)) score += 10;
  }
  
  // Medium-value keywords
  const mediumValueKeywords = [
    'startup', 'product', 'marketing', 'social', 'video',
    'tutorial', 'guide', 'how to', 'tips', 'tools',
  ];
  
  for (const keyword of mediumValueKeywords) {
    if (text.includes(keyword)) score += 5;
  }
  
  // Bonus for having description
  if (item.description && item.description.length > 100) score += 15;
  
  // Bonus for source category being design/brand/ai focused
  if (['design-ux', 'branding', 'ai-creative'].includes(item.sourceCategory)) {
    score += 20;
  }
  
  // Recency bonus (items from last 24 hours get bonus)
  try {
    const itemDate = new Date(item.pubDate).getTime();
    const now = Date.now();
    const hoursAgo = (now - itemDate) / (1000 * 60 * 60);
    
    if (hoursAgo < 24) score += 30;
    else if (hoursAgo < 48) score += 20;
    else if (hoursAgo < 72) score += 10;
    else if (hoursAgo < 168) score += 5; // Within a week
  } catch {
    // Date parsing failed, no bonus
  }
  
  return score;
}

/**
 * Classify an item into a topic category using keywords
 */
function classifyItem(item: RSSItem): NewsTopicCategory {
  const text = `${item.title} ${item.description || ''}`.toLowerCase();
  
  let bestCategory: NewsTopicCategory = item.sourceCategory;
  let highestScore = 0;
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.length > 5 ? 2 : 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category as NewsTopicCategory;
    }
  }
  
  return bestCategory;
}

/**
 * Select the best items ensuring diversity across categories
 */
function selectBestItems(items: RSSItem[], targetCount: number): RSSItem[] {
  // Score all items
  const scored = items.map(item => ({
    item,
    score: scoreItem(item),
    category: classifyItem(item),
  }));
  
  // Sort by score
  scored.sort((a, b) => b.score - a.score);
  
  // Remove duplicates (similar titles)
  const seen = new Set<string>();
  const unique = scored.filter(({ item }) => {
    const normalized = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
  
  // Select ensuring category diversity
  const selected: typeof unique = [];
  const categoryCount: Record<string, number> = {};
  const maxPerCategory = Math.ceil(targetCount / 4); // Allow some category concentration
  
  for (const item of unique) {
    if (selected.length >= targetCount) break;
    
    const catCount = categoryCount[item.category] || 0;
    if (catCount < maxPerCategory) {
      selected.push(item);
      categoryCount[item.category] = catCount + 1;
    }
  }
  
  // If we still need more, add remaining high-scored items
  if (selected.length < targetCount) {
    for (const item of unique) {
      if (selected.length >= targetCount) break;
      if (!selected.includes(item)) {
        selected.push(item);
      }
    }
  }
  
  return selected.map(s => s.item);
}

// ===========================================
// News Generation
// ===========================================

/**
 * Generate news updates from selected items
 */
async function generateNews(items: RSSItem[]): Promise<NewsUpdateItem[]> {
  console.log('\n📰 Generating news feed...');
  console.log(`  Total items to analyze: ${items.length}`);
  
  // Select the best items
  const selectedItems = selectBestItems(items, TARGET_NEWS_COUNT);
  console.log(`  Selected ${selectedItems.length} top items`);
  
  // Convert to NewsUpdateItem format
  const newsItems: NewsUpdateItem[] = selectedItems.map(item => ({
    title: item.title,
    description: item.description,
    timestamp: formatDate(item.pubDate),
    sources: [{ name: item.source, url: item.link }],
    tier: 'quick' as const,
    sourceUrl: item.link,
    topicCategory: classifyItem(item),
  }));
  
  // Log category distribution
  const catDist: Record<string, number> = {};
  newsItems.forEach(item => {
    catDist[item.topicCategory || 'unknown'] = (catDist[item.topicCategory || 'unknown'] || 0) + 1;
  });
  console.log(`  Category distribution:`, catDist);
  
  return newsItems;
}

/**
 * Format date string
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}

/**
 * Save news data to JSON files
 */
async function saveNews(newsItems: NewsUpdateItem[]): Promise<void> {
  const today = new Date().toISOString();
  const dateString = today.split('T')[0];
  
  // Split into weekly (recent) and monthly (context)
  const weeklyItems = newsItems.slice(0, Math.ceil(newsItems.length * 0.6));
  const monthlyItems = newsItems.slice(Math.ceil(newsItems.length * 0.6));
  
  const weeklyData: NewsData = {
    type: 'weekly-update',
    date: today,
    updates: weeklyItems,
  };
  
  const monthlyData: NewsData = {
    type: 'monthly-outlook',
    date: today,
    updates: monthlyItems,
  };
  
  if (isDryRun) {
    console.log(`\n🔍 DRY RUN - Would save:`);
    console.log(`  Weekly Update: ${weeklyItems.length} items`);
    console.log(`  Monthly Outlook: ${monthlyItems.length} items`);
    return;
  }
  
  // Ensure directories exist
  const weeklyDir = path.join(NEWS_DIR, 'weekly-update');
  const monthlyDir = path.join(NEWS_DIR, 'monthly-outlook');
  fs.mkdirSync(weeklyDir, { recursive: true });
  fs.mkdirSync(monthlyDir, { recursive: true });
  
  // Save files
  fs.writeFileSync(path.join(weeklyDir, 'latest.json'), JSON.stringify(weeklyData, null, 2));
  fs.writeFileSync(path.join(weeklyDir, `${dateString}.json`), JSON.stringify(weeklyData, null, 2));
  fs.writeFileSync(path.join(monthlyDir, 'latest.json'), JSON.stringify(monthlyData, null, 2));
  fs.writeFileSync(path.join(monthlyDir, `${dateString}.json`), JSON.stringify(monthlyData, null, 2));
  
  console.log(`  ✓ Saved ${weeklyItems.length + monthlyItems.length} news items`);
}

// ===========================================
// Pexels Image Fetching
// ===========================================

interface PexelsPhoto {
  src: { large: string };
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

/**
 * Extract keywords from a title for Pexels search
 */
function extractKeywords(title: string): string {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'this',
    'that', 'how', 'what', 'when', 'where', 'why', 'your', 'our',
  ]);

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  return words.slice(0, 3).join(' ') || 'creative design';
}

/**
 * Fetch an image from Pexels API
 */
async function fetchPexelsImage(title: string): Promise<string | undefined> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return undefined;

  try {
    const query = extractKeywords(title);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );

    if (!response.ok) return undefined;

    const data: PexelsSearchResponse = await response.json();
    return data.photos[0]?.src.large;
  } catch {
    return undefined;
  }
}

/**
 * Get a random texture index
 */
function getRandomTextureIndex(): number {
  return Math.floor(Math.random() * SONIC_LINE_TEXTURE_COUNT);
}

// ===========================================
// Ideas Generation
// ===========================================

/**
 * Generate content ideas from news topics
 */
async function generateIdeas(newsItems: NewsUpdateItem[]): Promise<void> {
  console.log('\n💡 Generating content ideas...');
  
  const categories: Array<'short-form' | 'long-form' | 'blog'> = ['short-form', 'long-form', 'blog'];
  const today = new Date().toISOString();
  const dateString = today.split('T')[0];
  
  // Prepare topics from news items
  const topics = newsItems.slice(0, 8).map(item => ({
    title: item.title,
    description: item.description || item.title,
    sources: item.sources,
  }));
  
  if (topics.length === 0) {
    console.log('  ⚠️ No topics for idea generation');
    return;
  }
  
  console.log(`  Using ${topics.length} topics for idea generation`);
  
  for (const category of categories) {
    console.log(`\n  📝 Generating ${category} ideas...`);
    
    let ideas: IdeaItem[];
    
    if (isDryRun) {
      console.log(`    Would generate ${TARGET_IDEAS_PER_CATEGORY} ${category} ideas`);
      ideas = topics.slice(0, TARGET_IDEAS_PER_CATEGORY).map((topic, idx) => ({
        title: `[${category}] ${topic.title}`,
        description: topic.description,
        starred: idx === 0,
        sources: topic.sources,
        textureIndex: idx % SONIC_LINE_TEXTURE_COUNT,
      }));
    } else {
      // Generate ideas with rich briefs
      ideas = await generateIdeasBatch(topics, category, {
        maxIdeas: TARGET_IDEAS_PER_CATEGORY,
        delayMs: 500,
        onProgress: (completed, total) => {
          process.stdout.write(`    Progress: ${completed}/${total}\r`);
        },
      });
      console.log(`    ✓ Generated ${ideas.length} ideas`);
      
      // Enrich with images and textures
      console.log('    🖼️ Fetching images...');
      for (let i = 0; i < ideas.length; i++) {
        ideas[i].pexelsImageUrl = await fetchPexelsImage(ideas[i].title);
        ideas[i].textureIndex = getRandomTextureIndex();
        if (i < ideas.length - 1) {
          await new Promise(r => setTimeout(r, 200));
        }
      }
      const imageCount = ideas.filter(i => i.pexelsImageUrl).length;
      console.log(`    ✓ Fetched ${imageCount}/${ideas.length} images`);
    }
    
    // Mark first idea as starred
    if (ideas.length > 0) ideas[0].starred = true;
    
    // Save
    const ideaData: IdeaData = {
      type: category,
      date: today,
      ideas,
    };
    
    if (!isDryRun) {
      const categoryDir = path.join(IDEAS_DIR, category);
      fs.mkdirSync(categoryDir, { recursive: true });
      fs.writeFileSync(path.join(categoryDir, 'latest.json'), JSON.stringify(ideaData, null, 2));
      fs.writeFileSync(path.join(categoryDir, `${dateString}.json`), JSON.stringify(ideaData, null, 2));
    }
  }
  
  if (!isDryRun) {
    console.log(`\n  ✓ Saved ${categories.length * TARGET_IDEAS_PER_CATEGORY} ideas total`);
  }
}

// ===========================================
// Main
// ===========================================

async function main() {
  console.log('🚀 OPEN SESSION Daily Content Generation');
  console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN' : '✏️ LIVE'}`);
  console.log(`Targets: ${TARGET_NEWS_COUNT} news, ${TARGET_IDEAS_PER_CATEGORY * 3} ideas`);
  
  try {
    // Fetch RSS feeds
    const rssItems = await fetchAllFeeds();
    
    if (rssItems.length === 0) {
      console.error('\n❌ No RSS items fetched. Check network connectivity.');
      process.exit(1);
    }
    
    // Generate and save news
    const newsItems = await generateNews(rssItems);
    await saveNews(newsItems);
    
    // Generate and save ideas
    await generateIdeas(newsItems);
    
    console.log('\n✅ Daily content generation complete!');
    console.log(`   Generated: ${newsItems.length} news + ${TARGET_IDEAS_PER_CATEGORY * 3} ideas`);
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
