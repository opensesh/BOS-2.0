'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Video, FileText, Pen, Sparkles } from 'lucide-react';
import { IdeaCardData } from '@/types';

interface IdeaCardProps {
  item: IdeaCardData;
  variant?: 'featured' | 'compact';
}

// Gradient presets for card backgrounds - warm terracotta/aperol tones
const GRADIENT_PRESETS = [
  'from-orange-600/60 via-orange-500/40 to-rose-600/30',
  'from-amber-600/50 via-orange-500/40 to-red-600/30',
  'from-rose-600/50 via-orange-500/40 to-amber-600/30',
  'from-orange-500/50 via-rose-500/40 to-orange-600/30',
  'from-red-600/40 via-orange-500/50 to-amber-600/30',
];

// Get consistent gradient based on item id
function getGradientForItem(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENT_PRESETS[hash % GRADIENT_PRESETS.length];
}

// Get category display info
function getCategoryInfo(category: IdeaCardData['category']) {
  switch (category) {
    case 'short-form':
      return { label: 'Short Form', icon: Video };
    case 'long-form':
      return { label: 'Long Form', icon: FileText };
    case 'blog':
      return { label: 'Blog', icon: Pen };
    default:
      return { label: 'Content', icon: Video };
  }
}

// Get format label based on title keywords
function getFormatLabel(title: string, category: IdeaCardData['category']): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('carousel')) return 'Carousel';
  if (lowerTitle.includes('reel')) return 'Reel';
  if (lowerTitle.includes('story')) return 'Story';
  if (lowerTitle.includes('thread')) return 'Thread';
  if (lowerTitle.includes('video')) return 'Video';
  if (lowerTitle.includes('tutorial')) return 'Tutorial';
  if (lowerTitle.includes('guide')) return 'Guide';
  if (lowerTitle.includes('listicle')) return 'Listicle';
  
  const defaults: Record<string, string> = {
    'short-form': 'Reel',
    'long-form': 'Video',
    'blog': 'Article',
  };
  return defaults[category] || 'Content';
}

export function IdeaCard({ item, variant = 'compact' }: IdeaCardProps) {
  const categoryInfo = getCategoryInfo(item.category);
  const formatLabel = getFormatLabel(item.title, item.category);
  const gradientClass = getGradientForItem(item.id);
  const CategoryIcon = categoryInfo.icon;

  // Clean title - remove format prefix if present
  const cleanTitle = item.title
    .replace(/^(Carousel|Reel|Story|Thread|Video|Tutorial|Guide|Listicle):\s*/i, '')
    .trim();

  if (variant === 'featured') {
    return (
      <Link 
        href={`/discover/ideas/${item.slug}`}
        className="group flex flex-col md:flex-row gap-6 p-5 rounded-2xl bg-os-bg-dark border border-transparent hover:border-brand-aperol transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10"
      >
        {/* Text Content - LEFT */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-4">
            {/* Format label with sparkle */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-vanilla/80" />
              <span className="text-sm font-medium text-brand-vanilla/80 tracking-wide">
                {formatLabel}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-vanilla leading-tight">
              {cleanTitle}
            </h2>

            {/* Description */}
            <p className="text-os-text-secondary-dark text-base leading-relaxed line-clamp-3">
              {item.description}
            </p>
          </div>

          {/* Footer pills */}
          <div className="flex items-center gap-3 mt-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-os-border-dark bg-transparent">
              <Clock className="w-3.5 h-3.5 text-os-text-secondary-dark" />
              <span className="text-xs text-os-text-secondary-dark font-medium">
                {item.sources.length} {item.sources.length === 1 ? 'source' : 'sources'}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-os-border-dark bg-transparent">
              <CategoryIcon className="w-3.5 h-3.5 text-os-text-secondary-dark" />
              <span className="text-xs text-os-text-secondary-dark font-medium">
                {categoryInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Gradient Cover - RIGHT */}
        <div className="w-full md:w-[360px] shrink-0">
          <div className={`relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass}`}>
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant - matches screenshot design
  return (
    <Link 
      href={`/discover/ideas/${item.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden h-full bg-os-bg-dark border border-transparent hover:border-brand-aperol transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aperol focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg-dark"
    >
      {/* Gradient Cover Area */}
      <div className={`relative w-full aspect-[4/3] bg-gradient-to-br ${gradientClass}`}>
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col flex-1 p-4 sm:p-5">
        {/* Format Label with sparkle */}
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3 h-3 text-brand-vanilla/70" />
          <span className="text-xs font-medium text-brand-vanilla/70 tracking-wide">
            {formatLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-brand-vanilla text-lg sm:text-xl leading-snug line-clamp-3 flex-1">
          {cleanTitle}
        </h3>

        {/* Footer Chips */}
        <div className="flex items-center gap-3 mt-4 pt-4">
          {/* Sources pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-os-border-dark bg-transparent">
            <Clock className="w-3.5 h-3.5 text-os-text-secondary-dark" />
            <span className="text-xs text-os-text-secondary-dark font-medium">
              {item.sources.length} {item.sources.length === 1 ? 'source' : 'sources'}
            </span>
          </div>

          {/* Category format pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-os-border-dark bg-transparent">
            <CategoryIcon className="w-3.5 h-3.5 text-os-text-secondary-dark" />
            <span className="text-xs text-os-text-secondary-dark font-medium">
              {categoryInfo.label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

