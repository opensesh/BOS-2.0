'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Globe, Youtube, Video } from 'lucide-react';
import { ParagraphSource } from '@/types';

// A source group represents one chip (e.g., "benzinga +2" or a YouTube icon)
export interface SourceGroup {
  primarySource: ParagraphSource;
  additionalSources: ParagraphSource[];
  isVideo?: boolean; // For YouTube/video icon display
}

interface InlineSourceChipsProps {
  sourceGroups: SourceGroup[];
}

// Renders multiple source chips for a paragraph
export function InlineSourceChips({ sourceGroups }: InlineSourceChipsProps) {
  if (sourceGroups.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 ml-1">
      {sourceGroups.map((group, idx) => (
        <InlineSourceChip key={`group-${idx}`} group={group} />
      ))}
    </span>
  );
}

// Single source chip with popover
function InlineSourceChip({ group }: { group: SourceGroup }) {
  const [showPopover, setShowPopover] = useState(false);

  const allSources = [group.primarySource, ...group.additionalSources];
  const additionalCount = group.additionalSources.length;

  // Video sources get special icon treatment
  if (group.isVideo) {
    return (
      <span
        className="relative inline-flex"
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
      >
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-os-surface-dark/80 border border-os-border-dark/50 rounded text-xs text-os-text-secondary-dark hover:text-brand-aperol cursor-pointer transition-colors">
          <Youtube className="w-3.5 h-3.5" />
          {additionalCount > 0 && (
            <span className="text-[10px] opacity-70">+{additionalCount}</span>
          )}
        </span>
        {showPopover && <SourcePopover sources={allSources} />}
      </span>
    );
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-aperol/10 border border-brand-aperol/30 rounded text-xs text-brand-aperol hover:bg-brand-aperol/20 cursor-pointer transition-colors font-mono">
        <span className="lowercase">{group.primarySource.name}</span>
        {additionalCount > 0 && (
          <span className="text-[10px] text-brand-aperol/70">+{additionalCount}</span>
        )}
      </span>
      {showPopover && <SourcePopover sources={allSources} />}
    </span>
  );
}

// Legacy single badge component for backwards compatibility
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-aperol/10 border border-brand-aperol/30 rounded text-xs text-brand-aperol hover:bg-brand-aperol/20 cursor-pointer transition-colors font-mono">
        <span className="lowercase">{displayName}</span>
        {additionalCount > 0 && (
          <span className="text-[10px] text-brand-aperol/70">+{additionalCount}</span>
        )}
      </span>

      {showPopover && sources.length > 0 && <SourcePopover sources={sources} />}
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
        <p className="text-sm font-medium text-os-text-primary-dark group-hover:text-brand-aperol transition-colors line-clamp-2">
          {source.title || source.name}
        </p>
        <p className="text-xs text-os-text-secondary-dark mt-0.5 font-mono">{domain}</p>
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

// Helper to detect if a source is a video source
export function isVideoSource(source: ParagraphSource): boolean {
  const videoPatterns = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'twitch.tv'];
  return videoPatterns.some((pattern) => source.url.toLowerCase().includes(pattern));
}

// Helper to group sources into chip groups for a paragraph
export function groupSourcesForParagraph(sources: ParagraphSource[]): SourceGroup[] {
  if (sources.length === 0) return [];

  const groups: SourceGroup[] = [];
  const videoSources: ParagraphSource[] = [];
  const textSources: ParagraphSource[] = [];

  // Separate video and text sources
  sources.forEach((source) => {
    if (isVideoSource(source)) {
      videoSources.push(source);
    } else {
      textSources.push(source);
    }
  });

  // Create text source groups (group by similar domain or create individual chips)
  if (textSources.length > 0) {
    // Group by domain root
    const domainGroups = new Map<string, ParagraphSource[]>();
    textSources.forEach((source) => {
      const domain = getDomain(source.url).split('.')[0];
      if (!domainGroups.has(domain)) {
        domainGroups.set(domain, []);
      }
      domainGroups.get(domain)!.push(source);
    });

    // Create chip for each domain group (max 3 chips for text sources)
    let chipCount = 0;
    domainGroups.forEach((domainSources) => {
      if (chipCount >= 3) return;
      groups.push({
        primarySource: domainSources[0],
        additionalSources: domainSources.slice(1),
        isVideo: false,
      });
      chipCount++;
    });
  }

  // Add video source chip if present
  if (videoSources.length > 0) {
    groups.push({
      primarySource: videoSources[0],
      additionalSources: videoSources.slice(1),
      isVideo: true,
    });
  }

  return groups;
}
