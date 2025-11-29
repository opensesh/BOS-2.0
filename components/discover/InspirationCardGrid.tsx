'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Video,
  FileText,
  Pen,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { InspirationCardData } from '@/types';

interface InspirationCardGridProps {
  shortForm: InspirationCardData[];
  longForm: InspirationCardData[];
  blog: InspirationCardData[];
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Generate consistent ID that matches the detail page
function generateItemId(title: string, category: string, index: number): string {
  return `${category}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30)}-${index}`;
}

// Featured card (large, top-left position)
function FeaturedInspirationCard({ item, index }: { item: InspirationCardData; index: number }) {
  const [ogImage, setOgImage] = useState<string | null>(null);

  useEffect(() => {
    if (item.sources.length > 0) {
      const fetchOgImage = async () => {
        try {
          const response = await fetch(`/api/og-image?url=${encodeURIComponent(item.sources[0].url)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.image) setOgImage(data.image);
          }
        } catch (error) {
          console.error('Error fetching OG image:', error);
        }
      };
      fetchOgImage();
    }
  }, [item.sources]);

  const slug = generateSlug(item.title);
  const itemId = item.id || generateItemId(item.title, item.category, index);

  return (
    <Link
      href={`/discover/inspiration/${slug}?id=${itemId}`}
      className="group relative col-span-2 row-span-2 rounded-2xl overflow-hidden bg-os-surface-dark border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {ogImage ? (
          <Image
            src={ogImage}
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
      <div className="relative h-full flex flex-col justify-end p-6">
        {/* Featured badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-aperol/90 text-white text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            Featured
          </span>
        </div>

        {/* Category badge */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-os-surface-dark/80 text-os-text-secondary-dark text-xs w-fit mb-3">
          {item.category === 'short-form' && <Video className="w-3 h-3" />}
          {item.category === 'long-form' && <FileText className="w-3 h-3" />}
          {item.category === 'blog' && <Pen className="w-3 h-3" />}
          {item.category === 'short-form' ? 'Short Form' : item.category === 'long-form' ? 'Long Form' : 'Blog'}
        </span>

        <h3 className="text-xl font-semibold text-brand-vanilla group-hover:text-brand-aperol transition-colors line-clamp-2 mb-2">
          {item.title}
        </h3>
        
        <p className="text-sm text-os-text-secondary-dark line-clamp-2 mb-4">
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

// Compact card (smaller, grid position)
function CompactInspirationCard({ item, index }: { item: InspirationCardData; index: number }) {
  const [ogImage, setOgImage] = useState<string | null>(null);

  useEffect(() => {
    if (item.sources.length > 0) {
      const fetchOgImage = async () => {
        try {
          const response = await fetch(`/api/og-image?url=${encodeURIComponent(item.sources[0].url)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.image) setOgImage(data.image);
          }
        } catch (error) {
          console.error('Error fetching OG image:', error);
        }
      };
      fetchOgImage();
    }
  }, [item.sources]);

  const slug = generateSlug(item.title);
  const itemId = item.id || generateItemId(item.title, item.category, index);

  return (
    <Link
      href={`/discover/inspiration/${slug}?id=${itemId}`}
      className="group flex flex-col rounded-xl overflow-hidden bg-os-surface-dark/50 border border-os-border-dark/30 hover:border-brand-aperol/30 hover:bg-os-surface-dark transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-os-surface-dark">
        {ogImage ? (
          <Image
            src={ogImage}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
            <span className="text-2xl">💡</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="text-sm font-medium text-brand-vanilla group-hover:text-brand-aperol transition-colors line-clamp-2 mb-1">
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

// Section with 5-card layout (1 featured + 4 compact)
function InspirationSection({ 
  title, 
  icon: Icon, 
  items,
  category
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  items: InspirationCardData[];
  category: string;
}) {
  if (items.length === 0) return null;

  const featuredItem = items[0];
  const compactItems = items.slice(1, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-10"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-aperol/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-brand-aperol" />
          </div>
          <h2 className="text-lg font-semibold text-brand-vanilla">{title}</h2>
          <span className="px-2 py-0.5 rounded-full bg-os-surface-dark text-xs text-os-text-secondary-dark">
            {items.length}
          </span>
        </div>
        {items.length > 5 && (
          <Link
            href={`/discover?tab=Inspiration&type=${category}`}
            className="text-sm text-os-text-secondary-dark hover:text-brand-aperol transition-colors flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Card Grid - Featured + 4 compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
        {/* Featured card - spans 2 cols and 2 rows */}
        <div className="col-span-2 row-span-2" style={{ minHeight: '320px' }}>
          <FeaturedInspirationCard item={featuredItem} index={0} />
        </div>

        {/* Compact cards */}
        {compactItems.map((item, idx) => (
          <CompactInspirationCard key={item.id || idx} item={item} index={idx + 1} />
        ))}
      </div>
    </motion.div>
  );
}

export function InspirationCardGrid({ shortForm, longForm, blog }: InspirationCardGridProps) {
  return (
    <div>
      <InspirationSection
        title="Short-Form"
        icon={Video}
        items={shortForm}
        category="short-form"
      />

      <InspirationSection
        title="Long-Form"
        icon={FileText}
        items={longForm}
        category="long-form"
      />

      <InspirationSection
        title="Blogging"
        icon={Pen}
        items={blog}
        category="blog"
      />
    </div>
  );
}

