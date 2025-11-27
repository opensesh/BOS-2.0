import React from 'react';
import { InlineSourceBadge } from './InlineSourceBadge';
import { Source } from '@/types';

interface ArticleSummaryProps {
  content: string[];
  sources?: Source[];
}

export function ArticleSummary({ content, sources = [] }: ArticleSummaryProps) {
  // Insert inline source citations at the end of paragraphs
  const getSourceForParagraph = (idx: number) => {
    if (sources.length === 0) return null;
    // Distribute sources across paragraphs
    const sourceIdx = idx % sources.length;
    return sources[sourceIdx];
  };

  return (
    <div className="flex flex-col gap-6 text-base leading-relaxed text-os-text-primary-dark/90 font-sans">
      {content.map((paragraph, idx) => {
        const source = getSourceForParagraph(idx);
        const additionalSources = Math.max(0, sources.length - 1 - idx);
        
        return (
          <p key={idx} className="text-base md:text-lg leading-relaxed">
            {paragraph}
            {source && (
              <>
                {' '}
                <InlineSourceBadge 
                  sourceName={source.name.toLowerCase().replace(/\s+/g, '')} 
                  additionalCount={additionalSources > 0 ? additionalSources : undefined}
                />
              </>
            )}
          </p>
        );
      })}
    </div>
  );
}
