#!/usr/bin/env npx tsx

/**
 * Standalone Ideas Generation Script
 * 
 * Generates content ideas independently from news using category-specific sources
 * Can be run manually or via GitHub Actions
 * 
 * Usage:
 *   npx tsx scripts/generate-ideas.ts
 *   npx tsx scripts/generate-ideas.ts --category=short-form
 *   npx tsx scripts/generate-ideas.ts --no-perplexity
 *   npx tsx scripts/generate-ideas.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import { getSourcesForDailyFetch, RSSSource } from '../lib/content-generator/rss-sources';
import { generateIdeasBatch } from '../lib/content-generator/ideas-generator';
import type { IdeaData } from '../types';

// ===========================================
// Configuration
// ===========================================

const DATA_DIR = path.join(process.cwd(), 'public/data');
const IDEAS_DIR = path.join(DATA_DIR, 'weekly-ideas');

const TARGET_IDEAS_PER_CATEGORY = 5;
const SONIC_LINE_TEXTURE_COUNT = 13;

// Parse arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const usePerplexity = !args.includes('--no-perplexity');
const categoryArg = args.find(arg => arg.startsWith('--category='))?.split('=')[1] as 'short-form' | 'long-form' | 'blog' | 'all' | undefined;
const targetCategory = categoryArg || 'all';

// ===========================================
// Category-Specific Source Selection
// ===========================================

/**
 * Get sources optimized for each content category
 */
function getSourcesForCategory(category: 'short-form' | 'long-form' | 'blog'): RSSSource[] {
  const allSources = getSourcesForDailyFetch();
  
  if (category === 'short-form') {
    // Visual, social, trendy sources for short-form
    const prioritySources = [
      'Figma Blog',
      'Awwwards',
      'Dribbble',
      'Gary Vaynerchuk',
      'Oren Meets World',
      'Freethink',
      'TechCrunch',
    ];
    
    return allSources.filter(s => 
      prioritySources.includes(s.name) || 
      s.category === 'design-ux' || 
      s.category === 'social-trends'
    ).slice(0, 15); // Limit to top 15 sources
  }
  
  if (category === 'long-form') {
    // Thought leadership, framework sources for long-form
    const prioritySources = [
      "Lenny's Newsletter",
      'a16z',
      'Sequoia Capital',
      'Marcus on AI (Gary Marcus)',
      'Derek Thompson',
      'Naval Ravikant',
      'Peter Yang (Creator Economy)',
      'SemiAnalysis',
    ];
    
    return allSources.filter(s => 
      prioritySources.includes(s.name) || 
      s.category === 'startup-business' ||
      s.category === 'ai-creative'
    ).slice(0, 15);
  }
  
  // Blog - analysis, vision, explanation sources
  const prioritySources = [
    'Love + Money',
    'AI Patterns (Tommy Geoco)',
    'Derek Thompson',
    'MIT Technology Review AI',
    'Marcus on AI (Gary Marcus)',
    "Lenny's Newsletter",
    'Oren Meets World',
  ];
  
  return allSources.filter(s => 
    prioritySources.includes(s.name) ||
    s.category === 'ai-creative' ||
    s.category === 'design-ux' ||
    s.category === 'startup-business'
  ).slice(0, 15);
}

// ===========================================
// RSS Fetching (simplified from daily-content-generation.ts)
// ===========================================

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  source: string;
  thumbnailUrl?: string;
}

/**
 * Simple RSS parsing
 */
function parseRSS(xml: string, source: RSSSource): RSSItem[] {
  const items: RSSItem[] = [];
  const rssItemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = rssItemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const dateMatch = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    
    if (titleMatch) {
      const title = titleMatch[1].trim().replace(/<[^>]+>/g, '').substring(0, 200);
      const link = linkMatch ? linkMatch[1].trim() : source.url;
      const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 500) : undefined;
      
      if (title.length > 10) {
        items.push({
          title,
          link,
          pubDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
          description,
          source: source.name,
        });
      }
    }
  }
  
  return items;
}

/**
 * Fetch a single RSS feed
 */
async function fetchFeed(source: RSSSource): Promise<RSSItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BOSContentBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
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
  } catch (error) {
    console.warn(`  ⚠️ ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
}

/**
 * Fetch RSS feeds for a specific category
 */
async function fetchFeedsForCategory(category: 'short-form' | 'long-form' | 'blog'): Promise<RSSItem[]> {
  console.log(`\n📡 Fetching ${category} sources...`);
  
  const sources = getSourcesForCategory(category);
  console.log(`  Sources: ${sources.map(s => s.name).join(', ')}`);
  
  const allItems: RSSItem[] = [];
  
  // Fetch in parallel with batching
  const batchSize = 8;
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fetchFeed));
    results.forEach(items => allItems.push(...items));
  }
  
  console.log(`  📊 Total items: ${allItems.length}`);
  return allItems;
}

// ===========================================
// Idea Generation
// ===========================================

/**
 * Get random texture index
 */
function getRandomTextureIndex(): number {
  return Math.floor(Math.random() * SONIC_LINE_TEXTURE_COUNT);
}

/**
 * Generate ideas for a category
 */
async function generateIdeasForCategory(
  category: 'short-form' | 'long-form' | 'blog'
): Promise<void> {
  console.log(`\n💡 Generating ${category} ideas...`);
  
  // Fetch RSS items
  const rssItems = await fetchFeedsForCategory(category);
  
  if (rssItems.length === 0) {
    console.error(`  ❌ No RSS items fetched for ${category}`);
    return;
  }
  
  // Select top items (most recent)
  const topItems = rssItems
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 8); // Get top 8 most recent
  
  // Convert to topics format
  const topics = topItems.map(item => ({
    title: item.title,
    description: item.description || item.title,
    sources: [{
      name: item.source,
      url: item.link,
    }],
  }));
  
  console.log(`  Using ${topics.length} topics for idea generation`);
  
  // Generate ideas with rich briefs
  const ideas = await generateIdeasBatch(topics, category, {
    maxIdeas: TARGET_IDEAS_PER_CATEGORY,
    delayMs: 500,
    onProgress: (completed, total) => {
      process.stdout.write(`    Progress: ${completed}/${total}\r`);
    },
  });
  
  console.log(`\n  ✓ Generated ${ideas.length} ideas`);
  
  // Assign random texture indices
  for (const idea of ideas) {
    idea.textureIndex = getRandomTextureIndex();
  }
  
  // Mark first idea as starred
  if (ideas.length > 0) ideas[0].starred = true;
  
  // Save to JSON
  const today = new Date().toISOString();
  const dateString = today.split('T')[0];
  
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
    console.log(`  ✓ Saved to ${category}/latest.json`);
  }
}

// ===========================================
// Main
// ===========================================

async function main() {
  console.log('🚀 OPEN SESSION Ideas Generation');
  console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN' : '✏️ LIVE'}`);
  console.log(`Category: ${targetCategory}`);
  console.log(`Perplexity: ${usePerplexity ? 'Enabled' : 'Disabled'}`);
  console.log(`Target: ${TARGET_IDEAS_PER_CATEGORY} ideas per category`);
  
  try {
    const categories: Array<'short-form' | 'long-form' | 'blog'> = 
      targetCategory === 'all' 
        ? ['short-form', 'long-form', 'blog']
        : [targetCategory as 'short-form' | 'long-form' | 'blog'];
    
    for (const category of categories) {
      await generateIdeasForCategory(category);
    }
    
    console.log('\n✅ Ideas generation complete!');
    console.log(`   Generated: ${categories.length * TARGET_IDEAS_PER_CATEGORY} ideas total`);
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
