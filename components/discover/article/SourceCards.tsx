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
  // Show only first 3-4 sources, then the "+X sources" card
  const visibleSources = sources.slice(0, 4);
  const remainingCount = displayCount - visibleSources.length;

  if (sources.length === 0) return null;

  return (
    <div className="flex gap-2 my-4 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
      {/* Source cards - horizontal scroll */}
      {visibleSources.map((source, idx) => (
        <SourceCardItem key={source.id || idx} source={source} />
      ))}
      
      {/* +N sources card */}
      {remainingCount > 0 && (
        <button
          onClick={onViewAllSources}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all"
        >
          {/* Favicon stack */}
          <div className="flex -space-x-1.5">
            {sources.slice(4, 7).map((source, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-os-bg-dark border-2 border-os-surface-dark flex items-center justify-center overflow-hidden"
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
          <span className="text-sm text-brand-aperol whitespace-nowrap font-medium">
            +{remainingCount}
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
      className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all group max-w-[260px]"
    >
      {/* Favicon */}
      <div className="flex-shrink-0 w-5 h-5 rounded overflow-hidden">
        {source.favicon ? (
          <Image
            src={source.favicon}
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
            unoptimized
          />
        ) : (
          <div className="w-5 h-5 bg-os-bg-dark flex items-center justify-center">
            <span className="text-[9px] font-bold text-os-text-secondary-dark">
              {source.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Source name + Article title */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] text-os-text-secondary-dark lowercase font-mono">
          {source.name}
        </span>
        <p className="text-xs font-medium text-os-text-primary-dark line-clamp-1 leading-tight group-hover:text-brand-aperol transition-colors">
          {source.title}
        </p>
      </div>

      {/* Optional thumbnail on right - only if provided and unique */}
      {source.imageUrl && (
        <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-os-bg-dark">
          <Image
            src={source.imageUrl}
            alt=""
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      )}
    </a>
  );
}
