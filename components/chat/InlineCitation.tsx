'use client';

import React, { useState } from 'react';
import { SourceInfo } from './AnswerView';
import { SourcePopover } from './SourcePopover';

interface InlineCitationProps {
  sources: SourceInfo[];
  primarySource: string;
  additionalCount?: number;
}

export function InlineCitation({
  sources,
  primarySource,
  additionalCount = 0,
}: InlineCitationProps) {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-os-surface-dark/80 rounded text-xs text-os-text-secondary-dark hover:text-brand-aperol cursor-pointer transition-colors font-mono">
        <span className="lowercase">{primarySource}</span>
        {additionalCount > 0 && (
          <span className="text-[10px] text-os-text-secondary-dark/70">
            +{additionalCount}
          </span>
        )}
      </span>

      {/* Popover */}
      {showPopover && sources.length > 0 && (
        <SourcePopover sources={sources} />
      )}
    </span>
  );
}

