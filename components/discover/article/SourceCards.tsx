'use client';

import React, { useState, useEffect } from 'react';
import { Source } from '@/types';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

interface SourceCardsProps {
  sources: Source[];
}

interface OGData {
  image: string | null;
  title: string | null;
  description: string | null;
  siteName: string | null;
  favicon: string | null;
}

export function SourceCards({ sources }: SourceCardsProps) {
  const [ogDataMap, setOgDataMap] = useState<Record<string, OGData>>({});

  useEffect(() => {
    // Fetch OG data for each source
    const fetchOgData = async () => {
      const dataMap: Record<string, OGData> = {};
      
      await Promise.all(
        sources.map(async (source) => {
          try {
            const response = await fetch(`/api/og-image?url=${encodeURIComponent(source.url)}`);
            if (response.ok) {
              const data: OGData = await response.json();
              dataMap[source.url] = data;
            }
          } catch (error) {
            console.error('Error fetching OG data for source:', error);
          }
        })
      );
      
      setOgDataMap(dataMap);
    };

    if (sources.length > 0) {
      fetchOgData();
    }
  }, [sources]);

  return (
    <div className="flex flex-col gap-4 my-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {sources.slice(0, 4).map((source, idx) => (
              <div 
                key={source.id || idx}
                className="w-6 h-6 rounded-full bg-os-surface-dark border-2 border-os-bg-dark flex items-center justify-center"
              >
                <span className="text-[9px] text-os-text-secondary-dark font-bold">
                  {source.name.charAt(0)}
                </span>
              </div>
            ))}
          </div>
          <span className="text-sm text-os-text-secondary-dark">
            {sources.length} {sources.length === 1 ? 'source' : 'sources'}
          </span>
        </div>
        {sources.length > 4 && (
          <button className="text-sm text-brand-aperol hover:underline">
            +{sources.length - 4} sources
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {sources.map((source, idx) => {
          const ogData = ogDataMap[source.url];
          
          return (
            <a
              key={source.id || idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[200px] rounded-lg bg-os-surface-dark hover:bg-os-surface-dark/80 border border-os-border-dark/50 transition-all hover:border-brand-aperol/30 group overflow-hidden"
            >
              {/* Thumbnail */}
              {ogData?.image && (
                <div className="relative w-full h-24 bg-os-bg-dark">
                  <Image
                    src={ogData.image}
                    alt={source.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-charcoal flex items-center justify-center text-[9px] font-bold text-brand-vanilla border border-os-border-dark">
                      {source.name.charAt(0)}
                    </div>
                    <span className="text-xs text-os-text-secondary-dark">
                      {source.name}
                    </span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors flex-shrink-0" />
                </div>
                <p className="text-sm font-medium text-os-text-primary-dark line-clamp-2 group-hover:text-brand-vanilla transition-colors">
                  {ogData?.title || source.name}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
