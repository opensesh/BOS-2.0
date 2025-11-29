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
  const remainingCount = displayCount - sources.length;

  if (sources.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 my-4">
      {sources.map((source, idx) => (
        <SourceCardItem key={source.id || idx} source={source} />
      ))}
      
      {/* +N sources card */}
      {remainingCount > 0 && (
        <button
          onClick={onViewAllSources}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 transition-colors"
        >
          {/* Favicon stack for remaining sources */}
          <div className="flex -space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-os-bg-dark border border-os-border-dark flex items-center justify-center"
                style={{ 
                  backgroundColor: i === 0 ? '#FF6B6B' : i === 1 ? '#4ECDC4' : '#45B7D1',
                }}
              >
                <span className="text-[8px] font-bold text-white">
                  {String.fromCharCode(65 + i)}
                </span>
              </div>
            ))}
          </div>
          <span className="text-sm text-os-text-secondary-dark whitespace-nowrap">
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
      className="flex-shrink-0 flex items-center gap-3 px-3 py-2 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 transition-all hover:border-brand-aperol/30 group max-w-[280px]"
    >
      {/* Left: Favicon + Content */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {/* Favicon */}
        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-os-bg-dark flex items-center justify-center overflow-hidden">
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
            <span className="text-[10px] font-bold text-os-text-secondary-dark">
              {source.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Source name + title */}
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-os-text-secondary-dark lowercase font-mono">
            {source.name}
          </span>
          <p className="text-sm font-medium text-os-text-primary-dark truncate group-hover:text-brand-aperol transition-colors">
            {source.title}
          </p>
        </div>
      </div>

      {/* Right: Thumbnail */}
      {source.imageUrl && (
        <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-os-bg-dark">
          <Image
            src={source.imageUrl}
            alt=""
            width={64}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      )}
    </a>
  );
}
