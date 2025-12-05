'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { FinanceSearchBar, WatchlistSidebar } from '@/components/finance';
import { useMarketMovers, useQuote, formatPrice, formatPercent, formatChange } from '@/hooks/useFinanceData';
import { TrendingUp, TrendingDown, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// Major indices to show on the landing page
const MAJOR_INDICES = [
  { symbol: '^GSPC', name: 'S&P 500', shortName: 'S&P 500' },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', shortName: 'Dow Jones' },
  { symbol: '^IXIC', name: 'NASDAQ Composite', shortName: 'NASDAQ' },
  { symbol: '^RUT', name: 'Russell 2000', shortName: 'Russell 2000' },
];

const POPULAR_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B',
];

export default function FinancePage() {
  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0">
        {/* Header - matches StickyArticleHeader style */}
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

            {/* Center: Title */}
            <h1 className="text-sm font-medium text-brand-vanilla">
              Finance
            </h1>

            {/* Right: Search */}
            <div className="w-64 hidden md:block">
              <FinanceSearchBar className="w-full" />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main content - scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-4xl mx-auto px-6 py-8 md:px-12 md:py-12">
              {/* Mobile search */}
              <div className="md:hidden mb-6">
                <FinanceSearchBar className="w-full" />
              </div>

              {/* Major Indices */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wider mb-4">
                  Major Indices
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {MAJOR_INDICES.map((index) => (
                    <IndexCard key={index.symbol} {...index} />
                  ))}
                </div>
              </motion.section>

              {/* Popular Stocks */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wider mb-4">
                  Popular Stocks
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {POPULAR_TICKERS.map((ticker) => (
                    <Link
                      key={ticker}
                      href={`/finance/${ticker}`}
                      className="flex items-center justify-between p-3 bg-os-surface-dark/50 rounded-lg border border-os-border-dark/50 hover:border-brand-aperol/50 transition-colors group"
                    >
                      <span className="font-medium text-brand-vanilla">{ticker}</span>
                      <ArrowRight className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
                    </Link>
                  ))}
                </div>
              </motion.section>

              {/* Market Movers Section */}
              <MarketMoversSection />
            </div>
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

  // Convert index symbol for URL
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
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-os-text-secondary-dark animate-spin" />
        </div>
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
        <div className="text-sm text-os-text-secondary-dark">Data unavailable</div>
      )}
    </Link>
  );
}

function MarketMoversSection() {
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
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
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
              return (
                <Link
                  key={mover.symbol}
                  href={`/finance/${mover.symbol}`}
                  className="flex items-center justify-between p-4 hover:bg-os-surface-dark/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-os-surface-dark border border-os-border-dark flex items-center justify-center">
                      <span className="text-sm font-bold text-os-text-secondary-dark">
                        {mover.symbol.slice(0, 2)}
                      </span>
                    </div>
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
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}
