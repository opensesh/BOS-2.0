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
  
  // Default based on category
  const defaults: Record<string, string> = {
    'short-form': 'Reel',
    'long-form': 'Video',
    'blog': 'Article',
  };
  return defaults[category] || 'Content';
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

// Redesigned IdeaCard - Hero image top, texture bottom
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
    >
      {/* TOP: Hero Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-os-charcoal">
            <div className="w-6 h-6 border-2 border-brand-vanilla/30 border-t-brand-vanilla rounded-full animate-spin" />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={cleanTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        )}
      </div>

      {/* BOTTOM: Texture background with content */}
      <div className="relative flex-1 min-h-[180px]">
        {/* Texture Background */}
        <div className="absolute inset-0">
          <Image
            src={textureUrl}
            alt=""
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-5">
          {/* Format Label */}
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 text-brand-vanilla text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="underline underline-offset-2 decoration-brand-vanilla/50">{formatLabel}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-brand-vanilla text-xl md:text-2xl leading-tight line-clamp-2 mb-auto">
            {cleanTitle}
          </h3>

          {/* Footer Chips */}
          <div className="flex items-center justify-between mt-4">
            {/* Sources Chip */}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-os-charcoal/90 text-brand-vanilla text-sm font-medium">
              <Clock className="w-3.5 h-3.5 opacity-80" />
              {item.sources.length} {item.sources.length === 1 ? 'source' : 'sources'}
            </span>

            {/* Category Chip */}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-os-charcoal/90 text-brand-vanilla text-sm font-medium">
              <CategoryIcon className="w-3.5 h-3.5 opacity-80" />
              {categoryInfo.label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function IdeaCardGrid({ items, activeFilter }: IdeaCardGridProps) {
  // When showing all items or filtered items, use a flat grid layout (no section headers)
  const displayItems = activeFilter === 'all' 
    ? items 
    : items.filter(item => item.category === activeFilter);
  
  if (displayItems.length === 0) {
    return (
      <div className="text-center py-12 text-os-text-secondary-dark">
        No ideas found.
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
      {displayItems.map((item, idx) => (
        <motion.div
          key={item.id || idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: idx * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
        >
          <IdeaCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
