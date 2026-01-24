'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Video, FileText, Pen, Clock, Sparkles, Play, Image as ImageIcon, BookOpen, Square } from 'lucide-react';
import { IdeaCardData } from '@/types';
import { getTextureByIndex, getTextureIndexFromString } from '@/lib/discover-utils';

interface IdeaCardGridProps {
  items: IdeaCardData[];
  activeFilter: 'all' | 'short-form' | 'long-form' | 'blog';
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
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

// Get display label from format/subcategory
function getFormatLabel(item: IdeaCardData): string {
  // Use subcategory if available, otherwise format, otherwise fallback
  const formatValue = item.subcategory || item.format;
  
  if (!formatValue) {
    const defaults: Record<string, string> = {
      'short-form': 'Reel',
      'long-form': 'Video',
      'blog': 'Article',
    };
    return defaults[item.category] || 'Content';
  }
  
  // Map format values to display labels
  const formatLabels: Record<string, string> = {
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
    'case-study-deep-dive': 'Case Study',
    'guide': 'Guide',
    'thread': 'Thread',
    'instructional': 'Instructional',
    'leadership': 'Leadership',
    'framework': 'Framework',
    'thought-leadership': 'Thought Leadership',
    'visionary': 'Visionary',
    'explanatory': 'Explanatory',
  };
  
  return formatLabels[formatValue] || formatValue.charAt(0).toUpperCase() + formatValue.slice(1);
}

// Get format-specific icon for badge overlay
function getFormatIcon(item: IdeaCardData) {
  const formatValue = item.subcategory || item.format || '';
  
  switch (formatValue.toLowerCase()) {
    // Short-form formats
    case 'reel':
      return Play;
    case 'carousel':
      return Square;
    case 'story':
      return ImageIcon;
    case 'quick-image':
      return ImageIcon;
    // Long-form formats
    case 'video':
    case 'tutorial':
    case 'livestream':
    case 'documentary':
    case 'instructional':
    case 'leadership':
    case 'framework':
    case 'thought-leadership':
      return Play;
    // Blog formats
    case 'article':
    case 'guide':
    case 'listicle':
    case 'case-study':
    case 'case-study-deep-dive':
    case 'thread':
    case 'visionary':
    case 'explanatory':
      return BookOpen;
    default:
      return Video;
  }
}

// Map subcategory to specific texture index for visual consistency
function getTextureForSubcategory(item: IdeaCardData): number {
  const formatValue = item.subcategory || item.format || '';
  
  // Map each subcategory to a specific texture (0-12)
  const textureMap: Record<string, number> = {
    // Short-form (warm tones)
    'reel': 1,
    'carousel': 4,
    'story': 7,
    'quick-image': 10,
    // Long-form (mid tones)
    'video': 2,
    'tutorial': 5,
    'livestream': 8,
    'documentary': 11,
    'instructional': 2,
    'leadership': 5,
    'framework': 8,
    'thought-leadership': 11,
    // Blog (cool tones)
    'article': 3,
    'listicle': 6,
    'case-study': 9,
    'case-study-deep-dive': 9,
    'guide': 12,
    'thread': 0,
    'visionary': 3,
    'explanatory': 6,
  };
  
  // Use mapped texture or fall back to assigned texture or derive from title
  return textureMap[formatValue.toLowerCase()] ?? item.textureIndex ?? getTextureIndexFromString(item.title);
}

// IdeaCard Component - uses sonic line textures
function IdeaCard({ item }: { item: IdeaCardData }) {
  const slug = item.slug || generateSlug(item.title);
  const categoryInfo = getCategoryInfo(item.category);
  const formatLabel = getFormatLabel(item);
  const CategoryIcon = categoryInfo.icon;
  const FormatIcon = getFormatIcon(item);
  
  // Get texture mapped to subcategory for visual consistency
  const textureIndex = getTextureForSubcategory(item);
  const textureUrl = getTextureByIndex(textureIndex);

  // Clean title - remove format prefix if present
  const cleanTitle = item.title
    .replace(/^(Carousel|Reel|Story|Thread|Video|Tutorial|Guide|Listicle):\s*/i, '')
    .trim();

  return (
    <Link
      href={`/discover/ideas/${slug}?id=${item.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden h-full 
                 bg-os-surface-dark/50 border border-os-border-dark/50
                 hover:border-brand-aperol hover:bg-os-surface-dark/70
                 transition-all duration-200
                 hover:shadow-lg hover:shadow-brand-aperol/10
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aperol focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg-dark"
    >
      {/* Sonic Line Texture Cover - Much more compact */}
      <div className="relative w-full h-24 sm:h-28 overflow-hidden">
        {/* Using native img tag with explicit dimensions for crisp rendering */}
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

      {/* Content Section */}
      <div className="relative z-10 flex flex-col flex-1 p-3 sm:p-4">
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

export function IdeaCardGrid({ items, activeFilter }: IdeaCardGridProps) {
  const displayItems = activeFilter === 'all' 
    ? items 
    : items.filter(item => item.category === activeFilter);
  
  if (displayItems.length === 0) {
    return (
      <div className="text-center py-16 text-os-text-secondary-dark">
        <p className="text-sm">No ideas found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
    >
      {displayItems.map((item, idx) => (
        <motion.div
          key={item.id || idx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.35, 
            delay: Math.min(idx * 0.04, 0.3),
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
        >
          <IdeaCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
