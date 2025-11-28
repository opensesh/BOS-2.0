'use client';

import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import Image from 'next/image';
import { SourceInfo } from './AnswerView';

interface LinksViewProps {
  query: string;
  sources: SourceInfo[];
}

export function LinksView({ query, sources }: LinksViewProps) {
  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-os-text-secondary-dark">
        <Globe className="w-12 h-12 mb-4 opacity-40" />
        <p className="text-sm">No links available for this search</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search query header */}
      <p className="text-sm text-os-text-secondary-dark">
        Search results for: <span className="font-medium text-os-text-primary-dark">{query}</span>
      </p>

      {/* Links list */}
      <div className="space-y-4">
        {sources.map((source, idx) => (
          <LinkCard key={source.id || idx} source={source} />
        ))}
      </div>

      {/* See more button */}
      {sources.length >= 5 && (
        <button className="text-sm text-brand-aperol hover:underline">
          See more links
        </button>
      )}
    </div>
  );
}

function LinkCard({ source }: { source: SourceInfo }) {
  const domain = getDomain(source.url);

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="flex gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Source info */}
          <div className="flex items-center gap-2 mb-1">
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
              <div className="w-4 h-4 rounded bg-os-surface-dark flex items-center justify-center">
                <Globe className="w-2.5 h-2.5 text-os-text-secondary-dark" />
              </div>
            )}
            <span className="text-xs text-os-text-secondary-dark">{source.name}</span>
            <span className="text-xs text-os-text-secondary-dark/60 truncate">{domain}</span>
          </div>

          {/* Title */}
          <h3 className="text-brand-aperol font-medium text-[15px] mb-1 group-hover:underline line-clamp-2">
            {source.title || source.name}
          </h3>

          {/* Snippet */}
          {source.snippet && (
            <p className="text-sm text-os-text-secondary-dark line-clamp-2">
              {source.snippet}
            </p>
          )}
        </div>

        {/* External link icon */}
        <ExternalLink className="w-4 h-4 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
      </div>
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

