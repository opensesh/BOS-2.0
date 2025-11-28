'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal,
  Bookmark,
  FolderPlus,
  Pencil,
  FileText,
  FileCode,
  FileDown,
  Trash2,
} from 'lucide-react';

interface OverflowMenuProps {
  threadTitle?: string;
  onAddBookmark?: () => void;
  onAddToSpace?: () => void;
  onRename?: () => void;
  onExportPDF?: () => void;
  onExportMarkdown?: () => void;
  onExportDOCX?: () => void;
  onDelete?: () => void;
}

export function OverflowMenu({
  threadTitle = 'Untitled Thread',
  onAddBookmark,
  onAddToSpace,
  onRename,
  onExportPDF,
  onExportMarkdown,
  onExportDOCX,
  onDelete,
}: OverflowMenuProps) {
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

  const menuItems = [
    {
      icon: Bookmark,
      label: 'Add Bookmark',
      onClick: onAddBookmark || (() => console.log('Add Bookmark')),
    },
    {
      icon: FolderPlus,
      label: 'Add to Space',
      onClick: onAddToSpace || (() => console.log('Add to Space')),
    },
    {
      icon: Pencil,
      label: 'Rename Thread',
      onClick: onRename || (() => console.log('Rename Thread')),
    },
    { type: 'divider' as const },
    {
      icon: FileText,
      label: 'Export as PDF',
      onClick: onExportPDF || (() => console.log('Export PDF')),
    },
    {
      icon: FileCode,
      label: 'Export as Markdown',
      onClick: onExportMarkdown || (() => console.log('Export Markdown')),
    },
    {
      icon: FileDown,
      label: 'Export as DOCX',
      onClick: onExportDOCX || (() => console.log('Export DOCX')),
    },
    { type: 'divider' as const },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: onDelete || (() => console.log('Delete')),
      danger: true,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2 rounded-lg transition-all
          ${
            isOpen
              ? 'bg-os-surface-dark text-os-text-primary-dark'
              : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark/50'
          }
        `}
        aria-label="More options"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl z-50 overflow-hidden">
          {/* Thread info header */}
          <div className="px-4 py-3 border-b border-os-border-dark">
            <p className="text-sm font-medium text-os-text-primary-dark truncate">
              {threadTitle}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-os-text-secondary-dark">
              <span>Created by You</span>
              <span>Last Updated Today</span>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map((item, idx) => {
              if ('type' in item && item.type === 'divider') {
                return (
                  <div
                    key={idx}
                    className="my-1 border-t border-os-border-dark"
                  />
                );
              }

              const Icon = 'icon' in item ? item.icon : null;
              const isDanger = 'danger' in item && item.danger;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if ('onClick' in item) item.onClick();
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                    ${
                      isDanger
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-os-text-primary-dark hover:bg-os-bg-dark'
                    }
                  `}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{'label' in item ? item.label : ''}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

