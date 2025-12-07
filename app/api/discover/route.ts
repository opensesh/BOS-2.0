/**
 * Discover Search API
 * 
 * Searches across RSS feed content from the discover page.
 * Returns relevant articles based on user query.
 */

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { NewsData } from '@/types';
import { 
  searchNewsData, 
  getRelevantCategories, 
  formatDiscoverResultsForAI,
  DiscoverSearchResult 
} from '@/lib/discover-search';
import { processNewsData } from '@/lib/discover-utils';

interface SearchRequestBody {
  query: string;
  maxResults?: number;
  categories?: string[];
  includeFormatted?: boolean;
}

/**
 * Load news data from JSON files
 */
async function loadAllNewsData() {
  const types = ['weekly-update', 'monthly-outlook'];
  const allNews = [];

  for (const type of types) {
    try {
      const filePath = join(process.cwd(), 'public', 'data', 'news', type, 'latest.json');
      const data = await readFile(filePath, 'utf-8');
      const newsData: NewsData = JSON.parse(data);
      const processed = processNewsData(newsData);
      allNews.push(...processed);
    } catch (error) {
      console.error(`Failed to load ${type} news data:`, error);
    }
  }

  return allNews;
}

export async function POST(request: Request) {
  try {
    const body: SearchRequestBody = await request.json();
    const { query, maxResults = 5, categories, includeFormatted = false } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Load all news data
    const newsData = await loadAllNewsData();

    if (newsData.length === 0) {
      return NextResponse.json({
        results: [],
        query,
        searchedCategories: [],
        totalResults: 0,
        message: 'No discover content available',
      });
    }

    // Get relevant categories if not specified
    const searchCategories = categories || getRelevantCategories(query);

    // Search the news data
    const results = searchNewsData(newsData, query, {
      maxResults,
      categories: searchCategories,
      minRelevance: 3,
    });

    const response: {
      results: DiscoverSearchResult[];
      query: string;
      searchedCategories: string[];
      totalResults: number;
      formatted?: string;
    } = {
      results,
      query,
      searchedCategories: searchCategories,
      totalResults: results.length,
    };

    // Include formatted context for AI if requested
    if (includeFormatted && results.length > 0) {
      response.formatted = formatDiscoverResultsForAI(results);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Discover search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const maxResults = parseInt(searchParams.get('max') || '5', 10);

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter (q) is required' },
      { status: 400 }
    );
  }

  // Reuse POST logic
  const fakeRequest = {
    json: async () => ({ query, maxResults }),
  } as Request;

  return POST(fakeRequest);
}


