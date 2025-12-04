import { useState, useEffect, useCallback } from 'react';

// Types
export interface Quote {
  symbol: string;
  shortName: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen?: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  dividendYield?: number;
  epsTrailingTwelveMonths?: number;
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
  previousClose: number;
  currency: string;
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

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface SearchResult {
  symbol: string;
  shortName: string;
  longName: string;
  type: string;
  exchange: string;
}

export type ChartRange = '1d' | '5d' | '1mo' | '6mo' | 'ytd' | '1y' | '5y' | 'max';

// Fetch quote data for a symbol
export function useQuote(symbol: string | null) {
  const [data, setData] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      return;
    }

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/finance?action=quote&symbol=${encodeURIComponent(symbol)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }
        const quote = await response.json();
        setData(quote);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quote');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();

    // Refresh every 30 seconds
    const interval = setInterval(fetchQuote, 30000);
    return () => clearInterval(interval);
  }, [symbol]);

  return { data, loading, error };
}

// Fetch chart data for a symbol
export function useChart(symbol: string | null, range: ChartRange = '1d') {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      return;
    }

    const fetchChart = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/finance?action=chart&symbol=${encodeURIComponent(symbol)}&range=${range}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        const chartData = await response.json();
        setData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart');
      } finally {
        setLoading(false);
      }
    };

    fetchChart();

    // Refresh based on range
    const refreshInterval = range === '1d' ? 60000 : 300000; // 1 min for intraday, 5 min otherwise
    const interval = setInterval(fetchChart, refreshInterval);
    return () => clearInterval(interval);
  }, [symbol, range]);

  return { data, loading, error };
}

// Fetch company profile
export function useCompanyProfile(symbol: string | null) {
  const [data, setData] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/finance?action=profile&symbol=${encodeURIComponent(symbol)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch company profile');
        }
        const profile = await response.json();
        setData(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [symbol]);

  return { data, loading, error };
}

// Fetch news for a symbol
export function useNews(symbol: string | null) {
  const [data, setData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData([]);
      return;
    }

    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/finance?action=news&symbol=${encodeURIComponent(symbol)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const news = await response.json();
        setData(Array.isArray(news) ? news : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, [symbol]);

  return { data, loading, error };
}

// Fetch market movers (gainers, losers, active)
export function useMarketMovers() {
  const [gainers, setGainers] = useState<MarketMover[]>([]);
  const [losers, setLosers] = useState<MarketMover[]>([]);
  const [active, setActive] = useState<MarketMover[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/finance?action=movers');
        if (!response.ok) {
          throw new Error('Failed to fetch market movers');
        }
        const data = await response.json();
        setGainers(data.gainers || []);
        setLosers(data.losers || []);
        setActive(data.active || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch movers');
      } finally {
        setLoading(false);
      }
    };

    fetchMovers();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMovers, 300000);
    return () => clearInterval(interval);
  }, []);

  return { gainers, losers, active, loading, error };
}

// Search for symbols
export function useSymbolSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/finance?action=search&query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, loading, error, search, clearResults };
}

// Combined hook for stock detail page
export function useStockData(symbol: string | null, range: ChartRange = '1d') {
  const quote = useQuote(symbol);
  const chart = useChart(symbol, range);
  const profile = useCompanyProfile(symbol);
  const news = useNews(symbol);

  return {
    quote,
    chart,
    profile,
    news,
    loading: quote.loading || chart.loading || profile.loading || news.loading,
    error: quote.error || chart.error || profile.error || news.error,
  };
}

// Format helpers
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatChange(change: number, showSign: boolean = true): string {
  const sign = showSign && change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

export function formatPercent(percent: number, showSign: boolean = true): string {
  const sign = showSign && percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
  return volume.toString();
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return formatDate(timestamp);
}


