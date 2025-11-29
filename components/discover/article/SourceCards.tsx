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
  // Show only first 3 sources, then the "+X sources" card
  const visibleSources = sources.slice(0, 3);
  const remainingCount = displayCount - visibleSources.length;

  if (sources.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-4">
      {/* Source cards - max 3 */}
      {visibleSources.map((source, idx) => (
        <SourceCardItem key={source.id || idx} source={source} />
      ))}
      
      {/* +N sources card */}
      <button
        onClick={onViewAllSources}
        className="flex flex-col items-center justify-center gap-2 p-3 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all min-h-[80px]"
      >
        {/* Favicon stack */}
        <div className="flex -space-x-1.5">
          {sources.slice(3, 6).map((source, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-os-bg-dark border-2 border-os-surface-dark flex items-center justify-center overflow-hidden"
            >
              {source.favicon ? (
                <Image
                  src={source.favicon}
                  alt=""
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5"
                  unoptimized
                />
              ) : (
                <span className="text-[8px] font-bold text-os-text-secondary-dark">
                  {source.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          ))}
        </div>
        <span className="text-sm text-os-text-secondary-dark">
          +{remainingCount} sources
        </span>
      </button>
    </div>
  );
}

function SourceCardItem({ source }: { source: SourceCard }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all overflow-hidden group"
    >
      {/* Top: Thumbnail */}
      <div className="relative w-full aspect-[16/10] bg-os-bg-dark overflow-hidden">
        {source.imageUrl ? (
          <Image
            src={source.imageUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
            <span className="text-lg font-bold text-os-text-secondary-dark/50">
              {source.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Bottom: Source info */}
      <div className="p-2.5">
        {/* Favicon + Source name inline */}
        <div className="flex items-center gap-1.5 mb-1">
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
              <div className="w-4 h-4 bg-os-bg-dark flex items-center justify-center">
                <span className="text-[8px] font-bold text-os-text-secondary-dark">
                  {source.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <span className="text-[11px] text-os-text-secondary-dark lowercase font-mono truncate">
            {source.name}
          </span>
        </div>

        {/* Article title - 2 lines with truncation */}
        <p className="text-xs font-medium text-os-text-primary-dark line-clamp-2 leading-snug group-hover:text-brand-aperol transition-colors">
          {source.title}
        </p>
      </div>
    </a>
  );
}
