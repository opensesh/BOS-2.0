import React from 'react';

interface InlineSourceBadgeProps {
  sourceName: string;
  additionalCount?: number;
}

export function InlineSourceBadge({ sourceName, additionalCount }: InlineSourceBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-os-surface-dark rounded text-xs text-os-text-secondary-dark hover:text-[#20B2AA] cursor-pointer transition-colors">
      <span className="font-mono">{sourceName}</span>
      {additionalCount && additionalCount > 0 && (
        <span className="text-[10px]">+{additionalCount}</span>
      )}
    </span>
  );
}

