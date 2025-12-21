'use client';

import React from 'react';
import { NewsItem, getRelativeTime } from '@/hooks/useFinanceData';
import { ExternalLink, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';

interface LatestNewsProps {
  news: NewsItem[];
  loading?: boolean;
  maxItems?: number;
}

export function LatestNews({ news, loading, maxItems = 5 }: LatestNewsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-brand-vanilla flex items-center gap-2">
          <Newspaper className="w-4 h-4" />
          Latest Updates
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-16 h-12 bg-os-surface-dark rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-full bg-os-surface-dark rounded" />
                <div className="h-3 w-3/4 bg-os-surface-dark rounded" />
                <div className="h-2 w-24 bg-os-surface-dark rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-brand-vanilla flex items-center gap-2">
          <Newspaper className="w-4 h-4" />
          Latest Updates
        </h3>
        <p className="text-sm text-os-text-secondary-dark">No recent news available.</p>
      </div>
    );
  }

  const displayedNews = news.slice(0, maxItems);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-brand-vanilla flex items-center gap-2">
        <Newspaper className="w-4 h-4" />
        Latest Updates
      </h3>
      
      <div className="space-y-3">
        {displayedNews.map((item, index) => (
          <motion.a
            key={item.uuid}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex gap-3 p-2 -mx-2 rounded-lg hover:bg-os-surface-dark/50 transition-colors"
          >
            {/* Thumbnail */}
            {item.thumbnail?.resolutions?.[0]?.url ? (
              <div className="w-16 h-12 rounded overflow-hidden shrink-0 bg-os-surface-dark">
                <img
                  src={item.thumbnail.resolutions[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-12 rounded bg-os-surface-dark flex items-center justify-center shrink-0">
                <Newspaper className="w-5 h-5 text-os-text-secondary-dark" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm text-brand-vanilla line-clamp-2 group-hover:text-brand-aperol transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-os-text-secondary-dark">{item.publisher}</span>
                <span className="text-xs text-os-text-secondary-dark">·</span>
                <span className="text-xs text-os-text-secondary-dark">
                  {getRelativeTime(item.providerPublishTime)}
                </span>
                <ExternalLink className="w-3 h-3 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {news.length > maxItems && (
        <button className="text-xs text-brand-aperol hover:underline">
          View all {news.length} articles
        </button>
      )}
    </div>
  );
}

// Compact news item for sidebar
export function NewsItemCompact({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-2 -mx-2 rounded-lg hover:bg-os-surface-dark/50 transition-colors"
    >
      <h4 className="text-xs text-brand-vanilla line-clamp-2 group-hover:text-brand-aperol transition-colors">
        {item.title}
      </h4>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] text-os-text-secondary-dark">{item.publisher}</span>
        <span className="text-[10px] text-os-text-secondary-dark">·</span>
        <span className="text-[10px] text-os-text-secondary-dark">
          {getRelativeTime(item.providerPublishTime)}
        </span>
      </div>
    </a>
  );
}






