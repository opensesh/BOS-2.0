/**
 * Script to capture screenshots of all resources in the Inspiration Design Resources table
 * using shot-scraper CLI tool.
 *
 * Run with: npm run capture-screenshots
 *
 * Prerequisites:
 * - shot-scraper installed: pip3 install --user shot-scraper
 * - Browser installed: shot-scraper install
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

const execAsync = promisify(exec);

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to shot-scraper (installed with --user flag)
const SHOT_SCRAPER_PATH = '/Users/alexbouhdary/Library/Python/3.8/bin/shot-scraper';

// Screenshots directory (relative to project root)
const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'assets', 'screenshots');

// Screenshot settings
const SCREENSHOT_WIDTH = 1280;
const SCREENSHOT_HEIGHT = 800;
const WAIT_TIME = 3000; // Wait 3s for page to load
const DELAY_BETWEEN = 2000; // 2s delay between requests to be polite

// Type for resource from database
interface InspoResource {
  ID: number;
  Name: string;
  URL: string;
  screenshot?: string | null;
}

/**
 * Capture a screenshot of a URL using shot-scraper
 */
async function captureScreenshot(url: string, outputPath: string): Promise<boolean> {
  try {
    // Build the shot-scraper command
    const command = `"${SHOT_SCRAPER_PATH}" "${url}" -o "${outputPath}" -w ${SCREENSHOT_WIDTH} -h ${SCREENSHOT_HEIGHT} --wait ${WAIT_TIME} --quality 85`;

    await execAsync(command, { timeout: 60000 }); // 60s timeout per screenshot
    return true;
  } catch (error) {
    const err = error as Error & { stderr?: string };
    console.error(`  Screenshot failed: ${err.message || err.stderr || 'Unknown error'}`);
    return false;
  }
}

/**
 * Sanitize filename from resource name
 */
function sanitizeFilename(name: string, id: number): string {
  // Use ID as primary identifier for uniqueness, with sanitized name for readability
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  return `${id}-${safeName}.jpg`;
}

async function main() {
  console.log('📸 Capturing screenshots for Inspiration Design Resources\n');
  console.log(`Screenshots will be saved to: ${SCREENSHOTS_DIR}\n`);

  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    console.log('Created screenshots directory\n');
  }

  // Fetch all resources
  console.log('🔍 Fetching resources from Supabase...\n');
  const { data: resources, error: fetchError } = await supabase
    .from('Inspiration Design Resources')
    .select('ID, Name, URL, screenshot')
    .order('ID', { ascending: true });

  if (fetchError) {
    console.error('❌ Failed to fetch resources:', fetchError.message);
    process.exit(1);
  }

  if (!resources || resources.length === 0) {
    console.log('No resources found in database.');
    process.exit(0);
  }

  // Filter to only resources without screenshots (resumable)
  const needsScreenshot = (resources as InspoResource[]).filter(
    r => !r.screenshot || r.screenshot.trim() === ''
  );

  const alreadyHas = resources.length - needsScreenshot.length;

  if (alreadyHas > 0) {
    console.log(`ℹ️  Skipping ${alreadyHas} resources that already have screenshots\n`);
  }

  if (needsScreenshot.length === 0) {
    console.log('✅ All resources already have screenshots!');
    process.exit(0);
  }

  console.log(`📷 Capturing screenshots for ${needsScreenshot.length} resources...\n`);
  console.log('─'.repeat(60));

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < needsScreenshot.length; i++) {
    const resource = needsScreenshot[i];
    const progress = `[${i + 1}/${needsScreenshot.length}]`;

    console.log(`\n${progress} ${resource.Name}`);
    console.log(`    URL: ${resource.URL}`);

    // Generate filename
    const filename = sanitizeFilename(resource.Name, resource.ID);
    const outputPath = path.join(SCREENSHOTS_DIR, filename);
    const relativePath = `/assets/screenshots/${filename}`;

    // Capture screenshot
    const success = await captureScreenshot(resource.URL, outputPath);

    if (success && fs.existsSync(outputPath)) {
      // Update the database with the relative path
      const { error: updateError } = await supabase
        .from('Inspiration Design Resources')
        .update({ screenshot: relativePath })
        .eq('ID', resource.ID);

      if (updateError) {
        console.log(`    ✗ DB update failed: ${updateError.message}`);
        failed++;
      } else {
        const stats = fs.statSync(outputPath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`    ✓ Saved: ${filename} (${sizeKB} KB)`);
        successful++;
      }
    } else {
      failed++;
    }

    // Delay between requests (except for last one)
    if (i < needsScreenshot.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN));
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`\n✅ Complete! ${successful} successful, ${failed} failed.`);

  if (failed > 0) {
    console.log(`\nTip: Run again to retry failed resources.`);
  }

  // Show disk usage
  const files = fs.readdirSync(SCREENSHOTS_DIR);
  const totalSize = files.reduce((sum, file) => {
    const filePath = path.join(SCREENSHOTS_DIR, file);
    try {
      return sum + fs.statSync(filePath).size;
    } catch {
      return sum;
    }
  }, 0);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`\n📁 Screenshots folder: ${files.length} files, ${totalMB} MB total`);
}

main().catch(console.error);
