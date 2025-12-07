'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Bookmark, Box, Table2 } from 'lucide-react';

type DisplayMode = '3d' | 'table';

interface InspoHeaderProps {
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  savedCount?: number;
  onOpenSaved?: () => void;
  onSettingsClick?: () => void;
}

export function InspoHeader({
  displayMode,
  onDisplayModeChange,
  savedCount = 0,
  onOpenSaved,
  onSettingsClick,
}: InspoHeaderProps) {
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
            href="/discover"
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
          <Link
            href="/discover/inspo"
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 bg-brand-aperol text-white"
          >
            Inspo
          </Link>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Display Mode Toggle (3D / Table) */}
        <div className="flex items-center bg-os-surface-dark rounded-lg p-1 border border-os-border-dark mr-1">
          <button
            onClick={() => onDisplayModeChange('3d')}
            className={`p-2 rounded-md transition-all ${
              displayMode === '3d'
                ? 'bg-brand-aperol text-white'
                : 'text-os-text-secondary-dark hover:text-brand-vanilla'
            }`}
            title="3D Explorer"
          >
            <Box className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDisplayModeChange('table')}
            className={`p-2 rounded-md transition-all ${
              displayMode === 'table'
                ? 'bg-brand-aperol text-white'
                : 'text-os-text-secondary-dark hover:text-brand-vanilla'
            }`}
            title="Table View"
          >
            <Table2 className="w-4 h-4" />
          </button>
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
