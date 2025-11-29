'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { NEWS_ITEMS } from '@/lib/mock-data';
import { Sidebar } from '@/components/Sidebar';
import { StickyArticleHeader } from '@/components/discover/article/StickyArticleHeader';
import { ArticleHeader } from '@/components/discover/article/ArticleHeader';
import { ArticleSummary } from '@/components/discover/article/ArticleSummary';
import { SourceCards } from '@/components/discover/article/SourceCards';
import { ArticleSidebar } from '@/components/discover/article/ArticleSidebar';
import { AskFollowUp } from '@/components/discover/article/AskFollowUp';
import { DiscoverMore } from '@/components/discover/article/DiscoverMore';
import {
  Source,
  NewsData,
  InspirationData,
  ArticleSection,
  ParagraphSource,
  EnrichedArticleData,
} from '@/types';

interface ArticleData {
  title: string;
  summary: string;
  content: string[];
  sources: Source[];
  publishedAt: string;
  imageUrl?: string;
  summaryPoints?: string[];
  category?: string;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // Single loading state - page shows loading until ALL content is ready
  const [isLoading, setIsLoading] = useState(true);
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [enrichedSections, setEnrichedSections] = useState<ArticleSection[] | null>(null);
  const [enrichedSources, setEnrichedSources] = useState<ParagraphSource[]>([]);
  const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
  const [ogImage, setOgImage] = useState<string | null>(null);

  // Load everything at once
  useEffect(() => {
    const loadAllContent = async () => {
      setIsLoading(true);

      // Step 1: Load base article data
      const baseData = await loadBaseArticleData(slug);
      
      if (!baseData) {
        setArticleData(null);
        setIsLoading(false);
        return;
      }

      setArticleData(baseData.article);
      setOgImage(baseData.article.imageUrl || null);

      // Step 2: Fetch OG image if needed (in parallel with enrichment)
      const ogImagePromise = baseData.article.imageUrl 
        ? Promise.resolve(baseData.article.imageUrl)
        : fetchOgImage(baseData.article.sources[0]?.url);

      // Step 3: Enrich with Perplexity (in parallel)
      const enrichPromise = enrichArticle(baseData.article.title, baseData.article.sources);

      // Wait for both to complete
      const [fetchedOgImage, enrichedData] = await Promise.all([
        ogImagePromise,
        enrichPromise,
      ]);

      if (fetchedOgImage) {
        setOgImage(fetchedOgImage);
      }

      if (enrichedData) {
        setEnrichedSections(enrichedData.sections);
        // Merge enriched sources with existing sources for more coverage
        const mergedSources = [...enrichedData.allSources];
        baseData.article.sources.forEach((s) => {
          if (!mergedSources.find((ms) => ms.url === s.url)) {
            mergedSources.push({
              id: s.id,
              name: s.name,
              url: s.url,
              favicon: `https://www.google.com/s2/favicons?domain=${new URL(s.url).hostname}&sz=32`,
            });
          }
        });
        setEnrichedSources(mergedSources);
        setRelatedQueries(enrichedData.relatedQueries);
      }

      setIsLoading(false);
    };

    loadAllContent();
  }, [slug]);

  // Generate summary points from enriched sections
  const getSummaryPoints = (): string[] => {
    if (enrichedSections && enrichedSections.length > 0) {
      return enrichedSections
        .filter((s) => s.title)
        .map((s) => s.title!)
        .slice(0, 4);
    }
    return articleData?.summaryPoints || [];
  };

