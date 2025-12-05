'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { FinanceSearchBar, WatchlistSidebar } from '@/components/finance';
import { useMarketMovers, useQuote, formatPrice, formatPercent, formatChange } from '@/hooks/useFinanceData';
import { TrendingUp, TrendingDown, Loader2, ArrowRight, ArrowLeft, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition, MotionItem } from '@/lib/motion';

// Major indices to show on the landing page
const MAJOR_INDICES = [
  { symbol: '^GSPC', name: 'S&P 500', shortName: 'S&P 500' },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', shortName: 'Dow Jones' },
  { symbol: '^IXIC', name: 'NASDAQ Composite', shortName: 'NASDAQ' },
  { symbol: '^RUT', name: 'Russell 2000', shortName: 'Russell 2000' },
];

const POPULAR_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
];

// Saved stocks storage
const SAVED_STOCKS_KEY = 'bos-saved-stocks';

function getSavedStocks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(SAVED_STOCKS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveSavedStocks(stocks: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_STOCKS_KEY, JSON.stringify(stocks));
}

// Get company logo URL
function getLogoUrl(symbol: string): string {
  // Use Clearbit Logo API (free) or fallback
  const cleanSymbol = symbol.replace('^', '').replace('-USD', '');
  // Map common symbols to domains
  const domainMap: Record<string, string> = {
    'AAPL': 'apple.com',
    'MSFT': 'microsoft.com',
    'GOOGL': 'google.com',
    'AMZN': 'amazon.com',
    'NVDA': 'nvidia.com',
    'META': 'meta.com',
    'TSLA': 'tesla.com',
    'JPM': 'jpmorganchase.com',
    'BRK': 'berkshirehathaway.com',
    'V': 'visa.com',
    'JNJ': 'jnj.com',
    'WMT': 'walmart.com',
    'PG': 'pg.com',
    'MA': 'mastercard.com',
    'HD': 'homedepot.com',
    'DIS': 'disney.com',
    'PYPL': 'paypal.com',
    'NFLX': 'netflix.com',
    'ADBE': 'adobe.com',
    'CRM': 'salesforce.com',
    'INTC': 'intel.com',
    'AMD': 'amd.com',
    'CSCO': 'cisco.com',
    'PEP': 'pepsico.com',
    'KO': 'coca-cola.com',
    'NKE': 'nike.com',
    'MCD': 'mcdonalds.com',
    'SBUX': 'starbucks.com',
  };
  
  const domain = domainMap[cleanSymbol];
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }
  return '';
}

