'use client';

import React from 'react';
import Image from 'next/image';
import { X, ExternalLink, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SourceItem {
  id: string;
  name: string;
  url: string;
  favicon: string;
  title?: string;
}

interface AllSourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: SourceItem[];
  totalCount: number;
}

export function AllSourcesDrawer({ isOpen, onClose, sources, totalCount }: AllSourcesDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-os-surface-dark border-l border-os-border-dark z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-os-border-dark">
              <div>
                <h2 className="text-lg font-display font-semibold text-brand-vanilla">
                  {totalCount} sources
                </h2>
                <p className="text-sm text-os-text-secondary-dark mt-0.5">
                  All sources used in this article
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-os-bg-dark text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sources list */}
            <div className="flex-1 overflow-y-auto">
              {sources.map((source, idx) => (
                <SourceItem key={`${source.id}-${idx}`} source={source} />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SourceItem({ source }: { source: SourceItem }) {
  const domain = getDomain(source.url);
  const displayTitle = source.title || generateTitleFromUrl(source.url);

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 px-6 py-4 hover:bg-os-bg-dark transition-colors group border-b border-os-border-dark/30"
    >
      {/* Favicon */}
      <div className="flex-shrink-0 mt-0.5">
        {source.favicon ? (
          <div className="w-8 h-8 rounded-lg bg-os-bg-dark flex items-center justify-center overflow-hidden">
            <Image
              src={source.favicon}
              alt=""
              width={20}
              height={20}
              className="w-5 h-5"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-os-bg-dark flex items-center justify-center">
            <Globe className="w-4 h-4 text-os-text-secondary-dark" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Domain badge */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wide">
            {source.name}
          </span>
        </div>
        
        {/* Title */}
        <p className="text-sm font-medium text-os-text-primary-dark group-hover:text-brand-aperol transition-colors line-clamp-2 leading-snug">
          {displayTitle}
        </p>
        
        {/* URL */}
        <p className="text-xs text-os-text-secondary-dark mt-1 truncate font-mono">
          {domain}
        </p>
      </div>

      {/* External link icon */}
      <ExternalLink className="w-4 h-4 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
    </a>
  );
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function generateTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1]
        .replace(/[-_]/g, ' ')
        .replace(/\.(html|htm|php|asp)$/i, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (lastPart.length > 5) {
        return lastPart;
      }
    }
    
    return `Article from ${urlObj.hostname.replace('www.', '')}`;
  } catch {
    return 'Source article';
  }
}

