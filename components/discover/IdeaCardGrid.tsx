'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Video, FileText, Pen, Clock, Sparkles } from 'lucide-react';
import { IdeaCardData } from '@/types';
import { getTextureByIndex } from '@/lib/discover-utils';

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
    .substring(0, 50);
}

// Fallback placeholder images based on category
const FALLBACK_IMAGES = {
  'short-form': 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop',
  'long-form': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
  'blog': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
};

// Get category display info
function getCategoryInfo(category: IdeaCardData['category']) {
  switch (category) {
    case 'short-form':
      return { label: 'Short Form', icon: Video, formatLabel: 'Reel' };
    case 'long-form':
      return { label: 'Long Form', icon: FileText, formatLabel: 'Video' };
    case 'blog':
      return { label: 'Blog', icon: Pen, formatLabel: 'Article' };
    default:
      return { label: 'Content', icon: Video, formatLabel: 'Content' };
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
  
  // Default based on category
  return getCategoryInfo(category).formatLabel;
}

// Hook for fetching OG image with fallback - prefers pexelsImageUrl
function useIdeaImage(item: IdeaCardData) {
  const [imageUrl, setImageUrl] = useState<string>(
    item.pexelsImageUrl || FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES['short-form']
  );
  const [isLoading, setIsLoading] = useState(!item.pexelsImageUrl);

  useEffect(() => {
    // If we have a pexels image, use it immediately
    if (item.pexelsImageUrl) {
      setImageUrl(item.pexelsImageUrl);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    
    const fetchImage = async () => {
      if (!item.sources || item.sources.length === 0) {
        setImageUrl(FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES['short-form']);
        setIsLoading(false);
        return;
      }

      // Try each source URL until we get an image
      for (let i = 0; i < Math.min(item.sources.length, 3); i++) {
        try {
          const response = await fetch(`/api/og-image?url=${encodeURIComponent(item.sources[i].url)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.image && isMounted) {
              setImageUrl(data.image);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Continue to next source
        }
      }

      // Keep fallback if no OG image found
      if (isMounted) {
        setIsLoading(false);
      }
    };

    fetchImage();
    
    return () => {
      isMounted = false;
    };
  }, [item.pexelsImageUrl, item.sources, item.category]);

  return { imageUrl, isLoading };
}

// Redesigned IdeaCard matching Figma design
function IdeaCard({ item }: { item: IdeaCardData }) {
  const { imageUrl, isLoading } = useIdeaImage(item);
  const slug = item.slug || generateSlug(item.title);
  const categoryInfo = getCategoryInfo(item.category);
  const formatLabel = getFormatLabel(item.title, item.category);
  const textureUrl = getTextureByIndex(item.textureIndex ?? 0);
  const CategoryIcon = categoryInfo.icon;

  // Clean title - remove format prefix if present
  const cleanTitle = item.title
    .replace(/^(Carousel|Reel|Story|Thread|Video|Tutorial|Guide|Listicle):\s*/i, '')
    .trim();

  return (
    <Link
      href={`/discover/ideas/${slug}?id=${item.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-full"
      style={{ minHeight: '380px' }}
    >
      {/* Background Texture */}
      <div className="absolute inset-0">
        <Image
          src={textureUrl}
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Subtle dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col h-full p-5 md:p-6">
        {/* Thumbnail Image */}
        <div className="mb-6">
          <div 
            className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-[3px] border-brand-vanilla shadow-lg"
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-os-charcoal/80">
                <div className="w-5 h-5 border-2 border-brand-vanilla/30 border-t-brand-vanilla rounded-full animate-spin" />
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={cleanTitle}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-brand-vanilla text-xl md:text-2xl leading-tight mb-3 line-clamp-2">
          {cleanTitle}
        </h3>

        {/* Format Chip */}
        <div className="mb-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-vanilla/40 text-brand-vanilla text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {formatLabel}
          </span>
        </div>

        {/* Footer Chips */}
        <div className="flex items-center gap-3 mt-6">
          {/* Sources Chip */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-charcoal/80 text-brand-vanilla text-sm font-medium">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            {item.sources.length} {item.sources.length === 1 ? 'source' : 'sources'}
          </span>

          {/* Category Chip */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-charcoal/80 text-brand-vanilla text-sm font-medium">
            <CategoryIcon className="w-3.5 h-3.5 opacity-70" />
            {categoryInfo.label}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Section component for organized display
function IdeaSection({ 
  title, 
  icon: Icon, 
  items 
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  items: IdeaCardData[];
}) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-8"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-aperol/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-aperol" />
        </div>
        <h2 className="text-base font-semibold text-brand-vanilla">{title}</h2>
        <span className="px-2 py-0.5 rounded-full bg-os-surface-dark text-xs text-os-text-secondary-dark font-medium">
          {items.length}
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: idx * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94] 
            }}
          >
            <IdeaCard item={item} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function IdeaCardGrid({ items, activeFilter }: IdeaCardGridProps) {
  // Group items by category
  const shortFormItems = items.filter(item => item.category === 'short-form');
  const longFormItems = items.filter(item => item.category === 'long-form');
  const blogItems = items.filter(item => item.category === 'blog');

  // If filter is active, show only that category in a flat layout
  if (activeFilter !== 'all') {
    const filteredItems = items.filter(item => item.category === activeFilter);
    
    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-12 text-os-text-secondary-dark">
          No ideas found for this filter.
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredItems.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: idx * 0.06,
              ease: [0.25, 0.46, 0.45, 0.94] 
            }}
          >
            <IdeaCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Default: Show organized by sections
  return (
    <div>
      <IdeaSection
        title="Short-Form"
        icon={Video}
        items={shortFormItems}
      />

      <IdeaSection
        title="Long-Form"
        icon={FileText}
        items={longFormItems}
      />

      <IdeaSection
        title="Blogging"
        icon={Pen}
        items={blogItems}
      />
    </div>
  );
}
