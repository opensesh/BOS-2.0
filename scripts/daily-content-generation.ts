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
import { batchEnrichTopics } from '../lib/content-generator/source-enricher';
import { generateDiscoverArticle } from '../lib/article-generator/perplexity-client';
import type { NewsData, IdeaData, NewsUpdateItem, IdeaItem, NewsTopicCategory, DiscoverArticle, DiscoverSection, CitationChip } from '../types';

// ===========================================
// Configuration
// ===========================================

const DATA_DIR = path.join(process.cwd(), 'public/data');
const NEWS_DIR = path.join(DATA_DIR, 'news');
const IDEAS_DIR = path.join(DATA_DIR, 'weekly-ideas');
const ARTICLES_DIR = path.join(DATA_DIR, 'discover/articles');

// Target counts - these should ALWAYS be met
const TARGET_NEWS_COUNT = 12;
const TARGET_IDEAS_PER_CATEGORY = 5;
const TARGET_FEATURED_ARTICLES = 3; // Rich articles with 40+ sources

// Number of sonic line textures available (1-13)
const SONIC_LINE_TEXTURE_COUNT = 13;

// Parse arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// ===========================================
// HTML Entity Decoder
// ===========================================

/**
 * Decode HTML entities in text (e.g., &#x27; → ', &#8217; → ')
 */
function decodeHTMLEntities(text: string): string {
  if (!text) return text;
  
  // Named entities (using unicode escapes to avoid syntax issues with curly quotes)
  const namedEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
    '&mdash;': '\u2014', // —
    '&ndash;': '\u2013', // –
    '&ldquo;': '\u201C', // "
    '&rdquo;': '\u201D', // "
    '&lsquo;': '\u2018', // '
    '&rsquo;': '\u2019', // '
    '&hellip;': '\u2026', // …
    '&copy;': '\u00A9', // ©
    '&reg;': '\u00AE', // ®
    '&trade;': '\u2122', // ™
  };
  
  let decoded = text;
  
  // Replace named entities
  for (const [entity, char] of Object.entries(namedEntities)) {
    decoded = decoded.replace(new RegExp(entity, 'gi'), char);
  }
  
  // Replace numeric entities (decimal: &#8217; and hex: &#x27;)
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });
  
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  return decoded;
}

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
      // Decode HTML entities and clean up the title
      const rawTitle = titleMatch[1].trim().replace(/<[^>]+>/g, '');
      const title = decodeHTMLEntities(rawTitle).substring(0, 200);
      const link = linkMatch ? (linkMatch[1] || linkMatch[0]).trim() : source.url;
      const rawDescription = descMatch 
        ? descMatch[1].replace(/<[^>]+>/g, '').trim()
        : undefined;
      const description = rawDescription 
        ? decodeHTMLEntities(rawDescription).substring(0, 500)
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
        // Decode HTML entities and clean up the title
        const rawTitle = titleMatch[1].trim().replace(/<[^>]+>/g, '');
        const title = decodeHTMLEntities(rawTitle).substring(0, 200);
        const link = linkMatch ? linkMatch[1].trim() : source.url;
        const rawDescription = summaryMatch 
          ? summaryMatch[1].replace(/<[^>]+>/g, '').trim()
          : undefined;
        const description = rawDescription
          ? decodeHTMLEntities(rawDescription).substring(0, 500)
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
// Topic Clustering & Source Aggregation
// ===========================================

interface ClusteredTopic {
  title: string;
  description?: string;
  pubDate: string;
  sources: Array<{ name: string; url: string }>;
  sourceCategory: NewsTopicCategory;
  score: number;
}

/**
 * Extract significant words from a title for clustering
 */
function extractSignificantWords(title: string): Set<string> {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'this', 'that', 'these', 'those', 'how', 'what', 'when', 'where',
    'why', 'who', 'whom', 'which', 'whose', 'your', 'our', 'their', 'its',
    'new', 'first', 'last', 'just', 'now', 'more', 'most', 'other', 'into',
    'over', 'such', 'than', 'too', 'very', 'just', 'only', 'own', 'same',
    'so', 'also', 'no', 'not', 'about', 'out', 'up', 'down', 'off', 'after',
    'before', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'all', 'each', 'few', 'both', 'any', 'some', 'one', 'two',
  ]);

  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
  );
}

