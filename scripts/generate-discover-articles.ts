#!/usr/bin/env npx tsx

/**
 * Generate Discover Articles Script
 * 
 * Usage:
 *   npx tsx scripts/generate-discover-articles.ts
 *   npm run generate:articles
 * 
 * This script:
 * 1. Fetches trending topics from RSS feeds
 * 2. Generates articles with 40+ sources each
 * 3. Saves them to public/data/discover/articles/
 */

import { generateArticles, buildManifest } from '../lib/article-generator';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public/data/discover/articles');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

async function main() {
  console.log('🚀 Starting discover article generation...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Generate articles
  const maxArticles = parseInt(process.env.MAX_ARTICLES || '5', 10);
  const articles = await generateArticles(maxArticles);

  if (articles.length === 0) {
    console.error('❌ No articles were generated');
    process.exit(1);
  }

  // Save each article as a separate JSON file
  for (const article of articles) {
    const filePath = path.join(OUTPUT_DIR, `${article.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(article, null, 2));
    console.log(`💾 Saved: ${article.slug}.json (${article.totalSources} sources)`);
  }

  // Save manifest
  const manifest = buildManifest(articles);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Saved manifest with ${articles.length} articles`);

  console.log('\n✅ Article generation complete!');
  console.log(`   Articles saved to: ${OUTPUT_DIR}`);
}

// Run the script
main().catch((error) => {
  console.error('❌ Generation failed:', error);
  process.exit(1);
});

