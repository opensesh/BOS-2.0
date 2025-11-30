'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Bookmark, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Sparkles,
  FileText 
} from 'lucide-react';
import { NewsCardData } from '@/types';
import { SourceInfo } from '@/components/chat/AnswerView';
import { NewsCardMenu } from './NewsCardMenu';

interface TieredNewsCardProps {
  item: NewsCardData;
  variant?: 'featured' | 'compact';
  priority?: boolean;
  onOpenSources?: (sources: SourceInfo[]) => void;
  onSave?: (item: NewsCardData, isSaved: boolean) => void;
  isSaved?: boolean;
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
};

// Helper to enrich sources with dummy data for visual demo
function enrichSources(originalSources: NewsCardData['sources']): SourceInfo[] {
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

  if (originalSources.length > 10) {
    return realSources;
  }

  const dummySourceNames = Object.keys(SOURCE_LOGOS).filter(
    name => !originalSources.some(s => s.name === name)
  );
  
  const targetCount = Math.floor(Math.random() * 11) + 40;
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

// Tier badge component
function TierBadge({ tier }: { tier: NewsCardData['tier'] }) {
  if (tier === 'featured') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-aperol/20 text-brand-aperol text-[10px] font-bold uppercase tracking-wider">
        <FileText className="w-3 h-3" />
        40+ Sources
      </span>
    );
  }
  
  if (tier === 'summary') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
        <Sparkles className="w-3 h-3" />
        AI Summary
      </span>
    );
  }
  
  // Quick tier - no badge or subtle external indicator
  return null;
}

