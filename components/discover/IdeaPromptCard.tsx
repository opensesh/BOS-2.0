'use client';

import React, { useState } from 'react';
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

// Gradient presets for card backgrounds - warm terracotta/aperol tones
const GRADIENT_PRESETS = [
  'from-orange-600/60 via-orange-500/40 to-rose-600/30',
  'from-amber-600/50 via-orange-500/40 to-red-600/30',
  'from-rose-600/50 via-orange-500/40 to-amber-600/30',
  'from-orange-500/50 via-rose-500/40 to-orange-600/30',
  'from-red-600/40 via-orange-500/50 to-amber-600/30',
];

// Source favicon/logo mappings
const SOURCE_LOGOS: Record<string, { favicon: string; color: string }> = {
  'TechCrunch': { favicon: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', color: '#0A0' },
  'TechCrunch AI': { favicon: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png', color: '#0A0' },
  'The Verge': { favicon: 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395367/favicon-64x64.0.png', color: '#E71C23' },
  'Wired': { favicon: 'https://www.wired.com/favicon.ico', color: '#000' },
  'Ars Technica': { favicon: 'https://cdn.arstechnica.net/favicon.ico', color: '#F60' },
};

// Get consistent gradient based on item id
function getGradientForItem(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENT_PRESETS[hash % GRADIENT_PRESETS.length];
}

export function IdeaPromptCard({ item, variant = 'compact' }: IdeaPromptCardProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[item.category];
  const CategoryIcon = categoryConfig.icon;
  const gradientClass = getGradientForItem(item.id);

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
      <div className="group flex flex-col md:flex-row gap-6 p-5 rounded-2xl bg-os-bg-dark border border-transparent hover:border-brand-aperol transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10">
        {/* Text Content - LEFT */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-4">
            {/* Category label with sparkle */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-vanilla/80" />
              <span className="text-sm font-medium text-brand-vanilla/80 tracking-wide">
                {categoryConfig.label}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-vanilla leading-tight">
              {item.title}
            </h2>

            {/* Description */}
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

        {/* Gradient Cover - RIGHT */}
        <div className="w-full md:w-[360px] shrink-0">
          <div className={`relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass}`}>
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  // Compact variant - card matching screenshot design
  return (
    <button
      onClick={handleGenerateBrief}
      disabled={isGenerating}
      className="group relative flex flex-col rounded-2xl overflow-hidden h-full bg-os-bg-dark border border-transparent hover:border-brand-aperol transition-all duration-200 hover:shadow-lg hover:shadow-brand-aperol/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-aperol focus-visible:ring-offset-2 focus-visible:ring-offset-os-bg-dark text-left"
    >
      {/* Gradient Cover Area */}
      <div className={`relative aspect-[4/3] w-full bg-gradient-to-br ${gradientClass}`}>
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex flex-col flex-1 p-4 sm:p-5">
        {/* Category label with sparkle */}
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3 h-3 text-brand-vanilla/70" />
          <span className="text-xs font-medium text-brand-vanilla/70 tracking-wide">
            {categoryConfig.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-display font-bold text-brand-vanilla leading-snug line-clamp-3 mb-auto">
          {item.title}
        </h3>

        {/* Bottom pills */}
        <div className="flex items-center gap-3 mt-4 pt-4">
          {/* Sources pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-os-border-dark bg-transparent">
            <Clock className="w-3.5 h-3.5 text-os-text-secondary-dark" />
            <span className="text-xs text-os-text-secondary-dark font-medium">
              {item.sources.length} {item.sources.length === 1 ? 'source' : 'sources'}
            </span>
          </div>

          {/* Category format pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-os-border-dark bg-transparent">
            <CategoryIcon className="w-3.5 h-3.5 text-os-text-secondary-dark" />
            <span className="text-xs text-os-text-secondary-dark font-medium">
              {categoryConfig.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

