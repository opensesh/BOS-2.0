'use client';

import React from 'react';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Copy, 
  Download, 
  Grid3X3, 
  Maximize2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewToolbarProps {
  zoom: number;
  showGrid: boolean;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCopyCode: () => void;
  onDownload: () => void;
  onToggleGrid: () => void;
  onExpand: () => void;
  codeCopied: boolean;
}

export function PreviewToolbar({
  zoom,
  showGrid,
  onReset,
  onZoomIn,
  onZoomOut,
  onCopyCode,
  onDownload,
  onToggleGrid,
  onExpand,
  codeCopied,
}: PreviewToolbarProps) {
  const buttonClass = cn(
    'p-2 rounded-lg transition-colors',
    'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  );

  const activeButtonClass = cn(
    buttonClass,
    'bg-os-surface-dark text-brand-aperol'
  );

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-os-border-dark bg-os-bg-darker">
      {/* Reset */}
      <button
        onClick={onReset}
        className={buttonClass}
        title="Reset preview"
        aria-label="Reset preview"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-os-border-dark mx-1" />

      {/* Zoom Controls */}
      <button
        onClick={onZoomIn}
        disabled={zoom >= 2}
        className={buttonClass}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <button
        onClick={onZoomOut}
        disabled={zoom <= 0.25}
        className={buttonClass}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Zoom percentage */}
      <span className="text-xs text-os-text-secondary-dark min-w-[40px] text-center">
        {Math.round(zoom * 100)}%
      </span>

      {/* Divider */}
      <div className="w-px h-5 bg-os-border-dark mx-1" />

      {/* Copy Code */}
      <button
        onClick={onCopyCode}
        className={codeCopied ? activeButtonClass : buttonClass}
        title="Copy code"
        aria-label="Copy code"
      >
        {codeCopied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {/* Download */}
      <button
        onClick={onDownload}
        className={buttonClass}
        title="Download"
        aria-label="Download"
      >
        <Download className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-os-border-dark mx-1" />

      {/* Grid Toggle */}
      <button
        onClick={onToggleGrid}
        className={showGrid ? activeButtonClass : buttonClass}
        title="Toggle grid"
        aria-label="Toggle grid"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>

      {/* Expand */}
      <button
        onClick={onExpand}
        className={buttonClass}
        title="Expand"
        aria-label="Expand"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}
