import { useState, useEffect, useCallback } from 'react';
import { MarketData, TrendingCompany } from '@/types';

const STORAGE_KEY_MARKET = 'bos-market-watchlist';
const STORAGE_KEY_TRENDING = 'bos-trending-watchlist';

// Default market indices and assets
const DEFAULT_MARKET_SYMBOLS = ['SPY', 'QQQ', 'BTC-USD', '^VIX'];

// Default trending companies
const DEFAULT_TRENDING = [
  { id: 'GOOGL', name: 'Alphabet Inc.', ticker: 'GOOGL' },
  { id: 'AVGO', name: 'Broadcom Inc.', ticker: 'AVGO' },
  { id: 'TSLA', name: 'Tesla, Inc.', ticker: 'TSLA' },
  { id: 'MU', name: 'Micron Technology', ticker: 'MU' },
  { id: 'AMD', name: 'Advanced Micro Devices', ticker: 'AMD' },
];

// Symbol metadata for display names
const SYMBOL_METADATA: Record<string, { name: string; isCrypto?: boolean }> = {
  'SPY': { name: 'S&P 500 ETF' },
  'QQQ': { name: 'NASDAQ 100 ETF' },
  'BTC-USD': { name: 'Bitcoin', isCrypto: true },
  'ETH-USD': { name: 'Ethereum', isCrypto: true },
  '^VIX': { name: 'VIX Volatility' },
  'VIX': { name: 'VIX Volatility' },
  'DIA': { name: 'Dow Jones ETF' },
  'IWM': { name: 'Russell 2000 ETF' },
  'GLD': { name: 'Gold ETF' },
  'SLV': { name: 'Silver ETF' },
  'USO': { name: 'Oil ETF' },
};

// Popular symbols for search suggestions
export const POPULAR_SYMBOLS = [
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF' },
  { symbol: 'DIA', name: 'Dow Jones ETF' },
  { symbol: 'IWM', name: 'Russell 2000 ETF' },
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' },
  { symbol: '^VIX', name: 'VIX Volatility' },
  { symbol: 'GLD', name: 'Gold ETF' },
];

export const POPULAR_COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corp.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.' },
  { ticker: 'META', name: 'Meta Platforms' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'AMD', name: 'Advanced Micro Devices' },
];

