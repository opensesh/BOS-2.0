'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMarketData, searchSymbols, POPULAR_SYMBOLS } from '@/hooks/useMarketData';
import { Loader2, Plus, X, Search, RotateCcw, Check } from 'lucide-react';
import { FlipCard } from '@/components/ui/FlipCard';

// Front face - Market display
function MarketDisplay({
  marketData,
  onFlip,
}: {
  marketData: ReturnType<typeof useMarketData>['marketData'];
  onFlip: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header with flip trigger */}
      <button
        onClick={onFlip}
        className="flex items-center justify-between text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium hover:text-brand-aperol transition-colors group w-full text-left"
      >
        <span>Market Outlook</span>
        <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Market Cards */}
      <div className="grid grid-cols-2 gap-3">
        {marketData.map((item) => (
          <div 
            key={item.symbol} 
            className="flex flex-col p-3 bg-os-surface-dark rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer group relative"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-os-text-secondary-dark truncate">
                {item.name}
              </span>
              <span className={`text-xs font-medium whitespace-nowrap ml-2 ${
                item.positive ? 'text-green-500' : 'text-red-500'
              }`}>
                {item.positive ? '+' : ''}{item.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-mono font-medium text-brand-vanilla">
                {item.symbol.includes('BTC') || item.symbol.includes('ETH') ? '$' : ''}{item.value}
              </span>
              <span className={`text-xs font-medium ${
                item.positive ? 'text-green-500' : 'text-red-500'
              }`}>
                {item.change}
              </span>
            </div>
            {/* Mini trend chart */}
            {item.trend && item.trend.length > 0 && (
              <div className="mt-2 h-8 flex items-end gap-0.5">
                {item.trend.map((value, idx) => {
                  const max = Math.max(...item.trend!);
                  const min = Math.min(...item.trend!);
                  const range = max - min || 1;
                  const height = ((value - min) / range) * 100;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-t ${
                        item.positive ? 'bg-green-500/50' : 'bg-red-500/50'
                      }`}
                      style={{ height: `${Math.max(height, 20)}%` }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Back face - Market editor
function MarketEditor({
  marketData,
  onAddSymbol,
  onRemoveSymbol,
  onDone,
}: {
  marketData: ReturnType<typeof useMarketData>['marketData'];
  onAddSymbol: (symbol: string, name: string) => void;
  onRemoveSymbol: (symbol: string) => void;
  onDone: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string; type: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Search for symbols
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchSymbols(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleAddSymbol = (symbol: string, name: string) => {
    onAddSymbol(symbol, name);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-medium text-os-text-secondary-dark">
          Edit Watchlist
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
          placeholder="Search symbols..."
          className="w-full pl-9 pr-3 py-2 bg-os-bg-dark border border-os-border-dark rounded-lg text-sm text-brand-vanilla placeholder-os-text-secondary-dark focus:outline-none focus:border-brand-aperol transition-colors"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark animate-spin" />
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="max-h-[100px] overflow-y-auto -mx-1 px-1">
          {searchResults.map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleAddSymbol(result.symbol, result.name)}
              className="w-full px-2 py-1.5 text-left hover:bg-os-bg-dark rounded transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3 h-3 text-brand-aperol shrink-0" />
                <span className="text-xs font-medium text-brand-vanilla">{result.symbol}</span>
                <span className="text-[10px] text-os-text-secondary-dark truncate">{result.name}</span>
              </div>
              <span className="text-[10px] text-os-text-secondary-dark bg-os-bg-dark px-1 py-0.5 rounded">
                {result.type}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick Add Popular */}
      {searchResults.length === 0 && !searchQuery && (
        <div>
          <div className="text-[10px] text-os-text-secondary-dark uppercase tracking-wider mb-2">Quick Add</div>
          <div className="flex flex-wrap gap-1">
            {POPULAR_SYMBOLS.filter(s => !marketData.find(d => d.symbol === s.symbol)).slice(0, 6).map((s) => (
              <button
                key={s.symbol}
                onClick={() => handleAddSymbol(s.symbol, s.name)}
                className="px-2 py-1 text-xs text-brand-vanilla bg-os-bg-dark hover:bg-brand-aperol/20 rounded transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {s.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Watchlist */}
      <div>
        <div className="text-[10px] text-os-text-secondary-dark uppercase tracking-wider mb-2">Current Watchlist</div>
        <div className="flex flex-wrap gap-1">
          {marketData.map((item) => (
            <div
              key={item.symbol}
              className="flex items-center gap-1 px-2 py-1 text-xs text-brand-vanilla bg-os-bg-dark rounded group"
            >
              <span>{item.symbol}</span>
              <button
                onClick={() => onRemoveSymbol(item.symbol)}
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

export function MarketWidget() {
  const { marketData, loading, error, addMarketSymbol, removeMarketSymbol } = useMarketData();
  const [isFlipped, setIsFlipped] = useState(false);

  if (loading && marketData.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium">
          Market Outlook
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-os-text-secondary-dark animate-spin" />
        </div>
      </div>
    );
  }

  if (error && marketData.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium">
          Market Outlook
        </div>
        <div className="text-xs text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <FlipCard
      isFlipped={isFlipped}
      front={
        <MarketDisplay
          marketData={marketData}
          onFlip={() => setIsFlipped(true)}
        />
      }
      back={
        <MarketEditor
          marketData={marketData}
          onAddSymbol={addMarketSymbol}
          onRemoveSymbol={removeMarketSymbol}
          onDone={() => setIsFlipped(false)}
        />
      }
    />
  );
}
