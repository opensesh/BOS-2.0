'use client';

import React from 'react';

interface ArticleSidebarProps {
  summaryPoints: string[];
}

// Generate a slug from section title for anchor links
function generateSectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ArticleSidebar({ summaryPoints }: ArticleSidebarProps) {
  if (summaryPoints.length === 0) return null;

  const handleClick = (point: string) => {
    const sectionId = generateSectionId(point);
    const element = document.getElementById(sectionId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {summaryPoints.map((point, idx) => (
        <button 
          key={idx}
          onClick={() => handleClick(point)}
          className="text-left text-sm text-os-text-secondary-dark leading-relaxed border-l-2 border-os-border-dark pl-4 hover:border-brand-aperol hover:text-brand-vanilla transition-colors"
        >
          {point}
        </button>
      ))}
    </div>
  );
}

// Export helper for use in article page
export { generateSectionId };

