'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMarketMovers, MarketMover, formatPrice, formatPercent } from '@/hooks/useFinanceData';
import { TrendingUp, TrendingDown, Activity, Plus, Loader2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type TabType = 'gainers' | 'losers' | 'active';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'gainers', label: 'Gainers', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: 'losers', label: 'Losers', icon: <TrendingDown className="w-3.5 h-3.5" /> },
  { id: 'active', label: 'Active', icon: <Activity className="w-3.5 h-3.5" /> },
];

// Watchlist storage
const WATCHLIST_KEY = 'bos-finance-watchlist';

function getStoredWatchlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    return stored ? JSON.parse(stored) : ['NVDA', 'AMZN', 'MSFT', 'AAPL', 'ADI'];
  } catch {
    return ['NVDA', 'AMZN', 'MSFT', 'AAPL', 'ADI'];
  }
}

function setStoredWatchlist(symbols: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols));
}

export function WatchlistSidebar() {
  const [activeTab, setActiveTab] = useState<TabType>('gainers');
  const { gainers, losers, active, loading, error } = useMarketMovers();

  const getActiveData = (): MarketMover[] => {
    switch (activeTab) {
      case 'gainers':
        return gainers;
      case 'losers':
        return losers;
      case 'active':
        return active;
      default:
        return gainers;
    }
  };

  const movers = getActiveData();

  return (
    <div className="space-y-6">
      {/* Create Watchlist Section */}
      <WatchlistSection />

      {/* Market Movers */}
      <div className="space-y-3">
        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-os-surface-dark text-brand-vanilla'
                  : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Movers List */}
        <div className="space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-os-text-secondary-dark animate-spin" />
            </div>
          ) : error ? (
            <div className="text-xs text-os-text-secondary-dark text-center py-4">
              Unable to load market data
            </div>
          ) : movers.length === 0 ? (
            <div className="text-xs text-os-text-secondary-dark text-center py-4">
              No data available
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {movers.slice(0, 5).map((mover, index) => (
                <MoverItem key={mover.symbol} mover={mover} index={index} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-os-border-dark">
        <p className="text-[10px] text-os-text-secondary-dark leading-relaxed">
          Financial information provided by Yahoo Finance. All data is provided for informational purposes only, and is not intended for trading purposes or financial, investment, tax, legal, accounting or other advice.
        </p>
      </div>
    </div>
  );
}

function WatchlistSection() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistData, setWatchlistData] = useState<Map<string, { price: number; change: number; changePercent: number }>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load watchlist from storage
  useEffect(() => {
    setWatchlist(getStoredWatchlist());
  }, []);

  // Fetch watchlist data
  useEffect(() => {
    if (watchlist.length === 0) {
      setLoading(false);
      return;
    }

    const fetchWatchlistData = async () => {
      setLoading(true);
      const newData = new Map<string, { price: number; change: number; changePercent: number }>();

      await Promise.all(
        watchlist.map(async (symbol) => {
          try {
            const response = await fetch(`/api/finance?action=quote&symbol=${symbol}`);
            if (response.ok) {
              const quote = await response.json();
              newData.set(symbol, {
                price: quote.regularMarketPrice,
                change: quote.regularMarketChange,
                changePercent: quote.regularMarketChangePercent,
              });
            }
          } catch {
            // Ignore errors for individual symbols
          }
        })
      );

      setWatchlistData(newData);
      setLoading(false);
    };

    fetchWatchlistData();
    const interval = setInterval(fetchWatchlistData, 60000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      if (prev.includes(symbol)) return prev;
      const newList = [...prev, symbol];
      setStoredWatchlist(newList);
      return newList;
    });
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider font-medium text-os-text-secondary-dark">
          Create Watchlist
        </h3>
        <button className="p-1 hover:bg-os-surface-dark rounded transition-colors">
          <Settings className="w-3.5 h-3.5 text-os-text-secondary-dark" />
        </button>
      </div>

      <div className="space-y-1">
        {loading && watchlist.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 text-os-text-secondary-dark animate-spin" />
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-xs text-os-text-secondary-dark text-center py-4">
            Your watchlist is empty
          </div>
        ) : (
          watchlist.map((symbol) => {
            const data = watchlistData.get(symbol);
            return (
              <Link
                key={symbol}
                href={`/finance/${symbol}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-os-surface-dark transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-os-surface-dark border border-os-border-dark flex items-center justify-center">
                    <span className="text-xs font-bold text-os-text-secondary-dark">
                      {symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-brand-vanilla">{symbol}</div>
                    <div className="text-xs text-os-text-secondary-dark">NASDAQ</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {data ? (
                    <>
                      <span className="text-sm font-mono text-brand-vanilla">
                        {formatPrice(data.price)}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          data.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {formatPercent(data.changePercent)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-os-text-secondary-dark">—</span>
                  )}
                  <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-os-text-secondary-dark" />
                  </button>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function MoverItem({ mover, index }: { mover: MarketMover; index: number }) {
  const isPositive = mover.changePercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/finance/${mover.symbol}`}
        className="flex items-center justify-between p-2 rounded-lg hover:bg-os-surface-dark transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-os-surface-dark border border-os-border-dark flex items-center justify-center">
            <span className="text-xs font-bold text-os-text-secondary-dark">
              {mover.symbol.slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-brand-vanilla">{mover.symbol}</div>
            <div className="text-xs text-os-text-secondary-dark truncate max-w-[120px]">
              {mover.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-brand-vanilla">
            {formatPrice(mover.price)}
          </span>
          <span
            className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatPercent(mover.changePercent)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

