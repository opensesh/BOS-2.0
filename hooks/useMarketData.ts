import { useState, useEffect, useCallback } from 'react';
import { MarketData, TrendingCompany } from '@/types';

const STORAGE_KEY_MARKET = 'bos-market-watchlist';
const STORAGE_KEY_TRENDING = 'bos-trending-watchlist';

// Default market indices and assets
const DEFAULT_MARKET_SYMBOLS = ['SPY', 'QQQ', 'BTC-USD', 'VIX'];

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
  { symbol: 'VIX', name: 'VIX Volatility' },
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

// Generate realistic mock data based on symbol
function generateMockQuote(symbol: string, existingData?: MarketData): MarketData {
  const metadata = SYMBOL_METADATA[symbol] || { name: symbol };
  const isCrypto = metadata.isCrypto || symbol.includes('-USD');
  
  // Base values for different asset types
  let baseValue: number;
  if (symbol === 'SPY') baseValue = 595;
  else if (symbol === 'QQQ') baseValue = 520;
  else if (symbol === 'BTC-USD') baseValue = 95000;
  else if (symbol === 'ETH-USD') baseValue = 3400;
  else if (symbol === 'VIX') baseValue = 14;
  else if (symbol === 'GLD') baseValue = 240;
  else baseValue = 100 + Math.random() * 400;

  // Use existing value if available for continuity
  const currentValue = existingData 
    ? parseFloat(existingData.value.replace(/,/g, ''))
    : baseValue;

  // Generate small random change
  const changePercent = (Math.random() - 0.5) * 2; // -1% to +1%
  const change = currentValue * (changePercent / 100);
  const newValue = currentValue + change;
  const positive = change >= 0;

  // Generate trend data
  const trend = existingData?.trend?.slice(1) || [];
  trend.push(newValue);
  while (trend.length < 10) {
    trend.unshift(newValue - Math.random() * newValue * 0.02);
  }

  return {
    name: metadata.name,
    symbol,
    value: isCrypto 
      ? newValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : newValue.toFixed(2),
    change: `${positive ? '+' : ''}${change.toFixed(2)}`,
    changePercent: Math.abs(changePercent),
    positive,
    trend: trend.slice(-10),
  };
}

function generateMockCompanyQuote(company: { id: string; name: string; ticker: string }, existing?: TrendingCompany): TrendingCompany {
  // Base prices for popular companies
  const basePrices: Record<string, number> = {
    'AAPL': 235,
    'MSFT': 430,
    'GOOGL': 175,
    'AMZN': 210,
    'NVDA': 145,
    'META': 580,
    'TSLA': 350,
    'AMD': 140,
    'AVGO': 185,
    'MU': 105,
  };

  const basePrice = basePrices[company.ticker] || 100 + Math.random() * 200;
  const currentPrice = existing 
    ? parseFloat(existing.price.replace('$', ''))
    : basePrice;

  const changePercent = (Math.random() - 0.4) * 4; // Slight upward bias
  const newPrice = currentPrice * (1 + changePercent / 100);
  const positive = changePercent >= 0;

  return {
    id: company.id,
    name: company.name,
    ticker: company.ticker,
    price: `$${newPrice.toFixed(2)}`,
    change: `${positive ? '+' : ''}${changePercent.toFixed(2)}%`,
    changePercent: Math.abs(changePercent),
  };
}

// Search for symbols using a mock search (in production, use a real API)
export async function searchSymbols(query: string): Promise<Array<{ symbol: string; name: string; type: string }>> {
  if (!query || query.length < 1) return [];
  
  const upperQuery = query.toUpperCase();
  
  // Search in popular symbols
  const symbolMatches = POPULAR_SYMBOLS.filter(s => 
    s.symbol.includes(upperQuery) || s.name.toUpperCase().includes(upperQuery)
  ).map(s => ({ symbol: s.symbol, name: s.name, type: 'ETF/Index' }));

  // Search in popular companies
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

  // Fetch market data
  useEffect(() => {
    if (marketSymbols.length === 0) return;

    const fetchData = () => {
      setMarketData(prev => 
        marketSymbols.map(symbol => {
          const existing = prev.find(d => d.symbol === symbol);
          return generateMockQuote(symbol, existing);
        })
      );
      setLoading(false);
    };

    // Initial fetch
    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [marketSymbols]);

  // Fetch trending company data
  useEffect(() => {
    if (trendingWatchlist.length === 0) return;

    const fetchData = () => {
      setTrendingCompanies(prev =>
        trendingWatchlist.map(company => {
          const existing = prev.find(c => c.id === company.id);
          return generateMockCompanyQuote(company, existing);
        })
      );
    };

    // Initial fetch
    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [trendingWatchlist]);

  // Add a market symbol
  const addMarketSymbol = useCallback((symbol: string, name?: string) => {
    if (!marketSymbols.includes(symbol)) {
      // Also add to metadata if name provided
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
