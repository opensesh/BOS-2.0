'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MoreHorizontal, Clock, Star } from 'lucide-react';
import { InspirationCardData } from '@/types';

interface InspirationCardProps {
  item: InspirationCardData;
  variant?: 'featured' | 'compact';
}

interface OGData {
  image: string | null;
  title: string | null;
  description: string | null;
  siteName: string | null;
  favicon: string | null;
}

export function InspirationCard({ item, variant = 'compact' }: InspirationCardProps) {
  const [ogImage, setOgImage] = useState<string | null>(item.imageUrl || null);
  const [isLoadingImage, setIsLoadingImage] = useState(!item.imageUrl);

  // Fetch OG image from first source if no imageUrl
  useEffect(() => {
    if (!item.imageUrl && item.sources.length > 0) {
      const fetchOgImage = async () => {
        try {
          const sourceUrl = item.sources[0].url;
          const response = await fetch(`/api/og-image?url=${encodeURIComponent(sourceUrl)}`);
          if (response.ok) {
            const data: OGData = await response.json();
            if (data.image) {
              setOgImage(data.image);
            }
          }
        } catch (error) {
          console.error('Error fetching OG image:', error);
        } finally {
          setIsLoadingImage(false);
        }
      };
      fetchOgImage();
    } else {
      setIsLoadingImage(false);
    }
  }, [item.imageUrl, item.sources]);

  if (variant === 'featured') {
    return (
      <Link 
        href={`/discover/${item.slug}`}
        className="group flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-transparent hover:bg-os-surface-dark/30 transition-colors"
      >
        {/* Text Content - LEFT */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-3">
            {/* Category badge */}
            <div className="flex items-center gap-2">
              {item.starred && (
                <Star className="w-4 h-4 text-brand-aperol fill-brand-aperol" />
              )}
              <span className="text-xs font-medium text-brand-aperol uppercase tracking-wider">
                {item.category.replace('-', ' ')}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla group-hover:text-brand-aperol transition-colors leading-tight">
              {item.title}
            </h2>

            {/* Published time */}
            <div className="flex items-center gap-2 text-os-text-secondary-dark">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Published {item.publishedAt}</span>
            </div>

            {/* Description */}
            <p className="text-os-text-secondary-dark text-base leading-relaxed line-clamp-3">
              {item.description}
            </p>
          </div>

          {/* Source icons and actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {item.sources.slice(0, 4).map((source, idx) => (
                  <div 
                    key={source.id || idx} 
                    className="w-6 h-6 rounded-full bg-os-surface-dark border-2 border-os-bg-dark flex items-center justify-center"
                    title={source.name}
                  >
                    <span className="text-[9px] text-os-text-secondary-dark font-bold">
                      {source.name.charAt(0)}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-sm text-os-text-secondary-dark font-medium">
                {item.sources.length} {item.sources.length === 1 ? 'source' : 'sources'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="w-5 h-5" />
              </button>
              <button 
                className="text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Image - RIGHT */}
        <div className="w-full md:w-[360px] shrink-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-os-surface-dark">
            {isLoadingImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-os-text-secondary-dark border-t-transparent rounded-full animate-spin" />
              </div>
            ) : ogImage ? (
              <Image
                src={ogImage}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">💡</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant
  return (
    <Link 
      href={`/discover/${item.slug}`}
      className="group flex flex-col gap-3 p-3 rounded-xl bg-transparent hover:bg-os-surface-dark/30 transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-os-surface-dark">
        {isLoadingImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-os-text-secondary-dark border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ogImage ? (
          <Image
            src={ogImage}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
            <div className="text-2xl">💡</div>
          </div>
        )}
        {/* Category badge on image */}
        {item.starred && (
          <div className="absolute top-2 left-2">
            <Star className="w-4 h-4 text-brand-aperol fill-brand-aperol" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        {/* Title */}
        <h3 className="text-sm font-medium text-brand-vanilla group-hover:text-brand-aperol transition-colors leading-snug line-clamp-3">
          {item.title}
        </h3>

        {/* Source icons and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {item.sources.slice(0, 3).map((source, idx) => (
                <div 
                  key={source.id || idx} 
                  className="w-5 h-5 rounded-full bg-os-surface-dark border border-os-bg-dark flex items-center justify-center"
                  title={source.name}
                >
                  <span className="text-[8px] text-os-text-secondary-dark font-bold">
                    {source.name.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-xs text-os-text-secondary-dark">
              {item.sources.length} sources
            </span>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="w-4 h-4" />
            </button>
            <button 
              className="text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
