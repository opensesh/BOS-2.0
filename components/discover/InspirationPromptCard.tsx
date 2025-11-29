'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Sparkles, 
  ExternalLink,
  FileText,
  Video,
  Pen
} from 'lucide-react';
import { InspirationCardData } from '@/types';

interface InspirationPromptCardProps {
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

// Category icons and colors - using brand colors
const CATEGORY_CONFIG = {
  'short-form': { 
    icon: Video, 
    label: 'Short Form',
    color: 'text-brand-aperol bg-brand-aperol/10'
  },
  'long-form': { 
    icon: FileText, 
    label: 'Long Form',
    color: 'text-brand-vanilla bg-brand-charcoal/50'
  },
  'blog': { 
    icon: Pen, 
    label: 'Blog',
    color: 'text-brand-vanilla bg-os-surface-dark'
  },
};

// Source favicon/logo mappings
const SOURCE_LOGOS: Record<string, { favicon: string; color: string }> = {
  'TechCrunch': { favicon: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', color: '#0A0' },
  'TechCrunch AI': { favicon: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', color: '#0A0' },
  'The Verge': { favicon: 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395367/favicon-64x64.0.png', color: '#E71C23' },
  'Wired': { favicon: 'https://www.wired.com/favicon.ico', color: '#000' },
  'Ars Technica': { favicon: 'https://cdn.arstechnica.net/favicon.ico', color: '#F60' },
};

export function InspirationPromptCard({ item, variant = 'compact' }: InspirationPromptCardProps) {
  const router = useRouter();
  const [ogImage, setOgImage] = useState<string | null>(item.imageUrl || null);
  const [isLoadingImage, setIsLoadingImage] = useState(!item.imageUrl);
  const [isGenerating, setIsGenerating] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[item.category];
  const CategoryIcon = categoryConfig.icon;

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

  // Generate brief prompt and navigate to chat
  const handleGenerateBrief = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGenerating(true);

    // Build the prompt for the AI
    const sourceUrls = item.sources.map(s => s.url).join('\n');
    const prompt = `Create a creative brief for the following content idea:

**Title:** ${item.title}

**Format:** ${categoryConfig.label}

**Description:** ${item.description}

**Reference Sources:**
${sourceUrls}

Please provide:
1. A refined concept with hook
2. Key talking points (3-5 bullets)
3. Suggested structure/outline
4. Visual/aesthetic recommendations
5. Call-to-action suggestions`;

    // Encode the prompt and navigate to home with query param
    const encodedPrompt = encodeURIComponent(prompt);
    router.push(`/?q=${encodedPrompt}`);
  };

  // Source icons component
  const SourceChips = () => (
    <div className="flex flex-wrap gap-2">
      {item.sources.slice(0, 4).map((source, idx) => {
        const logoData = SOURCE_LOGOS[source.name];
        return (
          <a
            key={source.id || idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-os-surface-dark/50 hover:bg-os-surface-dark transition-colors text-xs text-os-text-secondary-dark hover:text-os-text-primary-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: logoData?.color || '#333' }}
            >
              {logoData?.favicon ? (
                <img 
                  src={logoData.favicon} 
                  alt={source.name} 
                  className="w-3 h-3 object-contain"
                />
              ) : (
                <span className="text-[8px] text-white font-bold">
                  {source.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="truncate max-w-[100px]">{source.name}</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        );
      })}
      {item.sources.length > 4 && (
        <span className="inline-flex items-center px-2 py-1 text-xs text-os-text-secondary-dark">
          +{item.sources.length - 4} more
        </span>
      )}
    </div>
  );

  if (variant === 'featured') {
    return (
      <div className="group flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-os-surface-dark/30 border border-os-border-dark/30">
        {/* Text Content - LEFT */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-3">
            {/* Category badge and starred indicator */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${categoryConfig.color} text-[10px] font-bold uppercase tracking-wider`}>
                <CategoryIcon className="w-3 h-3" />
                {categoryConfig.label}
              </span>
              {item.starred && (
                <Star className="w-4 h-4 text-brand-aperol fill-brand-aperol" />
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-os-surface-dark text-os-text-secondary-dark text-[10px] font-medium uppercase tracking-wider">
                Content Prompt
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla leading-tight">
              {item.title}
            </h2>

            {/* Description - FULL, no truncation */}
            <p className="text-os-text-secondary-dark text-base leading-relaxed">
              {item.description}
            </p>

            {/* Source chips */}
            <div className="mt-2">
              <span className="text-xs text-os-text-secondary-dark font-medium mb-2 block">Reference Sources:</span>
              <SourceChips />
            </div>
          </div>

          {/* Generate Ideas button */}
          <div className="mt-6">
            <button
              onClick={handleGenerateBrief}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-aperol text-white font-medium hover:bg-brand-aperol/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Ideas
                </>
              )}
            </button>
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
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
                <div className="text-center p-4">
                  <CategoryIcon className="w-12 h-12 text-os-text-secondary-dark/50 mx-auto mb-2" />
                  <span className="text-sm text-os-text-secondary-dark">{categoryConfig.label}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Compact variant - non-clickable card with generate button
  return (
    <div className="group flex flex-col gap-3 p-3 rounded-xl bg-os-surface-dark/20 border border-os-border-dark/20 hover:border-os-border-dark/40 transition-colors">
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
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
            <CategoryIcon className="w-8 h-8 text-os-text-secondary-dark/50" />
          </div>
        )}
        
        {/* Category badge on image */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${categoryConfig.color} text-[9px] font-bold uppercase tracking-wider`}>
            <CategoryIcon className="w-2.5 h-2.5" />
            {categoryConfig.label}
          </span>
        </div>
        
        {/* Starred indicator */}
        {item.starred && (
          <div className="absolute top-2 right-2">
            <Star className="w-4 h-4 text-brand-aperol fill-brand-aperol drop-shadow-md" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        {/* Title */}
        <h3 className="text-sm font-medium text-brand-vanilla leading-snug line-clamp-2">
          {item.title}
        </h3>

        {/* Description - show first 2 lines */}
        <p className="text-xs text-os-text-secondary-dark leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* Source count */}
        <div className="flex items-center gap-2 text-xs text-os-text-secondary-dark">
          <div className="flex -space-x-1">
            {item.sources.slice(0, 3).map((source, idx) => {
              const logoData = SOURCE_LOGOS[source.name];
              return (
                <div 
                  key={source.id || idx} 
                  className="w-4 h-4 rounded-full border border-os-bg-dark flex items-center justify-center"
                  style={{ backgroundColor: logoData?.color || '#333' }}
                >
                  <span className="text-[7px] text-white font-bold">
                    {source.name.charAt(0)}
                  </span>
                </div>
              );
            })}
          </div>
          <span>{item.sources.length} sources</span>
        </div>

        {/* Generate Ideas button - compact */}
        <button
          onClick={handleGenerateBrief}
          disabled={isGenerating}
          className="mt-1 inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-brand-aperol/10 text-brand-aperol text-xs font-medium hover:bg-brand-aperol/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="w-3 h-3 border-2 border-brand-aperol/30 border-t-brand-aperol rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              Generate Ideas
            </>
          )}
        </button>
      </div>
    </div>
  );
}

