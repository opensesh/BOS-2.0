'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StickyArticleHeader } from '@/components/discover/article/StickyArticleHeader';
import { SourceCards } from '@/components/discover/article/SourceCards';
import { ArticleSidebar } from '@/components/discover/article/ArticleSidebar';
import { AskFollowUp } from '@/components/discover/article/AskFollowUp';
import { DiscoverMore } from '@/components/discover/article/DiscoverMore';
import { InlineSourceChips, SourceGroup } from '@/components/discover/article/InlineSourceBadge';
import type { DiscoverArticle, Source } from '@/types';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [article, setArticle] = useState<DiscoverArticle | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load article from pre-generated JSON (instant load)
  useEffect(() => {
    const loadArticle = async () => {
      setIsLoading(true);
      setNotFound(false);

      try {
        // Try to load pre-generated article JSON
        const response = await fetch(`/data/discover/articles/${slug}.json`);
        
        if (response.ok) {
          const data: DiscoverArticle = await response.json();
          setArticle(data);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('Pre-generated article not found, trying legacy sources...');
      }

      // Article not found in pre-generated data
      setNotFound(true);
      setIsLoading(false);
    };

    loadArticle();
  }, [slug]);

  // Get sources for SourceCards component
  const getSourcesForCards = (): Source[] => {
    if (!article) return [];
    return article.sourceCards.map(sc => ({
      id: sc.id,
      name: sc.name,
      url: sc.url,
      logo: sc.favicon,
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-os-text-secondary-dark border-t-brand-aperol rounded-full animate-spin" />
            <p className="text-sm text-os-text-secondary-dark">Loading article...</p>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (notFound || !article) {
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
        {/* Sticky Header */}
        <StickyArticleHeader title={article.title} titleRef={titleRef} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-4xl mx-auto px-6 py-8 md:px-12 md:py-12">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Article Header */}
                <div className="flex flex-col gap-4 mb-8">
                  <h1 
                    ref={titleRef}
                    className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-brand-vanilla leading-tight"
                  >
                    {article.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-os-text-secondary-dark">
                    <span className="flex items-center gap-1.5">
                      Published {formatTimestamp(article.publishedAt)}
                    </span>
                    <span className="text-os-border-dark">•</span>
                    <span>{article.totalSources} sources</span>
                  </div>
                </div>

                {/* Article Sections */}
                <div className="flex flex-col gap-8">
                  {article.sections.map((section, sectionIdx) => (
                    <section key={section.id} className="flex flex-col gap-5">
                      {/* Section sub-heading (h3, smaller size) */}
                      {section.title && (
                        <h3 className="text-lg md:text-xl font-display font-semibold text-brand-vanilla mt-4">
                          {section.title}
                        </h3>
                      )}

                      {/* Paragraphs with inline citations */}
                      {section.paragraphs.map((paragraph) => {
                        // Convert citations to SourceGroup format
                        const sourceGroups: SourceGroup[] = paragraph.citations.map(citation => ({
                          primarySource: {
                            id: citation.primarySource.id,
                            name: citation.primarySource.name,
                            url: citation.primarySource.url,
                            favicon: citation.primarySource.favicon,
                          },
                          additionalSources: citation.additionalSources.map(s => ({
                            id: s.id,
                            name: s.name,
                            url: s.url,
                            favicon: s.favicon,
                          })),
                          isVideo: citation.primarySource.url.includes('youtube.com') || 
                                   citation.primarySource.url.includes('youtu.be'),
                        }));

                        return (
                          <p 
                            key={paragraph.id} 
                            className="text-sm md:text-base leading-relaxed text-os-text-primary-dark/90"
                          >
                            {paragraph.content}
                            {sourceGroups.length > 0 && (
                              <InlineSourceChips sourceGroups={sourceGroups} />
                            )}
                          </p>
                        );
                      })}

                      {/* Hero image after intro section */}
                      {sectionIdx === 0 && article.heroImage && (
                        <div className="relative w-full my-4">
                          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-os-surface-dark">
                            <Image 
                              src={article.heroImage.url} 
                              alt={article.title}
                              fill 
                              className="object-cover" 
                              unoptimized 
                            />
                          </div>
                          {article.heroImage.attribution && (
                            <p className="text-xs text-os-text-secondary-dark mt-2 text-right font-mono">
                              {article.heroImage.attribution}
                            </p>
                          )}
                        </div>
                      )}
                    </section>
                  ))}
                </div>

                {/* Source Cards */}
                <SourceCards sources={getSourcesForCards()} totalCount={article.totalSources} />

                {/* Discover More Section */}
                <DiscoverMore 
                  currentSlug={slug} 
                  relatedArticles={article.relatedArticles} 
                />

                {/* Bottom padding for pinned chat input */}
                <div className="h-32" />
              </div>

              {/* Right Sidebar - Section Navigation */}
              <div className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-os-text-secondary-dark mb-4">
                    Sections
                  </h3>
                  <ArticleSidebar summaryPoints={article.sidebarSections} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Follow-up Chat Input */}
        <AskFollowUp 
          articleTitle={article.title} 
          articleSlug={slug}
          articleImage={article.heroImage?.url}
        />
      </main>
    </div>
  );
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
