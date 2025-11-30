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

// Extract keywords from a title for better search results
function extractKeywords(title: string): string {
  // Remove common filler words and special characters
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

  // Take the first 3-4 meaningful words
  return words.slice(0, 4).join(' ');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawQuery = searchParams.get('query');
  const perPage = searchParams.get('per_page') || '1';

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
    // Extract meaningful keywords from the query
    const query = extractKeywords(rawQuery);
    
    if (!query) {
      // Fallback to generic creative/design search
      return fetchPexelsImage('creative design technology', apiKey, perPage);
    }

    return fetchPexelsImage(query, apiKey, perPage);
  } catch (error) {
    console.error('Pexels API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Pexels' },
      { status: 500 }
    );
  }
}

async function fetchPexelsImage(query: string, apiKey: string, perPage: string) {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pexels API error response:', errorText);
    return NextResponse.json(
      { error: `Pexels API error: ${response.status}` },
      { status: response.status }
    );
  }

  const data: PexelsSearchResponse = await response.json();

  if (data.photos.length === 0) {
    // Try a more generic fallback search
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
        const photo = fallbackData.photos[0];
        return NextResponse.json({
          imageUrl: photo.src.large,
          photographer: photo.photographer,
          pexelsUrl: photo.url,
          alt: photo.alt || 'Abstract technology image',
        });
      }
    }

    return NextResponse.json(
      { error: 'No images found', imageUrl: null },
      { status: 404 }
    );
  }

  const photo = data.photos[0];
  
  return NextResponse.json({
    imageUrl: photo.src.large,
    photographer: photo.photographer,
    pexelsUrl: photo.url,
    alt: photo.alt || query,
  });
}

