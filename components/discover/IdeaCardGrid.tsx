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
  
  const defaults: Record<string, string> = {
    'short-form': 'Reel',
    'long-form': 'Video',
    'blog': 'Article',
  };
  return defaults[category] || 'Content';
}

// Hook for fetching OG image with fallback
function useIdeaImage(item: IdeaCardData) {
  const [imageUrl, setImageUrl] = useState<string>(
    item.pexelsImageUrl || FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES['short-form']
  );
  const [isLoading, setIsLoading] = useState(!item.pexelsImageUrl);

  useEffect(() => {
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

// IdeaCard Component
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
      className="group relative flex flex-col rounded-2xl overflow-hidden h-full
                 transition-all duration-300 ease-out
                 hover:scale-[1.015] hover:shadow-xl
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aperol focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg-dark"
    >
      {/* Hero Image */}
      <div className="relative w-full aspect-[2.4/1] overflow-hidden bg-os-charcoal">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-vanilla/20 border-t-brand-vanilla rounded-full animate-spin" />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
      </div>

      {/* Content Section with Texture */}
      <div className="relative flex-1 flex flex-col">
        {/* Texture Background */}
        <div className="absolute inset-0">
          <Image
            src={textureUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 p-4 sm:p-5">
          {/* Format Label */}
          <span className="inline-flex items-center gap-1.5 text-brand-vanilla text-xs font-medium mb-3">
            <Sparkles className="w-3 h-3 opacity-80" />
            <span className="underline underline-offset-4 decoration-1 decoration-brand-vanilla/50">
              {formatLabel}
            </span>
          </span>

          {/* Title */}
          <h3 className="font-display font-bold text-brand-vanilla text-[17px] sm:text-lg leading-snug line-clamp-2 flex-1">
            {cleanTitle}
          </h3>

          {/* Footer Chips */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-charcoal/95 text-brand-vanilla text-[11px] font-medium">
              <Clock className="w-3 h-3 opacity-60" />
              {item.sources.length} sources
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-charcoal/95 text-brand-vanilla text-[11px] font-medium ml-auto">
              <CategoryIcon className="w-3 h-3 opacity-60" />
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
