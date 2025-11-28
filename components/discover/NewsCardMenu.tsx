'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, FolderPlus, ThumbsDown, MoreHorizontal } from 'lucide-react';

interface NewsCardMenuProps {
  onBookmark?: () => void;
  onAddToSpace?: () => void;
  onDislike?: () => void;
  size?: 'sm' | 'md';
}

export function NewsCardMenu({
  onBookmark,
  onAddToSpace,
  onDislike,
  size = 'md'
}: NewsCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAction = (action?: () => void) => {
    action?.();
    setIsOpen(false);
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const buttonPadding = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          ${buttonPadding} rounded-lg transition-all
          ${isOpen 
            ? 'bg-os-surface-dark text-os-text-primary-dark' 
            : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark/50'
          }
        `}
        aria-label="More options"
      >
        <MoreHorizontal className={iconSize} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 bottom-full mb-2 w-52 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-2xl z-50 overflow-hidden"
          onClick={(e) => e.preventDefault()}
        >
          <div className="py-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onBookmark);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span>Bookmark</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onAddToSpace);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add to Space</span>
            </button>
            
            <div className="my-1.5 border-t border-os-border-dark" />
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onDislike);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-os-text-secondary-dark hover:text-red-400 hover:bg-os-bg-dark transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Dislike</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
