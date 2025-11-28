'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, FolderPlus, ThumbsDown, MoreHorizontal } from 'lucide-react';

interface NewsCardMenuProps {
  onBookmark?: () => void;
  onAddToSpace?: () => void;
  onDislike?: () => void;
}

export function NewsCardMenu({
  onBookmark,
  onAddToSpace,
  onDislike
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault(); // Prevent navigating to the article
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          p-1.5 rounded-lg transition-all
          ${isOpen 
            ? 'bg-os-surface-dark text-brand-aperol' 
            : 'text-os-text-secondary-dark hover:text-brand-aperol hover:bg-os-surface-dark/50'
          }
        `}
        aria-label="More options"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 bottom-full mb-2 w-48 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-bottom-right"
          onClick={(e) => e.preventDefault()} // Prevent link navigation
        >
          <div className="py-1">
            <button
              onClick={() => handleAction(onBookmark)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span>Bookmark</span>
            </button>
            
            <button
              onClick={() => handleAction(onAddToSpace)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add to Space</span>
            </button>
            
            <div className="my-1 border-t border-os-border-dark" />
            
            <button
              onClick={() => handleAction(onDislike)}
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

