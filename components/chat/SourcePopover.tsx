'use client';

import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import Image from 'next/image';
import { SourceInfo } from './AnswerView';

interface SourcePopoverProps {
  sources: SourceInfo[];
}

export function SourcePopover({ sources }: SourcePopoverProps) {
  if (sources.length === 0) return null;

  return (
    <div className="absolute left-0 bottom-full mb-2 w-72 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-os-border-dark">
        <p className="text-xs font-semibold text-os-text-secondary-dark">
          Sources • {sources.length}
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

function SourceItem({ source }: { source: SourceInfo }) {
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
        <p className="text-xs text-os-text-secondary-dark mt-0.5">
          {source.name}
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