export default function FinancePage() {
  const [savedStocks, setSavedStocks] = useState<string[]>([]);

  useEffect(() => {
    setSavedStocks(getSavedStocks());
  }, []);

  const addToSaved = useCallback((symbol: string) => {
    setSavedStocks(prev => {
      if (prev.includes(symbol)) return prev;
      const newList = [...prev, symbol];
      saveSavedStocks(newList);
      return newList;
    });
  }, []);

  const removeFromSaved = useCallback((symbol: string) => {
    setSavedStocks(prev => {
      const newList = prev.filter(s => s !== symbol);
      saveSavedStocks(newList);
      return newList;
    });
  }, []);

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0">
        {/* Header */}
        <header className="shrink-0 z-30 h-12 bg-os-bg-dark border-b border-os-border-dark/50">
          <div className="flex items-center justify-between h-full px-6 md:px-12 max-w-4xl mx-auto">
            {/* Left: Back to Discover */}
            <Link
              href="/discover"
              className="group flex items-center gap-2 text-os-text-secondary-dark hover:text-brand-vanilla transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium hidden sm:inline">Discover</span>
            </Link>

            {/* Right: Search */}
            <div className="w-48 hidden md:block">
              <FinanceSearchBar className="w-full" />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main content - scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <PageTransition className="w-full max-w-4xl mx-auto px-6 py-8 md:px-12 md:py-12">
              {/* Page Title - like Architecture page */}
              <MotionItem className="flex flex-col gap-2 mb-10">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla leading-tight">
                  Finance
                </h1>
                <p className="text-os-text-secondary-dark text-lg">
                  Real-time market data, quotes, and financial news.
                </p>
              </MotionItem>

              {/* Mobile search */}
              <MotionItem className="md:hidden mb-6">
                <FinanceSearchBar className="w-full" />
              </MotionItem>

              {/* Major Indices */}
              <MotionItem className="mb-8">
                <h2 className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wider mb-4">
                  Major Indices
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {MAJOR_INDICES.map((index) => (
                    <IndexCard key={index.symbol} {...index} />
                  ))}
                </div>
              </MotionItem>

              {/* Saved Stocks */}
              {savedStocks.length > 0 && (
                <MotionItem className="mb-8">
                  <h2 className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-brand-aperol" />
                    Saved Stocks
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {savedStocks.map((symbol) => (
                      <SavedStockCard
                        key={symbol}
                        symbol={symbol}
                        onRemove={() => removeFromSaved(symbol)}
                      />
                    ))}
                  </div>
                </MotionItem>
              )}

              {/* Popular Stocks */}
              <MotionItem className="mb-8">
                <h2 className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wider mb-4">
                  Popular Stocks
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {POPULAR_TICKERS.map((ticker) => (
                    <PopularStockCard
                      key={ticker.symbol}
                      {...ticker}
                      isSaved={savedStocks.includes(ticker.symbol)}
                      onSave={() => addToSaved(ticker.symbol)}
                      onRemove={() => removeFromSaved(ticker.symbol)}
                    />
                  ))}
                </div>
              </MotionItem>

              {/* Market Movers Section */}
              <MotionItem>
                <MarketMoversSection onSaveStock={addToSaved} savedStocks={savedStocks} />
              </MotionItem>
            </PageTransition>
          </div>

          {/* Sidebar - fixed width */}
          <aside className="hidden xl:block w-[320px] border-l border-os-border-dark bg-os-surface-dark/30 p-4 overflow-y-auto custom-scrollbar">
            <WatchlistSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}

