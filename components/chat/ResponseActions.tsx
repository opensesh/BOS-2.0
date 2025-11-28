'use client';

import React, { useState } from 'react';
import {
  Share2,
  FileText,
  RefreshCw,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Copy,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import { SourceInfo } from './AnswerView';

interface ResponseActionsProps {
  sources?: SourceInfo[];
  content?: string;
  onShare?: () => void;
  onRegenerate?: () => void;
  showSources?: boolean;
}

export function ResponseActions({
  sources = [],
  content = '',
  onShare,
  onRegenerate,
  showSources = true,
}: ResponseActionsProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const leftActions = [
    {
      icon: Share2,
      label: 'Share',
      onClick: onShare || (() => console.log('Share')),
    },
    {
      icon: FileText,
      label: 'Export',
      onClick: () => console.log('Export'),
    },
    {
      icon: RefreshCw,
      label: 'Regenerate',
      onClick: onRegenerate || (() => console.log('Regenerate')),
    },
    {
      icon: ExternalLink,
      label: 'Open in new tab',
      onClick: () => console.log('Open in new tab'),
    },
  ];

  return (
    <div className="flex items-center justify-between py-3 border-t border-os-border-dark/50 mt-6">
      {/* Left side - action buttons */}
      <div className="flex items-center gap-1">
        {leftActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={action.onClick}
              className="p-2 text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark rounded-lg transition-colors"
              title={action.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}

        {/* Sources indicator */}
        {showSources && sources.length > 0 && (
          <SourcesIndicator sources={sources} />
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
  );
}

function SourcesIndicator({ sources }: { sources: SourceInfo[] }) {
  const [showPopover, setShowPopover] = useState(false);
  const displaySources = sources.slice(0, 3);
  const remainingCount = sources.length - 3;

  return (
    <div className="relative ml-2">
      <button
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-os-surface-dark transition-colors"
      >
        {/* Source favicons */}
        <div className="flex -space-x-1.5">
          {displaySources.map((source, idx) => (
            <div
              key={source.id || idx}
              className="w-5 h-5 rounded-full bg-os-surface-dark border border-os-bg-dark flex items-center justify-center text-[9px] font-bold text-os-text-secondary-dark"
              title={source.name}
            >
              {source.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        <span className="text-xs text-os-text-secondary-dark">
          {sources.length} sources
        </span>
      </button>

      {/* Popover */}
      {showPopover && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-xl p-3 z-50">
          <p className="text-xs font-semibold text-os-text-secondary-dark mb-2">
            Sources • {sources.length}
          </p>
          <div className="space-y-2">
            {sources.slice(0, 5).map((source, idx) => (
              <a
                key={source.id || idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-os-text-primary-dark hover:text-brand-aperol transition-colors"
              >
                <div className="w-4 h-4 rounded bg-os-bg-dark flex items-center justify-center text-[8px] font-bold">
                  {source.name.charAt(0)}
                </div>
                <span className="truncate">{source.title || source.name}</span>
                <span className="text-xs text-os-text-secondary-dark ml-auto">
                  {source.name}
                </span>
              </a>
            ))}
            {sources.length > 5 && (
              <p className="text-xs text-os-text-secondary-dark">
                +{sources.length - 5} more sources
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

