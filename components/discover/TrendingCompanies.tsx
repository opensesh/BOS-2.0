'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMarketData, POPULAR_COMPANIES } from '@/hooks/useMarketData';
import { Loader2, Plus, X, Search, TrendingUp, RotateCcw, Check } from 'lucide-react';
import { FlipCard } from '@/components/ui/FlipCard';

// Front face - Trending companies display
function TrendingDisplay({
  trendingCompanies,
  onFlip,
}: {
  trendingCompanies: ReturnType<typeof useMarketData>['trendingCompanies'];
  onFlip: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header with flip trigger */}
      <button
        onClick={onFlip}
        className="flex items-center justify-between text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium hover:text-brand-aperol transition-colors group w-full text-left"
      >
        <span>Trending Companies</span>
        <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Company List */}
      <div className="flex flex-col gap-2">
        {trendingCompanies.map((company) => (
          <div 
            key={company.id} 
            className="group flex items-center justify-between p-2 rounded-lg hover:bg-os-surface-dark cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Company logo placeholder */}
              <div className="w-8 h-8 rounded bg-os-surface-dark border border-os-border-dark flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-os-text-secondary-dark">
                  {company.ticker.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-brand-vanilla truncate">
                  {company.name}
                </div>
                <div className="text-xs text-os-text-secondary-dark">
                  {company.ticker}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 ml-2">
              <div className="text-sm font-mono font-medium text-brand-vanilla">
                {company.price}
              </div>
              <div className={`text-xs font-medium flex items-center gap-0.5 ${
                company.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
              }`}>
                <TrendingUp className={`w-3 h-3 ${!company.change.startsWith('+') ? 'rotate-180' : ''}`} />
                {company.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Back face - Company editor
function CompanyEditor({
  trendingCompanies,
  onAddCompany,
  onRemoveCompany,
  onDone,
}: {
  trendingCompanies: ReturnType<typeof useMarketData>['trendingCompanies'];
  onAddCompany: (ticker: string, name: string) => void;
  onRemoveCompany: (ticker: string) => void;
  onDone: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ ticker: string; name: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Search for companies
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const upperQuery = searchQuery.toUpperCase();
    const results = POPULAR_COMPANIES.filter(c => 
      c.ticker.includes(upperQuery) || c.name.toUpperCase().includes(upperQuery)
    );
    setSearchResults(results);
  }, [searchQuery]);

  const handleAddCompany = (ticker: string, name: string) => {
    onAddCompany(ticker, name);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-medium text-os-text-secondary-dark">
          Edit Companies
        </span>
        <button 
          onClick={onDone}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-aperol hover:bg-brand-aperol/10 rounded transition-colors"
        >
          <Check className="w-3 h-3" />
          Done
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search companies..."
          className="w-full pl-9 pr-3 py-2 bg-os-bg-dark border border-os-border-dark rounded-lg text-sm text-brand-vanilla placeholder-os-text-secondary-dark focus:outline-none focus:border-brand-aperol transition-colors"
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="max-h-[100px] overflow-y-auto -mx-1 px-1">
          {searchResults.map((result) => (
            <button
              key={result.ticker}
              onClick={() => handleAddCompany(result.ticker, result.name)}
              disabled={trendingCompanies.some(c => c.ticker === result.ticker)}
              className="w-full px-2 py-1.5 text-left hover:bg-os-bg-dark rounded transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3 h-3 text-brand-aperol shrink-0" />
                <span className="text-xs font-medium text-brand-vanilla">{result.ticker}</span>
                <span className="text-[10px] text-os-text-secondary-dark truncate">{result.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick Add Popular */}
      {searchResults.length === 0 && !searchQuery && (
        <div>
          <div className="text-[10px] text-os-text-secondary-dark uppercase tracking-wider mb-2">Popular Companies</div>
          <div className="flex flex-wrap gap-1">
            {POPULAR_COMPANIES.filter(c => !trendingCompanies.find(tc => tc.ticker === c.ticker)).slice(0, 6).map((c) => (
              <button
                key={c.ticker}
                onClick={() => handleAddCompany(c.ticker, c.name)}
                className="px-2 py-1 text-xs text-brand-vanilla bg-os-bg-dark hover:bg-brand-aperol/20 rounded transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {c.ticker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Watchlist */}
      <div>
        <div className="text-[10px] text-os-text-secondary-dark uppercase tracking-wider mb-2">Current Watchlist</div>
        <div className="flex flex-wrap gap-1">
          {trendingCompanies.map((company) => (
            <div
              key={company.ticker}
              className="flex items-center gap-1 px-2 py-1 text-xs text-brand-vanilla bg-os-bg-dark rounded group"
            >
              <span>{company.ticker}</span>
              <button
                onClick={() => onRemoveCompany(company.ticker)}
                className="p-0.5 hover:bg-red-500/20 rounded transition-colors"
              >
                <X className="w-3 h-3 text-os-text-secondary-dark group-hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrendingCompanies() {
  const { trendingCompanies, loading, error, addTrendingCompany, removeTrendingCompany } = useMarketData();
  const [isFlipped, setIsFlipped] = useState(false);

  if (loading && trendingCompanies.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium">
          Trending Companies
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-os-text-secondary-dark animate-spin" />
        </div>
      </div>
    );
  }

  if (error && trendingCompanies.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium">
          Trending Companies
        </div>
        <div className="text-xs text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <FlipCard
      isFlipped={isFlipped}
      front={
        <TrendingDisplay
          trendingCompanies={trendingCompanies}
          onFlip={() => setIsFlipped(true)}
        />
      }
      back={
        <CompanyEditor
          trendingCompanies={trendingCompanies}
          onAddCompany={addTrendingCompany}
          onRemoveCompany={removeTrendingCompany}
          onDone={() => setIsFlipped(false)}
        />
      }
    />
  );
}
