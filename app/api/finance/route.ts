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

// Hardcoded profiles for popular symbols (fallback when APIs fail)
const HARDCODED_PROFILES: Record<string, Partial<CompanyProfile>> = {
  'AAPL': {
    symbol: 'AAPL',
    shortName: 'Apple Inc.',
    longName: 'Apple Inc.',
    longBusinessSummary: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    fullTimeEmployees: 164000,
    city: 'Cupertino',
    state: 'California',
    country: 'United States',
    website: 'https://www.apple.com',
    companyOfficers: [
      { name: 'Tim Cook', title: 'CEO' },
      { name: 'Luca Maestri', title: 'CFO' },
      { name: 'Jeff Williams', title: 'COO' },
      { name: 'Katherine Adams', title: 'General Counsel' },
    ],
  },
  'MSFT': {
    symbol: 'MSFT',
    shortName: 'Microsoft Corporation',
    longName: 'Microsoft Corporation',
    longBusinessSummary: 'Microsoft Corporation develops and supports software, services, devices, and solutions worldwide. The company operates through Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments. It offers Office, Exchange, SharePoint, Microsoft Teams, and related services.',
    sector: 'Technology',
    industry: 'Software—Infrastructure',
    fullTimeEmployees: 221000,
    city: 'Redmond',
    state: 'Washington',
    country: 'United States',
    website: 'https://www.microsoft.com',
    companyOfficers: [
      { name: 'Satya Nadella', title: 'CEO' },
      { name: 'Amy Hood', title: 'CFO' },
    ],
  },
  'GOOGL': {
    symbol: 'GOOGL',
    shortName: 'Alphabet Inc.',
    longName: 'Alphabet Inc.',
    longBusinessSummary: 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments. The company provides search, advertising, commerce, and cloud services.',
    sector: 'Communication Services',
    industry: 'Internet Content & Information',
    fullTimeEmployees: 182502,
    city: 'Mountain View',
    state: 'California',
    country: 'United States',
    website: 'https://www.abc.xyz',
    companyOfficers: [
      { name: 'Sundar Pichai', title: 'CEO' },
      { name: 'Ruth Porat', title: 'CFO' },
    ],
  },
  'AMZN': {
    symbol: 'AMZN',
    shortName: 'Amazon.com, Inc.',
    longName: 'Amazon.com, Inc.',
    longBusinessSummary: 'Amazon.com, Inc. engages in the retail sale of consumer products, advertising, and subscription services through online and physical stores worldwide. The company operates through North America, International, and Amazon Web Services segments.',
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    fullTimeEmployees: 1525000,
    city: 'Seattle',
    state: 'Washington',
    country: 'United States',
    website: 'https://www.amazon.com',
    companyOfficers: [
      { name: 'Andy Jassy', title: 'CEO' },
      { name: 'Brian Olsavsky', title: 'CFO' },
    ],
  },
  'NVDA': {
    symbol: 'NVDA',
    shortName: 'NVIDIA Corporation',
    longName: 'NVIDIA Corporation',
    longBusinessSummary: 'NVIDIA Corporation provides graphics and compute and networking solutions in the United States, Taiwan, China, Hong Kong, and internationally. The company operates through Graphics and Compute & Networking segments, offering GeForce GPUs, data center platforms, and AI solutions.',
    sector: 'Technology',
    industry: 'Semiconductors',
    fullTimeEmployees: 29600,
    city: 'Santa Clara',
    state: 'California',
    country: 'United States',
    website: 'https://www.nvidia.com',
    companyOfficers: [
      { name: 'Jensen Huang', title: 'CEO' },
      { name: 'Colette Kress', title: 'CFO' },
    ],
  },
  'META': {
    symbol: 'META',
    shortName: 'Meta Platforms, Inc.',
    longName: 'Meta Platforms, Inc.',
    longBusinessSummary: 'Meta Platforms, Inc. engages in the development of products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide. It operates in two segments, Family of Apps and Reality Labs.',
    sector: 'Communication Services',
    industry: 'Internet Content & Information',
    fullTimeEmployees: 67317,
    city: 'Menlo Park',
    state: 'California',
    country: 'United States',
    website: 'https://www.meta.com',
    companyOfficers: [
      { name: 'Mark Zuckerberg', title: 'CEO' },
      { name: 'Susan Li', title: 'CFO' },
    ],
  },
  'TSLA': {
    symbol: 'TSLA',
    shortName: 'Tesla, Inc.',
    longName: 'Tesla, Inc.',
    longBusinessSummary: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally. The company operates through Automotive and Energy Generation and Storage segments.',
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    fullTimeEmployees: 140473,
    city: 'Austin',
    state: 'Texas',
    country: 'United States',
    website: 'https://www.tesla.com',
    companyOfficers: [
      { name: 'Elon Musk', title: 'CEO' },
      { name: 'Vaibhav Taneja', title: 'CFO' },
    ],
  },
  'JPM': {
    symbol: 'JPM',
    shortName: 'JPMorgan Chase & Co.',
    longName: 'JPMorgan Chase & Co.',
    longBusinessSummary: 'JPMorgan Chase & Co. operates as a financial services company worldwide. It operates through Consumer & Community Banking, Corporate & Investment Bank, Commercial Banking, and Asset & Wealth Management segments.',
    sector: 'Financial Services',
    industry: 'Banks—Diversified',
    fullTimeEmployees: 309926,
    city: 'New York',
    state: 'New York',
    country: 'United States',
    website: 'https://www.jpmorganchase.com',
    companyOfficers: [
      { name: 'Jamie Dimon', title: 'CEO' },
      { name: 'Jeremy Barnum', title: 'CFO' },
    ],
  },
  // Market indices
  '^GSPC': {
    symbol: '^GSPC',
    shortName: 'S&P 500',
    longName: 'S&P 500 Index',
    longBusinessSummary: 'The S&P 500 is a stock market index tracking the stock performance of 500 of the largest companies listed on stock exchanges in the United States. It is one of the most commonly followed equity indices and is considered one of the best representations of the U.S. stock market.',
    sector: 'Index',
    industry: 'Market Index',
    country: 'United States',
    companyOfficers: [],
  },
  '^DJI': {
    symbol: '^DJI',
    shortName: 'Dow Jones Industrial Average',
    longName: 'Dow Jones Industrial Average',
    longBusinessSummary: 'The Dow Jones Industrial Average (DJIA) is a stock market index that tracks 30 large, publicly-owned blue-chip companies trading on the New York Stock Exchange and the Nasdaq. It is one of the oldest and most-watched indices in the world.',
    sector: 'Index',
    industry: 'Market Index',
    country: 'United States',
    companyOfficers: [],
  },
  '^IXIC': {
    symbol: '^IXIC',
    shortName: 'NASDAQ Composite',
    longName: 'NASDAQ Composite Index',
    longBusinessSummary: 'The NASDAQ Composite is a stock market index that includes almost all stocks listed on the Nasdaq stock exchange. It is heavily weighted towards information technology companies and is considered a barometer for the tech sector.',
    sector: 'Index',
    industry: 'Market Index',
    country: 'United States',
    companyOfficers: [],
  },
  '^RUT': {
    symbol: '^RUT',
    shortName: 'Russell 2000',
    longName: 'Russell 2000 Index',
    longBusinessSummary: 'The Russell 2000 Index is a small-cap stock market index that makes up the smallest 2,000 stocks in the Russell 3000 Index. It is widely regarded as a benchmark for small-cap U.S. stocks.',
    sector: 'Index',
    industry: 'Market Index',
    country: 'United States',
    companyOfficers: [],
  },
};

