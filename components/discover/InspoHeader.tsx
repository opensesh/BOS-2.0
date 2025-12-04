'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Bookmark, ChevronDown, Check, Globe, Orbit, Grid3X3, Cloud, Stars, Wind } from 'lucide-react';
import { ViewMode } from '@/lib/stores/inspo-store';

interface InspoHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isTransitioning: boolean;
  savedCount?: number;
  onOpenSaved?: () => void;
  onSettingsClick?: () => void;
}

const VIEW_MODE_OPTIONS: { id: ViewMode; label: string; icon: typeof Globe }[] = [
  { id: 'galaxy', label: 'Galaxy', icon: Orbit },
  { id: 'sphere', label: 'Sphere', icon: Globe },
  { id: 'nebula', label: 'Nebula', icon: Cloud },
  { id: 'starfield', label: 'Starfield', icon: Stars },
  { id: 'vortex', label: 'Vortex', icon: Wind },
  { id: 'grid', label: 'Grid', icon: Grid3X3 },
];

export function InspoHeader({
  viewMode,
  onViewModeChange,
  isTransitioning,
  savedCount = 0,
  onOpenSaved,
  onSettingsClick,
}: InspoHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentViewOption = VIEW_MODE_OPTIONS.find(v => v.id === viewMode) || VIEW_MODE_OPTIONS[1];
  const CurrentViewIcon = currentViewOption.icon;

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Left: Title and Tabs */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla">
          Discover
        </h1>

        {/* Tab Pills */}
        <div className="flex items-center bg-os-surface-dark/50 rounded-full p-1">
          <Link
            href="/discover?tab=News"
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-os-text-secondary-dark hover:text-brand-vanilla"
          >
            News
          </Link>
          <Link
            href="/discover?tab=Ideas"
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-os-text-secondary-dark hover:text-brand-vanilla"
          >
            Ideas
          </Link>
          <span className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 bg-brand-aperol text-white">
            Inspo
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* View Mode Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            disabled={isTransitioning}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isTransitioning
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-brand-aperol/15 text-brand-aperol border border-brand-aperol/30'
            }`}
          >
            <CurrentViewIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{currentViewOption.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 py-2 bg-os-surface-dark border border-os-border-dark rounded-xl shadow-xl min-w-[180px] z-50">
              <div className="px-3 pb-2 mb-2 border-b border-os-border-dark">
                <span className="text-xs font-semibold text-os-text-secondary-dark uppercase tracking-wide">
                  View Mode
                </span>
              </div>
              {VIEW_MODE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onViewModeChange(option.id);
                      setIsFilterOpen(false);
                    }}
                    disabled={isTransitioning}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                      viewMode === option.id
                        ? 'text-brand-aperol bg-brand-aperol/10'
                        : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-bg-dark'
                    } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </div>
                    {viewMode === option.id && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Saved Button */}
        <button
          onClick={onOpenSaved}
          className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors group relative"
          title="Saved Articles"
        >
          <Bookmark className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
          {savedCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-brand-aperol text-white text-[10px] font-bold rounded-full">
              {savedCount > 9 ? '9+' : savedCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors group"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
        </button>
      </div>
    </div>
  );
}
