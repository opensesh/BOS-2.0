#!/usr/bin/env npx tsx

/**
 * Featured Article Auto-Selection Script (Tier 1)
 * 
 * Usage:
 *   npx tsx scripts/select-featured.ts
 *   npx tsx scripts/select-featured.ts --count 3
 *   npx tsx scripts/select-featured.ts --generate
 * 
 * This script:
 * 1. Reads news items from /public/data/news/
 * 2. Scores items based on: source count, recency, topic relevance
 * 3. Outputs top candidates for featured article generation
 * 4. Optionally marks items as featured and triggers article generation
 * 
 * Selection Criteria:
 * - Source count (more sources = higher score)
 * - Recency (newer items = higher score)
 * - Topic relevance (brand/design keywords = higher score)
 * - Avoid duplicates with existing featured articles
 */

import * as fs from 'fs';
import * as path from 'path';

const NEWS_DIR = path.join(process.cwd(), 'public/data/news');
const ARTICLES_DIR = path.join(process.cwd(), 'public/data/discover/articles');

interface NewsUpdateItem {
  title: string;
  description?: string;
  timestamp: string;
  sources: Array<{ name: string; url: string }>;
  tier?: 'featured' | 'summary' | 'quick';
  articlePath?: string;
  aiSummary?: string;
}

interface NewsData {
  type: 'weekly-update' | 'monthly-outlook';
  date: string;
  updates: NewsUpdateItem[];
}

interface ScoredItem {
  item: NewsUpdateItem;
  file: string;
  index: number;
  score: number;
  breakdown: {
    sourceScore: number;
    recencyScore: number;
    relevanceScore: number;
  };
}

// Keywords that indicate brand/design relevance
const BRAND_KEYWORDS = [
  'brand', 'design', 'creative', 'agency', 'marketing', 'ui', 'ux',
  'interface', 'visual', 'logo', 'identity', 'typography', 'color',
  'experience', 'product', 'innovation', 'digital', 'strategy',
  'ai', 'artificial intelligence', 'automation', 'tool', 'platform',
  'startup', 'launch', 'funding', 'growth', 'enterprise',
];

// Parse command line arguments
const args = process.argv.slice(2);
const countIndex = args.indexOf('--count');
const targetCount = countIndex !== -1 ? parseInt(args[countIndex + 1], 10) : 3;
const shouldGenerate = args.includes('--generate');
const shouldMark = args.includes('--mark');

/**
 * Calculate relevance score based on brand/design keywords
 */
function calculateRelevanceScore(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  for (const keyword of BRAND_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      score += 10;
    }
  }
  
  return Math.min(score, 50); // Cap at 50
}

/**
 * Calculate recency score (higher for more recent items)
 */
function calculateRecencyScore(timestamp: string): number {
  try {
    const itemDate = new Date(timestamp);
    const now = new Date();
    const hoursAgo = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo < 24) return 50;      // Last 24 hours
    if (hoursAgo < 48) return 40;      // Last 48 hours
    if (hoursAgo < 72) return 30;      // Last 3 days
    if (hoursAgo < 168) return 20;     // Last week
    return 10;                          // Older
  } catch {
    return 10;
  }
}

/**
 * Get list of existing featured article slugs
 */
function getExistingFeaturedSlugs(): Set<string> {
  const slugs = new Set<string>();
  
  if (!fs.existsSync(ARTICLES_DIR)) {
    return slugs;
  }
  
  const files = fs.readdirSync(ARTICLES_DIR);
  for (const file of files) {
    if (file.endsWith('.json') && file !== 'manifest.json') {
      slugs.add(file.replace('.json', ''));
    }
  }
  
  return slugs;
}

/**
 * Generate slug from title (for duplicate checking)
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

async function main() {
  console.log('🎯 Featured Article Auto-Selection\n');
  console.log(`Target: Select top ${targetCount} candidates for featured articles\n`);

  // Get existing featured articles to avoid duplicates
  const existingSlugs = getExistingFeaturedSlugs();
  console.log(`Found ${existingSlugs.size} existing featured articles\n`);

  // Find all news items
  const newsCategories = ['weekly-update', 'monthly-outlook'];
  const allItems: ScoredItem[] = [];

  for (const category of newsCategories) {
    const filePath = path.join(NEWS_DIR, category, 'latest.json');
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      continue;
    }

    const data: NewsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    for (let i = 0; i < data.updates.length; i++) {
      const item = data.updates[i];
      
      // Skip items already marked as featured
      if (item.tier === 'featured' || item.articlePath) {
        continue;
      }
      
      // Skip if we already have a featured article for this title
      const slug = generateSlug(item.title);
      if (existingSlugs.has(slug)) {
        continue;
      }
      
      // Calculate scores
      const sourceScore = Math.min(item.sources.length * 10, 30); // Cap at 30
      const recencyScore = calculateRecencyScore(item.timestamp);
      const relevanceScore = calculateRelevanceScore(
        `${item.title} ${item.description || ''}`
      );
      
      const totalScore = sourceScore + recencyScore + relevanceScore;
      
      allItems.push({
        item,
        file: filePath,
        index: i,
        score: totalScore,
        breakdown: { sourceScore, recencyScore, relevanceScore },
      });
    }
  }

  // Sort by score (descending)
  allItems.sort((a, b) => b.score - a.score);

  // Select top candidates
  const candidates = allItems.slice(0, targetCount);

  console.log('📊 Top Candidates for Featured Articles:\n');
  console.log('═'.repeat(80));
  
  candidates.forEach((c, i) => {
    console.log(`\n#${i + 1} Score: ${c.score}/130`);
    console.log(`   📰 "${c.item.title}"`);
    console.log(`   📊 Sources: ${c.item.sources.length} | Recency: ${c.breakdown.recencyScore} | Relevance: ${c.breakdown.relevanceScore}`);
    console.log(`   🔗 First source: ${c.item.sources[0]?.url.slice(0, 60)}...`);
  });
  
  console.log('\n' + '═'.repeat(80));

  // Output slugs for use with article generation
  console.log('\n📋 Slugs for generation:');
  candidates.forEach(c => {
    console.log(`   - ${generateSlug(c.item.title)}`);
  });

  // Mark items as featured if requested
  if (shouldMark) {
    console.log('\n✏️ Marking items as featured candidates...');
    
    // Group by file
    const fileGroups = new Map<string, typeof candidates>();
    for (const candidate of candidates) {
      const group = fileGroups.get(candidate.file) || [];
      group.push(candidate);
      fileGroups.set(candidate.file, group);
    }
    
    for (const [filePath, items] of fileGroups) {
      const data: NewsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      for (const { index } of items) {
        // Mark as featured candidate (not yet generated)
        data.updates[index].tier = 'featured';
      }
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`   💾 Updated ${path.basename(filePath)}`);
    }
    
    console.log('✅ Items marked as featured candidates');
  }

  // Generate featured articles if requested
  if (shouldGenerate) {
    console.log('\n🚀 Article generation requested...');
    console.log('   Run the following command to generate featured articles:');
    console.log('   npx tsx scripts/generate-discover-articles.ts');
  }

  console.log('\n✅ Selection complete!');
  console.log('\nNext steps:');
  console.log('   1. Review the candidates above');
  console.log('   2. Run with --mark to mark them as featured');
  console.log('   3. Run generate-discover-articles.ts to create full articles');
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});