export function TieredNewsCard({ 
  item, 
  variant = 'compact', 
  priority = false, 
  onOpenSources,
  onSave,
  isSaved: isSavedProp = false,
}: TieredNewsCardProps) {
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
  const [isSaved, setIsSaved] = useState(isSavedProp);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Sync with prop
  useEffect(() => {
    setIsSaved(isSavedProp);
  }, [isSavedProp]);

  // Memoize enriched sources
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

  // Fetch OG image from sources with Pexels fallback
  useEffect(() => {
    if (!isVisible || item.imageUrl || item.sources.length === 0) return;
    
    const controller = new AbortController();
    let cancelled = false;

    const fetchOgImageWithFallback = async () => {
      // Try each source in order
      for (let i = 0; i < item.sources.length && !cancelled; i++) {
        const sourceUrl = item.sources[i].url;
        
        if (ogImageCache.has(sourceUrl)) {
          const cached = ogImageCache.get(sourceUrl);
          if (cached) {
            setOgImage(cached);
            setIsLoadingImage(false);
            return;
          }
          continue;
        }

        try {
          const response = await fetch(
            `/api/og-image?url=${encodeURIComponent(sourceUrl)}`,
            { signal: controller.signal }
          );
          if (response.ok) {
            const data: OGData = await response.json();
            if (data.image) {
              ogImageCache.set(sourceUrl, data.image);
              if (!cancelled) {
                setOgImage(data.image);
                setIsLoadingImage(false);
              }
              return;
            }
          }
          ogImageCache.set(sourceUrl, null);
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            ogImageCache.set(sourceUrl, null);
          }
        }
      }
      
      // FINAL FALLBACK: Pexels API
      if (!cancelled) {
        try {
          const pexelsResponse = await fetch(
            `/api/pexels?query=${encodeURIComponent(item.title)}`,
            { signal: controller.signal }
          );
          if (pexelsResponse.ok) {
            const pexelsData = await pexelsResponse.json();
            if (pexelsData.imageUrl) {
              if (item.sources.length > 0) {
                ogImageCache.set(item.sources[0].url, pexelsData.imageUrl);
              }
              if (!cancelled) {
                setOgImage(pexelsData.imageUrl);
                setIsLoadingImage(false);
              }
              return;
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.warn('Pexels fallback failed:', error);
          }
        }
      }
      
      if (!cancelled) {
        setIsLoadingImage(false);
      }
    };
    
    fetchOgImageWithFallback();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isVisible, item.imageUrl, item.sources, item.title]);

  const handleImageError = () => {
    setImageError(true);
    setOgImage(null);
  };

  const handleSourcesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenSources?.(displaySources);
  };

  const handleSaveClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    onSave?.(item, newSavedState);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const isFeatured = variant === 'featured';
  const tier = item.tier || 'quick';
  
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

  // Source Icons Component
  const SourceIcons = () => {
    const maxIcons = 3;
    const visibleSources = displaySources.slice(0, maxIcons);
    const iconSize = isFeatured ? 'w-5 h-5' : 'w-4 h-4';
    const innerIconSize = isFeatured ? 'w-3 h-3' : 'w-2.5 h-2.5';
    
    return (
      <button 
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group/sources"
        onClick={handleSourcesClick}
      >
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
        
        <span className={`
          text-os-text-secondary-dark group-hover/sources:text-os-text-primary-dark transition-colors
          ${isFeatured ? 'text-xs' : 'text-[11px]'}
        `}>
          {displaySources.length} sources
        </span>
      </button>
    );
  };

  // Action buttons
  const ActionButtons = () => (
    <div className="flex items-center gap-0.5">
      <button 
        className={`
          p-1.5 rounded-md transition-all
          ${isSaved 
            ? 'text-brand-aperol' 
            : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
          }
        `}
        onClick={handleSaveClick}
        title={isSaved ? 'Unsave' : 'Save'}
      >
        <Bookmark className={`${isFeatured ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${isSaved ? 'fill-current' : ''}`} />
      </button>
      
      <NewsCardMenu 
        onBookmark={() => handleSaveClick()}
        onAddToSpace={() => console.log('Add to Space:', item.title)}
        onDislike={() => console.log('Dislike:', item.title)}
        size={isFeatured ? 'md' : 'sm'}
      />
    </div>
  );

  // Expandable summary content for summary tier
  const ExpandableSummary = () => {
    if (tier !== 'summary' || !item.aiSummary) return null;
    
    return (
      <div 
        className={`
          grid transition-all duration-300 ease-in-out
          ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
        `}
      >
        <div className="overflow-hidden">
          <div className="pt-4 pb-2 border-t border-os-border-dark/30 mt-4">
            <p className="text-sm text-os-text-primary-dark/80 leading-relaxed whitespace-pre-line">
              {item.aiSummary}
            </p>
            {item.sourceUrl && (
              <a 
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-brand-aperol hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Read original article
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Determine the wrapper element based on tier
  const getCardContent = () => {
    // Featured tier - link to article page
    if (tier === 'featured') {
      return (
        <Link 
          href={`/discover/${item.slug}`}
          className="group flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-transparent hover:bg-os-surface-dark/20 transition-colors"
        >
          {renderFeaturedContent()}
        </Link>
      );
    }
    
    // Summary tier - expandable card (not a link)
    if (tier === 'summary') {
      return (
        <div 
          className={`
            group flex flex-col gap-2 p-2 rounded-lg bg-transparent 
            hover:bg-os-surface-dark/10 transition-colors cursor-pointer
            ${isExpanded ? 'bg-os-surface-dark/10' : ''}
          `}
          onClick={handleExpandClick}
        >
          {renderCompactContent()}
        </div>
      );
    }
    
    // Quick tier - external link
    return (
      <a 
        href={item.sourceUrl || item.sources[0]?.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2 p-2 rounded-lg bg-transparent hover:bg-os-surface-dark/10 transition-colors"
      >
        {renderCompactContent()}
      </a>
    );
  };

  // Featured variant content
  const renderFeaturedContent = () => (
    <>
      {/* Text Content - LEFT */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex flex-col gap-3">
          {/* Tier badge */}
          <div className="flex items-center gap-2">
            <TierBadge tier={tier} />
          </div>

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
    </>
  );

  // Compact variant content (for both summary and quick tiers)
  const renderCompactContent = () => (
    <>
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-os-surface-dark">
        {renderImage()}
        {/* Tier badge on image */}
        <div className="absolute top-2 left-2">
          <TierBadge tier={tier} />
        </div>
        {/* External link indicator for quick tier */}
        {tier === 'quick' && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px]">
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        )}
        {/* Expand indicator for summary tier */}
        {tier === 'summary' && (
          <div className="absolute bottom-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px]">
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </span>
          </div>
        )}
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

      {/* Expandable summary for summary tier */}
      <ExpandableSummary />
    </>
  );

  // For featured variant, always use link wrapper
  if (isFeatured) {
    return (
      <div ref={cardRef}>
        <Link 
          href={`/discover/${item.slug}`}
          className="group flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-transparent hover:bg-os-surface-dark/20 transition-colors"
        >
          {renderFeaturedContent()}
        </Link>
      </div>
    );
  }

  // For compact variant, wrapper depends on tier
  return (
    <div ref={cardRef}>
      {getCardContent()}
    </div>
  );
}

