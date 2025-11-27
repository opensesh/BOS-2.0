'use client';

import React from 'react';
import { WeatherWidget } from './WeatherWidget';
import { MarketWidget } from './MarketWidget';
import { TrendingCompanies } from './TrendingCompanies';

export function WidgetPanel() {
  return (
    <div className="flex flex-col gap-4 w-full lg:w-[300px] shrink-0">
      {/* Weather Card */}
      <div className="bg-os-surface-dark rounded-xl p-4 border border-os-border-dark/50">
        <WeatherWidget />
      </div>

      {/* Market Outlook Card */}
      <div className="bg-os-surface-dark rounded-xl p-4 border border-os-border-dark/50">
        <MarketWidget />
      </div>

      {/* Trending Companies Card */}
      <div className="bg-os-surface-dark rounded-xl p-4 border border-os-border-dark/50">
        <TrendingCompanies />
      </div>
    </div>
  );
}