/**
 * Calculate similarity between two sets of words (Jaccard similarity)
 */
function calculateSimilarity(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 || set2.size === 0) return 0;
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Cluster similar RSS items by title similarity
 * Items with 50%+ word overlap are considered the same story
 */
function clusterSimilarTopics(items: RSSItem[]): ClusteredTopic[] {
  const clusters: ClusteredTopic[] = [];
  const assigned = new Set<number>();
  
  // Pre-compute word sets for all items
  const wordSets = items.map(item => extractSignificantWords(item.title));
  
  for (let i = 0; i < items.length; i++) {
    if (assigned.has(i)) continue;
    
    const item = items[i];
    const cluster: ClusteredTopic = {
      title: item.title,
      description: item.description,
      pubDate: item.pubDate,
      sources: [{ name: item.source, url: item.link }],
      sourceCategory: item.sourceCategory,
      score: 0,
    };
    
    assigned.add(i);
    
    // Find similar items to cluster with this one
    for (let j = i + 1; j < items.length; j++) {
      if (assigned.has(j)) continue;
      
      const similarity = calculateSimilarity(wordSets[i], wordSets[j]);
      
      if (similarity >= 0.5) { // 50% word overlap = same story
        const otherItem = items[j];
        
        // Add source if not already present
        const sourceExists = cluster.sources.some(s => 
          s.name === otherItem.source || s.url === otherItem.link
        );
        
        if (!sourceExists) {
          cluster.sources.push({ name: otherItem.source, url: otherItem.link });
        }
        
        // Use longer description
        if (otherItem.description && (!cluster.description || otherItem.description.length > cluster.description.length)) {
          cluster.description = otherItem.description;
        }
        
        // Use most recent date
        try {
          const clusterDate = new Date(cluster.pubDate).getTime();
          const otherDate = new Date(otherItem.pubDate).getTime();
          if (otherDate > clusterDate) {
            cluster.pubDate = otherItem.pubDate;
          }
        } catch { /* ignore */ }
        
        assigned.add(j);
      }
    }
    
    clusters.push(cluster);
  }
  
  console.log(`  📊 Clustered ${items.length} items into ${clusters.length} unique topics`);
  const multiSourceCount = clusters.filter(c => c.sources.length > 1).length;
  console.log(`  📰 ${multiSourceCount} topics have multiple sources`);
  
  return clusters;
}

// ===========================================
// Content Scoring & Selection
// ===========================================

/**
 * Score a clustered topic for relevance to OPEN SESSION's focus areas
 */
