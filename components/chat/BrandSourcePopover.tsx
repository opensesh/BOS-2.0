'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FileText, Image as ImageIcon, Copy, Check, ExternalLink } from 'lucide-react';

export interface BrandSourceInfo {
  id: string;
  name: string;
  type: 'brand-doc' | 'asset';
  title: string;
  path: string;
  snippet?: string;
  thumbnail?: string;
  href?: string; // Page link for navigation
  tab?: string;  // Tab/filter to select on the page
}

interface BrandSourcePopoverProps {
  sources: BrandSourceInfo[];
}

export function BrandSourcePopover({ sources }: BrandSourcePopoverProps) {
  if (sources.length === 0) return null;

  // Using span-based elements to avoid hydration errors when rendered inside <p> tags
  return (
    <span className="absolute left-0 bottom-full mb-2 w-80 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-xl z-50 overflow-hidden block">
      {/* Header */}
      <span className="px-3 py-2 border-b border-os-border-dark flex">
        <span className="text-xs font-semibold text-os-text-secondary-dark">
          Brand Sources • {sources.length}
        </span>
      </span>

      {/* Sources list */}
      <span className="max-h-64 overflow-y-auto block">
        {sources.map((source, idx) => (
          <BrandSourceItem key={source.id || idx} source={source} />
        ))}
      </span>
    </span>
  );
}

function BrandSourceItem({ source }: { source: BrandSourceInfo }) {
  const [copied, setCopied] = useState(false);
  const isAsset = source.type === 'asset';
  const isImage = source.path.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i);

  const handleCopyPath = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(source.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="flex items-start gap-3 px-3 py-2.5 hover:bg-os-bg-dark transition-colors group">
      {/* Icon or Thumbnail */}
      <span className="flex-shrink-0 mt-0.5">
        {isAsset && isImage && source.thumbnail ? (
          <span className="w-10 h-10 rounded-lg overflow-hidden bg-os-border-dark block">
            <Image
              src={source.thumbnail}
              alt={source.title}
              width={40}
              height={40}
              className="w-full h-full object-contain"
              unoptimized
            />
          </span>
        ) : isAsset && isImage ? (
          <span className="w-10 h-10 rounded-lg overflow-hidden bg-os-border-dark block">
            <Image
              src={source.path}
              alt={source.title}
              width={40}
              height={40}
              className="w-full h-full object-contain"
              unoptimized
            />
          </span>
        ) : isAsset ? (
          <span className="w-8 h-8 rounded-lg bg-brand-aperol/10 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-brand-aperol" />
          </span>
        ) : (
          <span className="w-8 h-8 rounded-lg bg-brand-aperol/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-brand-aperol" />
          </span>
        )}
      </span>

      {/* Content */}
      <span className="flex-1 min-w-0 flex flex-col">
        <span className="text-sm font-medium text-os-text-primary-dark line-clamp-1">
          {source.title || source.name}
        </span>
        {source.snippet && (
          <span className="text-xs text-os-text-secondary-dark mt-0.5 line-clamp-2">
            {source.snippet}
          </span>
        )}
        {isAsset && (
          <code className="text-[10px] text-brand-aperol/80 font-mono mt-1 block truncate">
            {source.path}
          </code>
        )}
      </span>

      {/* Actions */}
      <span className="flex-shrink-0 flex items-center gap-1">
        {isAsset && (
          <button
            onClick={handleCopyPath}
            className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-os-border-dark transition-all"
            title="Copy path"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-os-text-secondary-dark" />
            )}
          </button>
        )}
        {!isAsset && source.path && (
          <a
            href={source.path}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-os-border-dark transition-all"
            title="Open document"
          >
            <ExternalLink className="w-3.5 h-3.5 text-os-text-secondary-dark" />
          </a>
        )}
      </span>
    </span>
  );
}
