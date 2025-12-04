'use client';

import React from 'react';
import { Quote, formatPrice, formatVolume, formatMarketCap } from '@/hooks/useFinanceData';

interface StockStatsProps {
  quote: Quote | null;
  loading?: boolean;
}

export function StockStats({ quote, loading }: StockStatsProps) {
  if (loading || !quote) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-3 w-16 bg-os-surface-dark rounded mb-2" />
            <div className="h-5 w-24 bg-os-surface-dark rounded" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Prev Close',
      value: formatPrice(quote.regularMarketPreviousClose, quote.currency),
    },
    {
      label: '52W Range',
      value: `${formatPrice(quote.fiftyTwoWeekLow, quote.currency)} - ${formatPrice(quote.fiftyTwoWeekHigh, quote.currency)}`,
    },
    {
      label: 'Open',
      value: quote.regularMarketOpen ? formatPrice(quote.regularMarketOpen, quote.currency) : '—',
    },
    {
      label: 'Day Range',
      value: `${formatPrice(quote.regularMarketDayLow, quote.currency)} - ${formatPrice(quote.regularMarketDayHigh, quote.currency)}`,
    },
    {
      label: 'Volume',
      value: formatVolume(quote.regularMarketVolume),
    },
    {
      label: 'Market Cap',
      value: quote.marketCap ? formatMarketCap(quote.marketCap) : '—',
    },
    {
      label: 'P/E Ratio',
      value: quote.trailingPE ? quote.trailingPE.toFixed(2) : '—',
    },
    {
      label: 'EPS',
      value: quote.epsTrailingTwelveMonths
        ? formatPrice(quote.epsTrailingTwelveMonths, quote.currency)
        : '—',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col">
          <span className="text-xs text-os-text-secondary-dark mb-1">{stat.label}</span>
          <span className="font-mono text-sm text-brand-vanilla">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}

// Compact version for sidebar
export function StockStatsCompact({ quote }: { quote: Quote | null }) {
  if (!quote) return null;

  const stats = [
    { label: 'Prev Close', value: formatPrice(quote.regularMarketPreviousClose, quote.currency) },
    { label: 'Day Range', value: `${quote.regularMarketDayLow?.toFixed(2)} - ${quote.regularMarketDayHigh?.toFixed(2)}` },
    { label: 'Volume', value: formatVolume(quote.regularMarketVolume) },
  ];

  return (
    <div className="flex flex-col gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="flex justify-between">
          <span className="text-xs text-os-text-secondary-dark">{stat.label}</span>
          <span className="text-xs font-mono text-brand-vanilla">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}


