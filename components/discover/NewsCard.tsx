'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MoreHorizontal, Clock } from 'lucide-react';
import { NewsCardData } from '@/types';

interface NewsCardProps {
  item: NewsCardData;
  variant?: 'featured' | 'compact';
  priority?: boolean;
}

interface OGData {
  image: string | null;
  title: string | null;
  description: string | null;
  siteName: string | null;
  favicon: string | null;
}

// Simple in-memory cache for OG images to avoid refetching
const ogImageCache = new Map<string, string | null>();

export function NewsCard({ item, variant = 'compact', priority = false }: NewsCardProps) {
  const [ogImage, setOgImage] = useState<string | null>(() => {
    // Check cache first
    if (item.imageUrl) return item.imageUrl;
    const cachedImage = item.sources.length > 0 ? ogImageCache.get(item.sources[0].url) : undefined;
    return cachedImage !== undefined ? cachedImage : null;
  });
  const [isLoadingImage, setIsLoadingImage] = useState(() => {
    if (item.imageUrl) return false;
    // If cached, don't show loading
    if (item.sources.length > 0 && ogImageCache.has(item.sources[0].url)) return false;
    return true;
  });
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority); // Featured cards load immediately
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Intersection Observer for lazy loading OG images
  useEffect(() => {
    if (priority || item.imageUrl) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [priority, item.imageUrl]);

  // Fetch OG image from first source if no imageUrl
  useEffect(() => {
    if (!isVisible || item.imageUrl || item.sources.length === 0) return;
    
    const sourceUrl = item.sources[0].url;
    
    // Check cache
    if (ogImageCache.has(sourceUrl)) {
      const cached = ogImageCache.get(sourceUrl);
      setOgImage(cached || null);
      setIsLoadingImage(false);
      return;
    }

    const controller = new AbortController();

    const fetchOgImage = async () => {
      try {
        const response = await fetch(
          `/api/og-image?url=${encodeURIComponent(sourceUrl)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data: OGData = await response.json();
          const image = data.image || null;
          ogImageCache.set(sourceUrl, image);
          setOgImage(image);
        } else {
          ogImageCache.set(sourceUrl, null);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching OG image:', error);
          ogImageCache.set(sourceUrl, null);
        }
      } finally {
        setIsLoadingImage(false);
      }
    };
    
    fetchOgImage();

    return () => controller.abort();
  }, [isVisible, item.imageUrl, item.sources]);

  const handleImageError = () => {
    setImageError(true);
    setOgImage(null);
  };

  // Determine if we should show featured or compact variant
  const isFeatured = variant === 'featured';
  
  // Responsive sizes for better image optimization
  const imageSizes = isFeatured
    ? "(max-width: 768px) 100vw, 360px"
    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  const renderImage = () => {
    if (isLoadingImage && isVisible) {
      return (
        <div className="w-full h-full flex items-center justify-center animate-pulse">
          <div className={`${isFeatured ? 'w-8 h-8' : 'w-6 h-6'} border-2 border-os-text-secondary-dark/30 border-t-os-text-secondary-dark rounded-full animate-spin`} />
        </div>
      );
    }
    
    if (ogImage && !imageError) {
      return (
        <Image
          src={ogImage}
          alt={item.title}
          fill
          sizes={imageSizes}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority && isFeatured}
          loading={priority ? 'eager' : 'lazy'}
          onError={handleImageError}
          unoptimized // Required for external URLs
        />
      );
    }
    
    // Fallback placeholder
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
        <div className={`text-center ${isFeatured ? 'p-4' : ''}`}>
          <div className={isFeatured ? 'text-4xl' : 'text-2xl'}>📰</div>
        </div>
      </div>
    );
  };

  if (isFeatured) {
    return (
      <Link 
        ref={cardRef}
        href={`/discover/${item.slug}`}
        className="group flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-transparent hover:bg-os-surface-dark/30 transition-colors"
      >
        {/* Text Content - LEFT */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-3">
            {/* Title */}
            <h3 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla group-hover:text-brand-aperol transition-colors leading-tight">
              {item.title}
            </h3>

            {/* Published time */}
            <div className="flex items-center gap-2 text-os-text-secondary-dark">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Published {item.publishedAt}</span>
            </div>

            {/* Description */}
            <p className="text-os-text-secondary-dark text-base leading-relaxed line-clamp-3">
              {item.summary}
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
            {renderImage()}
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant
  return (
    <Link 
      ref={cardRef}
      href={`/discover/${item.slug}`}
      className="group flex flex-col gap-3 p-3 rounded-xl bg-transparent hover:bg-os-surface-dark/30 transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-os-surface-dark">
        {renderImage()}
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
