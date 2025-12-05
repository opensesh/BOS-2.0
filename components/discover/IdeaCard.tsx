'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Video, FileText, Pen, Sparkles, Play, Image as ImageIcon, BookOpen, Square } from 'lucide-react';
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

// Get format-specific icon for badge overlay
function getFormatIcon(formatLabel: string) {
  switch (formatLabel.toLowerCase()) {
    case 'reel':
    case 'video':
    case 'tutorial':
      return Play;
    case 'carousel':
      return Square;
    case 'story':
      return ImageIcon;
    case 'article':
    case 'guide':
    case 'listicle':
    case 'case study':
      return BookOpen;
    default:
      return Video;
  }
}

export function IdeaCard({ item, variant = 'compact' }: IdeaCardProps) {
  const categoryInfo = getCategoryInfo(item.category);
  const formatLabel = getFormatLabel(item.title, item.category, item.format);
  const CategoryIcon = categoryInfo.icon;
  const FormatIcon = getFormatIcon(formatLabel);
  
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
        className="group flex flex-row gap-4 p-4 rounded-2xl bg-os-surface-dark/50 border border-os-border-dark/50 hover:border-brand-aperol hover:bg-os-surface-dark/70 transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10"
      >
        {/* Sonic Line Texture Cover - LEFT (narrower with large icon) */}
        <div className="w-24 sm:w-28 shrink-0">
          <div className="relative w-full h-full min-h-[96px] overflow-hidden rounded-xl">
            {/* Using native img tag with explicit dimensions */}
            <img
              src={textureUrl}
              alt=""
              width={800}
              height={600}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              style={{ imageRendering: 'crisp-edges' }}
            />
            
            {/* Large Centered Content Type Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-os-charcoal/80 backdrop-blur-md border-2 border-brand-vanilla/20 group-hover:border-brand-aperol/60 transition-colors">
                <FormatIcon className="w-6 h-6 sm:w-7 sm:h-7 text-brand-vanilla" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content - RIGHT */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-2">
            {/* Format Label */}
            <span className="text-[11px] font-medium text-brand-vanilla/60 tracking-wide uppercase">
              {formatLabel}
            </span>

            {/* Title */}
            <h2 className="text-lg md:text-xl font-display font-bold text-brand-vanilla leading-tight line-clamp-2">
              {cleanTitle}
            </h2>

            {/* Description */}
            <p className="text-os-text-secondary-dark text-sm leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Footer pills */}
          <div className="flex items-center gap-2 mt-3 flex-nowrap">
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
      </Link>
    );
  }

  // Compact variant - horizontal layout with narrow image
  return (
    <Link 
      href={`/discover/ideas/${item.slug}`}
      className="group flex flex-row rounded-2xl overflow-hidden h-full bg-os-surface-dark/50 border border-os-border-dark/50 hover:border-brand-aperol hover:bg-os-surface-dark/70 transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aperol focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg-dark"
    >
      {/* Sonic Line Texture Cover - LEFT (narrow with large icon) */}
      <div className="w-20 sm:w-24 shrink-0 relative overflow-hidden">
        {/* Using native img tag with explicit dimensions */}
        <img
          src={textureUrl}
          alt=""
          width={800}
          height={600}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          style={{ imageRendering: 'crisp-edges' }}
        />
        
        {/* Large Centered Content Type Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-os-charcoal/80 backdrop-blur-md border-2 border-brand-vanilla/20 group-hover:border-brand-aperol/60 transition-colors">
            <FormatIcon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-vanilla" />
          </div>
        </div>
      </div>

      {/* Content Section - RIGHT */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 min-w-0">
        {/* Format Label */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[11px] font-medium text-brand-vanilla/60 tracking-wide uppercase">
            {formatLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-brand-vanilla text-sm sm:text-base leading-snug line-clamp-3 flex-1 mb-3">
          {cleanTitle}
        </h3>

        {/* Footer Chips */}
        <div className="flex items-center gap-2 pt-3 border-t border-os-border-dark/30 flex-nowrap overflow-hidden">
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

