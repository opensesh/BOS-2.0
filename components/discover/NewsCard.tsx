'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock } from 'lucide-react';
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

// Source favicon/logo mappings for common news sources
const SOURCE_LOGOS: Record<string, { favicon: string; color: string }> = {
  'TechCrunch': { favicon: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', color: '#0A0' },
  'TechCrunch AI': { favicon: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', color: '#0A0' },
  'The Verge': { favicon: 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395367/favicon-64x64.0.png', color: '#E71C23' },
  'Wired': { favicon: 'https://www.wired.com/favicon.ico', color: '#000' },
  'Ars Technica': { favicon: 'https://cdn.arstechnica.net/favicon.ico', color: '#F60' },
  'Engadget': { favicon: 'https://s.yimg.com/cv/apiv2/engadget/engadget-favicon-32x32.png', color: '#000' },
  'VentureBeat': { favicon: 'https://venturebeat.com/wp-content/themes/flavor-flavor/flavor/static/favicon/favicon-32x32.png', color: '#C00' },
  'Gizmodo': { favicon: 'https://i.kinja-img.com/gawker-media/image/upload/c_fill,f_auto,fl_progressive,g_center,h_80,q_80,w_80/fdj3buryz5nuzyf2k620.png', color: '#222' },
  'CNET': { favicon: 'https://www.cnet.com/favicon.ico', color: '#E00' },
  'ZDNet': { favicon: 'https://www.zdnet.com/favicon.ico', color: '#E00' },
  'Mashable': { favicon: 'https://mashable.com/favicon.ico', color: '#00ACED' },
  'Reuters': { favicon: 'https://www.reuters.com/pf/resources/images/reuters/favicon/tr-icon-32x32.png', color: '#F80' },
  'Bloomberg': { favicon: 'https://assets.bwbx.io/s3/javelin/public/hub/images/favicon-black-63fe5249d3.png', color: '#000' },
  'WSJ': { favicon: 'https://s.wsj.net/favicon.ico', color: '#000' },
  'NYT': { favicon: 'https://www.nytimes.com/favicon.ico', color: '#000' },
  'Forbes': { favicon: 'https://i.forbesimg.com/48X48-F.png', color: '#000' },
  'Business Insider': { favicon: 'https://www.businessinsider.com/public/assets/BI/US/favicons/favicon-32x32.png', color: '#004B93' },
  'Fast Company': { favicon: 'https://www.fastcompany.com/favicon.ico', color: '#000' },
  'Inc.': { favicon: 'https://www.inc.com/favicon.ico', color: '#C00' },
  'Quartz': { favicon: 'https://qz.com/favicon.ico', color: '#000' },
  'Axios': { favicon: 'https://www.axios.com/favicon.ico', color: '#000' },
  'Politico': { favicon: 'https://www.politico.com/favicon.ico', color: '#C00' },
  'The Hill': { favicon: 'https://thehill.com/favicon.ico', color: '#1A1A1A' },
  'BBC News': { favicon: 'https://static.files.bbci.co.uk/core/website/assets/static/icons/favicon/news/favicon-32x32.4e6bde4a.png', color: '#B80000' },
  'The Guardian': { favicon: 'https://assets.guim.co.uk/images/favicons/32x32.ico', color: '#052962' },
  'Al Jazeera': { favicon: 'https://www.aljazeera.com/favicon.ico', color: '#FA9000' },
  'CNN': { favicon: 'https://www.cnn.com/favicon.ico', color: '#C00' },
  'Fox News': { favicon: 'https://www.foxnews.com/favicon.ico', color: '#003366' },
  'NBC News': { favicon: 'https://nodeassets.nbcnews.com/cdnassets/projects/ramen/favicon/nbcnews/all-other-sizes-PNG.ico/favicon-32x32.png', color: '#F37021' },
  'CBS News': { favicon: 'https://www.cbsnews.com/favicon.ico', color: '#069' },
  'ABC News': { favicon: 'https://s.abcnews.com/assets/images/apple-touch-icon-180x180-precomposed.png', color: '#000' },
  'NPR': { favicon: 'https://media.npr.org/chrome/favicon/favicon-32x32.png', color: '#1A1A1A' },
  'PBS': { favicon: 'https://www.pbs.org/favicon.ico', color: '#1E3D7B' },
  'USA Today': { favicon: 'https://www.usatoday.com/favicon.ico', color: '#009BFF' },
  'Washington Post': { favicon: 'https://www.washingtonpost.com/favicon.ico', color: '#000' },
  'LA Times': { favicon: 'https://www.latimes.com/favicon.ico', color: '#000' },
  'Chicago Tribune': { favicon: 'https://www.chicagotribune.com/favicon.ico', color: '#000' },
  'Boston Globe': { favicon: 'https://www.bostonglobe.com/favicon.ico', color: '#000' },
  'SF Chronicle': { favicon: 'https://www.sfchronicle.com/favicon.ico', color: '#000' },
  'Seattle Times': { favicon: 'https://www.seattletimes.com/favicon.ico', color: '#000' },
  'Miami Herald': { favicon: 'https://www.miamiherald.com/favicon.ico', color: '#000' },
  'Denver Post': { favicon: 'https://www.denverpost.com/favicon.ico', color: '#000' },
  'Dallas Morning News': { favicon: 'https://www.dallasnews.com/favicon.ico', color: '#000' },
  'Houston Chronicle': { favicon: 'https://www.houstonchronicle.com/favicon.ico', color: '#000' },
};

// Helper to enrich sources with dummy data for visual demo (requested feature: 40-50 sources)
function enrichSources(originalSources: NewsCardData['sources']): SourceInfo[] {
  // Convert original sources with favicon data
  const realSources: SourceInfo[] = originalSources.map(s => {
    const logoData = SOURCE_LOGOS[s.name];
    return {
      id: s.id,
      name: s.name,
      url: s.url,
      title: s.name,
      type: 'external',
      favicon: logoData?.favicon,
    };
  });

  // If we already have many sources, just return them
  if (originalSources.length > 10) {
    return realSources;
  }

  // Generate dummy sources to reach ~40-50 count
  const dummySourceNames = Object.keys(SOURCE_LOGOS).filter(
    name => !originalSources.some(s => s.name === name)
  );
  
  // Pick random number of dummies to reach 40-50 total
  const targetCount = Math.floor(Math.random() * 11) + 40; // 40 to 50
  const needed = targetCount - realSources.length;
  
  const dummySources: SourceInfo[] = dummySourceNames
    .sort(() => 0.5 - Math.random())
    .slice(0, needed)
    .map((name, idx) => {
      const logoData = SOURCE_LOGOS[name];
      return {
        id: `dummy-${idx}`,
        name,
        url: '#',
        title: `${name} Report`,
        type: 'external',
        snippet: 'Coverage from this source.',
        favicon: logoData?.favicon,
      };
    });

  return [...realSources, ...dummySources];
}

export function NewsCard({ item, variant = 'compact', priority = false, onOpenSources }: NewsCardProps) {
  const [ogImage, setOgImage] = useState<string | null>(() => {
    if (item.imageUrl) return item.imageUrl;
    const cachedImage = item.sources.length > 0 ? ogImageCache.get(item.sources[0].url) : undefined;
    return cachedImage !== undefined ? cachedImage : null;
  });
  const [isLoadingImage, setIsLoadingImage] = useState(() => {
    if (item.imageUrl) return false;
    if (item.sources.length > 0 && ogImageCache.has(item.sources[0].url)) return false;
    return true;
  });
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
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
      { rootMargin: '100px' }
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

  const isFeatured = variant === 'featured';
  
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
          unoptimized
        />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
        <div className={`text-center ${isFeatured ? 'p-4' : ''}`}>
          <div className={isFeatured ? 'text-4xl' : 'text-2xl'}>📰</div>
        </div>
      </div>
    );
  };

  // Stacked Source Icons Component - Perplexity style (minimal, no background)
  const SourceIcons = () => {
    const maxIcons = 3;
    const visibleSources = displaySources.slice(0, maxIcons);
    // Smaller icon sizes to match Perplexity
    const iconSize = isFeatured ? 'w-5 h-5' : 'w-4 h-4';
    const innerIconSize = isFeatured ? 'w-3 h-3' : 'w-2.5 h-2.5';
    
    return (
      <button 
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group/sources"
        onClick={handleSourcesClick}
      >
        {/* Stacked circular favicon icons - smaller and tighter */}
        <div className="flex -space-x-1">
          {visibleSources.map((source, idx) => {
            const logoData = SOURCE_LOGOS[source.name];
            const bgColor = logoData?.color || '#333';
            
            return (
              <div 
                key={source.id || idx} 
                className={`
                  relative ${iconSize} rounded-full overflow-hidden
                  border border-os-bg-dark
                  flex items-center justify-center
                `}
                style={{ backgroundColor: bgColor }}
                title={source.name}
              >
                {source.favicon ? (
                  <img
                    src={source.favicon}
                    alt={source.name}
                    className={`${innerIconSize} object-contain`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className={`
                    absolute inset-0 flex items-center justify-center
                    text-white font-bold
                    ${isFeatured ? 'text-[8px]' : 'text-[7px]'}
                  `}
                  style={{ display: source.favicon ? 'none' : 'flex' }}
                >
                  {source.name.charAt(0).toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Source count - smaller text */}
        <span className={`
          text-os-text-secondary-dark group-hover/sources:text-os-text-primary-dark transition-colors
          ${isFeatured ? 'text-xs' : 'text-[11px]'}
        `}>
          {displaySources.length} s...
        </span>
      </button>
    );
  };

  // Action buttons - minimal style like Perplexity
  const ActionButtons = () => (
    <div className="flex items-center gap-0.5">
      <button 
        className={`
          p-1.5 rounded-md transition-all
          ${isLiked 
            ? 'text-brand-aperol' 
            : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
          }
        `}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        title={isLiked ? 'Unlike' : 'Like'}
      >
        <Heart className={`${isFeatured ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${isLiked ? 'fill-current' : ''}`} />
      </button>
      
      <NewsCardMenu 
        onBookmark={() => console.log('Bookmark:', item.title)}
        onAddToSpace={() => console.log('Add to Space:', item.title)}
        onDislike={() => console.log('Dislike:', item.title)}
        size={isFeatured ? 'md' : 'sm'}
      />
    </div>
  );

  if (isFeatured) {
    return (
      <Link 
        ref={cardRef}
        href={`/discover/${item.slug}`}
        className="group flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-transparent hover:bg-os-surface-dark/20 transition-colors"
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

          {/* Source icons and actions - always visible */}
          <div className="flex items-center justify-between mt-4">
            <SourceIcons />
            <ActionButtons />
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

  // Compact variant - lighter hover background
  return (
    <Link 
      ref={cardRef}
      href={`/discover/${item.slug}`}
      className="group flex flex-col gap-2 p-2 rounded-lg bg-transparent hover:bg-os-surface-dark/10 transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-os-surface-dark">
        {renderImage()}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 px-1">
        {/* Title */}
        <h3 className="text-sm font-medium text-brand-vanilla group-hover:text-brand-aperol transition-colors leading-snug line-clamp-2">
          {item.title}
        </h3>

        {/* Source icons and actions - always visible */}
        <div className="flex items-center justify-between">
          <SourceIcons />
          <ActionButtons />
        </div>
      </div>
    </Link>
  );
}
