#!/usr/bin/env npx tsx

/**
 * Daily Content Generation Script
 * 
 * Runs daily at 8AM PST via GitHub Actions to generate:
 * 1. Fresh news feed with categorized items
 * 2. Rich content ideas with creative briefs
 * 
 * Usage:
 *   npx tsx scripts/daily-content-generation.ts
 *   npx tsx scripts/daily-content-generation.ts --dry-run
 *   npx tsx scripts/daily-content-generation.ts --news-only
 *   npx tsx scripts/daily-content-generation.ts --ideas-only
 */

import * as fs from 'fs';
import * as path from 'path';
import { getSourcesForDailyFetch, RSSSource } from '../lib/content-generator/rss-sources';
import { classifyByKeywords, filterRelevantNews } from '../lib/content-generator/news-classifier';
import { generateIdeasBatch, transformTopicToIdeas } from '../lib/content-generator/ideas-generator';
import type { NewsData, InspirationData, NewsUpdateItem, InspirationItem, NewsTopicCategory } from '../types';

// ===========================================
// Configuration
// ===========================================

const DATA_DIR = path.join(process.cwd(), 'public/data');
const NEWS_DIR = path.join(DATA_DIR, 'news');
const IDEAS_DIR = path.join(DATA_DIR, 'weekly-ideas');

// Number of sonic line textures available (1-13)
const SONIC_LINE_TEXTURE_COUNT = 13;

// Parse arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const newsOnly = args.includes('--news-only');
const ideasOnly = args.includes('--ideas-only');

// ===========================================
// RSS Fetching
// ===========================================

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  source: string;
  category: NewsTopicCategory;
}

/**
 * Parse RSS XML into items
 */
function parseRSS(xml: string, source: RSSSource): RSSItem[] {
  const items: RSSItem[] = [];
  
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i);
    const dateMatch = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    
    if (titleMatch && linkMatch) {
      const title = titleMatch[1].trim().replace(/<[^>]+>/g, '');
      const description = descMatch 
        ? descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 500)
        : undefined;
      
      items.push({
        title,
        link: linkMatch[1].trim(),
        pubDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
        description,
        source: source.name,
        category: source.category,
      });
    }
  }
  
  return items;
}

/**
 * Fetch items from a single RSS feed
 */
