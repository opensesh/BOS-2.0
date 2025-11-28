'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock, Globe } from 'lucide-react';
import { NewsCardData } from '@/types';
import { SourceInfo } from '@/components/chat/AnswerView';
import { NewsCardMenu } from './NewsCardMenu';

interface NewsCardProps {
  item: NewsCardData;
  variant?: 'featured' | 'compact';
  priority?: boolean;
  onOpenSources?: (sources: SourceInfo[]) => void;
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

// Helper to enrich sources with dummy data for visual demo (requested feature: 40-50 sources)
function enrichSources(originalSources: NewsCardData['sources']): SourceInfo[] {
  // If we already have many sources, just convert them
  if (originalSources.length > 10) {
    return originalSources.map(s => ({
      id: s.id,
      name: s.name,
      url: s.url,
      title: s.name, // Fallback title
      type: 'external'
    }));
  }

  // Convert original sources
  const realSources: SourceInfo[] = originalSources.map(s => ({
    id: s.id,
    name: s.name,
    url: s.url,
    title: s.name,
    type: 'external'
  }));

  // Generate dummy sources to reach ~40-50 count
  const dummySourceNames = [
    'The Verge', 'TechCrunch', 'Wired', 'Ars Technica', 'Engadget',
    'VentureBeat', 'Gizmodo', 'CNET', 'ZDNet', 'Mashable',
    'Reuters', 'Bloomberg', 'WSJ', 'NYT', 'Forbes',
    'Business Insider', 'Fast Company', 'Inc.', 'Quartz', 'Axios',
    'Politico', 'The Hill', 'BBC News', 'The Guardian', 'Al Jazeera',
    'CNN', 'Fox News', 'NBC News', 'CBS News', 'ABC News',
    'NPR', 'PBS', 'USA Today', 'Washington Post', 'LA Times',
    'Chicago Tribune', 'Boston Globe', 'SF Chronicle', 'Seattle Times',
    'Miami Herald', 'Denver Post', 'Dallas Morning News', 'Houston Chronicle'
  ];

  // Filter out names that are already in real sources
  const realNames = new Set(realSources.map(s => s.name));
  const availableDummies = dummySourceNames.filter(name => !realNames.has(name));
  
  // Pick random number of dummies to reach 40-50 total
  const targetCount = Math.floor(Math.random() * 11) + 40; // 40 to 50
  const needed = targetCount - realSources.length;
  
  const dummySources: SourceInfo[] = availableDummies
    .sort(() => 0.5 - Math.random())
    .slice(0, needed)
    .map((name, idx) => ({
      id: `dummy-${idx}`,
      name,
      url: '#',
      title: `${name} Report on ${realSources[0]?.title || 'Topic'}`,
      type: 'external',
      snippet: 'This is a simulated source for demonstration purposes as requested.'
    }));

  return [...realSources, ...dummySources];
}

export function NewsCard({ item, variant = 'compact', priority = false, onOpenSources }: NewsCardProps) {
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
  const [isLiked, setIsLiked] = useState(false);
  
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Memoize enriched sources to avoid regeneration on re-renders
  const displaySources = useMemo(() => enrichSources(item.sources), [item.sources]);

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

  const handleSourcesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenSources?.(displaySources);
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

  // Source Icons Component
  const SourceIcons = () => {
    const maxIcons = 5;
    const visibleSources = displaySources.slice(0, maxIcons);
    
    return (
      <div 
        className="flex items-center gap-2 group/sources cursor-pointer"
        onClick={handleSourcesClick}
      >
        <div className="flex -space-x-2 transition-spacing duration-200 group-hover/sources:-space-x-1">
          {visibleSources.map((source, idx) => (
            <div 
              key={source.id || idx} 
              className={`
                relative flex items-center justify-center rounded-full border-2 border-os-bg-dark bg-os-surface-dark overflow-hidden
                ${isFeatured ? 'w-6 h-6' : 'w-5 h-5'}
                transition-transform duration-200 hover:z-10 hover:scale-110
              `}
              title={source.name}
            >
              {source.favicon ? (
                 <img
                  src={source.favicon}
                  alt={source.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                <span className={`
                  font-bold text-os-text-secondary-dark
                  ${isFeatured ? 'text-[9px]' : 'text-[8px]'}
                `}>
                  {source.name.charAt(0)}
                </span>
              )}
              {/* Fallback icon if image fails or isn't present (hidden by default) */}
              <div className="hidden absolute inset-0 flex items-center justify-center bg-os-surface-dark">
                 <span className={`
                  font-bold text-os-text-secondary-dark
                  ${isFeatured ? 'text-[9px]' : 'text-[8px]'}
                `}>
                  {source.name.charAt(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <span className={`
          font-medium text-os-text-secondary-dark group-hover/sources:text-os-text-primary-dark transition-colors
          ${isFeatured ? 'text-sm' : 'text-xs'}
        `}>
          {displaySources.length} sources
        </span>
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
            <SourceIcons />
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className={`
                  p-1.5 rounded-lg transition-colors
                  ${isLiked ? 'text-brand-aperol' : 'text-os-text-secondary-dark hover:text-brand-aperol hover:bg-os-surface-dark/50'}
                `}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              
              <NewsCardMenu 
                onBookmark={() => console.log('Bookmark clicked')}
                onAddToSpace={() => console.log('Add to Space clicked')}
                onDislike={() => console.log('Dislike clicked')}
              />
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
        <div className="flex items-center justify-between h-8">
          <SourceIcons />
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className={`
                p-1.5 rounded-lg transition-colors
                ${isLiked ? 'text-brand-aperol' : 'text-os-text-secondary-dark hover:text-brand-aperol hover:bg-os-surface-dark/50'}
              `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            
            <NewsCardMenu 
              onBookmark={() => console.log('Bookmark clicked')}
              onAddToSpace={() => console.log('Add to Space clicked')}
              onDislike={() => console.log('Dislike clicked')}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
