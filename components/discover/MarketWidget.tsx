'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMarketData, searchSymbols, POPULAR_SYMBOLS } from '@/hooks/useMarketData';
import { Loader2, Plus, X, Search, Settings, Check, ExternalLink } from 'lucide-react';
import { FlipCard } from '@/components/ui/FlipCard';
import Link from 'next/link';

// Sparkline SVG component for better visualization
function Sparkline({ data, positive, height = 32 }: { data: number[]; positive: boolean; height?: number }) {
  if (!data || data.length < 2) return null;
  
  const width = 100;
  const padding = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // Create path points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });
  
  const pathD = `M ${points.join(' L ')}`;
  
  // Create area fill path
  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
  
  const color = positive ? '#22c55e' : '#ef4444';
  const fillColor = positive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  
  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      className="w-full" 
      style={{ height: `${height}px` }}
      preserveAspectRatio="none"
    >
      {/* Area fill */}
      <path d={areaD} fill={fillColor} />
      {/* Line */}
      <path 
        d={pathD} 
        fill="none" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle 
        cx={width - padding} 
        cy={padding + (1 - (data[data.length - 1] - min) / range) * (height - padding * 2)} 
        r="2" 
        fill={color}
      />
    </svg>
  );
}

// Front face - Market display with clickable cards
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
      <div className="flex items-center justify-between">
        <Link 
          href="/finance"
          className="text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium hover:text-brand-aperol transition-colors flex items-center gap-1.5"
        >
          Market Outlook
          <ExternalLink className="w-3 h-3" />
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            onFlip();
          }}
          className="p-1.5 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-lg transition-colors border border-os-border-dark/30"
          title="Edit watchlist"
        >
          <Settings className="w-3.5 h-3.5 text-os-text-secondary-dark hover:text-brand-aperol" />
        </button>
      </div>

      {/* Market Cards - Clickable to go to finance page */}
      <div className="grid grid-cols-2 gap-3">
        {marketData.map((item) => {
          // Format symbol for URL (handle special chars like ^VIX)
          const urlSymbol = item.symbol.startsWith('^') 
            ? encodeURIComponent(item.symbol) 
            : item.symbol;
            
          return (
            <Link
              key={item.symbol}
              href={`/finance/${urlSymbol}`}
              className="flex flex-col p-3 bg-os-surface-dark rounded-lg hover:bg-os-surface-dark/80 hover:ring-1 hover:ring-brand-aperol/30 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-1">
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
              {/* Sparkline Chart */}
              {item.trend && item.trend.length > 1 && (
                <div className="mt-2">
                  <Sparkline data={item.trend} positive={item.positive} height={28} />
                </div>
              )}
            </Link>
          );
        })}
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
        <div className="text-xs text-os-text-secondary-dark">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-xs text-brand-aperol hover:underline"
        >
          Retry
        </button>
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