async function fetchFeed(source: RSSSource): Promise<RSSItem[]> {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'BOS-DailyContentGenerator/1.0',
      },
    });
    
    if (!response.ok) {
      console.warn(`  ⚠️ Failed to fetch ${source.name}: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    const items = parseRSS(xml, source);
    console.log(`  ✓ ${source.name}: ${items.length} items`);
    return items;
  } catch (error) {
    console.warn(`  ⚠️ Error fetching ${source.name}:`, error);
    return [];
  }
}

/**
 * Fetch all RSS feeds and return combined items
 */
async function fetchAllFeeds(): Promise<RSSItem[]> {
  console.log('\n📡 Fetching RSS feeds...');
  
  const sources = getSourcesForDailyFetch();
  const allItems: RSSItem[] = [];
  
  // Fetch in parallel with batching to avoid overwhelming servers
  const batchSize = 5;
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fetchFeed));
    results.forEach(items => allItems.push(...items));
  }
  
  console.log(`\n📊 Total items fetched: ${allItems.length}`);
  return allItems;
}

// ===========================================
// News Generation
// ===========================================

/**
 * Process RSS items into news updates with classification
 */
function processNewsItems(items: RSSItem[]): NewsUpdateItem[] {
  // Filter to last 48 hours
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recentItems = items.filter(item => {
    try {
      return new Date(item.pubDate).getTime() > cutoff;
    } catch {
      return true; // Include if date parsing fails
    }
  });
  
  // Remove duplicates by title similarity
  const seen = new Set<string>();
  const uniqueItems = recentItems.filter(item => {
    const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
    if (seen.has(normalizedTitle)) return false;
    seen.add(normalizedTitle);
    return true;
  });
  
  // Classify and convert to NewsUpdateItem
  return uniqueItems.map(item => {
    const classification = classifyByKeywords(item.title, item.description);
    
    return {
      title: item.title,
      description: item.description,
      timestamp: new Date(item.pubDate).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      sources: [{ name: item.source, url: item.link }],
      tier: 'quick' as const,
      sourceUrl: item.link,
      topicCategory: classification.category,
    };
  });
}

/**
 * Save news data to JSON files
 */
async function generateNews(items: RSSItem[]): Promise<void> {
  console.log('\n📰 Generating news feed...');
  
  const newsItems = processNewsItems(items);
  console.log(`  Processed ${newsItems.length} unique news items`);
  
  // Filter to relevant items
  const relevantItems = filterRelevantNews(newsItems, { minConfidence: 20, includeGeneral: true });
  console.log(`  ${relevantItems.length} items relevant to OPEN SESSION`);
  
  // Sort by timestamp (newest first)
  relevantItems.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });
  
  // Split into weekly-update (recent) and monthly-outlook (slightly older context)
  const weeklyItems = relevantItems.slice(0, 10);
  const monthlyItems = relevantItems.slice(10, 20);
  
  // Create data objects
  const today = new Date().toISOString();
  const dateString = today.split('T')[0];
  
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
    console.log('\n🔍 DRY RUN - Would save:');
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
  
  console.log(`  ✓ Saved news to ${NEWS_DIR}`);
}

// ===========================================
// Pexels Image Fetching
// ===========================================

interface PexelsPhoto {
  id: number;
  src: {
    large: string;
    medium: string;
  };
  photographer: string;
  alt: string;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

/**
 * Extract keywords from a title for better Pexels search results
 */
function extractKeywords(title: string): string {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', "it's", 'how', 'what', 'when', 'where', 'why', 'which',
    'your', 'our', 'their', 'my', 'his', 'her', 'we', 'you', 'they',
    'reel', 'carousel', 'blog', 'post', 'video', 'article', 'content',
  ]);

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  return words.slice(0, 4).join(' ');
}

/**
 * Fetch an image from Pexels API based on idea title
 */
async function fetchPexelsImage(title: string): Promise<string | undefined> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('    ⚠️ PEXELS_API_KEY not set, skipping image fetch');
    return undefined;
  }

  try {
    const query = extractKeywords(title) || 'creative design technology';
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      console.warn(`    ⚠️ Pexels API error: ${response.status}`);
      return undefined;
    }

    const data: PexelsSearchResponse = await response.json();
    
    if (data.photos.length > 0) {
      return data.photos[0].src.large;
    }

    // Fallback search if no results
    const fallbackResponse = await fetch(
      `https://api.pexels.com/v1/search?query=technology abstract&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (fallbackResponse.ok) {
      const fallbackData: PexelsSearchResponse = await fallbackResponse.json();
      if (fallbackData.photos.length > 0) {
        return fallbackData.photos[0].src.large;
      }
    }

    return undefined;
  } catch (error) {
    console.warn('    ⚠️ Error fetching Pexels image:', error);
    return undefined;
  }
}

/**
 * Get a random texture index (0-12, for 13 textures)
 */
function getRandomTextureIndex(): number {
  return Math.floor(Math.random() * SONIC_LINE_TEXTURE_COUNT);
}

/**
 * Enrich ideas with Pexels images and texture indices
 */
