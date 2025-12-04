'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Video,
  FileText,
  Pen,
  Image as ImageIcon,
  Type,
  Palette,
  FolderOpen,
  ScrollText,
  Lightbulb,
  Layers,
  ListTree,
  FileSearch,
  Clock,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  Hash,
  Target,
  Eye
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StickyArticleHeader } from '@/components/discover/article/StickyArticleHeader';
import { IdeaCardData, PlatformTip } from '@/types';
import { getTextureByIndex, getTextureIndexFromString } from '@/lib/discover-utils';

// Content-type specific generation options
interface GenerationOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
}

const SHORT_FORM_OPTIONS: GenerationOption[] = [
  {
    id: 'image',
    title: 'Image Concept',
    description: 'Visual direction and thumbnail ideas',
    icon: ImageIcon,
    prompt: 'Create image concept recommendations for a short-form video including thumbnail design, key visual moments, and imagery style that would perform well on social media',
  },
  {
    id: 'copy',
    title: 'Copy & Captions',
    description: 'Hook, script, and social copy',
    icon: Type,
    prompt: 'Write the copy for this short-form video including: attention-grabbing hook (first 3 seconds), main script/narration, and caption copy for social media posts',
  },
  {
    id: 'art-direction',
    title: 'Art Direction',
    description: 'Visual style and brand alignment',
    icon: Palette,
    prompt: 'Provide art direction for this short-form video including color palette, typography suggestions, motion graphics style, and brand alignment recommendations',
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Tools, templates, and references',
    icon: FolderOpen,
    prompt: 'Compile a list of helpful resources for creating this short-form video including recommended editing tools, music/audio sources, stock footage sites, and example references',
  },
];

const LONG_FORM_OPTIONS: GenerationOption[] = [
  {
    id: 'script',
    title: 'Script Outline',
    description: 'Chapter breakdown and talking points',
    icon: ScrollText,
    prompt: 'Create a detailed script outline for this long-form content including chapter breakdown, key talking points for each section, transitions, and timing estimates',
  },
  {
    id: 'hooks',
    title: 'Hooks & Intros',
    description: 'Opening variations and teasers',
    icon: Lightbulb,
    prompt: 'Generate 5 different hook/intro variations for this long-form content, each with a different angle to capture viewer attention in the first 30 seconds',
  },
  {
    id: 'storyboard',
    title: 'Storyboard',
    description: 'Visual sequence and shot list',
    icon: Layers,
    prompt: 'Create a storyboard outline for this long-form content including key visual moments, B-roll suggestions, graphics/overlay ideas, and shot composition recommendations',
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Research and reference materials',
    icon: FolderOpen,
    prompt: 'Compile research resources for this long-form content including expert sources to cite, statistics/data points, related studies, and competitor analysis',
  },
];

const BLOG_OPTIONS: GenerationOption[] = [
  {
    id: 'outline',
    title: 'Table of Contents',
    description: 'SEO-optimized structure',
    icon: ListTree,
    prompt: 'Create an SEO-optimized table of contents for this blog article including H2/H3 headings, estimated word count per section, and internal linking opportunities',
  },
  {
    id: 'titles',
    title: 'Title Ideas',
    description: 'Headlines and meta descriptions',
    icon: Type,
    prompt: 'Generate 10 title variations for this blog article optimized for both SEO and click-through rate, plus meta descriptions and social share headlines',
  },
  {
    id: 'similar',
    title: 'Similar Content',
    description: 'Competitor analysis and gaps',
    icon: FileSearch,
    prompt: 'Analyze similar blog content on this topic, identify content gaps and unique angles, and suggest how to differentiate this article from existing coverage',
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Links, citations, and visuals',
    icon: FolderOpen,
    prompt: 'Compile resources for this blog article including authoritative sources to link, statistics to cite, image/graphic suggestions, and call-to-action ideas',
  },
];

// Helper to generate consistent IDs - matches discover-utils.ts format
function generateId(category: string, index: number): string {
  return `idea-${category}-${index}`;
}

// Generate slug from title
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

