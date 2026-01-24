'use client';

import React from 'react';
import Image from 'next/image';
import type { SourceCard } from '@/types';

interface SourceCardsProps {
  sources: SourceCard[];
  totalCount?: number;
  onViewAllSources: () => void;
}

export function SourceCards({ sources, totalCount, onViewAllSources }: SourceCardsProps) {
  const displayCount = totalCount || sources.length;
  // Show first 3 sources on mobile, 4 on desktop, plus the "+X sources" button
  const visibleSources = sources.slice(0, 3);
  const remainingCount = displayCount - visibleSources.length;

  // Don't show source cards for limited sources - just use the sources button
  if (sources.length <= 4) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 mb-1">
      {/* Source cards - responsive grid, no scroll */}
      {visibleSources.map((source, idx) => (
        <SourceCardItem key={source.id || idx} source={source} />
      ))}
      
      {/* +N sources card */}
      {remainingCount > 0 && (
        <button
          onClick={onViewAllSources}
          className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 hover:border-os-border-dark transition-all"
        >
          {/* Favicon stack - horizontal row */}
          <div className="flex -space-x-1.5">
            {sources.slice(3, 6).map((source, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-os-bg-dark border-2 border-os-surface-dark/80 flex items-center justify-center overflow-hidden"
              >
                {source.favicon ? (
                  <Image
                    src={source.favicon}
                    alt=""
                    width={12}
                    height={12}
                    className="w-3 h-3"
                    unoptimized
                  />
                ) : (
                  <span className="text-[7px] font-bold text-os-text-secondary-dark">
                    {source.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Text below icons */}
          <span className="text-xs text-brand-vanilla whitespace-nowrap font-medium">
            +{remainingCount} sources
          </span>
        </button>
      )}
    </div>
  );
}

function SourceCardItem({ source }: { source: SourceCard }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-2.5 p-2.5 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 hover:border-os-border-dark transition-all group"
    >
      {/* Left: Source info */}
      <div className="flex flex-col min-w-0 flex-1 gap-1">
        {/* Favicon + Source name inline */}
        <div className="flex items-center gap-1.5">
          <div className="flex-shrink-0 w-4 h-4 rounded overflow-hidden">
            {source.favicon ? (
              <Image
                src={source.favicon}
                alt=""
                width={16}
                height={16}
                className="w-4 h-4"
                unoptimized
              />
            ) : (
              <div className="w-4 h-4 bg-os-bg-dark flex items-center justify-center rounded">
                <span className="text-[8px] font-bold text-os-text-secondary-dark">
                  {source.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <span className="text-[11px] text-os-text-secondary-dark lowercase truncate">
            {source.name}
          </span>
        </div>
        
        {/* Article title - 2 lines max */}
        <p className="text-xs font-medium text-os-text-primary-dark line-clamp-2 leading-snug group-hover:text-brand-aperol transition-colors">
          {source.title}
        </p>
      </div>

      {/* Right: Thumbnail */}
      {source.imageUrl && (
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-os-bg-dark">
          <Image
            src={source.imageUrl}
            alt=""
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      )}
    </a>
  );
}