async function enrichIdeasWithVisuals(
  ideas: InspirationItem[],
  options: { delayMs?: number } = {}
): Promise<InspirationItem[]> {
  const { delayMs = 300 } = options;
  const enrichedIdeas: InspirationItem[] = [];

  console.log('    🖼️ Fetching Pexels images...');
  
  for (let i = 0; i < ideas.length; i++) {
    const idea = ideas[i];
    
    // Fetch Pexels image
    const pexelsImageUrl = await fetchPexelsImage(idea.title);
    
    // Assign random texture index
    const textureIndex = getRandomTextureIndex();
    
    enrichedIdeas.push({
      ...idea,
      pexelsImageUrl,
      textureIndex,
    });

    // Small delay to avoid rate limiting
    if (i < ideas.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const successCount = enrichedIdeas.filter(i => i.pexelsImageUrl).length;
  console.log(`    ✓ Fetched ${successCount}/${ideas.length} images`);
  
  return enrichedIdeas;
}

// ===========================================
// Ideas Generation
// ===========================================

/**
 * Generate content ideas from news topics
 */
async function generateIdeas(newsItems: NewsUpdateItem[]): Promise<void> {
  console.log('\n💡 Generating content ideas...');
  
  // Select top news items for idea generation (most relevant)
  const topNews = newsItems
    .filter(item => item.topicCategory !== 'general-tech')
    .slice(0, 6);
  
  if (topNews.length === 0) {
    console.log('  ⚠️ No relevant news items for idea generation');
    return;
  }
  
  // Transform news topics into ideas for each category
  const categories: Array<'short-form' | 'long-form' | 'blog'> = ['short-form', 'long-form', 'blog'];
  const today = new Date().toISOString();
  const dateString = today.split('T')[0];
  
  for (const category of categories) {
    console.log(`\n  📝 Generating ${category} ideas...`);
    
    // Transform news to ideas
    const newsTopics = topNews.slice(0, 5).map(item => ({
      title: item.title,
      description: item.description || item.title,
      sources: item.sources,
    }));
    
    let ideas: InspirationItem[];
    
    if (isDryRun) {
      console.log(`    Would generate ${newsTopics.length} ${category} ideas`);
      ideas = newsTopics.map((topic, idx) => ({
        title: `[${category}] ${topic.title}`,
        description: topic.description,
        starred: false,
        sources: topic.sources,
        textureIndex: idx % SONIC_LINE_TEXTURE_COUNT,
      }));
    } else {
      // Generate ideas with rich briefs
      ideas = await generateIdeasBatch(newsTopics, category, {
        maxIdeas: 5,
        delayMs: 500,
        onProgress: (completed, total) => {
          process.stdout.write(`    Progress: ${completed}/${total}\r`);
        },
      });
      console.log(`    ✓ Generated ${ideas.length} ideas`);
      
      // Enrich ideas with Pexels images and texture indices
      ideas = await enrichIdeasWithVisuals(ideas);
    }
    
    // Create data object
    const ideaData: InspirationData = {
      type: category,
      date: today,
      ideas,
    };
    
    if (!isDryRun) {
      // Ensure directory exists
      const categoryDir = path.join(IDEAS_DIR, category);
      fs.mkdirSync(categoryDir, { recursive: true });
      
      // Save files
      fs.writeFileSync(path.join(categoryDir, 'latest.json'), JSON.stringify(ideaData, null, 2));
      fs.writeFileSync(path.join(categoryDir, `${dateString}.json`), JSON.stringify(ideaData, null, 2));
    }
  }
  
  if (!isDryRun) {
    console.log(`\n  ✓ Saved ideas to ${IDEAS_DIR}`);
  }
}

// ===========================================
// Main
// ===========================================

async function main() {
  console.log('🚀 OPEN SESSION Daily Content Generation');
  console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN' : '✏️ LIVE'}`);
  
  try {
    // Fetch RSS feeds
    const rssItems = await fetchAllFeeds();
    
    if (rssItems.length === 0) {
      console.error('\n❌ No RSS items fetched. Check network connectivity.');
      process.exit(1);
    }
    
    // Generate news
    if (!ideasOnly) {
      const newsItems = processNewsItems(rssItems);
      await generateNews(rssItems);
      
      // Generate ideas from news
      if (!newsOnly) {
        await generateIdeas(newsItems);
      }
    } else {
      // Ideas only mode - still need to process news for context
      const newsItems = processNewsItems(rssItems);
      await generateIdeas(newsItems);
    }
    
    console.log('\n✅ Daily content generation complete!');
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();


