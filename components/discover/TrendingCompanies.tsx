'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMarketData, POPULAR_COMPANIES } from '@/hooks/useMarketData';
import { Loader2, Plus, X, Search, Settings, TrendingUp } from 'lucide-react';

export function TrendingCompanies() {
  const { trendingCompanies, loading, error, addTrendingCompany, removeTrendingCompany } = useMarketData();
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ ticker: string; name: string }>>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close modal on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
    
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

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
    addTrendingCompany(ticker, name);
    setSearchQuery('');
    setSearchResults([]);
  };

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
    <div className="flex flex-col gap-3 relative">
      {/* Header with edit button */}
      <div className="flex items-center justify-between">
        <div className="text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium">
          Trending Companies
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 hover:bg-os-surface-dark rounded transition-colors group"
          title="Edit watchlist"
        >
          <Settings className="w-3.5 h-3.5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
        </button>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div 
          ref={modalRef}
          className="absolute z-50 top-0 left-0 right-0 bg-os-surface-dark border border-os-border-dark rounded-xl shadow-xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-3 border-b border-os-border-dark">
            <span className="text-sm font-medium text-brand-vanilla">Edit Company Watchlist</span>
            <button 
              onClick={() => {
                setIsEditing(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="p-1 hover:bg-os-bg-dark rounded transition-colors"
            >
              <X className="w-4 h-4 text-os-text-secondary-dark" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-3 border-b border-os-border-dark">
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
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="max-h-[160px] overflow-y-auto border-b border-os-border-dark">
              {searchResults.map((result) => (
                <button
                  key={result.ticker}
                  onClick={() => handleAddCompany(result.ticker, result.name)}
                  disabled={trendingCompanies.some(c => c.ticker === result.ticker)}
                  className="w-full px-3 py-2 text-left hover:bg-os-bg-dark transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-brand-aperol shrink-0" />
                    <span className="text-sm font-medium text-brand-vanilla">{result.ticker}</span>
                    <span className="text-xs text-os-text-secondary-dark truncate">{result.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Add Popular */}
          {searchResults.length === 0 && !searchQuery && (
            <div className="p-3 border-b border-os-border-dark">
              <div className="text-xs text-os-text-secondary-dark uppercase tracking-wider mb-2">Popular Companies</div>
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
          <div className="p-3">
            <div className="text-xs text-os-text-secondary-dark uppercase tracking-wider mb-2">Current Watchlist</div>
            <div className="flex flex-wrap gap-1">
              {trendingCompanies.map((company) => (
                <div
                  key={company.ticker}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-brand-vanilla bg-os-bg-dark rounded group"
                >
                  <span>{company.ticker}</span>
                  <button
                    onClick={() => removeTrendingCompany(company.ticker)}
                    className="p-0.5 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-os-text-secondary-dark group-hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
