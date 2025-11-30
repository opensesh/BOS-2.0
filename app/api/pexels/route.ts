import { NextRequest, NextResponse } from 'next/server';

/**
 * Pexels API Route
 * 
 * Fetches relevant images from Pexels based on a search query.
 * Used during content generation to get thumbnail images for idea cards.
 * 
 * Query params:
 *   - query: Search term (idea title or keywords)
 *   - per_page: Number of results (default: 1)
 * 
 * Returns:
 *   - imageUrl: URL of the best matching image
 *   - photographer: Attribution for the image
 *   - pexelsUrl: Link to the photo on Pexels
 */

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

// Category-specific image modifiers for brand-aligned imagery
const CATEGORY_MODIFIERS: Record<string, string[]> = {
  'design': ['geometric abstract minimal', 'clean lines architecture', 'modern gradient'],
  'ai': ['futuristic abstract digital', 'technology minimal', 'neural network abstract'],
  'brand': ['minimal typography layout', 'modern workspace', 'clean design'],
  'tech': ['technology abstract pattern', 'circuit minimal', 'digital abstract'],
  'social': ['colorful abstract gradient', 'vibrant geometric', 'modern pattern'],
  'default': ['abstract minimal design', 'geometric pattern', 'modern gradient'],
};

// Words that indicate text in images (to avoid)
const TEXT_INDICATOR_WORDS = [
  'sign', 'banner', 'poster', 'billboard', 'quote', 'typography', 'text',
  'letter', 'writing', 'book', 'magazine', 'newspaper', 'document',
];

// Extract keywords and determine category for brand-aligned search
function extractKeywordsAndCategory(title: string): { keywords: string; category: string } {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', "it's", 'how', 'what', 'when', 'where', 'why', 'which',
    'your', 'our', 'their', 'my', 'his', 'her', 'we', 'you', 'they',
    'reel', 'carousel', 'blog', 'post', 'video', 'article', 'content',
    'launches', 'announces', 'unveils', 'introduces', 'new', 'guide',
  ]);

  const titleLower = title.toLowerCase();
  
  // Determine category based on keywords
  let category = 'default';
  if (titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('ui') || titleLower.includes('figma')) {
    category = 'design';
  } else if (titleLower.includes('ai') || titleLower.includes('gpt') || titleLower.includes('claude') || titleLower.includes('machine learning')) {
    category = 'ai';
  } else if (titleLower.includes('brand') || titleLower.includes('logo') || titleLower.includes('identity')) {
    category = 'brand';
  } else if (titleLower.includes('tech') || titleLower.includes('software') || titleLower.includes('startup')) {
    category = 'tech';
  } else if (titleLower.includes('social') || titleLower.includes('instagram') || titleLower.includes('tiktok')) {
    category = 'social';
  }

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  return {
    keywords: words.slice(0, 2).join(' '),
    category,
  };
}

// Build a brand-aligned search query
function buildBrandAlignedQuery(title: string): string {
  const { keywords, category } = extractKeywordsAndCategory(title);
  const modifiers = CATEGORY_MODIFIERS[category] || CATEGORY_MODIFIERS['default'];
  // Pick a random modifier for variety
  const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
  
  // Combine core keyword with brand-aligned modifier
  if (keywords) {
    return `${keywords} ${modifier}`;
  }
  return modifier;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawQuery = searchParams.get('query');
  const perPage = searchParams.get('per_page') || '5'; // Get more to filter

  if (!rawQuery) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Pexels API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Build brand-aligned query
    const query = buildBrandAlignedQuery(rawQuery);
    
    return fetchPexelsImage(query, apiKey, parseInt(perPage));
  } catch (error) {
    console.error('Pexels API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Pexels' },
      { status: 500 }
    );
  }
}

// Check if a photo's alt text suggests it contains text
function isLikelyTextFree(photo: PexelsPhoto): boolean {
  const altText = (photo.alt || '').toLowerCase();
  return !TEXT_INDICATOR_WORDS.some(word => altText.includes(word));
}

// Brand-aligned colors (Vanilla/Charcoal/Aperol palette)
const BRAND_COLORS = ['orange', 'black', 'white'] as const;

async function fetchPexelsImage(query: string, apiKey: string, perPage: number) {
  // Try with different brand colors for variety
  for (const color of BRAND_COLORS) {
    try {
      const url = new URL('https://api.pexels.com/v1/search');
      url.searchParams.set('query', query);
      url.searchParams.set('per_page', perPage.toString());
      url.searchParams.set('orientation', 'landscape');
      url.searchParams.set('color', color);
      
      const response = await fetch(url.toString(), {
        headers: { Authorization: apiKey },
      });

      if (!response.ok) continue;

      const data: PexelsSearchResponse = await response.json();
      
      // Filter out images that likely contain text
      const textFreePhotos = data.photos.filter(isLikelyTextFree);
      
      if (textFreePhotos.length > 0) {
        // Return a random one from top results for variety
        const photo = textFreePhotos[Math.floor(Math.random() * Math.min(textFreePhotos.length, 3))];
        return NextResponse.json({
          imageUrl: photo.src.large,
          photographer: photo.photographer,
          pexelsUrl: photo.url,
          alt: photo.alt || 'Abstract design image',
        });
      }
    } catch {
      continue;
    }
  }
  
  // Fallback: generic abstract search without color filter
  try {
    const fallbackResponse = await fetch(
      `https://api.pexels.com/v1/search?query=abstract+minimal+gradient&per_page=5&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );

    if (fallbackResponse.ok) {
      const fallbackData: PexelsSearchResponse = await fallbackResponse.json();
      const textFreePhotos = fallbackData.photos.filter(isLikelyTextFree);
      
      if (textFreePhotos.length > 0) {
        const photo = textFreePhotos[0];
        return NextResponse.json({
          imageUrl: photo.src.large,
          photographer: photo.photographer,
          pexelsUrl: photo.url,
          alt: photo.alt || 'Abstract minimal image',
        });
      }
    }
  } catch {
    // Fall through to error
  }

  return NextResponse.json(
    { error: 'No suitable images found', imageUrl: null },
    { status: 404 }
  );
}

