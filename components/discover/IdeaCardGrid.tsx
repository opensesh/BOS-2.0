'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Video, FileText, Pen } from 'lucide-react';
import { IdeaCardData } from '@/types';
import { staggerContainerFast, fadeInUp } from '@/lib/motion';

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

// Hook for fetching OG image with fallback - uses fallback immediately if OG fails
function useOgImage(item: IdeaCardData) {
  const [imageUrl, setImageUrl] = useState<string>(FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES['short-form']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        } catch (error) {
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
  }, [item.sources, item.category]);

  return { imageUrl, isLoading };
}

// Card component (used for both featured and compact)
function IdeaCard({ item, featured = false }: { item: IdeaCardData; featured?: boolean }) {
  const { imageUrl, isLoading } = useOgImage(item);
  const slug = item.slug || generateSlug(item.title);

  if (featured) {
    return (
      <Link
        href={`/discover/ideas/${slug}?id=${item.id}`}
        className="group flex flex-col rounded-xl overflow-hidden bg-os-surface-dark border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all h-full"
      >
        {/* Image - more compact aspect ratio */}
        <div className="relative aspect-[3/1] overflow-hidden bg-os-surface-dark flex-shrink-0">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-os-text-secondary-dark border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          )}
        </div>

        {/* Content - tighter padding */}
        <div className="p-2.5 flex-1 flex flex-col">
          <h3 className="text-sm font-semibold text-brand-vanilla line-clamp-1 mb-0.5">
            {item.title}
          </h3>
          
          <p className="text-[11px] text-os-text-secondary-dark line-clamp-1 mb-1.5">
            {item.description}
          </p>

          {/* Sources */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {item.sources.slice(0, 2).map((source, idx) => (
                <span
                  key={source.id || idx}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full border border-os-border-dark/50 bg-os-bg-dark/60 text-[9px] text-os-text-secondary-dark"
                >
                  {source.name}
                </span>
              ))}
              {item.sources.length > 2 && (
                <span className="text-[9px] text-os-text-secondary-dark">
                  +{item.sources.length - 2}
                </span>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
          </div>
        </div>
      </Link>
    );
  }

  // Compact card - even smaller
  return (
    <Link
      href={`/discover/ideas/${slug}?id=${item.id}`}
      className="group flex flex-col rounded-xl overflow-hidden bg-os-surface-dark border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all h-full"
    >
      {/* Image - very compact */}
      <div className="relative aspect-[2.5/1] overflow-hidden bg-os-surface-dark flex-shrink-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-os-text-secondary-dark border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        )}
      </div>

      {/* Content - tight padding */}
      <div className="p-2 flex-1 flex flex-col">
        <h4 className="text-xs font-medium text-brand-vanilla line-clamp-1 mb-0.5">
          {item.title}
        </h4>
        <p className="text-[10px] text-os-text-secondary-dark line-clamp-1 mb-1">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-os-text-secondary-dark">
            {item.sources.length} sources
          </span>
          <ChevronRight className="w-3 h-3 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// Section component for organized display - compact version
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

  const featuredItem = items[0];
  const rightItem = items[1];
  const bottomItems = items.slice(2, 5);

  return (
    <motion.div
      variants={fadeInUp}
      className="mb-6"
    >
      {/* Section Header - compact */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-md bg-brand-aperol/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-brand-aperol" />
        </div>
        <h2 className="text-sm font-semibold text-brand-vanilla">{title}</h2>
        <span className="px-1.5 py-0.5 rounded-full bg-os-surface-dark text-[10px] text-os-text-secondary-dark">
          {items.length}
        </span>
      </div>

      {/* First Row: Featured (2 cols) + Right card (1 col) */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2.5"
        variants={staggerContainerFast}
        initial="hidden"
        animate="visible"
      >
        {/* Featured card - spans 2 columns */}
        <motion.div className="md:col-span-2" variants={fadeInUp}>
          <IdeaCard item={featuredItem} featured />
        </motion.div>

        {/* Right card */}
        {rightItem && (
          <motion.div variants={fadeInUp}>
            <IdeaCard item={rightItem} />
          </motion.div>
        )}
      </motion.div>

      {/* Second Row: 3 compact cards */}
      {bottomItems.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5"
          variants={staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          {bottomItems.map((item, idx) => (
            <motion.div key={item.id || idx} variants={fadeInUp}>
              <IdeaCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
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

    const featuredItem = filteredItems[0];
    const rightItem = filteredItems[1];
    const bottomItems = filteredItems.slice(2, 5);
    const remainingItems = filteredItems.slice(5);

    return (
      <motion.div
        className="space-y-2.5"
        variants={staggerContainerFast}
        initial="hidden"
        animate="visible"
      >
        {/* First Row */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-2.5"
          variants={staggerContainerFast}
        >
          <motion.div className="md:col-span-2" variants={fadeInUp}>
            <IdeaCard item={featuredItem} featured />
          </motion.div>
          {rightItem && (
            <motion.div variants={fadeInUp}>
              <IdeaCard item={rightItem} />
            </motion.div>
          )}
        </motion.div>

        {/* Second Row */}
        {bottomItems.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5"
            variants={staggerContainerFast}
          >
            {bottomItems.map((item, idx) => (
              <motion.div key={item.id || idx} variants={fadeInUp}>
                <IdeaCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Remaining items */}
        {remainingItems.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-3"
            variants={staggerContainerFast}
          >
            {remainingItems.map((item, idx) => (
              <motion.div key={item.id || idx} variants={fadeInUp}>
                <IdeaCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Default: Show organized by sections
  return (
    <motion.div
      variants={staggerContainerFast}
      initial="hidden"
      animate="visible"
    >
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
    </motion.div>
  );
}
