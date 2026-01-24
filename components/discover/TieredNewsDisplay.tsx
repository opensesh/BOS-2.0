'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Bookmark, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Sparkles,
  Zap,
  FileText,
  TrendingUp
} from 'lucide-react';
import { NewsCardData } from '@/types';
import { SourceInfo } from '@/components/chat/AnswerView';
import { NewsCardMenu } from './NewsCardMenu';

interface TieredNewsDisplayProps {
  items: NewsCardData[];
  onOpenSources?: (sources: SourceInfo[]) => void;
  onSaveArticle?: (item: NewsCardData, isSaved: boolean) => void;
  savedArticleIds?: Set<string>;
  lastUpdated?: string;
}

interface OGData {
  image: string | null;
}

// In-memory OG image cache
const ogImageCache = new Map<string, string | null>();

// Source logos for display
const SOURCE_LOGOS: Record<string, { favicon: string; color: string }> = {
  'TechCrunch': { favicon: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', color: '#0A0' },
  'TechCrunch AI': { favicon: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', color: '#0A0' },
  'The Verge': { favicon: 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395367/favicon-64x64.0.png', color: '#E71C23' },
  'Wired': { favicon: 'https://www.wired.com/favicon.ico', color: '#000' },
};

// ==========================================
// SPOTLIGHT CARD (Tier 1 - Featured)
// ==========================================
function SpotlightCard({ 
  item, 
  onSave, 
  isSaved 
}: { 
  item: NewsCardData; 
  onSave?: (item: NewsCardData, isSaved: boolean) => void;
  isSaved?: boolean;
}) {
  const [ogImage, setOgImage] = useState<string | null>(item.imageUrl || null);
  const [savedState, setSavedState] = useState(isSaved || false);

  useEffect(() => {
    if (!item.imageUrl && item.sources.length > 0) {
      const sourceUrl = item.sources[0].url;
      if (ogImageCache.has(sourceUrl)) {
        setOgImage(ogImageCache.get(sourceUrl) || null);
        return;
      }
      fetch(`/api/og-image?url=${encodeURIComponent(sourceUrl)}`)
        .then(res => res.json())
        .then((data: OGData) => {
          ogImageCache.set(sourceUrl, data.image);
          setOgImage(data.image);
        })
        .catch(() => ogImageCache.set(sourceUrl, null));
    }
  }, [item]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !savedState;
    setSavedState(newState);
    onSave?.(item, newState);
  };

  return (
    <Link
      href={`/discover/${item.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-brand-aperol/10 to-transparent border border-brand-aperol/20 hover:border-brand-aperol/40 transition-all"
    >
      <div className="flex flex-col md:flex-row">
        {/* Content */}
        <div className="flex-1 p-6 md:p-8">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-aperol text-white text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Deep Dive
            </span>
            <span className="text-xs text-os-text-secondary-dark">
              {item.sources.length}+ sources
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-vanilla group-hover:text-brand-aperol transition-colors leading-tight mb-3">
            {item.title}
          </h2>

          {/* Description */}
          <p className="text-os-text-secondary-dark text-base leading-relaxed line-clamp-3 mb-4">
            {item.summary}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-os-text-secondary-dark">
              <Clock className="w-4 h-4" />
              {item.publishedAt}
            </div>
            <button
              onClick={handleSave}
              className={`p-2 rounded-lg transition-colors ${
                savedState ? 'text-brand-aperol' : 'text-os-text-secondary-dark hover:text-brand-vanilla'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${savedState ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="w-full md:w-[400px] shrink-0">
          <div className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden">
            {ogImage ? (
              <Image
                src={ogImage}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-brand-aperol/20 to-os-surface-dark">
                <FileText className="w-16 h-16 text-brand-aperol/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-os-bg-dark/50 md:hidden" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ==========================================
// QUICK READ CARD (Tier 2 - Summary)
// ==========================================
function QuickReadCard({ 
  item, 
  onSave, 
  isSaved 
}: { 
  item: NewsCardData; 
  onSave?: (item: NewsCardData, isSaved: boolean) => void;
  isSaved?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedState, setSavedState] = useState(isSaved || false);
  const [ogImage, setOgImage] = useState<string | null>(item.imageUrl || null);

  useEffect(() => {
    if (!item.imageUrl && item.sources.length > 0) {
      const sourceUrl = item.sources[0].url;
      if (ogImageCache.has(sourceUrl)) {
        setOgImage(ogImageCache.get(sourceUrl) || null);
        return;
      }
      fetch(`/api/og-image?url=${encodeURIComponent(sourceUrl)}`)
        .then(res => res.json())
        .then((data: OGData) => {
          ogImageCache.set(sourceUrl, data.image);
          setOgImage(data.image);
        })
        .catch(() => {});
    }
  }, [item]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !savedState;
    setSavedState(newState);
    onSave?.(item, newState);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`
        group rounded-xl border transition-all cursor-pointer
        ${isExpanded 
          ? 'border-brand-aperol/30 bg-os-surface-dark/40' 
          : 'border-os-border-dark/30 bg-os-surface-dark/20 hover:bg-os-surface-dark/30'
        }
      `}
      onClick={handleExpand}
    >
      <div className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-os-surface-dark">
            {ogImage ? (
              <Image
                src={ogImage}
                alt={item.title}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
                <Sparkles className="w-8 h-8 text-os-text-secondary-dark/50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-aperol/10 text-brand-aperol text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Quick Read
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-brand-vanilla group-hover:text-brand-aperol transition-colors line-clamp-2 mb-1">
              {item.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-os-text-secondary-dark">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.publishedAt}
              </span>
              <span>{item.sources.length} sources</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg transition-colors ${
                savedState ? 'text-brand-aperol' : 'text-os-text-secondary-dark hover:text-brand-vanilla'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${savedState ? 'fill-current' : ''}`} />
            </button>
            <div className="p-1.5 text-os-text-secondary-dark">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Summary */}
      <div 
        className={`
          grid transition-all duration-300 ease-in-out
          ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
        `}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-os-border-dark/30 pt-4">
            <p className="text-sm text-os-text-primary-dark/80 leading-relaxed whitespace-pre-line">
              {item.aiSummary || item.summary}
            </p>
            {item.sourceUrl && (
              <a 
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-brand-aperol hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Read full article
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// HEADLINE ITEM (Tier 3 - Quick)
// ==========================================
function HeadlineItem({ item }: { item: NewsCardData }) {
  return (
    <a
      href={item.sourceUrl || item.sources[0]?.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-os-surface-dark/30 transition-colors"
    >
      {/* Bullet */}
      <div className="w-2 h-2 rounded-full bg-os-text-secondary-dark/50 shrink-0" />
      
      {/* Title */}
      <span className="flex-1 text-sm text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors line-clamp-1">
        {item.title}
      </span>
      
      {/* Source + External icon */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-os-text-secondary-dark/70">
          {item.sources[0]?.name || 'Source'}
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-os-text-secondary-dark/50 group-hover:text-brand-aperol transition-colors" />
      </div>
    </a>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export function TieredNewsDisplay({ 
  items, 
  onOpenSources,
  onSaveArticle,
  savedArticleIds = new Set(),
  lastUpdated
}: TieredNewsDisplayProps) {
  // Separate items by tier
  const spotlight = items.filter(item => item.tier === 'featured');
  const quickReads = items.filter(item => item.tier === 'summary');
  const headlines = items.filter(item => item.tier === 'quick' || !item.tier);

  // Format last updated
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Today at 8:00 AM PST';
    try {
      const date = new Date(lastUpdated);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' PST';
    } catch {
      return lastUpdated;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-vanilla">
          News
        </h1>
        <p className="text-os-text-secondary-dark text-lg">
          Daily updates curated and summarized for brand professionals
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-brand-aperol" />
          <span className="text-os-text-secondary-dark">
            Last updated: {formatLastUpdated()}
          </span>
        </div>
      </div>

      {/* SPOTLIGHT SECTION (Tier 1) */}
      {spotlight.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-brand-aperol" />
            <h2 className="text-xl font-display font-semibold text-brand-vanilla">Spotlight</h2>
            <span className="px-2 py-0.5 rounded-full bg-brand-aperol/10 text-brand-aperol text-xs font-medium">
              {spotlight.length} deep dive{spotlight.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {spotlight.map(item => (
              <SpotlightCard 
                key={item.id} 
                item={item} 
                onSave={onSaveArticle}
                isSaved={savedArticleIds.has(item.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* QUICK READS SECTION (Tier 2) */}
      {quickReads.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-brand-aperol" />
            <h2 className="text-xl font-display font-semibold text-brand-vanilla">Quick Reads</h2>
            <span className="px-2 py-0.5 rounded-full bg-os-surface-dark text-os-text-secondary-dark text-xs font-medium">
              {quickReads.length} summaries
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickReads.map(item => (
              <QuickReadCard 
                key={item.id} 
                item={item}
                onSave={onSaveArticle}
                isSaved={savedArticleIds.has(item.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* HEADLINES SECTION (Tier 3) */}
      {headlines.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-os-text-secondary-dark" />
            <h2 className="text-xl font-display font-semibold text-brand-vanilla">Headlines</h2>
            <span className="px-2 py-0.5 rounded-full bg-os-surface-dark text-os-text-secondary-dark text-xs font-medium">
              {headlines.length} stories
            </span>
          </div>
          <div className="rounded-xl border border-os-border-dark/30 bg-os-surface-dark/10 overflow-hidden divide-y divide-os-border-dark/20">
            {headlines.map(item => (
              <HeadlineItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-20 text-os-text-secondary-dark">
          No news items available.
        </div>
      )}
    </div>
  );
}