// Fetch real market data from our finance API
async function fetchRealQuote(symbol: string): Promise<MarketData | null> {
  try {
    const response = await fetch(`/api/finance?action=quote&symbol=${encodeURIComponent(symbol)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    const metadata = SYMBOL_METADATA[symbol] || { name: data.shortName || symbol };
    const isCrypto = metadata.isCrypto || symbol.includes('-USD');
    
    return {
      name: metadata.name || data.shortName || symbol,
      symbol,
      value: isCrypto 
        ? data.regularMarketPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : data.regularMarketPrice?.toFixed(2) || '0.00',
      change: `${data.regularMarketChange >= 0 ? '+' : ''}${data.regularMarketChange?.toFixed(2) || '0.00'}`,
      changePercent: Math.abs(data.regularMarketChangePercent || 0),
      positive: (data.regularMarketChange || 0) >= 0,
      trend: [], // Will be populated from chart data
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

// Fetch sparkline/trend data for a symbol
async function fetchTrendData(symbol: string): Promise<number[]> {
  try {
    const response = await fetch(`/api/finance?action=chart&symbol=${encodeURIComponent(symbol)}&range=1d`);
    if (!response.ok) return [];
    
    const data = await response.json();
    // Get last 10-20 data points for sparkline
    const closes = (data.close || []).filter((v: number | null) => v !== null);
    if (closes.length === 0) return [];
    
    // Sample evenly to get ~10 points
    const step = Math.max(1, Math.floor(closes.length / 10));
    const sampled = closes.filter((_: number, i: number) => i % step === 0).slice(-10);
    return sampled;
  } catch {
    return [];
  }
}

// Fetch real company quote
async function fetchRealCompanyQuote(company: { id: string; name: string; ticker: string }): Promise<TrendingCompany | null> {
  try {
    const response = await fetch(`/api/finance?action=quote&symbol=${encodeURIComponent(company.ticker)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    const changePercent = data.regularMarketChangePercent || 0;
    
    return {
      id: company.id,
      name: data.shortName || company.name,
      ticker: company.ticker,
      price: `$${data.regularMarketPrice?.toFixed(2) || '0.00'}`,
      change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
      changePercent: Math.abs(changePercent),
    };
  } catch (error) {
    console.error(`Error fetching company quote for ${company.ticker}:`, error);
    return null;
  }
}

// Search for symbols using real API
export async function searchSymbols(query: string): Promise<Array<{ symbol: string; name: string; type: string }>> {
  if (!query || query.length < 1) return [];
  
  try {
    const response = await fetch(`/api/finance?action=search&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      // Fallback to local search
      return localSearchSymbols(query);
    }
    
    const data = await response.json();
    return (data || []).map((item: { symbol: string; shortName?: string; longName?: string; type?: string }) => ({
      symbol: item.symbol,
      name: item.shortName || item.longName || item.symbol,
      type: item.type || 'EQUITY',
    }));
  } catch {
    return localSearchSymbols(query);
  }
}

// Local fallback search
function localSearchSymbols(query: string): Array<{ symbol: string; name: string; type: string }> {
  const upperQuery = query.toUpperCase();
  
  const symbolMatches = POPULAR_SYMBOLS.filter(s => 
    s.symbol.includes(upperQuery) || s.name.toUpperCase().includes(upperQuery)
  ).map(s => ({ symbol: s.symbol, name: s.name, type: 'ETF/Index' }));

  const companyMatches = POPULAR_COMPANIES.filter(c => 
    c.ticker.includes(upperQuery) || c.name.toUpperCase().includes(upperQuery)
  ).map(c => ({ symbol: c.ticker, name: c.name, type: 'Stock' }));

  return [...symbolMatches, ...companyMatches].slice(0, 8);
}

export function useMarketData() {
  const [marketSymbols, setMarketSymbols] = useState<string[]>([]);
  const [trendingWatchlist, setTrendingWatchlist] = useState<Array<{ id: string; name: string; ticker: string }>>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [trendingCompanies, setTrendingCompanies] = useState<TrendingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const savedMarket = localStorage.getItem(STORAGE_KEY_MARKET);
      const savedTrending = localStorage.getItem(STORAGE_KEY_TRENDING);
      
      setMarketSymbols(savedMarket ? JSON.parse(savedMarket) : DEFAULT_MARKET_SYMBOLS);
      setTrendingWatchlist(savedTrending ? JSON.parse(savedTrending) : DEFAULT_TRENDING);
    } catch {
      setMarketSymbols(DEFAULT_MARKET_SYMBOLS);
      setTrendingWatchlist(DEFAULT_TRENDING);
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (marketSymbols.length > 0) {
      localStorage.setItem(STORAGE_KEY_MARKET, JSON.stringify(marketSymbols));
    }
  }, [marketSymbols]);

  useEffect(() => {
    if (trendingWatchlist.length > 0) {
      localStorage.setItem(STORAGE_KEY_TRENDING, JSON.stringify(trendingWatchlist));
    }
  }, [trendingWatchlist]);

  // Fetch real market data
  useEffect(() => {
    if (marketSymbols.length === 0) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch quotes and trends in parallel
        const results = await Promise.all(
          marketSymbols.map(async (symbol) => {
            const [quote, trend] = await Promise.all([
              fetchRealQuote(symbol),
              fetchTrendData(symbol),
            ]);
            
            if (quote) {
              return { ...quote, trend };
            }
            return null;
          })
        );
        
        const validResults = results.filter((r): r is MarketData => r !== null);
        
        if (validResults.length === 0) {
          setError('Unable to fetch market data');
        } else {
          setMarketData(validResults);
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [marketSymbols]);

  // Fetch real trending company data
  useEffect(() => {
    if (trendingWatchlist.length === 0) return;

    const fetchData = async () => {
      try {
        const results = await Promise.all(
          trendingWatchlist.map(company => fetchRealCompanyQuote(company))
        );
        
        const validResults = results.filter((r): r is TrendingCompany => r !== null);
        setTrendingCompanies(validResults);
      } catch (err) {
        console.error('Error fetching trending companies:', err);
      }
    };

    fetchData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [trendingWatchlist]);

  // Add a market symbol
  const addMarketSymbol = useCallback((symbol: string, name?: string) => {
    if (!marketSymbols.includes(symbol)) {
      if (name && !SYMBOL_METADATA[symbol]) {
        SYMBOL_METADATA[symbol] = { name };
      }
      setMarketSymbols(prev => [...prev, symbol]);
    }
  }, [marketSymbols]);

  // Remove a market symbol
  const removeMarketSymbol = useCallback((symbol: string) => {
    setMarketSymbols(prev => prev.filter(s => s !== symbol));
    setMarketData(prev => prev.filter(d => d.symbol !== symbol));
  }, []);

  // Add a trending company
  const addTrendingCompany = useCallback((ticker: string, name: string) => {
    if (!trendingWatchlist.find(c => c.ticker === ticker)) {
      setTrendingWatchlist(prev => [...prev, { id: ticker, name, ticker }]);
    }
  }, [trendingWatchlist]);

  // Remove a trending company
  const removeTrendingCompany = useCallback((ticker: string) => {
    setTrendingWatchlist(prev => prev.filter(c => c.ticker !== ticker));
    setTrendingCompanies(prev => prev.filter(c => c.ticker !== ticker));
  }, []);

  return {
    marketData,
    trendingCompanies,
    loading,
    error,
    marketSymbols,
    trendingWatchlist,
    addMarketSymbol,
    removeMarketSymbol,
    addTrendingCompany,
    removeTrendingCompany,
  };
}
