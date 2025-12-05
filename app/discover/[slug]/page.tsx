'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { AddToSpaceModal, ArticleForSpace } from '@/components/discover/AddToSpaceModal';
import type { DiscoverArticle, DiscoverSection, CitationChip } from '@/types';

// Hero image component with error fallback
function HeroImage({ url, alt, attribution }: { url: string; alt: string; attribution?: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  // Decode HTML entities in URL (e.g., &amp; -> &)
  const decodedUrl = url.replace(/&amp;/g, '&');
  
  if (error) {
    // Fallback: gradient placeholder with abstract pattern
    return (
      <div className="relative w-full mt-1">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gradient-to-br from-os-surface-dark via-os-bg-dark to-os-surface-dark">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-brand-aperol/10 blur-3xl" />
            <div className="absolute w-32 h-32 rounded-full bg-brand-aperol/5 blur-2xl translate-x-10 -translate-y-5" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-os-text-secondary-dark">
            <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full mt-1">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-os-surface-dark">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-os-surface-dark via-os-bg-dark to-os-surface-dark" />
        )}
        <Image 
          src={decodedUrl} 
          alt={alt}
          fill 
          className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          unoptimized 
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
      {attribution && (
        <p className="text-xs text-os-text-secondary-dark mt-2 text-right font-mono">
          {attribution}
        </p>
      )}
    </div>
  );
}

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
  
  // Add to Space modal state
  const [isAddToSpaceOpen, setIsAddToSpaceOpen] = useState(false);

  // Handle Add to Space
  const handleAddToSpace = useCallback(() => {
    setIsAddToSpaceOpen(true);
  }, []);

  // Convert article to format expected by AddToSpaceModal
  const articleForSpace: ArticleForSpace | null = article ? {
    title: article.title,
    slug: article.slug,
    imageUrl: article.heroImage?.url,
    sourceCount: article.totalSources,
    url: `/discover/${article.slug}`,
  } : null;

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
                .substring(0, 60);
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
        <StickyArticleHeader 
          title={article.title} 
          titleRef={titleRef} 
          onAddToSpace={handleAddToSpace}
        />

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

                            {/* Hero image with fallback */}
                            {article.heroImage && (
                              <HeroImage 
                                url={article.heroImage.url}
                                alt={article.title}
                                attribution={article.heroImage.attribution}
                              />
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
          articleSummary={
            // Extract first 2-3 paragraphs as summary for LLM context
            article.sections
              .flatMap(s => s.paragraphs.map(p => p.content))
              .slice(0, 3)
              .join('\n\n')
          }
          articleSections={article.sidebarSections}
          sourceCount={article.totalSources}
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

      {/* Add to Space Modal */}
      <AddToSpaceModal
        isOpen={isAddToSpaceOpen}
        onClose={() => setIsAddToSpaceOpen(false)}
        article={articleForSpace}
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
