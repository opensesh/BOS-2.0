'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Video,
  FileText,
  Pen,
  Sparkles,
  ExternalLink,
  BookOpen,
  Palette,
  Clock
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StickyArticleHeader } from '@/components/discover/article/StickyArticleHeader';
import { InspirationCardData } from '@/types';

// Generation option types
type GenerationType = 'short-form' | 'long-form' | 'blog' | 'creative';

interface GenerationOption {
  id: GenerationType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  prompt: string;
}

const GENERATION_OPTIONS: GenerationOption[] = [
  {
    id: 'short-form',
    title: 'Short-Form Video',
    description: 'Create a 30-60 second social media video script',
    icon: Video,
    color: '#FE5102',
    prompt: 'Create a short-form video script (30-60 seconds) with hook, content breakdown, and call-to-action',
  },
  {
    id: 'long-form',
    title: 'Long-Form Content',
    description: 'Generate an in-depth video or podcast outline',
    icon: FileText,
    color: '#8B5CF6',
    prompt: 'Create a comprehensive long-form content outline with chapters, key points, and talking notes',
  },
  {
    id: 'blog',
    title: 'Blog Article',
    description: 'Write a detailed blog post with SEO structure',
    icon: BookOpen,
    color: '#3B82F6',
    prompt: 'Write a detailed blog article outline with SEO-optimized structure, headings, and key takeaways',
  },
  {
    id: 'creative',
    title: 'Visual/Creative',
    description: 'Design concepts for images, carousels, or graphics',
    icon: Palette,
    color: '#10B981',
    prompt: 'Create visual design recommendations including color palette, composition, typography, and imagery suggestions',
  },
];

// Helper to generate consistent IDs - matches discover-utils.ts format
function generateId(category: string, index: number): string {
  return `inspiration-${category}-${index}`;
}

// Generate slug from title
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Process raw inspiration data and add IDs - matches discover-utils.ts format
function processInspirationData(
  data: { ideas: Array<{ title: string; description: string; starred?: boolean; sources: Array<{ name: string; url: string }> }> },
  category: string
): InspirationCardData[] {
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
  }));
}

// Fetch inspiration item from all categories - with ID and slug fallback
async function fetchInspirationItem(id: string | null, slug: string): Promise<InspirationCardData | null> {
  try {
    const categories = ['short-form', 'long-form', 'blog'] as const;
    
    for (const category of categories) {
      const response = await fetch(`/data/weekly-ideas/${category}/latest.json`);
      if (response.ok) {
        const data = await response.json();
        const processedItems = processInspirationData(data, category);
        
        // First try to find by ID
        if (id) {
          const foundById = processedItems.find(item => item.id === id);
          if (foundById) return foundById;
        }
        
        // Fallback: find by slug
        const foundBySlug = processedItems.find(item => item.slug === slug);
        if (foundBySlug) return foundBySlug;
      }
    }
  } catch (error) {
    console.error('Error fetching inspiration item:', error);
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
async function generateConceptBrief(item: InspirationCardData): Promise<string> {
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
      // Try to parse as JSON first
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
  
  // Fallback brief
  return `This content idea explores "${item.title}" - a timely topic that offers creative potential across multiple formats. The concept draws from ${item.sources.length} source${item.sources.length > 1 ? 's' : ''}, providing a solid foundation for research and development. Consider the unique angles this topic offers and how it might resonate with your target audience.`;
}

export default function InspirationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [item, setItem] = useState<InspirationCardData | null>(null);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingType, setGeneratingType] = useState<GenerationType | null>(null);
  const [conceptBrief, setConceptBrief] = useState<string | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);

  const id = searchParams.get('id');
  const slug = params.slug as string;

  // Fetch inspiration item - by ID or slug fallback
  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetchInspirationItem(id, slug).then(data => {
        setItem(data);
        setLoading(false);
      });
    }
  }, [id, slug]);

  // Fetch OG image with fallback
  useEffect(() => {
    if (item) {
      // Set fallback immediately
      setOgImage(FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES['short-form']);
      
      if (item.sources && item.sources.length > 0) {
        // Try to fetch OG image
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
            } catch (error) {
              // Continue to next source
            }
          }
        };
        
        fetchImages();
      }
    }
  }, [item]);

  // Generate concept brief (non-streaming)
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
    setGeneratingType(option.id);

    const sourceUrls = item.sources.map(s => `- ${s.name}: ${s.url}`).join('\n');
    const categoryLabel = item.category === 'short-form' ? 'Short Form' : 
                          item.category === 'long-form' ? 'Long Form' : 'Blog';

    const prompt = `${option.prompt} for the following content idea:

**Title:** ${item.title}

**Original Format:** ${categoryLabel}

**Description:** ${item.description}

**Reference Sources:**
${sourceUrls}

Please provide a comprehensive creative brief with:
1. Refined concept and hook
2. Key talking points and structure
3. Visual/aesthetic recommendations aligned with OPEN SESSION brand
4. Call-to-action suggestions`;

    // Navigate to chat with context
    const urlParams = new URLSearchParams({
      q: prompt,
      inspirationTitle: item.title,
      inspirationCategory: item.category,
      inspirationDescription: item.description,
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

  const CategoryIcon = getCategoryIcon();

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
        {/* Sticky Header - same as discover articles */}
        <StickyArticleHeader
          title={item.title}
          titleRef={titleRef}
          backLink="/discover?tab=Ideas"
          backLabel="Ideas"
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-5xl mx-auto px-6 py-8 md:px-12 md:py-12">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Category and sources count */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-os-surface-dark text-os-text-secondary-dark text-sm">
                    <CategoryIcon className="w-4 h-4" />
                    {getCategoryLabel()}
                  </span>
                  <span className="text-sm text-os-text-secondary-dark flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {item.sources.length} reference sources
                  </span>
                </div>

                {/* Title */}
                <h1 
                  ref={titleRef}
                  className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-brand-vanilla mb-6"
                >
                  {item.title}
                </h1>

                {/* Hero Image - smaller, like discover articles */}
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-os-surface-dark mb-6">
                  {ogImage && (
                    <Image
                      src={ogImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                      priority
                    />
                  )}
                </div>

                {/* Original Description */}
                <p className="text-[15px] leading-[1.75] text-os-text-primary-dark/90 mb-8">
                  {item.description}
                </p>

                {/* AI-Generated Concept Brief */}
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
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-os-surface-dark/60 border border-os-border-dark/50 hover:border-brand-aperol/30 text-sm text-os-text-secondary-dark hover:text-brand-vanilla transition-all group"
                      >
                        {source.name}
                        <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Generation Options */}
              <div className="lg:w-72 shrink-0">
                <div className="sticky top-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-os-text-secondary-dark mb-4">
                    Generate Content
                  </h3>
                  
                  <div className="flex flex-col gap-3">
                    {GENERATION_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isGenerating = generatingType === option.id;
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleGenerate(option)}
                          disabled={isGenerating}
                          className="group flex flex-col gap-2 p-3 bg-os-surface-dark/60 hover:bg-os-surface-dark rounded-xl border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${option.color}20` }}
                            >
                              <Icon className="w-4 h-4" style={{ color: option.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-brand-vanilla truncate">
                                {option.title}
                              </h4>
                            </div>
                            {isGenerating ? (
                              <div className="w-4 h-4 border-2 border-brand-aperol/30 border-t-brand-aperol rounded-full animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
                            )}
                          </div>
                          <p className="text-xs text-os-text-secondary-dark line-clamp-2">
                            {option.description}
                          </p>
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
