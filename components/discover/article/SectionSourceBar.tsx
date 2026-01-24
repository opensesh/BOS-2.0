'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Link2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CitationChip } from '@/types';

interface SectionSourceBarProps {
  citations: CitationChip[];
  sectionTitle?: string;
  onOpenDrawer: () => void;
}

export function SectionSourceBar({ citations, sectionTitle, onOpenDrawer }: SectionSourceBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  // Flatten all sources from citations
  const allSources = citations.flatMap(c => [c.primarySource, ...c.additionalSources]);
  const uniqueSources = allSources.filter((s, idx, arr) => 
    arr.findIndex(x => x.url === s.url) === idx
  );
  const sourceCount = uniqueSources.length;

  // Get first 3 favicons for display
  const displayFavicons = uniqueSources.slice(0, 3);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const urls = uniqueSources.map(s => s.url).join('\n');
      await navigator.clipboard.writeText(urls);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open first source in new tab
    if (uniqueSources.length > 0) {
      window.open(uniqueSources[0].url, '_blank');
    }
  };

  if (sourceCount === 0) return null;

  return (
    <motion.div
      className="flex items-center gap-3 my-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main clickable container */}
      <motion.button
        onClick={onOpenDrawer}
        className="flex items-center gap-2 px-3 py-2 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-full border border-os-border-dark/50 transition-colors cursor-pointer"
        layout
      >
        {/* Favicon stack */}
        <div className="flex -space-x-1.5">
          {displayFavicons.map((source, idx) => (
            <div
              key={source.id}
              className="w-5 h-5 rounded-full bg-os-bg-dark border border-os-border-dark flex items-center justify-center overflow-hidden"
              style={{ zIndex: displayFavicons.length - idx }}
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

        {/* Source count */}
        <span className="text-sm text-os-text-secondary-dark">
          {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
        </span>
      </motion.button>

      {/* Action icons - expand on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 overflow-hidden"
          >
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={handleLinkClick}
              className="p-2 rounded-lg hover:bg-os-surface-dark text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors"
              title="Open source"
            >
              <Link2 className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-os-surface-dark text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors"
              title="Copy source URLs"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

