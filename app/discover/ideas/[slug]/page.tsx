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
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Sparkles,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StickyArticleHeader } from '@/components/discover/article/StickyArticleHeader';
import { SourceCards } from '@/components/discover/article/SourceCards';
import { IdeaCardData, PlatformTip, SourceCard } from '@/types';
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

// HTML entity decoder
function decodeHTMLEntities(text: string): string {
  if (typeof window === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Generate enhanced platform tips with consistent high-level tips and specific details
function enhancePlatformTip(tip: string, platform: string, ideaTitle: string, ideaDescription: string): { quickTip: string; detailedExplanation: string; example: string } {
  // Map raw tips to consistent high-level patterns
  const tipPatterns: Record<string, { quick: string; generateDetail: (title: string, desc: string) => string }> = {
    'visual': {
      quick: 'Use attention-grabbing visuals',
      generateDetail: (title, desc) => {
        // Extract key entities or comparisons from title/description
        const hasVs = title.toLowerCase().includes('vs') || desc.toLowerCase().includes('vs');
        const entities = title.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g) || [];
        
        if (hasVs && entities.length >= 2) {
          return `Create split-screen or side-by-side comparisons highlighting ${entities[0]} and ${entities[1]}. Use contrasting colors and clear data visualization to show the difference at a glance.`;
        }
        return `Focus on bold, high-contrast imagery that immediately conveys the core concept. Use data visualization, infographics, or dynamic text overlays to make statistics pop.`;
      }
    },
    'quick': {
      quick: 'Keep pacing fast and engaging',
      generateDetail: (title, desc) => `For "${title}", use quick cuts every 1-2 seconds to maintain energy. Start with the most surprising statistic or fact to hook viewers immediately, then reveal supporting details rapidly.`
    },
    'hook': {
      quick: 'Lead with your strongest hook',
      generateDetail: (title, desc) => {
        const numbers = desc.match(/\d+%?/g) || [];
        if (numbers.length > 0) {
          return `Open with the most shocking number: "${numbers[0]}" displayed prominently. Follow immediately with context about ${title.split(/[,:.]/)[0].toLowerCase()}.`;
        }
        return `Start with a provocative question or unexpected statement about ${title.split(/[,:.]/)[0].toLowerCase()}. Your first 3 seconds determine 70% of watch-through rate.`;
      }
    },
    'text': {
      quick: 'Maximize text readability',
      generateDetail: (title, desc) => `Use large, bold sans-serif fonts (min 60pt) with high contrast against backgrounds. For "${title}", ensure key terms and numbers are legible even on mobile screens. Add subtle animations to emphasize important words.`
    },
    'motion': {
      quick: 'Add subtle motion graphics',
      generateDetail: (title, desc) => `Incorporate smooth transitions and animated data points. For this concept, animate comparison charts or statistics to reveal over 2-3 seconds, creating a sense of progression and discovery.`
    }
  };

  // Detect tip category from content
  let category: keyof typeof tipPatterns = 'visual';
  const lowerTip = tip.toLowerCase();
  if (lowerTip.includes('quick') || lowerTip.includes('cut') || lowerTip.includes('fast')) category = 'quick';
  else if (lowerTip.includes('hook') || lowerTip.includes('start') || lowerTip.includes('open')) category = 'hook';
  else if (lowerTip.includes('text') || lowerTip.includes('overlay') || lowerTip.includes('caption')) category = 'text';
  else if (lowerTip.includes('motion') || lowerTip.includes('animate') || lowerTip.includes('transition')) category = 'motion';

  const pattern = tipPatterns[category];
  const detailedExplanation = pattern.generateDetail(ideaTitle, ideaDescription);
  
  // Generate concrete example
  const example = `On ${platform}, ${detailedExplanation.split('.')[0].toLowerCase()}.`;

  return {
    quickTip: pattern.quick,
    detailedExplanation,
    example
  };
}

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
  const [showAllSources, setShowAllSources] = useState(false);
  
  // New state for interactive features
  const [hooks, setHooks] = useState<string[]>([]);
  const [copiedHookIndex, setCopiedHookIndex] = useState<number | null>(null);
  const [draggedHookIndex, setDraggedHookIndex] = useState<number | null>(null);
  const [expandedPlatformTip, setExpandedPlatformTip] = useState<number | null>(null);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  
  // Visual concepts configuration state
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [setting, setSetting] = useState('Studio');
  const [artDirections, setArtDirections] = useState<string[]>(['Work']);
  const [selectedModel, setSelectedModel] = useState('Midjourney');
  const [artDirectionDropdownOpen, setArtDirectionDropdownOpen] = useState(false);
  
  // Feedback state
  const [feedbackType, setFeedbackType] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const id = searchParams.get('id');
  const slug = params.slug as string;

  // Set initial active platform when item loads
  useEffect(() => {
    if (item?.platformTips && item.platformTips.length > 0 && !activePlatform) {
      setActivePlatform(item.platformTips[0].platform);
    }
  }, [item, activePlatform]);

  // Initialize hooks from item (decode HTML entities and remove quotes)
  useEffect(() => {
    if (item?.hooks && item.hooks.length > 0) {
      const cleanedHooks = item.hooks.map(hook => {
        const decoded = decodeHTMLEntities(hook);
        // Remove surrounding quotes if present
        return decoded.replace(/^["']|["']$/g, '');
      });
      setHooks(cleanedHooks);
    }
  }, [item]);

  // Copy hook to clipboard
  const copyHook = async (hook: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hook);
      setCopiedHookIndex(index);
      setTimeout(() => setCopiedHookIndex(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = hook;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedHookIndex(index);
      setTimeout(() => setCopiedHookIndex(null), 2000);
    }
  };

  // Drag and drop handlers for hooks
  const handleDragStart = (index: number) => {
    setDraggedHookIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedHookIndex === null || draggedHookIndex === index) return;
    
    const newHooks = [...hooks];
    const draggedHook = newHooks[draggedHookIndex];
    newHooks.splice(draggedHookIndex, 1);
    newHooks.splice(index, 0, draggedHook);
    setHooks(newHooks);
    setDraggedHookIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedHookIndex(null);
  };

  // Toggle art direction selection (multi-select)
  const toggleArtDirection = (direction: string) => {
    setArtDirections(prev => 
      prev.includes(direction)
        ? prev.filter(d => d !== direction)
        : [...prev, direction]
    );
  };

  // Submit feedback
  const submitFeedback = async () => {
    if (!item || !feedbackType) return;
    
    const feedbackData = {
      ideaId: item.id,
      ideaTitle: item.title,
      feedbackType,
      feedbackText,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Feedback submitted:', feedbackData);
    // TODO: Send to API endpoint for storage
    
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackType(null);
      setFeedbackText('');
    }, 3000);
  };

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

  // Fetch OG image with fallback - prioritize source thumbnails over Pexels
  useEffect(() => {
    if (item) {
      // Set fallback first
      setOgImage(FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES['short-form']);
      
      // Try to fetch thumbnails from sources
      if (item.sources && item.sources.length > 0) {
        const fetchImages = async () => {
          // Try first 3 sources for OG images
          for (const source of item.sources.slice(0, 3)) {
            try {
              const response = await fetch(`/api/og-image?url=${encodeURIComponent(source.url)}`);
              if (response.ok) {
                const data = await response.json();
                if (data.image) {
                  setOgImage(data.image);
                  return; // Stop on first successful image
                }
              }
            } catch {
              // Continue to next source
            }
          }
          
          // Fallback to Pexels only if no source thumbnails found
          if (item.pexelsImageUrl) {
            setOgImage(item.pexelsImageUrl);
          }
        };
        fetchImages();
      } else if (item.pexelsImageUrl) {
        // Use Pexels as last resort if no sources available
        setOgImage(item.pexelsImageUrl);
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
                    {decodeHTMLEntities(item.title)}
                  </h1>

                  {/* Brief Description Preview */}
                  <p className="text-sm md:text-base text-brand-vanilla/80 line-clamp-2 max-w-2xl">
                    {decodeHTMLEntities(item.description)}
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
                  {decodeHTMLEntities(item.description)}
                </p>

                {/* Hook Ideas - Only show if available */}
                {hooks && hooks.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-display font-semibold text-brand-vanilla mb-4">
                      Hook Ideas
                    </h2>
                    <div className="space-y-3">
                      {hooks.map((hook, idx) => (
                        <div 
                          key={idx}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          className={`group flex items-center gap-3 p-4 rounded-xl bg-os-surface-dark/60 border border-os-border-dark/50 hover:border-os-border-dark transition-all cursor-move ${
                            draggedHookIndex === idx ? 'opacity-50' : ''
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-os-text-secondary-dark/50 group-hover:text-os-text-secondary-dark flex-shrink-0" />
                          <div className="w-6 h-6 rounded-full bg-brand-aperol/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-brand-aperol">{idx + 1}</span>
                          </div>
                          <p className="flex-1 text-[15px] text-brand-vanilla font-medium leading-relaxed">
                            {hook}
                          </p>
                          <button
                            onClick={() => copyHook(hook, idx)}
                            className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                              copiedHookIndex === idx
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-os-surface-dark hover:bg-os-charcoal text-os-text-secondary-dark hover:text-brand-vanilla'
                            }`}
                            title="Copy hook"
                          >
                            {copiedHookIndex === idx ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Platform Tips - Only show if available */}
                {item.platformTips && item.platformTips.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-display font-semibold text-brand-vanilla mb-4">
                      Platform Tips
                    </h2>
                    
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
                    
                    {/* Tips for active platform - Collapsible */}
                    {activePlatform && (
                      <div className="space-y-2">
                        {item.platformTips
                          .find(pt => pt.platform === activePlatform)
                          ?.tips.map((tip, idx) => {
                            const isExpanded = expandedPlatformTip === idx;
                            const enhanced = enhancePlatformTip(tip, activePlatform, item.title, item.description);
                            
                            return (
                              <div 
                                key={idx}
                                className="rounded-lg bg-os-surface-dark/40 border border-os-border-dark/50 overflow-hidden"
                              >
                                <button
                                  onClick={() => setExpandedPlatformTip(isExpanded ? null : idx)}
                                  className="w-full flex items-start gap-3 p-3 text-left hover:bg-os-surface-dark/60 transition-colors"
                                >
                                  <ChevronRight className={`w-4 h-4 text-brand-aperol flex-shrink-0 mt-0.5 transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`} />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-brand-vanilla">{enhanced.quickTip}</p>
                                  </div>
                                  <ChevronDown className={`w-4 h-4 text-os-text-secondary-dark flex-shrink-0 mt-0.5 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`} />
                                </button>
                                
                                {isExpanded && (
                                  <div className="px-3 pb-3 pl-10">
                                    <div className="pt-2 border-t border-os-border-dark/30">
                                      <p className="text-sm text-os-text-primary-dark/80 leading-relaxed mb-3">
                                        {enhanced.detailedExplanation}
                                      </p>
                                      <div className="p-3 rounded-lg bg-os-charcoal/40 border border-os-border-dark/30">
                                        <p className="text-xs font-mono text-os-text-secondary-dark mb-1.5">Example:</p>
                                        <p className="text-sm text-brand-vanilla/90 italic">
                                          {enhanced.example}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {/* Visual Concepts - Prompt Generator */}
                {item.visualDirection && (
                  <div className="mb-8">
                    <h2 className="text-lg font-display font-semibold text-brand-vanilla mb-4">
                      Visual Concepts
                    </h2>
                    
                    {/* Configuration Tools */}
                    <div className="mb-4 p-4 rounded-xl bg-os-surface-dark/60 border border-os-border-dark/50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-os-text-secondary-dark mb-1.5">Aspect Ratio</label>
                          <select 
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-os-charcoal border border-os-border-dark/50 text-sm text-brand-vanilla focus:border-os-border-dark focus:outline-none"
                          >
                            <option>16:9</option>
                            <option>9:16</option>
                            <option>1:1</option>
                            <option>4:5</option>
                            <option>21:9</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-os-text-secondary-dark mb-1.5">Setting</label>
                          <select 
                            value={setting}
                            onChange={(e) => setSetting(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-os-charcoal border border-os-border-dark/50 text-sm text-brand-vanilla focus:border-os-border-dark focus:outline-none"
                          >
                            <option>Any</option>
                            <option>Studio</option>
                            <option>Natural</option>
                            <option>Urban</option>
                            <option>Abstract</option>
                            <option>Minimalist</option>
                          </select>
                        </div>
                        
                        <div className="relative">
                          <label className="block text-xs font-medium text-os-text-secondary-dark mb-1.5">Art Direction</label>
                          <div className="relative">
                            <button
                              onClick={() => setArtDirectionDropdownOpen(!artDirectionDropdownOpen)}
                              className="w-full px-3 py-2 rounded-lg bg-os-charcoal border border-os-border-dark/50 text-sm text-brand-vanilla text-left focus:border-os-border-dark focus:outline-none flex items-center justify-between"
                            >
                              <span className="truncate">
                                {artDirections.length > 0 ? `${artDirections.length} selected` : 'Select territory'}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-os-text-secondary-dark transition-transform ${artDirectionDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {artDirectionDropdownOpen && (
                              <>
                                {/* Backdrop to close dropdown */}
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setArtDirectionDropdownOpen(false)}
                                />
                                <div className="absolute z-20 w-64 mt-1 rounded-lg bg-[#1a1a1a] border border-os-border-dark shadow-xl overflow-hidden">
                                  {[
                                    { id: 'Auto', label: 'Auto', desc: 'Performance & Precision' },
                                    { id: 'Lifestyle', label: 'Lifestyle', desc: 'Human Connection' },
                                    { id: 'Move', label: 'Move', desc: 'Dynamic Energy' },
                                    { id: 'Escape', label: 'Escape', desc: 'Wanderlust & Solitude' },
                                    { id: 'Work', label: 'Work', desc: 'Design Transformation' },
                                    { id: 'Feel', label: 'Feel', desc: 'Atmospheric Abstraction' },
                                  ].map(territory => (
                                    <div
                                      key={territory.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleArtDirection(territory.id);
                                      }}
                                      className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors border-b border-os-border-dark/30 last:border-b-0 ${
                                        artDirections.includes(territory.id)
                                          ? 'bg-os-surface-dark'
                                          : 'hover:bg-os-surface-dark/60'
                                      }`}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-brand-vanilla font-medium">{territory.label}</p>
                                        <p className="text-xs text-os-text-secondary-dark">{territory.desc}</p>
                                      </div>
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ml-3 ${
                                        artDirections.includes(territory.id)
                                          ? 'bg-brand-vanilla border-brand-vanilla'
                                          : 'border-os-border-dark'
                                      }`}>
                                        {artDirections.includes(territory.id) && (
                                          <Check className="w-3.5 h-3.5 text-os-charcoal" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-os-text-secondary-dark mb-1.5">Model</label>
                          <select 
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-os-charcoal border border-os-border-dark/50 text-sm text-brand-vanilla focus:border-os-border-dark focus:outline-none"
                          >
                            <option>Midjourney</option>
                            <option>DALL-E 3</option>
                            <option>Stable Diffusion</option>
                            <option>Runway Gen-3</option>
                            <option>SORA</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Prompt Ideas */}
                    <div className="space-y-3">
                      {(() => {
                        const baseTitle = decodeHTMLEntities(item.title);
                        
                        // Territory-specific visual language (from brand art direction)
                        const territoryStyles: Record<string, { visual: string; lighting: string; mood: string; keywords: string[] }> = {
                          'Auto': {
                            visual: 'high-contrast automotive photography with dramatic reflections',
                            lighting: 'studio lighting with film grain and modern grit',
                            mood: 'premium sophistication, technical precision',
                            keywords: ['Precision', 'Technical', 'Premium']
                          },
                          'Lifestyle': {
                            visual: 'authentic portraiture with fashion-forward composition',
                            lighting: 'natural flattering light with warm tones',
                            mood: 'genuine human connection, diverse representation',
                            keywords: ['Authentic', 'Human', 'Fashion']
                          },
                          'Move': {
                            visual: 'dynamic motion blur with kinetic energy',
                            lighting: 'action photography with dramatic angles',
                            mood: 'athletic vitality, energetic movement',
                            keywords: ['Dynamic', 'Energy', 'Motion']
                          },
                          'Escape': {
                            visual: 'environmental portraiture with vast landscapes',
                            lighting: 'golden hour or blue hour natural light',
                            mood: 'contemplative wanderlust, solitary figure in open space',
                            keywords: ['Wanderlust', 'Contemplative', 'Natural']
                          },
                          'Work': {
                            visual: 'clean data visualization and transformation showcase',
                            lighting: 'professional studio with modern aesthetics',
                            mood: 'innovation process, before/after revelation',
                            keywords: ['Innovation', 'Transformation', 'Process']
                          },
                          'Feel': {
                            visual: 'textural abstraction with organic color gradients',
                            lighting: 'soft diffused light with bokeh effects',
                            mood: 'atmospheric emotion, mood over message',
                            keywords: ['Atmospheric', 'Textural', 'Mood']
                          },
                        };
                        
                        // Setting-specific environments
                        const settingStyles: Record<string, string> = {
                          'Any': '',
                          'Studio': 'in a controlled studio environment with professional backdrop',
                          'Natural': 'in natural outdoor environment with organic elements',
                          'Urban': 'in urban cityscape with architectural elements and street textures',
                          'Abstract': 'in abstract void space with geometric forms',
                          'Minimalist': 'in clean minimalist space with negative space emphasis',
                        };
                        
                        // Model-specific prompt structures
                        const buildPromptForModel = (model: string, core: string, ar: string, style: 'editorial' | 'conceptual' | 'cinematic') => {
                          const arValue = ar.replace(':', ':');
                          
                          if (model === 'Midjourney') {
                            const styleParams = {
                              editorial: `--ar ${arValue} --style raw --stylize 200`,
                              conceptual: `--ar ${arValue} --v 6.0 --stylize 100`,
                              cinematic: `--ar ${arValue} --style raw --stylize 400 --chaos 15`,
                            };
                            return `${core} ${styleParams[style]}`;
                          } else if (model === 'DALL-E 3') {
                            const qualityHint = style === 'cinematic' ? 'I NEED this to be photorealistic and cinematic. ' : '';
                            return `${qualityHint}${core} Aspect ratio ${arValue}.`;
                          } else if (model === 'Stable Diffusion') {
                            const qualityTags = {
                              editorial: 'masterpiece, best quality, professional photography, 8k uhd',
                              conceptual: 'digital art, conceptual, clean design, sharp focus',
                              cinematic: 'cinematic still, film grain, anamorphic, color graded',
                            };
                            return `${core}, ${qualityTags[style]}, aspect ratio ${arValue}`;
                          } else if (model === 'Runway Gen-3' || model === 'SORA') {
                            return `${core}. Cinematic quality, smooth motion, professional lighting. Duration: 4 seconds. Aspect ratio: ${arValue}.`;
                          }
                          return core;
                        };
                        
                        // Build visual description from selections
                        const selectedTerritories = artDirections.length > 0 ? artDirections : ['Work'];
                        const primaryTerritory = territoryStyles[selectedTerritories[0]];
                        const settingDesc = settingStyles[setting];
                        
                        // Combine territory visuals
                        const combinedVisual = selectedTerritories
                          .map(t => territoryStyles[t]?.visual)
                          .filter(Boolean)
                          .join(', blending ');
                        
                        const combinedMood = selectedTerritories
                          .map(t => territoryStyles[t]?.mood)
                          .filter(Boolean)
                          .join(' with ');
                        
                        const combinedKeywords = selectedTerritories
                          .flatMap(t => territoryStyles[t]?.keywords || [])
                          .slice(0, 4);
                        
                        // Generate 3 distinct prompts
                        const prompts = [
                          {
                            label: 'Editorial',
                            themes: combinedKeywords.slice(0, 3),
                            prompt: buildPromptForModel(
                              selectedModel,
                              `${combinedVisual} ${settingDesc}. Subject: "${baseTitle}". ${primaryTerritory?.lighting}. Mood: ${combinedMood}. Brand palette: warm vanilla (#FFFAEE), deep charcoal (#191919), aperol accent (#FE5102).`,
                              aspectRatio,
                              'editorial'
                            ),
                          },
                          {
                            label: 'Conceptual',
                            themes: ['Symbolic', 'Layered', 'Narrative'],
                            prompt: buildPromptForModel(
                              selectedModel,
                              `Conceptual visual metaphor representing "${baseTitle}" ${settingDesc}. ${combinedVisual}. Symbolic composition with layered meaning. ${combinedMood}. Film-inspired color grading with subtle grain.`,
                              aspectRatio,
                              'conceptual'
                            ),
                          },
                          {
                            label: 'Cinematic',
                            themes: ['Dramatic', 'Immersive', 'Story'],
                            prompt: buildPromptForModel(
                              selectedModel,
                              `Cinematic wide shot ${settingDesc} capturing the essence of "${baseTitle}". ${combinedVisual}. Dramatic ${primaryTerritory?.lighting}. Anamorphic lens flare, shallow depth of field. ${combinedMood}.`,
                              aspectRatio,
                              'cinematic'
                            ),
                          },
                        ];
                        
                        return prompts.map((concept, idx) => (
                          <div 
                            key={idx}
                            className="group p-4 rounded-xl bg-os-surface-dark/60 border border-os-border-dark/50 hover:border-os-border-dark transition-all"
                          >
                            <p className="text-sm text-os-text-primary-dark/90 leading-relaxed font-mono bg-os-charcoal/40 p-3 rounded-lg border border-os-border-dark/30 mb-3">
                              {concept.prompt}
                            </p>
                            
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                {concept.themes.map(theme => (
                                  <span 
                                    key={theme}
                                    className="px-2.5 py-1 rounded-md bg-os-surface-dark/60 border border-os-border-dark/30 text-xs text-os-text-secondary-dark"
                                  >
                                    {theme}
                                  </span>
                                ))}
                              </div>
                              
                              <button
                                onClick={async () => {
                                  await navigator.clipboard.writeText(concept.prompt);
                                  setCopiedPromptIndex(idx);
                                  setTimeout(() => setCopiedPromptIndex(null), 2000);
                                }}
                                className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                  copiedPromptIndex === idx
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-os-surface-dark/60 hover:bg-os-surface-dark text-os-text-secondary-dark hover:text-brand-vanilla border border-os-border-dark/30'
                                }`}
                              >
                                {copiedPromptIndex === idx ? (
                                  <span className="flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Copied
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Copy className="w-3 h-3" />
                                    Copy
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Information Architecture - Only show if available */}
                {item.exampleOutline && item.exampleOutline.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-display font-semibold text-brand-vanilla mb-4">
                      Information Architecture
                    </h2>
                    
                    <div className="space-y-2">
                      {item.exampleOutline.map((section, idx) => {
                        // Remove redundant "Section X:" prefix if present
                        const cleanedSection = section.replace(/^Section\s+\d+:\s*/i, '');
                        
                        return (
                          <div 
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-lg bg-os-surface-dark/40 hover:bg-os-surface-dark/60 transition-colors"
                          >
                            <div className="w-6 h-6 rounded bg-brand-aperol/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-brand-aperol">{idx + 1}</span>
                            </div>
                            <p className="text-sm text-brand-vanilla font-medium leading-relaxed">{cleanedSection}</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 p-3 rounded-lg bg-os-charcoal/40 border border-os-border-dark/30">
                      <p className="text-xs text-os-text-secondary-dark">
                        <span className="font-semibold text-brand-aperol">Tip:</span> Use this structure as a starting framework. Adapt sections based on your content goals and audience needs.
                      </p>
                    </div>
                  </div>
                )}

                {/* Hashtags - Only show if available */}
                {item.hashtags && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-display font-semibold text-brand-vanilla">
                        Hashtags
                      </h2>
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

                {/* Source Cards - Using discover article style */}
                <div className="mb-10">
                  <h2 className="text-sm font-semibold text-brand-vanilla mb-3 uppercase tracking-wide">
                    Reference Sources
                  </h2>
                  
                  {item.sources && item.sources.length > 0 && (
                    <>
                      <SourceCards
                        sources={item.sources.map((source, idx) => ({
                          id: source.id || `source-${idx}`,
                          name: source.name,
                          url: source.url,
                          title: item.title,
                          favicon: undefined, // Will be fetched by SourceCards component
                        }))}
                        totalCount={item.sources.length}
                        onViewAllSources={() => setShowAllSources(true)}
                      />
                      
                      {/* If few sources, show as simple links */}
                      {item.sources.length <= 4 && (
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
                      )}
                    </>
                  )}
                </div>

                {/* Feedback Section */}
                <div className="mb-8 pt-8 border-t border-os-border-dark/30">
                  <h2 className="text-lg font-display font-semibold text-brand-vanilla mb-4">
                    Help Us Improve
                  </h2>
                  
                  <p className="text-sm text-os-text-secondary-dark mb-4">
                    Your feedback helps us curate better ideas for creators like you.
                  </p>
                  
                  <div className="p-4 rounded-xl bg-os-surface-dark/60 border border-os-border-dark/50">
                    {/* Thumbs Up/Down */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm text-os-text-secondary-dark">Rate this idea:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFeedbackType(feedbackType === 'up' ? null : 'up')}
                          className={`p-2.5 rounded-lg transition-all ${
                            feedbackType === 'up'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-os-surface-dark/60 text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark border border-os-border-dark/50'
                          }`}
                          title="Like this idea"
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => setFeedbackType(feedbackType === 'down' ? null : 'down')}
                          className={`p-2.5 rounded-lg transition-all ${
                            feedbackType === 'down'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-os-surface-dark/60 text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark border border-os-border-dark/50'
                          }`}
                          title="Dislike this idea"
                        >
                          <ThumbsDown className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Feedback Text */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-os-text-secondary-dark mb-2">
                        {feedbackType === 'up' ? 'What do you like about this idea?' : feedbackType === 'down' ? 'What could be improved?' : 'Tell us more (optional)'}
                      </label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-os-charcoal border border-os-border-dark/50 text-sm text-brand-vanilla placeholder-os-text-secondary-dark/50 focus:border-os-border-dark focus:outline-none resize-none"
                      />
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      onClick={submitFeedback}
                      disabled={!feedbackType || feedbackSubmitted}
                      className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        feedbackSubmitted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : feedbackType
                          ? 'bg-os-charcoal border border-os-border-dark hover:bg-os-surface-dark text-brand-vanilla'
                          : 'bg-os-surface-dark/40 border border-os-border-dark/30 text-os-text-secondary-dark/50 cursor-not-allowed'
                      }`}
                    >
                      {feedbackSubmitted ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          Thank you for your feedback!
                        </span>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
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
