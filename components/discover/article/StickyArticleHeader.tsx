'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MoreHorizontal,
  Bookmark,
  BookmarkCheck,
  Share2,
  Plus,
  Flag,
  Link2,
  Check,
  X,
} from 'lucide-react';

interface StickyArticleHeaderProps {
  title: string;
  showTitle?: boolean;
}

export function StickyArticleHeader({ title, showTitle = true }: StickyArticleHeaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(event.target as Node)) {
        setShowOverflowMenu(false);
      }
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Truncate title for display
  const truncatedTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;

  return (
    <header className="sticky top-0 z-40 bg-os-bg-dark/95 backdrop-blur-sm border-b border-os-border-dark/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        {/* Left: Back button */}
        <Link
          href="/discover"
          className="group flex items-center gap-2 text-os-text-secondary-dark hover:text-brand-vanilla transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium hidden sm:inline">Discover</span>
        </Link>

        {/* Center: Title (truncated) */}
        {showTitle && (
          <h2 className="text-sm font-medium text-brand-vanilla truncate max-w-[40%] md:max-w-[50%] text-center">
            {truncatedTitle}
          </h2>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Overflow menu */}
          <div className="relative" ref={overflowRef}>
            <button
              onClick={() => setShowOverflowMenu(!showOverflowMenu)}
              className="p-2 rounded-lg text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showOverflowMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-xl overflow-hidden">
                <button
                  onClick={() => {
                    // TODO: Implement add to space
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Space</span>
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement report
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report Page</span>
                </button>
              </div>
            )}
          </div>

          {/* Bookmark button */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-brand-aperol hover:bg-os-surface-dark'
                : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>

          {/* Share button */}
          <div className="relative" ref={shareRef}>
            <button
              onClick={() => setShowShareModal(!showShareModal)}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-aperol text-white rounded-lg hover:bg-brand-aperol/90 transition-colors text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {showShareModal && <ShareModalContent onClose={() => setShowShareModal(false)} />}
          </div>
        </div>
      </div>
    </header>
  );
}

function ShareModalContent({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-os-border-dark">
        <h3 className="text-sm font-semibold text-os-text-primary-dark">Share Article</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-os-bg-dark transition-colors">
          <X className="w-4 h-4 text-os-text-secondary-dark" />
        </button>
      </div>

      {/* Copy confirmation */}
      {copied && (
        <div className="px-4 py-2 flex items-center gap-2 text-brand-aperol text-sm bg-brand-aperol/10">
          <Check className="w-4 h-4" />
          <span>Link copied!</span>
        </div>
      )}

      {/* Copy link button */}
      <div className="p-4">
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-os-bg-dark hover:bg-os-bg-dark/80 rounded-lg transition-colors text-sm font-medium text-os-text-primary-dark"
        >
          <Link2 className="w-4 h-4" />
          <span>Copy Link</span>
        </button>
      </div>
    </div>
  );
}

