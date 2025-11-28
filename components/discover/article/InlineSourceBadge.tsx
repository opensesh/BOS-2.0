'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Globe } from 'lucide-react';
import { ParagraphSource } from '@/types';

interface InlineSourceBadgeProps {
  sources: ParagraphSource[];
  primarySourceName?: string;
}

export function InlineSourceBadge({ sources, primarySourceName }: InlineSourceBadgeProps) {
  const [showPopover, setShowPopover] = useState(false);

  if (sources.length === 0) return null;

  const primarySource = sources[0];
  const displayName = primarySourceName || primarySource.name;
  const additionalCount = sources.length - 1;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#20B2AA]/10 border border-[#20B2AA]/30 rounded text-xs text-[#20B2AA] hover:bg-[#20B2AA]/20 cursor-pointer transition-colors font-mono"
      >
        <span className="lowercase">{displayName}</span>
        {additionalCount > 0 && (
          <span className="text-[10px] text-[#20B2AA]/70">+{additionalCount}</span>
        )}
      </span>

      {/* Popover */}
      {showPopover && sources.length > 0 && (
        <SourcePopover sources={sources} />
      )}
    </span>
  );
}

function SourcePopover({ sources }: { sources: ParagraphSource[] }) {
  return (
    <div className="absolute left-0 bottom-full mb-2 w-80 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-os-border-dark">
        <p className="text-xs font-semibold text-os-text-secondary-dark">
          Sources · {sources.length}
        </p>
      </div>

      {/* Sources list */}
      <div className="max-h-64 overflow-y-auto">
        {sources.map((source, idx) => (
          <SourceItem key={source.id || idx} source={source} />
        ))}
      </div>
    </div>
  );
}

function SourceItem({ source }: { source: ParagraphSource }) {
  const domain = getDomain(source.url);

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 px-3 py-2.5 hover:bg-os-bg-dark transition-colors group"
    >
      {/* Favicon */}
      <div className="flex-shrink-0 mt-0.5">
        {source.favicon ? (
          <Image
            src={source.favicon}
            alt=""
            width={16}
            height={16}
            className="w-4 h-4 rounded"
            unoptimized
          />
        ) : (
          <div className="w-4 h-4 rounded bg-os-bg-dark flex items-center justify-center">
            <Globe className="w-2.5 h-2.5 text-os-text-secondary-dark" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-os-text-primary-dark group-hover:text-[#20B2AA] transition-colors line-clamp-2">
          {source.title || source.name}
        </p>
        <p className="text-xs text-os-text-secondary-dark mt-0.5 font-mono">
          {domain}
        </p>
      </div>

      {/* External link icon */}
      <ExternalLink className="w-3.5 h-3.5 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
    </a>
  );
}

function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Legacy compatibility export - maps old props to new interface
interface LegacyInlineSourceBadgeProps {
  sourceName: string;
  additionalCount?: number;
  sourceUrl?: string;
}

export function LegacyInlineSourceBadge({ sourceName, additionalCount, sourceUrl }: LegacyInlineSourceBadgeProps) {
  const sources: ParagraphSource[] = [{
    id: 'source-1',
    name: sourceName,
    url: sourceUrl || '#',
  }];
  
  // Add placeholder sources for additional count
  if (additionalCount && additionalCount > 0) {
    for (let i = 0; i < additionalCount; i++) {
      sources.push({
        id: `source-${i + 2}`,
        name: `Source ${i + 2}`,
        url: '#',
      });
    }
  }

  return <InlineSourceBadge sources={sources} primarySourceName={sourceName} />;
}
