'use client';

import React, { useState } from 'react';
import { FileText, Image } from 'lucide-react';
import { SourceInfo } from './AnswerView';
import { SourcePopover } from './SourcePopover';
import { BrandSourcePopover, BrandSourceInfo } from './BrandSourcePopover';

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
  const [showPopover, setShowPopover] = useState(false);

  // Check if primary source is a brand source
  const primarySourceData = sources[0];
  const isBrandSource = primarySourceData?.type === 'brand-doc' || primarySourceData?.type === 'asset';

  // Convert SourceInfo to BrandSourceInfo for brand sources
  const brandSources: BrandSourceInfo[] = sources
    .filter((s) => s.type === 'brand-doc' || s.type === 'asset')
    .map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type as 'brand-doc' | 'asset',
      title: s.title || s.name,
      path: s.path || s.url,
      snippet: s.snippet,
      thumbnail: s.thumbnail,
    }));

  // External sources for regular popover
  const externalSources = sources.filter((s) => !s.type || s.type === 'external');

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <span
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

