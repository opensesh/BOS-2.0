'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { DiscoverArticle, DiscoverArticleManifest, ParagraphSource } from '@/types';

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  sourceCount: number;
  sources: ParagraphSource[];
}

interface DiscoverMoreProps {
  currentSlug: string;
  relatedQueries?: string[];
  relatedArticles?: Array<{ slug: string; title: string }>;
}

export function DiscoverMore({ currentSlug, relatedQueries = [], relatedArticles = [] }: DiscoverMoreProps) {
  const [articles, setArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedArticles = async () => {
      setLoading(true);
      const foundArticles: RelatedArticle[] = [];

      try {
        // First, try to load from pre-generated discover articles manifest
        const manifestResponse = await fetch('/data/discover/articles/manifest.json');
        if (manifestResponse.ok) {
          const manifest: DiscoverArticleManifest = await manifestResponse.json();
          
          // Load full article data for each article in manifest
          for (const articleMeta of manifest.articles) {
            if (articleMeta.slug !== currentSlug) {
              try {
                const articleResponse = await fetch(`/data/discover/articles/${articleMeta.slug}.json`);
                if (articleResponse.ok) {
                  const articleData: DiscoverArticle = await articleResponse.json();
                  foundArticles.push({
                    id: `discover-${articleMeta.slug}`,
                    slug: articleMeta.slug,
                    title: articleMeta.title,
                    imageUrl: articleData.heroImage?.url,
                    sourceCount: articleData.totalSources,
                    sources: articleData.allSources.slice(0, 3).map(s => ({
                      id: s.id,
                      name: s.name,
                      url: s.url,
                      favicon: s.favicon,
                    })),
                  });
                }
              } catch (e) {
                // If full article load fails, use manifest data
                foundArticles.push({
                  id: `discover-${articleMeta.slug}`,
                  slug: articleMeta.slug,
                  title: articleMeta.title,
                  imageUrl: articleMeta.heroImageUrl,
                  sourceCount: articleMeta.totalSources,
                  sources: [],
                });
              }
            }
          }
        }

        // Also load from legacy weekly-ideas data
        const inspirationTypes = ['short-form', 'long-form', 'blog'];
        for (const type of inspirationTypes) {
          try {
            const response = await fetch(`/data/weekly-ideas/${type}/latest.json`);
            if (response.ok) {
              const data = await response.json();
              if (data.ideas) {
                for (const idea of data.ideas) {
                  const itemSlug = idea.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .substring(0, 50);

                  if (itemSlug !== currentSlug && !foundArticles.find(a => a.slug === itemSlug)) {
                    foundArticles.push({
                      id: `${type}-${itemSlug}`,
                      slug: itemSlug,
                      title: idea.title,
                      description: idea.description,
                      sourceCount: idea.sources?.length || 0,
                      sources: (idea.sources || []).map((s: { name: string; url: string }, idx: number) => ({
                        id: `source-${idx}`,
                        name: s.name,
                        url: s.url,
                        favicon: getFaviconUrl(s.url),
                      })),
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Error loading ${type} data:`, e);
          }
        }

        // Load from news data
        const newsTypes = ['weekly-update', 'monthly-outlook'];
        for (const type of newsTypes) {
          try {
            const response = await fetch(`/data/news/${type}/latest.json`);
            if (response.ok) {
              const data = await response.json();
              if (data.updates) {
                for (const update of data.updates) {
                  const itemSlug = update.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .substring(0, 50);

                  if (itemSlug !== currentSlug && !foundArticles.find(a => a.slug === itemSlug)) {
                    foundArticles.push({
                      id: `${type}-${itemSlug}`,
                      slug: itemSlug,
                      title: update.title,
                      description: update.description,
                      sourceCount: update.sources?.length || 0,
                      sources: (update.sources || []).map((s: { name: string; url: string }, idx: number) => ({
                        id: `source-${idx}`,
                        name: s.name,
                        url: s.url,
                        favicon: getFaviconUrl(s.url),
                      })),
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Error loading ${type} data:`, e);
          }
        }

        // Prioritize discover articles (they have proper images and source counts)
        const discoverArticles = foundArticles.filter(a => a.id.startsWith('discover-'));
        const others = foundArticles.filter(a => !a.id.startsWith('discover-'));
        const shuffledOthers = others.sort(() => Math.random() - 0.5);
        const combined = [...discoverArticles, ...shuffledOthers];
        
        setArticles(combined.slice(0, 4));
      } catch (error) {
        console.error('Error loading related articles:', error);
      }

      setLoading(false);
    };

    loadRelatedArticles();
  }, [currentSlug, relatedArticles]);

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t border-os-border-dark/50">
        <h3 className="text-lg font-display font-bold text-brand-vanilla mb-6">Discover more</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/10] bg-os-surface-dark rounded-lg mb-3" />
              <div className="h-4 bg-os-surface-dark rounded w-3/4 mb-2" />
              <div className="h-3 bg-os-surface-dark rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-os-border-dark/50">
      {/* Header - no icon */}
      <h3 className="text-lg font-display font-bold text-brand-vanilla mb-6">Discover more</h3>

      {/* Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {articles.map((article) => (
          <DiscoverMoreCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

function DiscoverMoreCard({ article }: { article: RelatedArticle }) {
  const [ogImage, setOgImage] = useState<string | null>(article.imageUrl || null);
  const [isLoadingImage, setIsLoadingImage] = useState(!article.imageUrl && article.sources.length > 0);

  // Fetch OG image from first source if no imageUrl
  useEffect(() => {
    if (!article.imageUrl && article.sources.length > 0) {
      const fetchOgImage = async () => {
        try {
          const sourceUrl = article.sources[0].url;
          const response = await fetch(`/api/og-image?url=${encodeURIComponent(sourceUrl)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.image) {
              setOgImage(data.image);
            }
          }
        } catch (error) {
          console.error('Error fetching OG image:', error);
        } finally {
          setIsLoadingImage(false);
        }
      };
      fetchOgImage();
    } else {
      setIsLoadingImage(false);
    }
  }, [article.imageUrl, article.sources]);

  return (
    <Link
      href={`/discover/${article.slug}`}
      className="group flex flex-col gap-3 rounded-xl bg-transparent hover:bg-os-surface-dark/30 p-2 transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-os-surface-dark">
        {isLoadingImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-os-text-secondary-dark border-t-brand-aperol rounded-full animate-spin" />
          </div>
        ) : ogImage ? (
          <Image
            src={ogImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
            <div className="text-2xl">📰</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 px-1">
        {/* Title */}
        <h4 className="text-sm font-medium text-brand-vanilla group-hover:text-brand-aperol transition-colors leading-snug line-clamp-2">
          {article.title}
        </h4>

        {/* Description (truncated) */}
        {article.description && (
          <p className="text-xs text-os-text-secondary-dark line-clamp-2">
            {article.description}
          </p>
        )}

        {/* Source icons and count */}
        <div className="flex items-center gap-1.5">
          {article.sources.length > 0 && (
            <div className="flex -space-x-1.5">
              {article.sources.slice(0, 3).map((source, idx) => (
                <div
                  key={source.id || idx}
                  className="w-5 h-5 rounded-full bg-os-surface-dark border border-os-bg-dark flex items-center justify-center"
                  title={source.name}
                >
                  {source.favicon ? (
                    <Image
                      src={source.favicon}
                      alt=""
                      width={12}
                      height={12}
                      className="w-3 h-3 rounded-sm"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[8px] text-os-text-secondary-dark font-bold">
                      {source.name.charAt(0)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <span className="text-xs text-os-text-secondary-dark">
            {article.sourceCount > 0 ? `${article.sourceCount} sources` : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Helper function to get favicon URL
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}
