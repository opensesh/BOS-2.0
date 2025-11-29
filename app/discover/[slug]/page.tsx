'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StickyArticleHeader } from '@/components/discover/article/StickyArticleHeader';
import { SourceCards } from '@/components/discover/article/SourceCards';
import { ArticleSidebar, generateSectionId } from '@/components/discover/article/ArticleSidebar';
import { AskFollowUp } from '@/components/discover/article/AskFollowUp';
import { DiscoverMore } from '@/components/discover/article/DiscoverMore';
import { InlineSourceChips, SourceGroup } from '@/components/discover/article/InlineSourceBadge';
import { SectionSourceBar } from '@/components/discover/article/SectionSourceBar';
import { SourcesDrawer } from '@/components/discover/article/SourcesDrawer';
import { AllSourcesDrawer } from '@/components/discover/article/AllSourcesDrawer';
import type { DiscoverArticle, DiscoverSection, CitationChip } from '@/types';

// Helper to create a simplified article from news/ideas data
function createSimplifiedArticle(
  slug: string,
  item: { 
    title: string; 
    description?: string; 
    timestamp?: string; 
    sources?: Array<{ name: string; url: string }>;
  }
): DiscoverArticle {
  const sources = item.sources || [];
  
  const getFavicon = (url: string) => {
    try {
      return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
    } catch {
      return '';
    }
  };
  
  // Generate structured sections from the description or create placeholder content
  const generateSections = () => {
    if (!item.description || item.description.trim().length < 50) {
      // For sparse content, create structured placeholder sections
      return [
        {
          id: 'section-overview',
          title: 'Overview',
          paragraphs: [{
            id: 'para-overview-0',
            content: item.description || `This article covers ${item.title}. Click on the source links below to read the full coverage from the original publishers.`,
            citations: sources.length > 0 ? [{
              primarySource: {
                id: 'source-0',
                name: sources[0].name,
                url: sources[0].url,
                favicon: getFavicon(sources[0].url),
                title: item.title,
              },
              additionalCount: Math.max(0, sources.length - 1),
              additionalSources: sources.slice(1).map((s, i) => ({
                id: `source-${i + 1}`,
                name: s.name,
                url: s.url,
                favicon: getFavicon(s.url),
                title: item.title,
              })),
            }] : [],
          }],
        },
        {
          id: 'section-sources',
          title: 'Read More',
          paragraphs: [{
            id: 'para-sources-0',
            content: `For full coverage of this story, visit the original sources listed below. Each source provides additional context and perspective on ${item.title.toLowerCase()}.`,
            citations: [],
          }],
        },
      ];
    }
    
    // Parse description paragraphs into sections
    const paragraphs = item.description.split('\n\n').filter(p => p.trim().length > 0);
    
    if (paragraphs.length <= 2) {
      // Short content - single section with title
      return [{
        id: 'section-0',
        title: 'Summary',
        paragraphs: paragraphs.map((para: string, idx: number) => ({
          id: `para-0-${idx}`,
          content: para,
          citations: idx === 0 && sources.length > 0 ? [{
            primarySource: {
              id: 'source-0',
              name: sources[0].name,
              url: sources[0].url,
              favicon: getFavicon(sources[0].url),
              title: item.title,
            },
            additionalCount: Math.max(0, sources.length - 1),
            additionalSources: sources.slice(1).map((s, i) => ({
              id: `source-${i + 1}`,
              name: s.name,
              url: s.url,
              favicon: getFavicon(s.url),
              title: item.title,
            })),
          }] : [],
        })),
      }];
    }
    
    // Multiple paragraphs - create structured sections
    const sections = [];
    const midPoint = Math.ceil(paragraphs.length / 2);
    
    // First section: Key Details
    sections.push({
      id: 'section-key-details',
      title: 'Key Details',
      paragraphs: paragraphs.slice(0, midPoint).map((para: string, idx: number) => ({
        id: `para-key-${idx}`,
        content: para,
        citations: idx === 0 && sources.length > 0 ? [{
          primarySource: {
            id: 'source-0',
            name: sources[0].name,
            url: sources[0].url,
            favicon: getFavicon(sources[0].url),
            title: item.title,
          },
          additionalCount: Math.max(0, sources.length - 1),
          additionalSources: sources.slice(1).map((s, i) => ({
            id: `source-${i + 1}`,
            name: s.name,
            url: s.url,
            favicon: getFavicon(s.url),
            title: item.title,
          })),
        }] : [],
      })),
    });
    
    // Second section: Analysis
    if (paragraphs.length > midPoint) {
      sections.push({
        id: 'section-analysis',
        title: 'Analysis',
        paragraphs: paragraphs.slice(midPoint).map((para: string, idx: number) => ({
          id: `para-analysis-${idx}`,
          content: para,
          citations: [],
        })),
      });
    }
    
    return sections;
  };
  
  const sections = generateSections();
  const sidebarSections = sections
    .filter((s): s is typeof s & { title: string } => Boolean(s.title))
    .map(s => s.title);
  
  return {
    id: `fallback-${slug}`,
    slug,
    title: item.title,
    publishedAt: item.timestamp || new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    totalSources: sources.length,
    sections,
    sourceCards: sources.slice(0, 4).map((s, i) => ({
      id: `card-${i}`,
      name: s.name,
      url: s.url,
      favicon: getFavicon(s.url),
      title: item.title,
    })),
    allSources: sources.map((s, i) => ({
      id: `source-${i}`,
      name: s.name,
      url: s.url,
      favicon: getFavicon(s.url),
      title: item.title,
    })),
    sidebarSections,
    relatedArticles: [],
  };
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [article, setArticle] = useState<DiscoverArticle | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  // Drawer states
  const [sectionDrawerOpen, setSectionDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState<{ title?: string; citations: CitationChip[] } | null>(null);
  const [allSourcesDrawerOpen, setAllSourcesDrawerOpen] = useState(false);

  // Load article from pre-generated JSON or fallback to news data
  useEffect(() => {
    const loadArticle = async () => {
      setIsLoading(true);
      setNotFound(false);

      try {
        // Try to load pre-generated article JSON first
        const response = await fetch(`/data/discover/articles/${slug}.json`);
        
        if (response.ok) {
          const data: DiscoverArticle = await response.json();
          setArticle(data);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('Pre-generated article not found, trying news data fallback...');
      }

      // Fallback: Try to find article in news data
      try {
        const newsUrls = [
          '/data/news/weekly-update/latest.json',
          '/data/news/monthly-outlook/latest.json',
        ];
        
        for (const url of newsUrls) {
          const newsResponse = await fetch(url);
          if (newsResponse.ok) {
            const newsData = await newsResponse.json();
            const foundUpdate = newsData.updates?.find((update: { title: string }) => {
              const updateSlug = update.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 50);
              return updateSlug === slug;
            });
            
            if (foundUpdate) {
              // Create a simplified article from news data
              const simplifiedArticle: DiscoverArticle = createSimplifiedArticle(slug, foundUpdate);
              setArticle(simplifiedArticle);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.log('News data fallback failed:', error);
      }

      // Fallback: Try to find article in inspiration/ideas data
      try {
        const ideasUrls = [
          '/data/weekly-ideas/short-form/latest.json',
          '/data/weekly-ideas/long-form/latest.json',
          '/data/weekly-ideas/blog/latest.json',
        ];
        
        for (const url of ideasUrls) {
          const ideasResponse = await fetch(url);
          if (ideasResponse.ok) {
            const ideasData = await ideasResponse.json();
            const foundIdea = ideasData.ideas?.find((idea: { title: string }) => {
              const ideaSlug = idea.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 50);
              return ideaSlug === slug;
            });
            
            if (foundIdea) {
              // Create a simplified article from ideas data
              const simplifiedArticle: DiscoverArticle = createSimplifiedArticle(slug, {
                ...foundIdea,
                timestamp: ideasData.date,
              });
              setArticle(simplifiedArticle);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.log('Ideas data fallback failed:', error);
      }

      // Article not found anywhere
      setNotFound(true);
      setIsLoading(false);
    };

    loadArticle();
  }, [slug]);

  // Open drawer for a specific section
  const openSectionDrawer = (section: DiscoverSection) => {
    const allCitations = section.paragraphs.flatMap(p => p.citations);
    setDrawerSection({ title: section.title, citations: allCitations });
    setSectionDrawerOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center pt-14 lg:pt-0">
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

      <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        {/* Sticky Header */}
        <StickyArticleHeader title={article.title} titleRef={titleRef} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-4xl mx-auto px-6 py-8 md:px-12 md:py-12">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Article Header */}
                <div className="flex flex-col gap-4 mb-6">
                  <h1 
                    ref={titleRef}
                    className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-brand-vanilla leading-tight"
                  >
                    {article.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-os-text-secondary-dark">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Published {formatTimestamp(article.publishedAt)}
                    </span>
                    <span className="text-os-border-dark">•</span>
                    <span>{article.totalSources} sources</span>
                  </div>
                </div>

                {/* Article Sections */}
                <div className="flex flex-col gap-6">
                  {article.sections.map((section, sectionIdx) => {
                    // Collect all citations for this section
                    const sectionCitations = section.paragraphs.flatMap(p => p.citations);
                    
                    return (
                      <section key={section.id} className="flex flex-col gap-4">
                        {/* Section sub-heading (h3, smaller size) with anchor ID */}
                        {section.title && (
                          <h3 
                            id={generateSectionId(section.title)}
                            className="text-lg md:text-xl font-display font-semibold text-brand-vanilla mt-4 scroll-mt-20"
                          >
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
                              title: citation.primarySource.title,
                            },
                            additionalSources: citation.additionalSources.map(s => ({
                              id: s.id,
                              name: s.name,
                              url: s.url,
                              favicon: s.favicon,
                              title: s.title,
                            })),
                            isVideo: citation.primarySource.url.includes('youtube.com') || 
                                     citation.primarySource.url.includes('youtu.be'),
                          }));

                          return (
                            <p 
                              key={paragraph.id} 
                              className="text-[15px] leading-[1.75] text-os-text-primary-dark/90"
                            >
                              {paragraph.content}
                              {sourceGroups.length > 0 && (
                                <InlineSourceChips sourceGroups={sourceGroups} />
                              )}
                            </p>
                          );
                        })}

                        {/* Section Source Bar - at end of each section */}
                        {sectionCitations.length > 0 && (
                          <SectionSourceBar
                            citations={sectionCitations}
                            sectionTitle={section.title}
                            onOpenDrawer={() => openSectionDrawer(section)}
                          />
                        )}

                        {/* Source Cards + Hero image after intro section */}
                        {sectionIdx === 0 && (
                          <>
                            {/* Source Cards - responsive grid */}
                            <SourceCards
                              sources={article.sourceCards}
                              totalCount={article.totalSources}
                              onViewAllSources={() => setAllSourcesDrawerOpen(true)}
                            />

                            {/* Hero image */}
                            {article.heroImage && (
                              <div className="relative w-full mt-1">
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
                          </>
                        )}
                      </section>
                    );
                  })}
                </div>

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

      {/* Section Sources Drawer */}
      <SourcesDrawer
        isOpen={sectionDrawerOpen}
        onClose={() => setSectionDrawerOpen(false)}
        sectionTitle={drawerSection?.title}
        citations={drawerSection?.citations || []}
      />

      {/* All Sources Drawer */}
      <AllSourcesDrawer
        isOpen={allSourcesDrawerOpen}
        onClose={() => setAllSourcesDrawerOpen(false)}
        sources={article.allSources}
        totalCount={article.totalSources}
      />
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