  // Get all sources for SourceCards
  const getAllSources = (): Source[] => {
    if (enrichedSources.length > 0) {
      return enrichedSources.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        logo: s.favicon,
      }));
    }
    return articleData?.sources || [];
  };

  // Loading state - single loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-os-text-secondary-dark border-t-[#20B2AA] rounded-full animate-spin" />
            <p className="text-sm text-os-text-secondary-dark">Loading article...</p>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (!articleData) {
    return (
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-brand-vanilla mb-4">
            Article Not Found
          </h1>
          <p className="text-os-text-secondary-dark mb-6">
            We couldn't find the article you're looking for.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-aperol text-white rounded-lg hover:bg-brand-aperol/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Header - Title fades in when scrolled past main title */}
        <StickyArticleHeader title={articleData.title} titleRef={titleRef} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-4xl mx-auto px-6 py-8 md:px-12 md:py-12">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Article Header with ref for scroll tracking */}
                <div className="flex flex-col gap-4 mb-8">
                  <h1 
                    ref={titleRef}
                    className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-brand-vanilla leading-tight"
                  >
                    {articleData.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-os-text-secondary-dark">
                    <span className="flex items-center gap-1.5">
                      Published {articleData.publishedAt}
                    </span>
                    <span className="text-os-border-dark">•</span>
                    <span>{getAllSources().length} {getAllSources().length === 1 ? 'source' : 'sources'}</span>
                  </div>
                </div>

                {/* Article Content */}
                <ArticleSummary
                  sections={enrichedSections || undefined}
                  content={!enrichedSections ? articleData.content : undefined}
                  sources={!enrichedSections ? articleData.sources : undefined}
                  dividerImageUrl={ogImage || undefined}
                  imageAttribution={ogImage ? getDomainFromUrl(articleData.sources[0]?.url) : undefined}
                />

                {/* Source Cards */}
                <SourceCards sources={getAllSources()} />

                {/* Follow-up Input */}
                <AskFollowUp articleTitle={articleData.title} />

                {/* Discover More Section */}
                <DiscoverMore currentSlug={slug} relatedQueries={relatedQueries} />
              </div>

              {/* Right Sidebar - Summary Points */}
              <div className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-os-text-secondary-dark mb-4">
                    {enrichedSections ? 'Sections' : 'Quick Summary'}
                  </h3>
                  <ArticleSidebar summaryPoints={getSummaryPoints()} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper: Load base article data from mock/JSON files
async function loadBaseArticleData(slug: string): Promise<{ article: ArticleData } | null> {
  // First check mock data
  const mockItem = NEWS_ITEMS.find((i) => i.slug === slug);

  if (mockItem) {
    const sources: Source[] = mockItem.sources.map((s, idx) => ({
      id: s.id || `source-${idx}`,
      name: s.name,
      url: s.url,
      logo: s.logo,
    }));

    const summaryPoints = mockItem.content.slice(0, 3).map((p) => {
      const firstSentence = p.split('.')[0];
      return firstSentence.length > 100
        ? firstSentence.substring(0, 100) + '...'
        : firstSentence + '.';
    });

    return {
      article: {
        title: mockItem.title,
        summary: mockItem.summary,
        content: mockItem.content,
        sources,
        publishedAt: mockItem.publishedAt,
        imageUrl: mockItem.imageUrl,
        summaryPoints,
      },
    };
  }

  // Try JSON data files
  const newsTypes = ['weekly-update', 'monthly-outlook'];
  const inspirationTypes = ['short-form', 'long-form', 'blog'];

  // Try news data
  for (const type of newsTypes) {
    try {
      const response = await fetch(`/data/news/${type}/latest.json`);
      if (response.ok) {
        const data: NewsData = await response.json();
        if (data.updates) {
          for (const update of data.updates) {
            const itemSlug = update.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .substring(0, 50);

            if (itemSlug === slug) {
              const sources: Source[] = update.sources.map((s, idx) => ({
                id: `source-${idx}`,
                name: s.name,
                url: s.url,
              }));

              const content = generateContentFromTitle(update.title);
              const summaryPoints = content.slice(0, 3).map((p) => {
                const firstSentence = p.split('.')[0];
                return firstSentence.length > 80
                  ? firstSentence.substring(0, 80) + '...'
                  : firstSentence + '.';
              });

              return {
                article: {
                  title: update.title,
                  summary: update.title.substring(0, 200),
                  content,
                  sources,
                  publishedAt: formatTimestamp(update.timestamp),
                  summaryPoints,
                  category: type,
                },
              };
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error loading ${type} data:`, e);
    }
  }

  // Try inspiration data
  for (const type of inspirationTypes) {
    try {
      const response = await fetch(`/data/weekly-ideas/${type}/latest.json`);
      if (response.ok) {
        const data: InspirationData = await response.json();
        if (data.ideas) {
          for (const idea of data.ideas) {
            const itemSlug = idea.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .substring(0, 50);

            if (itemSlug === slug) {
              const sources: Source[] = idea.sources.map((s, idx) => ({
                id: `source-${idx}`,
                name: s.name,
                url: s.url,
              }));

              const content = generateContentFromTitle(idea.title, idea.description);
              const summaryPoints = content.slice(0, 3).map((p) => {
                const firstSentence = p.split('.')[0];
                return firstSentence.length > 80
                  ? firstSentence.substring(0, 80) + '...'
                  : firstSentence + '.';
              });

              return {
                article: {
                  title: idea.title,
                  summary: idea.description,
                  content,
                  sources,
                  publishedAt: formatTimestamp(data.date),
                  summaryPoints,
                  category: type,
                },
              };
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error loading ${type} data:`, e);
    }
  }

  return null;
}

// Helper: Fetch OG image from source URL
async function fetchOgImage(sourceUrl?: string): Promise<string | null> {
  if (!sourceUrl || sourceUrl === '#') return null;

  try {
    const response = await fetch(`/api/og-image?url=${encodeURIComponent(sourceUrl)}`);
    if (response.ok) {
      const data = await response.json();
      return data.image || null;
    }
  } catch (error) {
    console.error('Error fetching OG image:', error);
  }
  return null;
}

// Helper: Enrich article with Perplexity
async function enrichArticle(
  title: string,
  sources: Source[]
): Promise<EnrichedArticleData | null> {
  try {
    const response = await fetch('/api/article-enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        existingSources: sources.map((s) => ({ name: s.name, url: s.url })),
      }),
    });

    if (response.ok) {
      const data: EnrichedArticleData = await response.json();
      if (data.sections && data.sections.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error enriching article:', error);
  }
  return null;
}

// Helper: Generate content from title
function generateContentFromTitle(title: string, description?: string): string[] {
  const content: string[] = [];

  content.push(
    title +
      '. ' +
      (description || 'This article explores the latest developments and insights in this area.')
  );

  content.push(
    'Industry experts have been closely monitoring these developments, noting the potential implications for businesses and consumers alike. The trend reflects broader changes in how technology and design intersect with everyday experiences.'
  );

  content.push(
    "As this space continues to evolve, we can expect to see more innovations that push the boundaries of what's possible. Stay tuned for more updates as we continue to track these developments."
  );

  return content;
}

// Helper: Format timestamps
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  } catch {
    return timestamp;
  }
}

// Helper: Extract domain from URL
function getDomainFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return undefined;
  }
}
