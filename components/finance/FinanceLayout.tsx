'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, TrendingUp, ChevronRight } from 'lucide-react';
import { useSymbolSearch, SearchResult } from '@/hooks/useFinanceData';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface FinanceLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function FinanceLayout({ children, sidebar }: FinanceLayoutProps) {
  return (
    <div className="flex min-h-screen bg-os-bg-dark">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {sidebar && (
        <aside className="hidden xl:block w-[320px] border-l border-os-border-dark bg-os-surface-dark/50 p-4 overflow-y-auto">
          {sidebar}
        </aside>
      )}
    </div>
  );
}

// Finance search bar component
export function FinanceSearchBar({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading, search, clearResults } = useSymbolSearch();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      search(query);
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, search]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    router.push(`/finance/${symbol}`);
    setQuery('');
    setIsOpen(false);
    clearResults();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search stocks, crypto..."
          className="w-full pl-9 pr-9 py-2 text-sm bg-os-surface-dark/60 border border-os-border-dark/50 rounded-lg text-brand-vanilla placeholder-os-text-secondary-dark focus:outline-none focus:border-brand-aperol focus:bg-os-surface-dark transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              clearResults();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-os-bg-dark rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-os-text-secondary-dark" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-os-surface-dark border border-os-border-dark rounded-xl shadow-xl overflow-hidden"
          >
            <div className="max-h-[400px] overflow-y-auto">
              {results.map((result) => (
                <SearchResultItem
                  key={result.symbol}
                  result={result}
                  onClick={() => handleSelect(result.symbol)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchResultItem({ result, onClick }: { result: SearchResult; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left hover:bg-os-bg-dark transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-os-bg-dark border border-os-border-dark flex items-center justify-center">
          <span className="text-sm font-bold text-brand-vanilla">
            {result.symbol.slice(0, 2)}
          </span>
        </div>
        <div>
          <div className="font-medium text-brand-vanilla">{result.symbol}</div>
          <div className="text-sm text-os-text-secondary-dark truncate max-w-[200px]">
            {result.shortName || result.longName}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-os-text-secondary-dark bg-os-bg-dark px-2 py-1 rounded">
          {result.type || 'EQUITY'}
        </span>
        <ChevronRight className="w-4 h-4 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

// Tab navigation for stock detail pages
export type FinanceTab = 'overview' | 'financials' | 'earnings' | 'holders' | 'historical' | 'research';

interface TabNavProps {
  activeTab: FinanceTab;
  onTabChange: (tab: FinanceTab) => void;
  showAllTabs?: boolean;
}

const TABS: { id: FinanceTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'financials', label: 'Financials' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'holders', label: 'Holders' },
  { id: 'historical', label: 'Historical Data' },
  { id: 'research', label: 'Research' },
];

export function FinanceTabNav({ activeTab, onTabChange, showAllTabs = true }: TabNavProps) {
  const tabs = showAllTabs ? TABS : TABS.slice(0, 2);

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? 'bg-brand-aperol text-white'
              : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Finance header component with breadcrumb
interface FinanceHeaderProps {
  symbol?: string;
  name?: string;
}

export function FinanceHeader({ symbol, name }: FinanceHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-os-bg-dark/95 backdrop-blur-sm border-b border-os-border-dark">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href="/finance" 
              className="text-os-text-secondary-dark hover:text-brand-vanilla transition-colors"
            >
              Finance
            </Link>
            {symbol && (
              <>
                <ChevronRight className="w-4 h-4 text-os-text-secondary-dark" />
                <span className="font-medium text-brand-vanilla">{symbol}</span>
              </>
            )}
          </div>

          {/* Search */}
          <FinanceSearchBar className="w-full max-w-md" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-os-text-secondary-dark hover:text-brand-vanilla transition-colors">
              Follow
            </button>
            <button className="px-4 py-2 text-sm font-medium text-os-text-secondary-dark hover:text-brand-vanilla transition-colors">
              Share
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Quick stats badge
interface StatBadgeProps {
  label: string;
  value: string | number;
  change?: number;
  className?: string;
}

export function StatBadge({ label, value, change, className = '' }: StatBadgeProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-xs text-os-text-secondary-dark">{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-mono font-medium text-brand-vanilla">{value}</span>
        {change !== undefined && (
          <span className={`text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}


