import React from 'react';

interface ArticleSidebarProps {
  summaryPoints: string[];
}

export function ArticleSidebar({ summaryPoints }: ArticleSidebarProps) {
  if (summaryPoints.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {summaryPoints.map((point, idx) => (
        <div 
          key={idx} 
          className="text-sm text-os-text-secondary-dark leading-relaxed border-l-2 border-os-border-dark pl-4 hover:border-brand-aperol hover:text-brand-vanilla transition-colors cursor-pointer"
        >
          {point}
        </div>
      ))}
    </div>
  );
}