function getHardcodedProfile(symbol: string): Partial<CompanyProfile> | null {
  return HARDCODED_PROFILES[symbol] || null;
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

        const upperSymbol = symbol.toUpperCase();
        let profile: Partial<CompanyProfile> | null = null;

        // First try: Financial Modeling Prep API (more reliable)
        const fmpKey = process.env.FINANCIAL_MODELING_PREP_API_KEY || process.env.FMP_API_KEY;
        if (fmpKey) {
          try {
            const response = await fetch(
              `https://financialmodelingprep.com/api/v3/profile/${upperSymbol}?apikey=${fmpKey}`,
              { next: { revalidate: 3600 } }
            );

            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                const fmpProfile = data[0];
                profile = {
                  symbol: upperSymbol,
                  shortName: fmpProfile.companyName,
                  longName: fmpProfile.companyName,
                  sector: fmpProfile.sector,
                  industry: fmpProfile.industry,
                  fullTimeEmployees: fmpProfile.fullTimeEmployees,
                  city: fmpProfile.city,
                  state: fmpProfile.state,
                  country: fmpProfile.country,
                  website: fmpProfile.website,
                  longBusinessSummary: fmpProfile.description,
                  companyOfficers: fmpProfile.ceo ? [{ name: fmpProfile.ceo, title: 'CEO' }] : [],
                };
              }
            }
          } catch (e) {
            console.error('FMP API error:', e);
          }
        }

        // Second try: Yahoo Finance quoteSummary endpoint
        if (!profile) {
          try {
            const response = await fetch(
              `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${upperSymbol}?modules=assetProfile,price`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'application/json',
                },
                next: { revalidate: 3600 },
              }
            );

            if (response.ok) {
              const data = await response.json();
              const assetProfile = data?.quoteSummary?.result?.[0]?.assetProfile;
              const price = data?.quoteSummary?.result?.[0]?.price;
              
              if (assetProfile) {
                profile = {
                  symbol: upperSymbol,
                  shortName: price?.shortName || upperSymbol,
                  longName: price?.longName,
                  sector: assetProfile.sector,
                  industry: assetProfile.industry,
                  fullTimeEmployees: assetProfile.fullTimeEmployees,
                  city: assetProfile.city,
                  state: assetProfile.state,
                  country: assetProfile.country,
                  website: assetProfile.website,
                  longBusinessSummary: assetProfile.longBusinessSummary,
                  companyOfficers: assetProfile.companyOfficers?.slice(0, 5).map((officer: { name: string; title: string }) => ({
                    name: officer.name,
                    title: officer.title,
                  })) || [],
                };
              }
            }
          } catch (e) {
            console.error('Yahoo quoteSummary error:', e);
          }
        }

        // Final fallback: Use hardcoded profiles for popular symbols
        if (!profile) {
          profile = getHardcodedProfile(upperSymbol);
        }

        if (!profile) {
          return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

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


