import { NextRequest, NextResponse } from 'next/server';

// Yahoo Finance API via RapidAPI
const RAPIDAPI_HOST = 'yahoo-finance15.p.rapidapi.com';
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}/api/v1`;

// Types for Yahoo Finance API responses
export interface QuoteResponse {
  symbol: string;
  shortName: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: number;
  trailingPE: number;
  forwardPE: number;
  dividendYield: number;
  epsTrailingTwelveMonths: number;
  currency: string;
  exchange: string;
  quoteType: string;
}

export interface ChartData {
  timestamp: number[];
  close: number[];
  high: number[];
  low: number[];
  open: number[];
  volume: number[];
}

export interface CompanyProfile {
  symbol: string;
  shortName: string;
  longName: string;
  sector: string;
  industry: string;
  fullTimeEmployees: number;
  city: string;
  state: string;
  country: string;
  website: string;
  longBusinessSummary: string;
  companyOfficers: Array<{
    name: string;
    title: string;
  }>;
}

export interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  thumbnail?: {
    resolutions: Array<{ url: string; width: number; height: number }>;
  };
}

// Helper to fetch from Yahoo Finance API
async function fetchYahooFinance(endpoint: string) {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  const response = await fetch(`${RAPIDAPI_BASE_URL}${endpoint}`, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
    next: { revalidate: 60 }, // Cache for 1 minute
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }

  return response.json();
}

// Alternative: Using free Yahoo Finance endpoint (no API key required but rate limited)
async function fetchYahooFinanceFree(endpoint: string) {
  const baseUrl = 'https://query1.finance.yahoo.com/v8/finance';
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }

  return response.json();
}

// GET /api/finance?action=quote&symbol=AAPL
// GET /api/finance?action=chart&symbol=AAPL&range=1d
// GET /api/finance?action=profile&symbol=AAPL
// GET /api/finance?action=news&symbol=AAPL
// GET /api/finance?action=movers
// GET /api/finance?action=search&query=apple
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const symbol = searchParams.get('symbol');
  const range = searchParams.get('range') || '1d';
  const query = searchParams.get('query');

  try {
    switch (action) {
      case 'quote': {
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }
        
        // Use free Yahoo Finance API for quotes
        const data = await fetchYahooFinanceFree(`/chart/${symbol}?interval=1m&range=1d`);
        const meta = data?.chart?.result?.[0]?.meta;
        const quote = data?.chart?.result?.[0]?.indicators?.quote?.[0];
        
        if (!meta) {
          return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
        }

        const response: Partial<QuoteResponse> = {
          symbol: meta.symbol,
          shortName: meta.shortName || meta.symbol,
          longName: meta.longName || meta.shortName || meta.symbol,
          regularMarketPrice: meta.regularMarketPrice,
          regularMarketChange: meta.regularMarketPrice - meta.chartPreviousClose,
          regularMarketChangePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
          regularMarketPreviousClose: meta.chartPreviousClose,
          regularMarketDayHigh: meta.regularMarketDayHigh,
          regularMarketDayLow: meta.regularMarketDayLow,
          regularMarketVolume: meta.regularMarketVolume,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
          currency: meta.currency,
          exchange: meta.exchangeName,
          quoteType: meta.instrumentType,
        };

        return NextResponse.json(response);
      }

      case 'chart': {
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        // Map range to interval
        const intervalMap: Record<string, string> = {
          '1d': '5m',
          '5d': '15m',
          '1mo': '1h',
          '6mo': '1d',
          'ytd': '1d',
          '1y': '1d',
          '5y': '1wk',
          'max': '1mo',
        };
        const interval = intervalMap[range] || '5m';

        const data = await fetchYahooFinanceFree(`/chart/${symbol}?interval=${interval}&range=${range}`);
        const result = data?.chart?.result?.[0];
        
        if (!result) {
          return NextResponse.json({ error: 'Chart data not found' }, { status: 404 });
        }

        const chartData: ChartData = {
          timestamp: result.timestamp || [],
          close: result.indicators?.quote?.[0]?.close || [],
          high: result.indicators?.quote?.[0]?.high || [],
          low: result.indicators?.quote?.[0]?.low || [],
          open: result.indicators?.quote?.[0]?.open || [],
          volume: result.indicators?.quote?.[0]?.volume || [],
        };

        return NextResponse.json({
          ...chartData,
          previousClose: result.meta?.chartPreviousClose,
          currency: result.meta?.currency,
        });
      }

      case 'profile': {
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        // For profile, we need to use a different approach
        // Using quoteSummary endpoint
        const response = await fetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=assetProfile,summaryProfile,price`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
          }
        );

        if (!response.ok) {
          return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const data = await response.json();
        const assetProfile = data?.quoteSummary?.result?.[0]?.assetProfile;
        const price = data?.quoteSummary?.result?.[0]?.price;

        const profile: Partial<CompanyProfile> = {
          symbol: symbol.toUpperCase(),
          shortName: price?.shortName,
          longName: price?.longName,
          sector: assetProfile?.sector,
          industry: assetProfile?.industry,
          fullTimeEmployees: assetProfile?.fullTimeEmployees,
          city: assetProfile?.city,
          state: assetProfile?.state,
          country: assetProfile?.country,
          website: assetProfile?.website,
          longBusinessSummary: assetProfile?.longBusinessSummary,
          companyOfficers: assetProfile?.companyOfficers?.slice(0, 5).map((officer: { name: string; title: string }) => ({
            name: officer.name,
            title: officer.title,
          })),
        };

        return NextResponse.json(profile);
      }

      case 'news': {
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        // Try the Yahoo Finance RSS feed approach
        try {
          const response = await fetch(
            `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
              next: { revalidate: 300 }, // Cache for 5 minutes
            }
          );

          if (response.ok) {
            const xmlText = await response.text();
            // Parse RSS XML - extract items
            const items: NewsItem[] = [];
            const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
            
            for (const itemXml of itemMatches.slice(0, 10)) {
              const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
              const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
              const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
              const source = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.trim() || 'Yahoo Finance';
              
              if (title && link) {
                items.push({
                  uuid: Buffer.from(link).toString('base64').slice(0, 16),
                  title,
                  publisher: source,
                  link,
                  providerPublishTime: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
                });
              }
            }

            if (items.length > 0) {
              return NextResponse.json(items);
            }
          }
        } catch (e) {
          console.error('RSS feed error:', e);
        }

        // Fallback: try the older v1 API
        const response = await fetch(
          `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=10&quotesCount=0`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 300 },
          }
        );

        if (!response.ok) {
          return NextResponse.json([]); // Return empty array instead of error
        }

        const data = await response.json();
        const news: NewsItem[] = (data?.news || []).map((item: {
          uuid: string;
          title: string;
          publisher: string;
          link: string;
          providerPublishTime: number;
          thumbnail?: { resolutions: Array<{ url: string; width: number; height: number }> };
        }) => ({
          uuid: item.uuid || Math.random().toString(36).slice(2),
          title: item.title,
          publisher: item.publisher || 'Yahoo Finance',
          link: item.link,
          providerPublishTime: item.providerPublishTime || Math.floor(Date.now() / 1000),
          thumbnail: item.thumbnail,
        }));

        return NextResponse.json(news);
      }

      case 'movers': {
        // Get market movers (gainers, losers, active)
        const [gainersRes, losersRes, activeRes] = await Promise.all([
          fetch('https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&lang=en-US&region=US&scrIds=day_gainers&count=10', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 300 },
          }),
          fetch('https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&lang=en-US&region=US&scrIds=day_losers&count=10', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 300 },
          }),
          fetch('https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&lang=en-US&region=US&scrIds=most_actives&count=10', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 300 },
          }),
        ]);

        const formatMovers = (data: { finance?: { result?: Array<{ quotes?: Array<{ symbol: string; shortName: string; regularMarketPrice: number; regularMarketChange: number; regularMarketChangePercent: number }> }> } }) => {
          return data?.finance?.result?.[0]?.quotes?.map((q: { symbol: string; shortName: string; regularMarketPrice: number; regularMarketChange: number; regularMarketChangePercent: number }) => ({
            symbol: q.symbol,
            name: q.shortName,
            price: q.regularMarketPrice,
            change: q.regularMarketChange,
            changePercent: q.regularMarketChangePercent,
          })) || [];
        };

        const [gainersData, losersData, activeData] = await Promise.all([
          gainersRes.json(),
          losersRes.json(),
          activeRes.json(),
        ]);

        return NextResponse.json({
          gainers: formatMovers(gainersData),
          losers: formatMovers(losersData),
          active: formatMovers(activeData),
        });
      }

      case 'search': {
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const response = await fetch(
          `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`,
          {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 60 },
          }
        );

        if (!response.ok) {
          return NextResponse.json({ error: 'Search failed' }, { status: 500 });
        }

        const data = await response.json();
        const results = (data?.quotes || []).map((q: { symbol: string; shortname: string; longname: string; quoteType: string; exchange: string }) => ({
          symbol: q.symbol,
          shortName: q.shortname,
          longName: q.longname,
          type: q.quoteType,
          exchange: q.exchange,
        }));

        return NextResponse.json(results);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Finance API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}


