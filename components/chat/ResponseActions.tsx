'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  Download,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  MoreHorizontal,
  Check,
  Command,
  FileText,
  FileCode,
  FileDown,
  Globe,
} from 'lucide-react';
import { SourceInfo } from './AnswerView';
import { ShortcutModal } from './ShortcutModal';

interface ResponseActionsProps {
  sources?: SourceInfo[];
  content?: string;
  onShare?: () => void;
  onRegenerate?: () => void;
  showSources?: boolean;
  modelUsed?: string;
}

export function ResponseActions({
  sources = [],
  content = '',
  onShare,
  onRegenerate,
  showSources = false,
  modelUsed,
}: ResponseActionsProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShortcutModal, setShowShortcutModal] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      if (onShare) onShare();
      setTimeout(() => setShared(false), 3000);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleExport = async (format: 'pdf' | 'markdown' | 'docx') => {
    setShowExportMenu(false);
    
    if (format === 'markdown') {
      // Download as markdown
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'response.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // For PDF, we'll use the browser's print functionality
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Export</title></head>
            <body style="font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto;">
              ${content.split('\n').map(line => `<p>${line}</p>`).join('')}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } else if (format === 'docx') {
      // For DOCX, download as text file (simplified)
      const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'response.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Check if Perplexity model is used
  const isPerplexityModel = modelUsed?.includes('sonar') || modelUsed?.includes('perplexity');

  return (
    <>
      <div className="flex items-center justify-between py-3 border-t border-os-border-dark/50 mt-6">
        {/* Left side - action buttons */}
        <div className="flex items-center gap-1">
          {/* Share button with checkmark state */}
          <button
            onClick={handleShare}
            className={`
              p-2 rounded-lg transition-colors
              ${shared 
                ? 'text-green-400' 
                : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark'
              }
            `}
            title={shared ? 'Link copied!' : 'Share'}
          >
            {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Export dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`
                p-2 rounded-lg transition-colors
                ${showExportMenu 
                  ? 'text-os-text-primary-dark bg-os-surface-dark' 
                  : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark'
                }
              `}
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div className="absolute left-0 top-full mt-1 w-40 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-xl z-50 py-1">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Markdown</span>
                </button>
                <button
                  onClick={() => handleExport('docx')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>DOCX</span>
                </button>
              </div>
            )}
          </div>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            className="p-2 text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark rounded-lg transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Command/Shortcut button */}
          <button
            onClick={() => setShowShortcutModal(true)}
            className="p-2 text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark rounded-lg transition-colors"
            title="Save as shortcut"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Sources indicator - only for Perplexity */}
          {showSources && isPerplexityModel && sources.length > 0 && (
            <SourcesChips sources={sources} />
          )}
        </div>

        {/* Right side - feedback and copy */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            className={`
              p-2 rounded-lg transition-colors
              ${
                feedback === 'up'
                  ? 'text-brand-aperol bg-brand-aperol/10'
                  : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark'
              }
            `}
            title="Good response"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
            className={`
              p-2 rounded-lg transition-colors
              ${
                feedback === 'down'
                  ? 'text-red-400 bg-red-400/10'
                  : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark'
              }
            `}
            title="Poor response"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark rounded-lg transition-colors"
            title={copied ? 'Copied!' : 'Copy response'}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            className="p-2 text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark rounded-lg transition-colors"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share toast notification */}
      {shared && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-os-surface-dark border border-os-border-dark rounded-lg px-4 py-3 shadow-xl animate-fade-in">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-sm text-os-text-primary-dark">Link copied. Paste to share</span>
        </div>
      )}

      {/* Shortcut Modal */}
      <ShortcutModal
        isOpen={showShortcutModal}
        onClose={() => setShowShortcutModal(false)}
        defaultInstructions={content.slice(0, 200)}
      />
    </>
  );
}

function SourcesChips({ sources }: { sources: SourceInfo[] }) {
  const [showAll, setShowAll] = useState(false);
  const displaySources = showAll ? sources : sources.slice(0, 3);

  return (
    <div className="flex items-center gap-2 ml-2">
      {/* Source favicon chips */}
      <div className="flex items-center">
        <div className="flex -space-x-1.5">
          {displaySources.map((source, idx) => (
            <a
              key={source.id || idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded-full bg-os-surface-dark border-2 border-os-bg-dark flex items-center justify-center hover:z-10 hover:scale-110 transition-transform"
              title={source.name}
            >
              {source.favicon ? (
                <img src={source.favicon} alt="" className="w-3.5 h-3.5 rounded" />
              ) : (
                <Globe className="w-3 h-3 text-os-text-secondary-dark" />
              )}
            </a>
          ))}
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="ml-2 text-xs text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors"
        >
          {sources.length} sources
        </button>
      </div>
    </div>
  );
}
