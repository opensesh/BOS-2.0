'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { InspirationCardData } from '@/types';

interface InspirationCardGridProps {
  items: InspirationCardData[];
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

// Hook for fetching OG image with fallback
function useOgImage(item: InspirationCardData) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attemptedSources, setAttemptedSources] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      if (!item.sources || item.sources.length === 0) {
        setImageUrl(FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES['short-form']);
        setIsLoading(false);
        return;
      }

      // Try each source URL until we get an image
      for (let i = attemptedSources; i < item.sources.length; i++) {
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
        } catch (error) {
          console.error('Error fetching OG image:', error);
        }
        
        if (isMounted) {
          setAttemptedSources(i + 1);
        }
      }

      // All sources failed, use fallback
      if (isMounted) {
        setImageUrl(FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES['short-form']);
        setIsLoading(false);
      }
    };

    fetchImage();
    
    return () => {
      isMounted = false;
    };
  }, [item.sources, item.category, attemptedSources]);

  return { imageUrl, isLoading };
}

// Featured card (large, spans 2 columns)
function FeaturedCard({ item }: { item: InspirationCardData }) {
  const { imageUrl, isLoading } = useOgImage(item);
  const slug = item.slug || generateSlug(item.title);

  return (
    <Link
      href={`/discover/inspiration/${slug}?id=${item.id}`}
      className="group relative rounded-2xl overflow-hidden bg-os-surface-dark border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all h-full min-h-[280px]"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full bg-os-surface-dark flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-os-text-secondary-dark border-t-transparent rounded-full animate-spin" />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-aperol/20 to-os-surface-dark" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-os-bg-dark via-os-bg-dark/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-5">
        <h3 className="text-lg md:text-xl font-semibold text-brand-vanilla line-clamp-2 mb-2">
          {item.title}
        </h3>
        
        <p className="text-sm text-os-text-secondary-dark line-clamp-2 mb-3">
          {item.description}
        </p>

        {/* Sources */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.sources.slice(0, 2).map((source, idx) => (
            <span
              key={source.id || idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-os-border-dark/50 bg-os-surface-dark/60 text-[10px] text-os-text-secondary-dark"
            >
              {source.name}
            </span>
          ))}
          {item.sources.length > 2 && (
            <span className="text-[10px] text-os-text-secondary-dark">
              +{item.sources.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact card (smaller, for grid positions)
function CompactCard({ item }: { item: InspirationCardData }) {
  const { imageUrl, isLoading } = useOgImage(item);
  const slug = item.slug || generateSlug(item.title);

  return (
    <Link
      href={`/discover/inspiration/${slug}?id=${item.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-os-surface-dark border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all h-full"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-os-surface-dark flex-shrink-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-os-text-secondary-dark border-t-transparent rounded-full animate-spin" />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-aperol/10 to-os-surface-dark" />
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="text-sm font-medium text-brand-vanilla line-clamp-2 mb-1">
          {item.title}
        </h4>
        <p className="text-xs text-os-text-secondary-dark line-clamp-2 mb-2 flex-1">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-os-text-secondary-dark">
            {item.sources.length} sources
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
        </div>
      </div>
    </Link>
  );
}

export function InspirationCardGrid({ items, activeFilter }: InspirationCardGridProps) {
  // Filter items based on activeFilter
  const filteredItems = activeFilter === 'all' 
    ? items 
    : items.filter(item => item.category === activeFilter);

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-20 text-os-text-secondary-dark">
        No inspiration items found for this filter.
      </div>
    );
  }

  // Layout: Featured (2 cols) + 1 card on right in first row, then 3 cards on bottom
  const featuredItem = filteredItems[0];
  const rightItem = filteredItems[1];
  const bottomItems = filteredItems.slice(2, 5);
  const remainingItems = filteredItems.slice(5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className="space-y-4"
    >
      {/* First Row: Featured (2 cols) + Right card (1 col) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Featured card - spans 2 columns */}
        <div className="md:col-span-2 min-h-[280px]">
          <FeaturedCard item={featuredItem} />
        </div>

        {/* Right card */}
        {rightItem && (
          <div className="min-h-[280px]">
            <CompactCard item={rightItem} />
          </div>
        )}
      </div>

      {/* Second Row: 3 compact cards */}
      {bottomItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {bottomItems.map((item, idx) => (
            <CompactCard key={item.id || idx} item={item} />
          ))}
        </div>
      )}

      {/* Remaining items in grid */}
      {remainingItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {remainingItems.map((item, idx) => (
            <CompactCard key={item.id || idx} item={item} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
