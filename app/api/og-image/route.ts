import { NextRequest, NextResponse } from 'next/server';

// Cache for OG data to avoid repeated fetches
const ogCache = new Map<string, { data: OGData; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface OGData {
  image: string | null;
  title: string | null;
  description: string | null;
  siteName: string | null;
  favicon: string | null;
}

async function extractOGData(url: string): Promise<OGData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract OG meta tags
    const getMetaContent = (property: string): string | null => {
      const patterns = [
        new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
        new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    // Extract favicon
    const getFavicon = (): string | null => {
      const faviconPatterns = [
        /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
        /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
      ];
      
      for (const pattern of faviconPatterns) {
        const match = html.match(pattern);
        if (match) {
          const href = match[1];
          // Make absolute URL if relative
          if (href.startsWith('//')) return `https:${href}`;
          if (href.startsWith('/')) {
            const urlObj = new URL(url);
            return `${urlObj.origin}${href}`;
          }
          if (!href.startsWith('http')) {
            const urlObj = new URL(url);
            return `${urlObj.origin}/${href}`;
          }
          return href;
        }
      }
      
      // Default to /favicon.ico
      try {
        const urlObj = new URL(url);
        return `${urlObj.origin}/favicon.ico`;
      } catch {
        return null;
      }
    };

    const ogImage = getMetaContent('og:image') || getMetaContent('twitter:image');
    const ogTitle = getMetaContent('og:title') || getMetaContent('twitter:title');
    const ogDescription = getMetaContent('og:description') || getMetaContent('twitter:description') || getMetaContent('description');
    const ogSiteName = getMetaContent('og:site_name');

    // Make image URL absolute if relative
    let absoluteImage = ogImage;
    if (ogImage && !ogImage.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        absoluteImage = ogImage.startsWith('/') 
          ? `${urlObj.origin}${ogImage}`
          : `${urlObj.origin}/${ogImage}`;
      } catch {
        absoluteImage = ogImage;
      }
    }

    return {
      image: absoluteImage,
      title: ogTitle,
      description: ogDescription,
      siteName: ogSiteName,
      favicon: getFavicon(),
    };
  } catch (error) {
    console.error('Error extracting OG data:', error);
    return {
      image: null,
      title: null,
      description: null,
      siteName: null,
      favicon: null,
    };
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Check cache
  const cached = ogCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  // Extract OG data
  const ogData = await extractOGData(url);

  // Cache the result
  ogCache.set(url, { data: ogData, timestamp: Date.now() });

  return NextResponse.json(ogData);
}

