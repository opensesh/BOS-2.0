import React from 'react';
import { Clock } from 'lucide-react';

interface ArticleHeaderProps {
  title: string;
  publishedAt: string;
  sourceCount: number;
}

export function ArticleHeader({ title, publishedAt, sourceCount }: ArticleHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-brand-vanilla leading-tight">
        {title}
      </h1>
      <div className="flex items-center gap-4 text-sm text-os-text-secondary-dark">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          Published {publishedAt}
        </span>
        <span className="text-os-border-dark">•</span>
        <span>{sourceCount} {sourceCount === 1 ? 'source' : 'sources'}</span>
      </div>
    </div>
  );
}
