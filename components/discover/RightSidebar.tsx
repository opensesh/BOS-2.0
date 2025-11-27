import React from 'react';
import { WeatherWidget } from './WeatherWidget';
import { MarketWidget } from './MarketWidget';
import { TrendingCompanies } from './TrendingCompanies';

export function RightSidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-6 w-[320px] shrink-0 py-8 pr-8 pl-4 border-l border-os-border-dark relative">
      {/* Weather Widget */}
      <WeatherWidget />

      <div className="h-px bg-os-border-dark/50" />

      {/* Market Widget */}
      <MarketWidget />

      <div className="h-px bg-os-border-dark/50" />

      {/* Trending Companies Widget */}
      <TrendingCompanies />
    </aside>
  );
}
