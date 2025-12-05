'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Video, FileText, Pen, Sparkles } from 'lucide-react';
import { IdeaCardData } from '@/types';
import { getTextureByIndex, getTextureIndexFromString } from '@/lib/discover-utils';

interface IdeaCardProps {
  item: IdeaCardData;
  variant?: 'featured' | 'compact';
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

// Format display names mapping
const FORMAT_LABELS: Record<string, string> = {
  'reel': 'Reel',
  'carousel': 'Carousel',
  'story': 'Story',
  'quick-image': 'Quick Image',
  'video': 'Video',
  'tutorial': 'Tutorial',
  'livestream': 'Livestream',
  'documentary': 'Documentary',
  'article': 'Article',
  'listicle': 'Listicle',
  'case-study': 'Case Study',
  'guide': 'Guide',
  'thread': 'Thread',
};

// Get format label - uses format field if available, falls back to title keywords
function getFormatLabel(title: string, category: IdeaCardData['category'], format?: string): string {
  // Use format field if available
  if (format && FORMAT_LABELS[format]) {
    return FORMAT_LABELS[format];
  }
  
  // Fallback: detect from title keywords
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('carousel')) return 'Carousel';
  if (lowerTitle.includes('reel')) return 'Reel';
  if (lowerTitle.includes('story')) return 'Story';
  if (lowerTitle.includes('thread')) return 'Thread';
  if (lowerTitle.includes('video')) return 'Video';
  if (lowerTitle.includes('tutorial')) return 'Tutorial';
  if (lowerTitle.includes('guide')) return 'Guide';
  if (lowerTitle.includes('listicle')) return 'Listicle';
  if (lowerTitle.includes('case study') || lowerTitle.includes('case-study')) return 'Case Study';
  
  const defaults: Record<string, string> = {
    'short-form': 'Reel',
    'long-form': 'Video',
    'blog': 'Article',
  };
  return defaults[category] || 'Content';
}

export function IdeaCard({ item, variant = 'compact' }: IdeaCardProps) {
  const categoryInfo = getCategoryInfo(item.category);
  const formatLabel = getFormatLabel(item.title, item.category, item.format);
  const CategoryIcon = categoryInfo.icon;
  
  // Get texture - use pre-assigned index or derive from title
  const textureIndex = item.textureIndex ?? getTextureIndexFromString(item.title);
  const textureUrl = getTextureByIndex(textureIndex);

  // Clean title - remove format prefix if present
  const cleanTitle = item.title
    .replace(/^(Carousel|Reel|Story|Thread|Video|Tutorial|Guide|Listicle):\s*/i, '')
    .trim();

  if (variant === 'featured') {
    return (
      <Link 
        href={`/discover/ideas/${item.slug}`}
        className="group flex flex-col md:flex-row gap-6 p-5 rounded-2xl bg-os-surface-dark/50 border border-os-border-dark/50 hover:border-brand-aperol hover:bg-os-surface-dark/70 transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10"
      >
        {/* Text Content - LEFT */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-3">
            {/* Format label with sparkle */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-brand-vanilla/60" />
              <span className="text-xs font-medium text-brand-vanilla/60 tracking-wide">
                {formatLabel}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla leading-tight">
              {cleanTitle}
            </h2>

            {/* Description */}
            <p className="text-os-text-secondary-dark text-sm leading-relaxed line-clamp-3">
              {item.description}
            </p>
          </div>

          {/* Footer pills */}
          <div className="flex items-center gap-2 mt-4 flex-nowrap">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-os-border-dark/50 bg-os-bg-dark/50 shrink-0">
              <Clock className="w-3 h-3 text-os-text-secondary-dark" />
              <span className="text-[10px] text-os-text-secondary-dark font-medium whitespace-nowrap">
                {item.sources.length} sources
              </span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-os-border-dark/50 bg-os-bg-dark/50 shrink-0">
              <CategoryIcon className="w-3 h-3 text-os-text-secondary-dark" />
              <span className="text-[10px] text-os-text-secondary-dark font-medium whitespace-nowrap">
                {categoryInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Sonic Line Texture Cover - RIGHT */}
        <div className="w-full md:w-[320px] shrink-0">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={textureUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
              unoptimized
            />
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant - uses sonic line textures
  return (
    <Link 
      href={`/discover/ideas/${item.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden h-full bg-os-surface-dark/50 border border-os-border-dark/50 hover:border-brand-aperol hover:bg-os-surface-dark/70 transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aperol focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg-dark"
    >
      {/* Sonic Line Texture Cover */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image
          src={textureUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col flex-1 p-3 sm:p-4">
        {/* Format Label with sparkle */}
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-brand-vanilla/60" />
          <span className="text-[11px] font-medium text-brand-vanilla/60 tracking-wide">
            {formatLabel}
          </span>
        </div>

        {/* Title - smaller for better visual hierarchy */}
        <h3 className="font-display font-bold text-brand-vanilla text-sm sm:text-[15px] leading-snug line-clamp-3 flex-1">
          {cleanTitle}
        </h3>

        {/* Footer Chips - flex-nowrap to prevent wrapping */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-os-border-dark/30 flex-nowrap overflow-hidden">
          {/* Sources pill */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-os-border-dark/50 bg-os-bg-dark/50 shrink-0">
            <Clock className="w-3 h-3 text-os-text-secondary-dark" />
            <span className="text-[10px] text-os-text-secondary-dark font-medium whitespace-nowrap">
              {item.sources.length} sources
            </span>
          </div>

          {/* Category format pill */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-os-border-dark/50 bg-os-bg-dark/50 shrink-0">
            <CategoryIcon className="w-3 h-3 text-os-text-secondary-dark" />
            <span className="text-[10px] text-os-text-secondary-dark font-medium whitespace-nowrap">
              {categoryInfo.label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