function scoreCluster(cluster: ClusteredTopic): number {
  let score = 0;
  const text = `${cluster.title} ${cluster.description || ''}`.toLowerCase();
  
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
  if (cluster.description && cluster.description.length > 100) score += 15;
  
  // Bonus for source category being design/brand/ai focused
  if (['design-ux', 'branding', 'ai-creative'].includes(cluster.sourceCategory)) {
    score += 20;
  }
  
  // MAJOR BONUS: Multiple sources = significant story
  // Stories with multiple outlets covering them are prioritized
  score += cluster.sources.length * 15;
  
  // Recency bonus (items from last 24 hours get bonus)
  try {
    const itemDate = new Date(cluster.pubDate).getTime();
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
 * Classify a cluster into a topic category using keywords
 */
function classifyCluster(cluster: ClusteredTopic): NewsTopicCategory {
  const text = `${cluster.title} ${cluster.description || ''}`.toLowerCase();
  
  let bestCategory: NewsTopicCategory = cluster.sourceCategory;
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
 * Select the best clustered topics ensuring diversity across categories
 */
function selectBestClusters(clusters: ClusteredTopic[], targetCount: number): ClusteredTopic[] {
  // Score all clusters
  const scored = clusters.map(cluster => ({
    cluster,
    score: scoreCluster(cluster),
    category: classifyCluster(cluster),
  }));
  
  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);
  
  // Select ensuring category diversity
  const selected: typeof scored = [];
  const categoryCount: Record<string, number> = {};
  const maxPerCategory = Math.ceil(targetCount / 4); // Allow some category concentration
  
  for (const item of scored) {
    if (selected.length >= targetCount) break;
    
    const catCount = categoryCount[item.category] || 0;
    if (catCount < maxPerCategory) {
      selected.push(item);
      categoryCount[item.category] = catCount + 1;
    }
  }
  
  // If we still need more, add remaining high-scored items
  if (selected.length < targetCount) {
    for (const item of scored) {
      if (selected.length >= targetCount) break;
      if (!selected.includes(item)) {
        selected.push(item);
      }
    }
  }
  
  return selected.map(s => s.cluster);
}

// ===========================================
// News Generation
// ===========================================

/**
 * Generate news updates from RSS items with source aggregation
 */
async function generateNews(items: RSSItem[]): Promise<NewsUpdateItem[]> {
  console.log('\n📰 Generating news feed...');
  console.log(`  Total items to analyze: ${items.length}`);
  
  // Cluster similar items to aggregate sources
  const clusters = clusterSimilarTopics(items);
  
  // Select the best clusters
  const selectedClusters = selectBestClusters(clusters, TARGET_NEWS_COUNT);
  console.log(`  Selected ${selectedClusters.length} top topics`);
  
  // Convert to NewsUpdateItem format, preserving all sources
  const newsItems: NewsUpdateItem[] = selectedClusters.map(cluster => ({
    title: cluster.title,
    description: cluster.description,
    timestamp: formatDate(cluster.pubDate),
    sources: cluster.sources, // Now can have multiple sources!
    tier: 'quick' as const,
    sourceUrl: cluster.sources[0]?.url || '',
    topicCategory: classifyCluster(cluster),
  }));
  
  // Log source distribution
  const sourceCounts = newsItems.map(item => item.sources?.length || 0);
  const avgSources = sourceCounts.reduce((a, b) => a + b, 0) / sourceCounts.length;
  const multiSourceItems = sourceCounts.filter(c => c > 1).length;
  console.log(`  📊 Source stats: avg ${avgSources.toFixed(1)} sources/topic, ${multiSourceItems} topics with multiple sources`);
  
  // Log category distribution
  const catDist: Record<string, number> = {};
  newsItems.forEach(item => {
    catDist[item.topicCategory || 'unknown'] = (catDist[item.topicCategory || 'unknown'] || 0) + 1;
  });
  console.log(`  Category distribution:`, catDist);
  
  // Enrich top 3 items with additional sources via Perplexity (for starred/featured items)
  if (!isDryRun && process.env.PERPLEXITY_API_KEY) {
    const topicsForEnrichment = newsItems.slice(0, 3).map(item => ({
      title: item.title,
      existingUrls: (item.sources || []).map(s => s.url),
    }));
    
    const enrichmentResults = await batchEnrichTopics(topicsForEnrichment, 3, 600);
    
    // Merge additional sources into news items
    for (const [title, additionalSources] of enrichmentResults) {
      const newsItem = newsItems.find(item => item.title === title);
      if (newsItem && newsItem.sources) {
        newsItem.sources = [...newsItem.sources, ...additionalSources];
        // Deduplicate sources by URL
        const seen = new Set<string>();
        newsItem.sources = newsItem.sources.filter(s => {
          const urlLower = s.url.toLowerCase();
          if (seen.has(urlLower)) return false;
          seen.add(urlLower);
          return true;
        });
      }
    }
    
    // Re-log source stats after enrichment
    const enrichedSourceCounts = newsItems.map(item => item.sources?.length || 0);
    const enrichedAvg = enrichedSourceCounts.reduce((a, b) => a + b, 0) / enrichedSourceCounts.length;
    console.log(`  📊 After enrichment: avg ${enrichedAvg.toFixed(1)} sources/topic`);
  }
  
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
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
}

/**
 * Generate rich featured articles with full sections and 40+ sources using Perplexity
 */
async function generateFeaturedArticles(
  clusters: ClusteredTopic[],
  targetCount: number = TARGET_FEATURED_ARTICLES
): Promise<DiscoverArticle[]> {
  console.log(`\n🌟 Generating ${targetCount} featured articles with rich content...`);
  
  if (!process.env.PERPLEXITY_API_KEY) {
    console.log('  ⚠️ PERPLEXITY_API_KEY not set, skipping featured article generation');
    return [];
  }
  
  // Select top clusters for featured articles
  const topClusters = clusters.slice(0, targetCount);
  const articles: DiscoverArticle[] = [];
  
  for (let i = 0; i < topClusters.length; i++) {
    const cluster = topClusters[i];
    console.log(`  [${i + 1}/${targetCount}] Generating: "${cluster.title.substring(0, 50)}..."`);
    
    try {
      // Use the Perplexity article generator to create rich content
      console.log(`    📡 Calling Perplexity API...`);
      const result = await generateDiscoverArticle(
        cluster.title,
        cluster.sources
      );
      
      // Validate we got actual content
      if (!result.sections || result.sections.length === 0) {
        console.error(`    ❌ No sections generated - Perplexity may have failed`);
        continue; // Skip this article, don't save empty content
      }
      
      if (!result.allSources || result.allSources.length < 5) {
        console.error(`    ❌ Too few sources (${result.allSources?.length || 0}) - skipping`);
        continue;
      }
      
      // Convert to DiscoverArticle format
      const slug = generateSlug(cluster.title);
      const allSources = result.allSources.map((s, idx) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        favicon: s.favicon,
        title: s.title || cluster.title,
      }));
      
      // Convert sections to DiscoverSection format
      const sections: DiscoverSection[] = result.sections.map((section, sectionIdx) => ({
        id: `section-${sectionIdx}`,
        title: section.title,
        paragraphs: section.paragraphs.map((para, paraIdx) => {
          // Convert source IDs to CitationChips
          const citations: CitationChip[] = [];
          if (para.sourceIds.length > 0) {
            const primarySourceId = para.sourceIds[0];
            const primarySource = allSources.find(s => s.id === primarySourceId);
            
            if (primarySource) {
              citations.push({
                primarySource,
                additionalCount: Math.max(0, para.sourceIds.length - 1),
                additionalSources: para.sourceIds.slice(1)
                  .map(id => allSources.find(s => s.id === id))
                  .filter((s): s is typeof primarySource => s !== undefined),
              });
            }
          }
          
          return {
            id: `para-${sectionIdx}-${paraIdx}`,
            content: para.content,
            citations,
          };
        }),
      }));
      
      // Validate sections have content
      const totalParagraphs = sections.reduce((sum, s) => sum + s.paragraphs.length, 0);
      if (totalParagraphs < 3) {
        console.error(`    ❌ Too few paragraphs (${totalParagraphs}) - skipping`);
        continue;
      }
      
      // Generate sidebar from section titles
      const sidebarSections = sections
        .filter(s => s.title)
        .map(s => s.title as string);
      
      const article: DiscoverArticle = {
        id: slug,
        slug,
        title: result.title || cluster.title,
        summary: cluster.description || '',
        heroImageUrl: result.heroImageUrl,
        publishedAt: new Date().toISOString(),
        sources: allSources,
        sections,
        sidebarSections,
        relatedArticles: [], // Will be populated separately if needed
      };
      
      articles.push(article);
      console.log(`    ✓ Generated with ${allSources.length} sources, ${sections.length} sections, ${totalParagraphs} paragraphs`);
      
      // Rate limit to avoid hitting API limits
      if (i < topClusters.length - 1) {
        await new Promise(r => setTimeout(r, 2000)); // 2 second delay between articles
      }
    } catch (error) {
      console.error(`    ❌ Failed to generate article:`, error);
      // Don't save empty articles - continue to next
    }
  }
  
  return articles;
}

