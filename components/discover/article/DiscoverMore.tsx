'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { InspirationCardData, NewsCardData, ParagraphSource } from '@/types';

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  sources: ParagraphSource[];
}

interface DiscoverMoreProps {
  currentSlug: string;
  relatedQueries?: string[];
  relatedArticles?: Array<{ slug: string; title: string }>;
}

interface OGData {
  image: string | null;
  title: string | null;
  description: string | null;
  siteName: string | null;
  favicon: string | null;
}

export function DiscoverMore({ currentSlug, relatedQueries = [], relatedArticles = [] }: DiscoverMoreProps) {
  const [articles, setArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedArticles = async () => {
      setLoading(true);
      const foundArticles: RelatedArticle[] = [];

      // If relatedArticles provided from pre-generated data, use those first
      if (relatedArticles.length > 0) {
        for (const ra of relatedArticles) {
          foundArticles.push({
            id: `related-${ra.slug}`,
            slug: ra.slug,
            title: ra.title,
            sources: [],
          });
        }
      }

      try {
        // Load from inspiration data (weekly ideas)
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

                  // Don't include current article
                  if (itemSlug !== currentSlug) {
                    foundArticles.push({
                      id: `${type}-${itemSlug}`,
                      slug: itemSlug,
                      title: idea.title,
                      description: idea.description,
                      sources: idea.sources.map((s: { name: string; url: string }, idx: number) => ({
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

                  if (itemSlug !== currentSlug) {
                    foundArticles.push({
                      id: `${type}-${itemSlug}`,
                      slug: itemSlug,
                      title: update.title,
                      description: update.description,
                      sources: update.sources.map((s: { name: string; url: string }, idx: number) => ({
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

        // Shuffle and take first 4 (but prioritize related articles if pre-loaded)
        const shuffled = foundArticles.sort(() => Math.random() - 0.5);
        // If we have pre-generated related articles, put them first
        const preGenerated = shuffled.filter(a => a.id.startsWith('related-'));
        const others = shuffled.filter(a => !a.id.startsWith('related-'));
        const combined = [...preGenerated, ...others];
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
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-brand-aperol" />
          <h3 className="text-lg font-display font-bold text-brand-vanilla">Discover more</h3>
        </div>
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
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-brand-aperol" />
        <h3 className="text-lg font-display font-bold text-brand-vanilla">Discover more</h3>
      </div>

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
  const [isLoadingImage, setIsLoadingImage] = useState(!article.imageUrl);

  // Fetch OG image from first source if no imageUrl
  useEffect(() => {
    if (!article.imageUrl && article.sources.length > 0) {
      const fetchOgImage = async () => {
        try {
          const sourceUrl = article.sources[0].url;
          const response = await fetch(`/api/og-image?url=${encodeURIComponent(sourceUrl)}`);
          if (response.ok) {
            const data: OGData = await response.json();
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
            <div className="w-6 h-6 border-2 border-os-text-secondary-dark border-t-transparent rounded-full animate-spin" />
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

        {/* Source icons */}
        <div className="flex items-center gap-1.5">
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
          <span className="text-xs text-os-text-secondary-dark">
            {article.sources.length} {article.sources.length === 1 ? 'source' : 'sources'}
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