function IndexCard({ symbol, name, shortName }: { symbol: string; name: string; shortName: string }) {
  const { data: quote, loading } = useQuote(symbol);
  const isPositive = quote ? quote.regularMarketChange >= 0 : true;
  const urlSymbol = symbol.replace('^', '%5E');

  return (
    <Link
      href={`/finance/${urlSymbol}`}
      className="block p-4 bg-os-surface-dark/50 rounded-xl border border-os-border-dark/50 hover:border-brand-aperol/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-os-text-secondary-dark">{shortName}</div>
          <div className="text-[10px] text-os-text-secondary-dark/60 truncate">{symbol}</div>
        </div>
        {!loading && quote && (
          <div className={`p-1 rounded ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {loading ? (
        <Loader2 className="w-4 h-4 text-os-text-secondary-dark animate-spin" />
      ) : quote ? (
        <div className="space-y-1">
          <div className="text-xl font-mono font-bold text-brand-vanilla">
            {quote.regularMarketPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {formatChange(quote.regularMarketChange)} ({formatPercent(quote.regularMarketChangePercent)})
          </div>
        </div>
      ) : (
        <div className="text-sm text-os-text-secondary-dark">--</div>
      )}
    </Link>
  );
}

function SavedStockCard({ symbol, onRemove }: { symbol: string; onRemove: () => void }) {
  const { data: quote, loading } = useQuote(symbol);
  const isPositive = quote ? quote.regularMarketChange >= 0 : true;
  const logoUrl = getLogoUrl(symbol);

  return (
    <div className="relative group">
      <Link
        href={`/finance/${symbol}`}
        className="flex items-center gap-3 p-3 bg-os-surface-dark/50 rounded-lg border border-brand-aperol/30 hover:border-brand-aperol/50 transition-colors"
      >
        {logoUrl ? (
          <img src={logoUrl} alt={symbol} className="w-6 h-6 rounded object-contain bg-white" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="w-6 h-6 rounded bg-os-surface-dark flex items-center justify-center text-[10px] font-bold text-os-text-secondary-dark">
            {symbol.slice(0, 2)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-brand-vanilla">{symbol}</div>
          {!loading && quote && (
            <div className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(quote.regularMarketChangePercent)}
            </div>
          )}
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); onRemove(); }}
        className="absolute -top-1.5 -right-1.5 p-1 bg-os-surface-dark border border-os-border-dark rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
      >
        <X className="w-3 h-3 text-os-text-secondary-dark hover:text-red-500" />
      </button>
    </div>
  );
}

function PopularStockCard({ 
  symbol, 
  name,
  isSaved,
  onSave,
  onRemove,
}: { 
  symbol: string; 
  name: string;
  isSaved: boolean;
  onSave: () => void;
  onRemove: () => void;
}) {
  const logoUrl = getLogoUrl(symbol);

  return (
    <div className="relative group">
      <Link
        href={`/finance/${symbol}`}
        className="flex items-center gap-3 p-3 bg-os-surface-dark/50 rounded-lg border border-os-border-dark/50 hover:border-brand-aperol/50 transition-colors"
      >
        {logoUrl ? (
          <img src={logoUrl} alt={symbol} className="w-6 h-6 rounded object-contain bg-white" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="w-6 h-6 rounded bg-os-surface-dark flex items-center justify-center text-[10px] font-bold text-os-text-secondary-dark">
            {symbol.slice(0, 2)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-brand-vanilla">{symbol}</div>
          <div className="text-xs text-os-text-secondary-dark truncate">{name}</div>
        </div>
        <ArrowRight className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors shrink-0" />
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); isSaved ? onRemove() : onSave(); }}
        className={`absolute -top-1.5 -right-1.5 p-1 border rounded-full transition-all ${
          isSaved 
            ? 'bg-brand-aperol/20 border-brand-aperol/50 opacity-100' 
            : 'bg-os-surface-dark border-os-border-dark opacity-0 group-hover:opacity-100'
        }`}
      >
        <Star className={`w-3 h-3 ${isSaved ? 'text-brand-aperol fill-brand-aperol' : 'text-os-text-secondary-dark'}`} />
      </button>
    </div>
  );
}

function MarketMoversSection({ onSaveStock, savedStocks }: { onSaveStock: (symbol: string) => void; savedStocks: string[] }) {
  const { gainers, losers, active, loading } = useMarketMovers();
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'active'>('gainers');

  const getData = () => {
    switch (activeTab) {
      case 'gainers': return gainers;
      case 'losers': return losers;
      case 'active': return active;
    }
  };

  const movers = getData();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wider">
          Market Movers
        </h2>
        <div className="flex gap-1">
          {(['gainers', 'losers', 'active'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-os-surface-dark text-brand-vanilla'
                  : 'text-os-text-secondary-dark hover:text-brand-vanilla'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-os-surface-dark/30 rounded-xl border border-os-border-dark/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-os-text-secondary-dark animate-spin" />
          </div>
        ) : movers.length === 0 ? (
          <div className="text-center py-12 text-os-text-secondary-dark text-sm">
            No data available
          </div>
        ) : (
          <div className="divide-y divide-os-border-dark/50">
            {movers.slice(0, 5).map((mover) => {
              const isPositive = mover.changePercent >= 0;
              const logoUrl = getLogoUrl(mover.symbol);
              const isSaved = savedStocks.includes(mover.symbol);
              
              return (
                <div key={mover.symbol} className="relative group">
                  <Link
                    href={`/finance/${mover.symbol}`}
                    className="flex items-center justify-between p-4 hover:bg-os-surface-dark/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {logoUrl ? (
                        <img src={logoUrl} alt={mover.symbol} className="w-10 h-10 rounded-lg object-contain bg-white" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-os-surface-dark border border-os-border-dark flex items-center justify-center">
                          <span className="text-sm font-bold text-os-text-secondary-dark">
                            {mover.symbol.slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-brand-vanilla">{mover.symbol}</div>
                        <div className="text-sm text-os-text-secondary-dark truncate max-w-[200px]">
                          {mover.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium text-brand-vanilla">
                        {formatPrice(mover.price)}
                      </div>
                      <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(mover.changePercent)}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); onSaveStock(mover.symbol); }}
                    className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
                      isSaved 
                        ? 'bg-brand-aperol/20 opacity-100' 
                        : 'bg-os-surface-dark opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isSaved ? 'text-brand-aperol fill-brand-aperol' : 'text-os-text-secondary-dark'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