/**
 * Save featured articles to JSON files
 */
async function saveFeaturedArticles(articles: DiscoverArticle[]): Promise<void> {
  if (articles.length === 0 || isDryRun) return;
  
  // Ensure directory exists
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  
  for (const article of articles) {
    const filePath = path.join(ARTICLES_DIR, `${article.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(article, null, 2));
    console.log(`  ✓ Saved article: ${article.slug}.json`);
  }
  
  // Save manifest of all articles
  const manifestPath = path.join(ARTICLES_DIR, 'manifest.json');
  const manifest = {
    generated: new Date().toISOString(),
    articles: articles.map(a => ({
      slug: a.slug,
      title: a.title,
      sourceCount: a.sources.length,
    })),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
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
// Brand-Aligned Pexels Image Fetching
// ===========================================

interface PexelsPhoto {
  id: number;
  src: { large: string; medium: string };
  alt: string | null;
  photographer: string;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

/**
 * Category-specific image search terms aligned with OPEN SESSION brand
 * These produce abstract, minimal, on-brand imagery
 */
const CATEGORY_IMAGE_KEYWORDS: Record<string, string[]> = {
  'design-ux': ['geometric shapes minimal', 'abstract gradient design', 'clean lines architecture'],
  'branding': ['minimal typography', 'abstract pattern design', 'clean workspace'],
  'ai-creative': ['abstract digital art', 'futuristic minimal', 'technology abstract'],
  'social-trends': ['colorful abstract pattern', 'modern gradient', 'vibrant geometric'],
  'general-tech': ['technology minimal', 'abstract circuit', 'modern office minimal'],
  'startup-business': ['minimal workspace', 'modern architecture', 'abstract success'],
};

/**
 * Brand-aligned colors for Pexels filtering (Vanilla/Charcoal/Aperol palette)
 */
const BRAND_COLORS = ['orange', 'black', 'white'] as const;

/**
 * Words that indicate an image likely contains text (to be avoided)
 */
const TEXT_INDICATOR_WORDS = [
  'sign', 'text', 'banner', 'poster', 'billboard', 'quote', 'typography',
  'word', 'letter', 'message', 'slogan', 'label', 'headline', 'title',
  'writing', 'book', 'magazine', 'newspaper', 'document', 'note',
];

/**
 * Check if a photo's alt text suggests it contains text
 */
function likelyContainsText(photo: PexelsPhoto): boolean {
  const altText = (photo.alt || '').toLowerCase();
  return TEXT_INDICATOR_WORDS.some(word => altText.includes(word));
}

/**
 * Extract core concept from title, removing common phrases
 */
function extractCoreConcept(title: string): string {
  const removePatterns = [
    /^how to /i, /^guide to /i, /^the complete /i, /^introduction to /i,
    /^what is /i, /^why you should /i, /^tips for /i, /^\d+ ways to /i,
    / launches? /i, / announces? /i, / unveils? /i, / introduces? /i,
  ];
  
  let cleaned = title;
  for (const pattern of removePatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Extract meaningful words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'this',
    'that', 'how', 'what', 'when', 'where', 'why', 'your', 'our', 'new',
  ]);

  const words = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  return words.slice(0, 2).join(' ') || 'creative';
}

/**
 * Build a brand-aligned Pexels search query
 */
function buildPexelsQuery(title: string, category?: string): string {
  const coreConcept = extractCoreConcept(title);
  
  // Get category-specific modifiers or use defaults
  const categoryKeywords = category && CATEGORY_IMAGE_KEYWORDS[category]
    ? CATEGORY_IMAGE_KEYWORDS[category]
    : ['abstract minimal design', 'geometric pattern', 'modern gradient'];
  
  // Randomly select one category keyword set
  const modifier = categoryKeywords[Math.floor(Math.random() * categoryKeywords.length)];
  
  // Combine with core concept, always adding "abstract" to avoid stock photo look
  return `${coreConcept} ${modifier}`;
}

/**
 * Fetch a brand-aligned image from Pexels API
 * Uses color filtering, text rejection, and abstract/minimal search terms
 */
async function fetchPexelsImage(
  title: string, 
  category?: string
): Promise<string | undefined> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return undefined;

  // Try each brand color until we find a good image
  for (const color of BRAND_COLORS) {
    try {
      const query = buildPexelsQuery(title, category);
      const url = new URL('https://api.pexels.com/v1/search');
      url.searchParams.set('query', query);
      url.searchParams.set('per_page', '10'); // Get more options to filter
      url.searchParams.set('orientation', 'landscape');
      url.searchParams.set('color', color);
      
      const response = await fetch(url.toString(), {
        headers: { Authorization: apiKey },
      });

      if (!response.ok) continue;

      const data: PexelsSearchResponse = await response.json();
      
      // Filter out images that likely contain text
      const textFreePhotos = data.photos.filter(photo => !likelyContainsText(photo));
      
      if (textFreePhotos.length > 0) {
        // Return a random one from the top 5 to add variety
        const topPhotos = textFreePhotos.slice(0, 5);
        const selected = topPhotos[Math.floor(Math.random() * topPhotos.length)];
        return selected.src.large;
      }
    } catch {
      // Continue to next color
    }
  }
  
  // Fallback: try a generic abstract query without color filter
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=abstract+minimal+gradient&per_page=5&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );
    
    if (response.ok) {
      const data: PexelsSearchResponse = await response.json();
      const textFreePhotos = data.photos.filter(photo => !likelyContainsText(photo));
      if (textFreePhotos.length > 0) {
        return textFreePhotos[0].src.large;
      }
    }
  } catch {
    // Give up
  }

  return undefined;
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
      
      // Enrich with brand-aligned images and textures
      console.log('    🖼️ Fetching brand-aligned images...');
      // Map content categories to image search categories
      const imageCategory = category === 'short-form' ? 'social-trends' 
        : category === 'long-form' ? 'ai-creative' 
        : 'design-ux';
      
      for (let i = 0; i < ideas.length; i++) {
        ideas[i].pexelsImageUrl = await fetchPexelsImage(ideas[i].title, imageCategory);
        ideas[i].textureIndex = getRandomTextureIndex();
        if (i < ideas.length - 1) {
          await new Promise(r => setTimeout(r, 300)); // Slightly longer delay for more API calls per image
        }
      }
      const imageCount = ideas.filter(i => i.pexelsImageUrl).length;
      console.log(`    ✓ Fetched ${imageCount}/${ideas.length} brand-aligned images`);
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
  console.log(`Targets: ${TARGET_NEWS_COUNT} news, ${TARGET_FEATURED_ARTICLES} featured, ${TARGET_IDEAS_PER_CATEGORY * 3} ideas`);
  
  try {
    // Fetch RSS feeds
    const rssItems = await fetchAllFeeds();
    
    if (rssItems.length === 0) {
      console.error('\n❌ No RSS items fetched. Check network connectivity.');
      process.exit(1);
    }
    
    // Cluster similar items
    const clusters = clusterSimilarTopics(rssItems);
    
    // Score and sort clusters
    const scoredClusters = clusters.map(cluster => ({
      ...cluster,
      score: scoreCluster(cluster),
    }));
    scoredClusters.sort((a, b) => b.score - a.score);
    
    // Generate featured articles for top clusters (rich content with 40+ sources)
    const featuredArticles = isDryRun ? [] : await generateFeaturedArticles(scoredClusters);
    await saveFeaturedArticles(featuredArticles);
    
    // Get slugs of featured articles for cross-referencing
    const featuredSlugs = new Set(featuredArticles.map(a => a.slug));
    
    // Generate and save news (mark top items as 'featured' if they have rich articles)
    const newsItems = await generateNews(rssItems);
    
    // Update news items: those with matching featured articles get 'featured' tier
    for (const item of newsItems) {
      const slug = generateSlug(item.title);
      if (featuredSlugs.has(slug)) {
        item.tier = 'featured';
      }
    }
    
    await saveNews(newsItems);
    
    // Generate and save ideas
    await generateIdeas(newsItems);
    
    console.log('\n✅ Daily content generation complete!');
    console.log(`   Generated: ${newsItems.length} news + ${featuredArticles.length} featured articles + ${TARGET_IDEAS_PER_CATEGORY * 3} ideas`);
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
