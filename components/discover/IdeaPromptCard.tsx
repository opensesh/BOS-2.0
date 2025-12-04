'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ExternalLink,
  FileText,
  Video,
  Pen,
  Clock
} from 'lucide-react';
import { IdeaCardData } from '@/types';
import { getTextureByIndex, getTextureIndexFromString } from '@/lib/discover-utils';

interface IdeaPromptCardProps {
  item: IdeaCardData;
  variant?: 'featured' | 'compact';
}

// Category icons and labels
const CATEGORY_CONFIG = {
  'short-form': { 
    icon: Video, 
    label: 'Short Form',
  },
  'long-form': { 
    icon: FileText, 
    label: 'Long Form',
  },
  'blog': { 
    icon: Pen, 
    label: 'Blog',
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

export function IdeaPromptCard({ item, variant = 'compact' }: IdeaPromptCardProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[item.category];
  const CategoryIcon = categoryConfig.icon;
  
  // Get texture - use pre-assigned index or derive from title
  const textureIndex = item.textureIndex ?? getTextureIndexFromString(item.title);
  const textureUrl = getTextureByIndex(textureIndex);

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
      <div className="group flex flex-col md:flex-row gap-6 p-5 rounded-2xl bg-os-surface-dark/50 border border-os-border-dark/50 hover:border-brand-aperol hover:bg-os-surface-dark/70 transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10">
        {/* Text Content - LEFT */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-3">
            {/* Category label with sparkle */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-brand-vanilla/60" />
              <span className="text-xs font-medium text-brand-vanilla/60 tracking-wide">
                {categoryConfig.label}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla leading-tight">
              {item.title}
            </h2>

            {/* Description */}
            <p className="text-os-text-secondary-dark text-sm leading-relaxed">
              {item.description}
            </p>

            {/* Source chips */}
            <div className="mt-2">
              <span className="text-[10px] text-os-text-secondary-dark font-medium mb-2 block">Reference Sources:</span>
              <SourceChips />
            </div>
          </div>

          {/* Generate Ideas button */}
          <div className="mt-4">
            <button
              onClick={handleGenerateBrief}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-aperol text-white text-sm font-medium hover:bg-brand-aperol/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Ideas
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sonic Line Texture Cover - RIGHT */}
        <div className="w-full md:w-[320px] shrink-0">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={textureUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
        </div>
      </div>
    );
  }

  // Compact variant - uses sonic line textures
  return (
    <button
      onClick={handleGenerateBrief}
      disabled={isGenerating}
      className="group relative flex flex-col rounded-2xl overflow-hidden h-full bg-os-surface-dark/50 border border-os-border-dark/50 hover:border-brand-aperol hover:bg-os-surface-dark/70 transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aperol focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg-dark text-left"
    >
      {/* Sonic Line Texture Cover */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image
          src={textureUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex flex-col flex-1 p-3 sm:p-4">
        {/* Category label with sparkle */}
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-brand-vanilla/60" />
          <span className="text-[11px] font-medium text-brand-vanilla/60 tracking-wide">
            {categoryConfig.label}
          </span>
        </div>

        {/* Title - smaller for better visual hierarchy */}
        <h3 className="text-sm sm:text-[15px] font-display font-bold text-brand-vanilla leading-snug line-clamp-3 mb-auto">
          {item.title}
        </h3>

        {/* Bottom pills - flex-nowrap to prevent wrapping */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-os-border-dark/30 flex-nowrap overflow-hidden">
          {/* Sources pill */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-os-border-dark/50 bg-os-bg-dark/50 shrink-0">
            <Clock className="w-3 h-3 text-os-text-secondary-dark" />
            <span className="text-[10px] text-os-text-secondary-dark font-medium whitespace-nowrap">
              {item.sources.length} sources
            </span>
          </div>

          {/* Category format pill */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-os-border-dark/50 bg-os-bg-dark/50 shrink-0">
            <CategoryIcon className="w-3 h-3 text-os-text-secondary-dark" />
            <span className="text-[10px] text-os-text-secondary-dark font-medium whitespace-nowrap">
              {categoryConfig.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

