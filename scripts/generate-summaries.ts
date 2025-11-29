#!/usr/bin/env npx tsx

/**
 * Generate AI Summaries Script (Tier 2 Content)
 * 
 * Usage:
 *   npx tsx scripts/generate-summaries.ts
 *   npx tsx scripts/generate-summaries.ts --dry-run
 *   npx tsx scripts/generate-summaries.ts --max 10
 * 
 * This script:
 * 1. Reads news items from /public/data/news/
 * 2. Identifies items without AI summaries (Tier 2 candidates)
 * 3. Generates 2-3 paragraph summaries using Claude Haiku
 * 4. Writes back to JSON with tier: 'summary' and aiSummary field
 * 
 * Cost estimate: ~50 summaries/month = ~$0.50/month
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateSummary, estimateCost, SummaryInput } from '../lib/article-generator/summary-generator';

const NEWS_DIR = path.join(process.cwd(), 'public/data/news');

interface NewsUpdateItem {
  title: string;
  description?: string;
  timestamp: string;
  sources: Array<{ name: string; url: string }>;
  tier?: 'featured' | 'summary' | 'quick';
  articlePath?: string;
  aiSummary?: string;
  sourceUrl?: string;
}

interface NewsData {
  type: 'weekly-update' | 'monthly-outlook';
  date: string;
  updates: NewsUpdateItem[];
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const maxIndex = args.indexOf('--max');
const maxItems = maxIndex !== -1 ? parseInt(args[maxIndex + 1], 10) : Infinity;

async function main() {
  console.log('📝 AI Summary Generator for Tier 2 Content\n');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (no changes will be made)' : '✏️ LIVE RUN'}\n`);

  // Find all news JSON files
  const newsCategories = ['weekly-update', 'monthly-outlook'];
  const candidates: Array<{ file: string; item: NewsUpdateItem; index: number }> = [];

  for (const category of newsCategories) {
    const filePath = path.join(NEWS_DIR, category, 'latest.json');
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      continue;
    }

    const data: NewsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    for (let i = 0; i < data.updates.length; i++) {
      const item = data.updates[i];
      
      // Skip items that already have a tier assigned
      if (item.tier === 'featured' || item.tier === 'summary' || item.tier === 'quick') {
        continue;
      }
      
      // Skip items that already have an AI summary
      if (item.aiSummary) {
        continue;
      }
      
      // Skip items with articlePath (they're featured)
      if (item.articlePath) {
        continue;
      }
      
      candidates.push({ file: filePath, item, index: i });
    }
  }

  console.log(`Found ${candidates.length} items without summaries\n`);

  if (candidates.length === 0) {
    console.log('✅ No items need summaries. All done!');
    return;
  }

  // Limit items to process
  const toProcess = candidates.slice(0, maxItems);
  
  // Estimate cost
  const costEstimate = estimateCost(toProcess.length);
  console.log(`📊 Processing ${toProcess.length} items`);
  console.log(`💰 Estimated cost: $${costEstimate.estimatedCostUsd.toFixed(4)}`);
  console.log(`   ${costEstimate.breakdown}\n`);

  if (isDryRun) {
    console.log('📋 Items that would be processed:\n');
    toProcess.forEach((c, i) => {
      console.log(`   ${i + 1}. "${c.item.title.slice(0, 60)}..."`);
    });
    console.log('\n🔍 Dry run complete. No changes made.');
    return;
  }

  // Group by file for efficient updates
  const fileGroups = new Map<string, typeof toProcess>();
  for (const candidate of toProcess) {
    const group = fileGroups.get(candidate.file) || [];
    group.push(candidate);
    fileGroups.set(candidate.file, group);
  }

  let successCount = 0;
  let errorCount = 0;

  // Process each file
  for (const [filePath, items] of fileGroups) {
    console.log(`\n📂 Processing ${path.basename(path.dirname(filePath))}/${path.basename(filePath)}:`);
    
    // Read the current data
    const data: NewsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    for (const { item, index } of items) {
      process.stdout.write(`   → Generating summary for "${item.title.slice(0, 40)}..."... `);
      
      try {
        const input: SummaryInput = {
          title: item.title,
          description: item.description || item.title,
          sources: item.sources,
        };
        
        const result = await generateSummary(input);
        
        // Update the item in the data
        data.updates[index].tier = 'summary';
        data.updates[index].aiSummary = result.summary;
        data.updates[index].sourceUrl = item.sources[0]?.url;
        
        console.log('✅');
        successCount++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log('❌');
        console.error(`      Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }
    
    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`   💾 Saved updates to ${path.basename(filePath)}`);
  }

  console.log(`\n✅ Summary generation complete!`);
  console.log(`   Success: ${successCount} | Errors: ${errorCount}`);
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});

