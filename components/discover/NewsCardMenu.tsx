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

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const buttonPadding = size === 'sm' ? 'p-1' : 'p-1.5';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          ${buttonPadding} rounded-md transition-all
          ${isOpen 
            ? 'text-os-text-primary-dark' 
            : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
          }
        `}
        aria-label="More options"
      >
        <MoreHorizontal className={iconSize} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 bottom-full mb-2 w-44 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-2xl z-50 overflow-hidden"
          onClick={(e) => e.preventDefault()}
        >
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onBookmark);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmark</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onAddToSpace);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add to Space</span>
            </button>
            
            <div className="my-1 border-t border-os-border-dark" />
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onDislike);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-os-text-secondary-dark hover:text-red-400 hover:bg-os-bg-dark transition-colors"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Dislike</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
