'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Image } from 'lucide-react';
import { SourceInfo } from './AnswerView';
import { SourcePopover } from './SourcePopover';
import { BrandSourcePopover, BrandSourceInfo } from './BrandSourcePopover';
import { BRAND_SOURCES } from '@/lib/brand-knowledge';

interface InlineCitationProps {
  sources: SourceInfo[];
  primarySource: string;
  additionalCount?: number;
}

export function InlineCitation({
  sources,
  primarySource,
  additionalCount = 0,
}: InlineCitationProps) {
  const router = useRouter();
  const [showPopover, setShowPopover] = useState(false);

  // Check if primary source is a brand source
  const primarySourceData = sources[0];
  const isBrandSource = primarySourceData?.type === 'brand-doc' || primarySourceData?.type === 'asset';

  // Get the brand source details for navigation
  const getBrandSourceDetails = (sourceId: string) => {
    return BRAND_SOURCES[sourceId];
  };

  // Convert SourceInfo to BrandSourceInfo for brand sources
  const brandSources: BrandSourceInfo[] = sources
    .filter((s) => s.type === 'brand-doc' || s.type === 'asset')
    .map((s) => {
      const brandDetails = getBrandSourceDetails(s.id);
      return {
        id: s.id,
        name: s.name,
        type: s.type as 'brand-doc' | 'asset',
        title: s.title || s.name,
        path: s.path || s.url,
        snippet: s.snippet,
        thumbnail: s.thumbnail,
        href: brandDetails?.href,
        tab: brandDetails?.tab,
      };
    });

  // External sources for regular popover
  const externalSources = sources.filter((s) => !s.type || s.type === 'external');

  // Handle click to navigate to the brand source page
  const handleClick = (e: React.MouseEvent) => {
    if (!isBrandSource) return;

    const primaryBrandSource = brandSources[0];
    if (primaryBrandSource?.href) {
      e.preventDefault();
      e.stopPropagation();

      // Build URL with tab param if applicable
      let url = primaryBrandSource.href;
      if (primaryBrandSource.tab) {
        url += `?tab=${primaryBrandSource.tab}`;
      }

      router.push(url);
    }
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <span
        onClick={handleClick}
        className={`
          inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs cursor-pointer transition-colors font-mono
          ${isBrandSource
            ? 'bg-brand-aperol/10 text-brand-aperol hover:bg-brand-aperol/20'
            : 'bg-os-surface-dark/80 text-os-text-secondary-dark hover:text-brand-aperol'
          }
        `}
      >
        {isBrandSource && (
          primarySourceData?.type === 'asset' ? (
            <Image className="w-3 h-3" />
          ) : (
            <FileText className="w-3 h-3" />
          )
        )}
        <span className="lowercase">{primarySource}</span>
        {additionalCount > 0 && (
          <span className={`text-[10px] ${isBrandSource ? 'opacity-70' : 'text-os-text-secondary-dark/70'}`}>
            +{additionalCount}
          </span>
        )}
      </span>

      {/* Popover - use brand popover for brand sources */}
      {showPopover && sources.length > 0 && (
        isBrandSource && brandSources.length > 0 ? (
          <BrandSourcePopover sources={brandSources} />
        ) : externalSources.length > 0 ? (
          <SourcePopover sources={externalSources} />
        ) : null
      )}
    </span>
  );
}

