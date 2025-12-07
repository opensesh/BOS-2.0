/**
 * One-time script to populate thumbnails for all resources in Supabase
 * using Open Graph scraping.
 *
 * Run with: npm run fetch-thumbnails
 */

import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ogs = require('open-graph-scraper');

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseKey) console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\nMake sure these are set in your .env.local file');
  process.exit(1);
}

// Create Supabase client for Node.js usage
const supabase = createClient(supabaseUrl, supabaseKey);

// Type for resource from database
interface InspoResource {
  ID: number;
  Name: string;
  URL: string;
  Thumbnail?: string | null;
}

// Type for OGS result
interface OgsResult {
  error: boolean;
  result: {
    ogImage?: Array<{ url: string }> | { url: string };
  };
}

// Open Graph Scraper options
const OGS_OPTIONS = {
  timeout: 10000, // 10 seconds
  fetchOptions: {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; OpenSessionBot/1.0)',
    },
  },
};

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Extract og:image from scraper result
function extractOgImage(result: OgsResult): string | null {
  const ogImage = result.result.ogImage;

  if (!ogImage) return null;

  // ogImage can be an array or single object
  if (Array.isArray(ogImage) && ogImage.length > 0) {
    return ogImage[0].url || null;
  }

  if (typeof ogImage === 'object' && 'url' in ogImage) {
    return (ogImage as { url: string }).url || null;
  }

  return null;
}

async function fetchThumbnail(url: string): Promise<string | null> {
  try {
    const result: OgsResult = await ogs({ url, ...OGS_OPTIONS });

    if (result.error) {
      return null;
    }

    return extractOgImage(result);
  } catch {
    return null;
  }
}

async function main() {
  console.log('🔍 Fetching resources from Supabase...\n');

  // Fetch all resources
  const { data: resources, error: fetchError } = await supabase
    .from('Inspiration Design Resources')
    .select('ID, Name, URL, Thumbnail')
    .order('ID', { ascending: true });

  if (fetchError) {
    console.error('❌ Failed to fetch resources:', fetchError.message);
    process.exit(1);
  }

  if (!resources || resources.length === 0) {
    console.log('No resources found in database.');
    process.exit(0);
  }

  // Filter to only resources without thumbnails (resumable)
  const needsThumbnail = (resources as InspoResource[]).filter(
    r => !r.Thumbnail || r.Thumbnail.trim() === ''
  );

  const alreadyHas = resources.length - needsThumbnail.length;

  if (alreadyHas > 0) {
    console.log(`ℹ️  Skipping ${alreadyHas} resources that already have thumbnails\n`);
  }

  if (needsThumbnail.length === 0) {
    console.log('✅ All resources already have thumbnails!');
    process.exit(0);
  }

  console.log(`Fetching thumbnails for ${needsThumbnail.length} resources...\n`);

  let successful = 0;
  let failed = 0;

  for (const resource of needsThumbnail) {
    const thumbnailUrl = await fetchThumbnail(resource.URL);

    if (thumbnailUrl) {
      // Update the database
      const { error: updateError } = await supabase
        .from('Inspiration Design Resources')
        .update({ Thumbnail: thumbnailUrl })
        .eq('ID', resource.ID);

      if (updateError) {
        console.log(`✗ ${resource.Name}: DB update failed - ${updateError.message}`);
        failed++;
      } else {
        console.log(`✓ ${resource.Name}: ${thumbnailUrl.substring(0, 60)}...`);
        successful++;
      }
    } else {
      console.log(`✗ ${resource.Name}: No og:image found`);
      failed++;
    }

    // Be polite to servers - wait 500ms between requests
    await delay(500);
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Complete! ${successful} successful, ${failed} failed.`);

  if (failed > 0) {
    console.log(`\nTip: Run again to retry failed resources, or manually add thumbnails.`);
  }
}

main().catch(console.error);
