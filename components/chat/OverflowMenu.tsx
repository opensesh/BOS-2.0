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
  content?: string;
  onAddBookmark?: () => void;
  onAddToSpace?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export function OverflowMenu({
  threadTitle = 'Untitled Thread',
  content = '',
  onAddBookmark,
  onAddToSpace,
  onRename,
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

  const handleExport = async (format: 'pdf' | 'markdown' | 'docx') => {
    setIsOpen(false);
    
    if (format === 'markdown') {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${threadTitle.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${threadTitle}</title>
              <style>
                body { font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                h1, h2, h3 { margin-top: 1.5em; }
              </style>
            </head>
            <body>
              <h1>${threadTitle}</h1>
              ${content.split('\n').map(line => `<p>${line}</p>`).join('')}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } else if (format === 'docx') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${threadTitle.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const menuItems = [
    {
      icon: Bookmark,
      label: 'Add Bookmark',
      onClick: () => {
        onAddBookmark?.();
        setIsOpen(false);
      },
    },
    {
      icon: FolderPlus,
      label: 'Add to Space',
      onClick: () => {
        onAddToSpace?.();
        setIsOpen(false);
      },
    },
    {
      icon: Pencil,
      label: 'Rename Thread',
      onClick: () => {
        onRename?.();
        setIsOpen(false);
      },
    },
    { type: 'divider' as const },
    {
      icon: FileText,
      label: 'Export as PDF',
      onClick: () => handleExport('pdf'),
    },
    {
      icon: FileCode,
      label: 'Export as Markdown',
      onClick: () => handleExport('markdown'),
    },
    {
      icon: FileDown,
      label: 'Export as DOCX',
      onClick: () => handleExport('docx'),
    },
    { type: 'divider' as const },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: () => {
        onDelete?.();
        setIsOpen(false);
      },
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
                  onClick={'onClick' in item ? item.onClick : undefined}
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