// Process raw idea data and add IDs - matches discover-utils.ts format
function processIdeaData(
  data: { ideas: Array<{ 
    title: string; 
    description: string; 
    starred?: boolean; 
    sources: Array<{ name: string; url: string }>;
    // Rich creative brief fields
    hooks?: string[];
    platformTips?: Array<{ platform: string; tips: string[] }>;
    visualDirection?: { rating: number; description: string };
    exampleOutline?: string[];
    hashtags?: string;
    // Visual design fields
    pexelsImageUrl?: string;
    textureIndex?: number;
  }> },
  category: string
): IdeaCardData[] {
  return data.ideas.map((idea, index) => ({
    id: generateId(category, index),
    title: idea.title,
    description: idea.description,
    slug: generateSlugFromTitle(idea.title),
    category: category as 'short-form' | 'long-form' | 'blog',
    starred: idea.starred || false,
    sources: idea.sources.map((source, sourceIndex) => ({
      id: `source-${index}-${sourceIndex}`,
      name: source.name,
      url: source.url,
    })),
    isPrompt: true,
    // Rich creative brief fields
    hooks: idea.hooks,
    platformTips: idea.platformTips as PlatformTip[] | undefined,
    visualDirection: idea.visualDirection,
    exampleOutline: idea.exampleOutline,
    hashtags: idea.hashtags,
    // Visual design fields
    pexelsImageUrl: idea.pexelsImageUrl,
    textureIndex: idea.textureIndex ?? getTextureIndexFromString(idea.title),
  }));
}

// Fetch idea item from all categories - with ID and slug fallback
async function fetchIdeaItem(id: string | null, slug: string): Promise<IdeaCardData | null> {
  try {
    const categories = ['short-form', 'long-form', 'blog'] as const;
    
    for (const category of categories) {
      const response = await fetch(`/data/weekly-ideas/${category}/latest.json`);
      if (response.ok) {
        const data = await response.json();
        const processedItems = processIdeaData(data, category);
        
        if (id) {
          const foundById = processedItems.find(item => item.id === id);
          if (foundById) return foundById;
        }
        
        const foundBySlug = processedItems.find(item => item.slug === slug);
        if (foundBySlug) return foundBySlug;
      }
    }
  } catch (error) {
    console.error('Error fetching idea item:', error);
  }
  return null;
}

// Fallback placeholder images based on category
const FALLBACK_IMAGES = {
  'short-form': 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop',
  'long-form': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
  'blog': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
};

// Generate concept brief (static, non-streaming)
async function generateConceptBrief(item: IdeaCardData): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Generate a brief 2-3 paragraph explanation of this content idea for a creative professional. Be concise and actionable.

Title: ${item.title}
Description: ${item.description}
Category: ${item.category}
Sources: ${item.sources.map(s => s.name).join(', ')}

Write about:
1. Why this topic is relevant and timely
2. The key angle or hook that makes it interesting
3. Potential approaches to explore this idea

