'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Video,
  FileText,
  Pen,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Play,
  BookOpen,
  Palette,
  Clock
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
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

// Helper to generate consistent IDs
function generateId(title: string, category: string, index: number): string {
  return `${category}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30)}-${index}`;
}

// Generate slug from title
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Process raw inspiration data and add IDs
function processInspirationData(
  data: { ideas: Array<{ title: string; description: string; starred?: boolean; sources: Array<{ name: string; url: string }> }> },
  category: string
): InspirationCardData[] {
  return data.ideas.map((idea, index) => ({
    id: generateId(idea.title, category, index),
    title: idea.title,
    description: idea.description,
    slug: generateSlugFromTitle(idea.title),
    category: category as 'short-form' | 'long-form' | 'blog',
    starred: idea.starred || false,
    sources: idea.sources.map((source, sourceIndex) => ({
      id: `${category}-source-${index}-${sourceIndex}`,
      name: source.name,
      url: source.url,
    })),
    isPrompt: true,
  }));
}

// Fetch inspiration item from all categories
async function fetchInspirationItem(id: string): Promise<InspirationCardData | null> {
  try {
    const categories = ['short-form', 'long-form', 'blog'] as const;
    
    for (const category of categories) {
      const response = await fetch(`/data/weekly-ideas/${category}/latest.json`);
      if (response.ok) {
        const data = await response.json();
        const processedItems = processInspirationData(data, category);
        const found = processedItems.find(item => item.id === id);
        if (found) return found;
      }
    }
  } catch (error) {
    console.error('Error fetching inspiration item:', error);
  }
  return null;
}

export default function InspirationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<InspirationCardData | null>(null);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingType, setGeneratingType] = useState<GenerationType | null>(null);

  const id = searchParams.get('id');
  const slug = params.slug as string;

  // Fetch inspiration item
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchInspirationItem(id).then(data => {
        setItem(data);
        setLoading(false);
      });
    }
  }, [id]);

  // Fetch OG image
  useEffect(() => {
    if (item && item.sources && item.sources.length > 0) {
      const firstSourceUrl = item.sources[0].url;
      const fetchOgImage = async () => {
        try {
          const response = await fetch(`/api/og-image?url=${encodeURIComponent(firstSourceUrl)}`);
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
  }, [item]);

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
    const params = new URLSearchParams({
      q: prompt,
      inspirationTitle: item.title,
      inspirationCategory: item.category,
      inspirationDescription: item.description,
    });
    router.push(`/?${params.toString()}`);
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
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-aperol/30 border-t-brand-aperol rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-screen bg-os-bg-dark">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="text-os-text-secondary-dark mb-4">Inspiration item not found</p>
          <Link
            href="/discover?tab=Inspiration"
            className="text-brand-aperol hover:underline"
          >
            Back to Inspiration
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Hero Section */}
          <div className="relative h-64 md:h-80 overflow-hidden">
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
              <div className="w-full h-full bg-gradient-to-br from-brand-aperol/20 to-os-surface-dark" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-os-bg-dark via-os-bg-dark/60 to-transparent" />

            {/* Back button */}
            <div className="absolute top-4 left-4 z-10">
              <Link
                href="/discover?tab=Inspiration"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-os-bg-dark/80 backdrop-blur-sm text-brand-vanilla text-sm hover:bg-os-surface-dark transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-12">
            {/* Category badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-os-surface-dark text-os-text-secondary-dark text-sm">
                <CategoryIcon className="w-4 h-4" />
                {getCategoryLabel()}
              </span>
              <span className="text-sm text-os-text-secondary-dark">
                {item.sources.length} reference sources
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-vanilla mb-4">
              {item.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-os-text-secondary-dark leading-relaxed mb-8">
              {item.description}
            </p>

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

            {/* Generation Options */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-brand-vanilla mb-2">
                Generate Content
              </h2>
              <p className="text-sm text-os-text-secondary-dark mb-6">
                Choose a content format to generate a creative brief with AI assistance
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GENERATION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isGenerating = generatingType === option.id;
                  
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleGenerate(option)}
                      disabled={isGenerating}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        flex items-start gap-4 p-5 rounded-2xl border transition-all text-left
                        ${isGenerating 
                          ? 'bg-brand-aperol/10 border-brand-aperol/30 cursor-wait' 
                          : 'bg-os-surface-dark/50 border-os-border-dark/50 hover:border-brand-aperol/30 hover:bg-os-surface-dark'
                        }
                      `}
                    >
                      {/* Icon */}
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${option.color}20` }}
                      >
                        <span style={{ color: option.color }}>
                          <Icon className="w-6 h-6" />
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-brand-vanilla mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-os-text-secondary-dark">
                          {option.description}
                        </p>
                      </div>

                      {/* Arrow / Loading */}
                      <div className="flex-shrink-0 mt-1">
                        {isGenerating ? (
                          <div className="w-5 h-5 border-2 border-brand-aperol/30 border-t-brand-aperol rounded-full animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-os-text-secondary-dark" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Quick Generate - all formats at once */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-aperol/10 to-transparent border border-brand-aperol/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-aperol/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-brand-aperol" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-brand-vanilla mb-1">
                    Need all formats?
                  </h3>
                  <p className="text-sm text-os-text-secondary-dark">
                    Generate a comprehensive brief covering all content types at once
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!item) return;
                    const sourceUrls = item.sources.map(s => `- ${s.name}: ${s.url}`).join('\n');
                    const prompt = `Create a comprehensive content strategy for the following idea, covering all formats:

**Title:** ${item.title}

**Description:** ${item.description}

**Reference Sources:**
${sourceUrls}

Please provide:

## Short-Form Video Script
- Hook and core message (30-60 seconds)
- Key visual moments

## Long-Form Content Outline  
- Chapter breakdown
- Key talking points

## Blog Article Structure
- SEO-optimized outline
- Key takeaways

## Visual/Creative Concepts
- Design recommendations
- Brand alignment notes`;

                    const params = new URLSearchParams({
                      q: prompt,
                      inspirationTitle: item.title,
                      inspirationCategory: item.category,
                      inspirationDescription: item.description,
                    });
                    router.push(`/?${params.toString()}`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-aperol text-white text-sm font-medium hover:bg-brand-aperol/90 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate All
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