Keep it under 150 words total. Do not use markdown formatting, just plain text paragraphs.`
        }]
      })
    });
    
    if (response.ok) {
      const text = await response.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed.content) return parsed.content;
        return text;
      } catch {
        return text;
      }
    }
  } catch (error) {
    console.error('Error generating concept brief:', error);
  }
  
  return `This content idea explores "${item.title}" - a timely topic that offers creative potential across multiple formats. The concept draws from ${item.sources.length} source${item.sources.length > 1 ? 's' : ''}, providing a solid foundation for research and development. Consider the unique angles this topic offers and how it might resonate with your target audience.`;
}

// Visual direction rating colors
const getRatingColor = (rating: number) => {
  if (rating <= 3) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (rating <= 6) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
};

const getRatingLabel = (rating: number) => {
  if (rating <= 2) return 'Basic';
  if (rating <= 4) return 'Conservative';
  if (rating <= 6) return 'Modern';
  if (rating <= 8) return 'Bold';
  return 'Radical';
};

export default function IdeaDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [item, setItem] = useState<IdeaCardData | null>(null);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [conceptBrief, setConceptBrief] = useState<string | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [hashtagsCopied, setHashtagsCopied] = useState(false);

  const id = searchParams.get('id');
  const slug = params.slug as string;

  // Set initial active platform when item loads
  useEffect(() => {
    if (item?.platformTips && item.platformTips.length > 0 && !activePlatform) {
      setActivePlatform(item.platformTips[0].platform);
    }
  }, [item, activePlatform]);

  // Copy hashtags to clipboard
  const copyHashtags = async () => {
    if (item?.hashtags) {
      try {
        await navigator.clipboard.writeText(item.hashtags);
        setHashtagsCopied(true);
        setTimeout(() => setHashtagsCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = item.hashtags;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setHashtagsCopied(true);
        setTimeout(() => setHashtagsCopied(false), 2000);
      }
    }
  };

  // Fetch idea item
  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetchIdeaItem(id, slug).then(data => {
        setItem(data);
        setLoading(false);
      });
    }
  }, [id, slug]);

  // Fetch OG image with fallback - prefer pexelsImageUrl if available
  useEffect(() => {
    if (item) {
      // Use pexelsImageUrl if available, otherwise use fallback
      if (item.pexelsImageUrl) {
        setOgImage(item.pexelsImageUrl);
        return;
      }
      
      setOgImage(FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES['short-form']);
      
      if (item.sources && item.sources.length > 0) {
        const fetchImages = async () => {
          for (const source of item.sources.slice(0, 3)) {
            try {
              const response = await fetch(`/api/og-image?url=${encodeURIComponent(source.url)}`);
              if (response.ok) {
                const data = await response.json();
                if (data.image) {
                  setOgImage(data.image);
                  return;
                }
              }
            } catch {
              // Continue to next source
            }
          }
        };
        fetchImages();
      }
    }
  }, [item]);

  // Generate concept brief
  useEffect(() => {
    if (item && !conceptBrief && !loadingBrief) {
      setLoadingBrief(true);
      generateConceptBrief(item).then(brief => {
        setConceptBrief(brief);
        setLoadingBrief(false);
      });
    }
  }, [item, conceptBrief, loadingBrief]);

  const handleGenerate = (option: GenerationOption) => {
    if (!item) return;
    setGeneratingId(option.id);

    const categoryLabel = item.category === 'short-form' ? 'Short Form' : 
                          item.category === 'long-form' ? 'Long Form' : 'Blog';
    
    // Create a simpler, cleaner prompt without full URLs
    const sourceNames = item.sources.map(s => s.name).join(', ');
    const prompt = `${option.prompt} for "${item.title}" (${categoryLabel}). ${item.description} Reference sources: ${sourceNames}.`;

    const urlParams = new URLSearchParams({
      q: prompt,
      ideaTitle: item.title,
      ideaCategory: item.category,
      ideaSlug: slug,
      generationType: option.id,
      generationLabel: option.title,
    });
    router.push(`/?${urlParams.toString()}`);
  };

  const getCategoryIcon = () => {
    if (!item) return Video;
    switch (item.category) {
      case 'short-form': return Video;
      case 'long-form': return FileText;
      case 'blog': return Pen;
      default: return Video;
    }
  };

  const getCategoryLabel = () => {
    if (!item) return '';
    switch (item.category) {
      case 'short-form': return 'Short Form';
      case 'long-form': return 'Long Form';
      case 'blog': return 'Blog';
      default: return item.category;
    }
  };

  const getGenerationOptions = (): GenerationOption[] => {
    if (!item) return SHORT_FORM_OPTIONS;
    switch (item.category) {
      case 'short-form': return SHORT_FORM_OPTIONS;
      case 'long-form': return LONG_FORM_OPTIONS;
      case 'blog': return BLOG_OPTIONS;
      default: return SHORT_FORM_OPTIONS;
    }
  };

  const CategoryIcon = getCategoryIcon();
  const generationOptions = getGenerationOptions();

  if (loading) {
    return (
      <div className="flex h-screen bg-os-bg-dark">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center pt-14 lg:pt-0">
          <div className="w-8 h-8 border-2 border-brand-aperol/30 border-t-brand-aperol rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-screen bg-os-bg-dark">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center pt-14 lg:pt-0">
          <p className="text-os-text-secondary-dark mb-4">Idea not found</p>
          <Link
            href="/discover?tab=Ideas"
            className="text-brand-aperol hover:underline"
          >
            Back to Ideas
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        {/* Sticky Header */}
        <StickyArticleHeader 
          title={item.title} 
          titleRef={titleRef}
          backLink="/discover?tab=Ideas"
          backLabel="Ideas"
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Textured Hero Header */}
          <div className="relative w-full overflow-hidden">
            {/* Texture Background */}
            <div className="absolute inset-0">
              <Image
                src={getTextureByIndex(item.textureIndex ?? 0)}
                alt=""
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 md:px-12 md:py-12">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                {/* Left: Text Content */}
                <div className="flex-1 min-w-0">
                  {/* Category and sources count */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-charcoal/80 text-brand-vanilla text-sm font-medium">
                      <CategoryIcon className="w-4 h-4" />
                      {getCategoryLabel()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-charcoal/80 text-brand-vanilla text-sm">
                      <Clock className="w-3.5 h-3.5 opacity-70" />
                      {item.sources.length} sources
                    </span>
                  </div>

                  {/* Title */}
                  <h1 
                    ref={titleRef}
                    className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-brand-vanilla mb-4 drop-shadow-md"
                  >
                    {item.title}
                  </h1>

                  {/* Brief Description Preview */}
                  <p className="text-sm md:text-base text-brand-vanilla/80 line-clamp-2 max-w-2xl">
                    {item.description}
                  </p>
                </div>

                {/* Right: Thumbnail Image */}
                <div className="shrink-0">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-[3px] border-brand-vanilla shadow-xl">
                    {ogImage ? (
                      <Image
                        src={ogImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-os-charcoal/80">
                        <div className="w-6 h-6 border-2 border-brand-vanilla/30 border-t-brand-vanilla rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="w-full max-w-5xl mx-auto px-6 py-8 md:px-12 md:py-10">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Full Description */}
                <p className="text-[15px] leading-[1.75] text-os-text-primary-dark/90 mb-8">
                  {item.description}
                </p>

                {/* Hook Ideas - Only show if available */}
                {item.hooks && item.hooks.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-brand-aperol" />
                      <h2 className="text-lg font-display font-semibold text-brand-vanilla">
                        Hook Ideas
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {item.hooks.map((hook, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-xl bg-os-surface-dark/60 border border-os-border-dark/50"
                        >
                          <div className="w-6 h-6 rounded-full bg-brand-aperol/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-brand-aperol">{idx + 1}</span>
                          </div>
                          <p className="text-[15px] text-brand-vanilla font-medium leading-relaxed">
                            "{hook}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Platform Tips - Only show if available */}
                {item.platformTips && item.platformTips.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-brand-aperol" />
                      <h2 className="text-lg font-display font-semibold text-brand-vanilla">
                        Platform Tips
                      </h2>
                    </div>
                    
                    {/* Platform tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                      {item.platformTips.map((pt) => (
                        <button
                          key={pt.platform}
                          onClick={() => setActivePlatform(pt.platform)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            activePlatform === pt.platform
                              ? 'bg-brand-aperol/15 text-brand-aperol border border-brand-aperol/30'
                              : 'bg-os-surface-dark/60 text-os-text-secondary-dark hover:text-brand-vanilla border border-os-border-dark/30'
                          }`}
                        >
                          {pt.platform}
                        </button>
                      ))}
                    </div>
                    
                    {/* Tips for active platform */}
                    {activePlatform && (
                      <div className="space-y-2">
                        {item.platformTips
                          .find(pt => pt.platform === activePlatform)
                          ?.tips.map((tip, idx) => (
                            <div 
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg bg-os-surface-dark/40"
                            >
                              <ChevronRight className="w-4 h-4 text-brand-aperol flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-os-text-primary-dark/90">{tip}</p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Visual Direction - Only show if available */}
                {item.visualDirection && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-5 h-5 text-brand-aperol" />
                      <h2 className="text-lg font-display font-semibold text-brand-vanilla">
                        Visual Direction
                      </h2>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-os-surface-dark/60 border border-os-border-dark/50">
                      {/* Rating badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getRatingColor(item.visualDirection.rating)}`}>
                          <span>{item.visualDirection.rating}/10</span>
                          <span className="text-xs opacity-75">•</span>
                          <span>{getRatingLabel(item.visualDirection.rating)}</span>
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className="text-[15px] text-os-text-primary-dark/90 leading-relaxed">
                        {item.visualDirection.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Example Outline - Only show if available */}
                {item.exampleOutline && item.exampleOutline.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <ListTree className="w-5 h-5 text-brand-aperol" />
                      <h2 className="text-lg font-display font-semibold text-brand-vanilla">
                        Example Outline
                      </h2>
                    </div>
                    
                    <div className="space-y-2">
                      {item.exampleOutline.map((section, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg bg-os-surface-dark/40"
                        >
                          <div className="w-6 h-6 rounded bg-os-surface-dark flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-mono text-os-text-secondary-dark">{idx + 1}</span>
                          </div>
                          <p className="text-sm text-os-text-primary-dark/90">{section}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hashtags - Only show if available */}
                {item.hashtags && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-brand-aperol" />
                        <h2 className="text-lg font-display font-semibold text-brand-vanilla">
                          Hashtags
                        </h2>
                      </div>
                      <button
                        onClick={copyHashtags}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          hashtagsCopied
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-os-surface-dark/60 text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark'
                        }`}
                      >
                        {hashtagsCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy All
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-os-surface-dark/60 border border-os-border-dark/50">
                      <p className="text-sm text-brand-aperol/80 leading-relaxed break-words">
                        {item.hashtags}
                      </p>
                    </div>
                  </div>
                )}

                {/* AI-Generated Concept Brief - Only show if no rich content available */}
                {!item.hooks && !item.platformTips && (
                  <div className="mb-8">
                    <h2 className="text-lg font-display font-semibold text-brand-vanilla mb-4">
                      Concept Overview
                    </h2>
                    {loadingBrief ? (
                      <div className="flex items-center gap-3 text-os-text-secondary-dark py-4">
                        <div className="w-4 h-4 border-2 border-os-text-secondary-dark border-t-brand-aperol rounded-full animate-spin" />
                        <span className="text-sm">Generating overview...</span>
                      </div>
                    ) : conceptBrief ? (
                      <div className="text-[15px] leading-[1.75] text-os-text-primary-dark/90 space-y-4">
                        {conceptBrief.split('\n\n').filter(p => p.trim()).map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Source Links */}
                <div className="mb-10">
                  <h2 className="text-sm font-semibold text-brand-vanilla mb-3 uppercase tracking-wide">
                    Reference Sources
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {item.sources.map((source, idx) => (
                      <a
                        key={source.id || idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-os-surface-dark/60 border border-os-border-dark/50 hover:border-brand-aperol/30 text-sm text-os-text-secondary-dark hover:text-brand-vanilla transition-all"
                      >
                        {source.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Content-Type Specific Generation Options */}
              <div className="lg:w-72 shrink-0">
                <div className="sticky top-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-os-text-secondary-dark mb-4">
                    Generate Content
                  </h3>
                  
                  <div className="flex flex-col gap-3">
                    {generationOptions.map((option) => {
                      const Icon = option.icon;
                      const isGenerating = generatingId === option.id;
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleGenerate(option)}
                          disabled={isGenerating}
                          className="group flex items-center gap-3 p-3 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand-aperol/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-brand-aperol" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-brand-vanilla">
                              {option.title}
                            </h4>
                            <p className="text-xs text-os-text-secondary-dark truncate">
                              {option.description}
                            </p>
                          </div>
                          {isGenerating && (
                            <div className="w-4 h-4 border-2 border-brand-aperol/30 border-t-brand-aperol rounded-full animate-spin" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
