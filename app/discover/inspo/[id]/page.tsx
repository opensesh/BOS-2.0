'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ExternalLink,
  Globe,
  Tag,
  DollarSign,
  Folder,
  Layers,
  Star,
  Code,
  ArrowUpRight,
  Copy,
  Check,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StickyArticleHeader } from '@/components/discover/article/StickyArticleHeader';
import { getInspoResources, normalizeResource, type NormalizedResource } from '@/lib/data/inspo';

// Get favicon URL from domain
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return '';
  }
}

// Get domain from URL
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Safely parse tags (might come as string or array from Supabase)
function parseTags(tags: string[] | string | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    // Handle comma-separated string
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

// Pricing badge styles
function getPricingStyle(pricing: string | null) {
  if (!pricing) return { bg: 'bg-os-surface-dark', text: 'text-os-text-secondary-dark', border: 'border-os-border-dark' };

  const lower = pricing.toLowerCase();
  if (lower === 'free') return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (lower === 'freemium') return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
  if (lower === 'paid') return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
  return { bg: 'bg-os-surface-dark', text: 'text-os-text-secondary-dark', border: 'border-os-border-dark' };
}

export default function ResourceDetailPage() {
  const params = useParams();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [resource, setResource] = useState<NormalizedResource | null>(null);
  const [relatedResources, setRelatedResources] = useState<NormalizedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const resourceId = parseInt(params.id as string, 10);

  // Fetch resource data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await getInspoResources();

      if (data && !error) {
        const normalized = data.map(normalizeResource);
        const found = normalized.find(r => r.id === resourceId);
        setResource(found || null);

        // Get related resources using smart matching
        if (found) {
          const foundTags = parseTags(found.tags);

          // Score each resource by relevance
          const scored = normalized
            .filter(r => r.id !== resourceId)
            .map(r => {
              let score = 0;
              const rTags = parseTags(r.tags);

              // +3 points per shared tag
              const sharedTags = foundTags.filter(t =>
                rTags.some(rt => rt.toLowerCase() === t.toLowerCase())
              );
              score += sharedTags.length * 3;

              // +2 points for same section
              if (r.section && r.section === found.section) score += 2;

              // +1 point for same category
              if (r.category && r.category === found.category) score += 1;

              return { resource: r, score };
            })
            .filter(s => s.score > 0) // Only include if there's some relation
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(s => s.resource);

          setRelatedResources(scored);
        }
      }
      setLoading(false);
    }

    fetchData();
  }, [resourceId]);

  // Copy URL to clipboard
  const copyUrl = async () => {
    if (resource) {
      try {
        await navigator.clipboard.writeText(resource.url);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      } catch {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = resource.url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      }
    }
  };

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

  if (!resource) {
    return (
      <div className="flex h-screen bg-os-bg-dark">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center pt-14 lg:pt-0">
          <p className="text-os-text-secondary-dark mb-4">Resource not found</p>
          <Link
            href="/discover/inspo?display=table"
            className="text-brand-aperol hover:underline"
          >
            Back to Resources
          </Link>
        </main>
      </div>
    );
  }

  const faviconUrl = getFaviconUrl(resource.url);
  const domain = getDomain(resource.url);
  const pricingStyle = getPricingStyle(resource.pricing);
  const hasThumbnail = resource.thumbnail && !imgError;

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        {/* Sticky Header */}
        <StickyArticleHeader
          title={resource.name}
          titleRef={titleRef}
          backLink="/discover/inspo?display=table"
          backLabel="Resources"
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Hero Section */}
          <div className="relative w-full bg-gradient-to-b from-os-surface-dark/50 to-os-bg-dark">
            {/* Background thumbnail blur effect */}
            {hasThumbnail && (
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={resource.thumbnail!}
                  alt=""
                  fill
                  className="object-cover blur-3xl opacity-20 scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-os-bg-dark/60 via-transparent to-os-bg-dark" />
              </div>
            )}

            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-10 md:px-12 md:py-16">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left: Thumbnail/Favicon */}
                <div className="shrink-0">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-os-surface-dark border-2 border-os-border-dark shadow-2xl">
                    {hasThumbnail ? (
                      <Image
                        src={resource.thumbnail!}
                        alt={resource.name}
                        fill
                        className="object-cover"
                        onError={() => setImgError(true)}
                        unoptimized
                        priority
                      />
                    ) : faviconUrl && !faviconError ? (
                      <div className="w-full h-full flex items-center justify-center bg-os-surface-dark">
                        <Image
                          src={faviconUrl}
                          alt={resource.name}
                          width={64}
                          height={64}
                          className="object-contain"
                          onError={() => setFaviconError(true)}
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-os-surface-dark">
                        <span className="text-4xl font-bold text-os-text-secondary-dark">
                          {resource.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h1
                    ref={titleRef}
                    className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-brand-vanilla mb-3"
                  >
                    {resource.name}
                  </h1>

                  {/* Domain + Tier */}
                  <div className="flex items-center gap-4 text-os-text-secondary-dark mb-6">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">{domain}</span>
                    </div>
                    {resource.tier && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-aperol/10 border border-brand-aperol/20">
                        <Layers className="w-3 h-3 text-brand-aperol" />
                        <span className="text-xs font-medium text-brand-aperol">Tier {resource.tier}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-aperol text-white rounded-xl hover:bg-brand-aperol/90 transition-all font-medium shadow-lg shadow-brand-aperol/20"
                    >
                      <span>Visit Website</span>
                      <ArrowUpRight className="w-5 h-5" />
                    </a>

                    <button
                      onClick={copyUrl}
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-medium ${
                        urlCopied
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-os-surface-dark border-os-border-dark text-os-text-secondary-dark hover:text-brand-vanilla hover:border-os-border-dark'
                      }`}
                    >
                      {urlCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Category & Section & Pricing Pills - Below buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {resource.category && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-aperol/10 text-brand-aperol text-sm font-medium border border-brand-aperol/20">
                        <Folder className="w-3.5 h-3.5" />
                        {resource.category}
                      </span>
                    )}
                    {resource.section && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-surface-dark text-os-text-secondary-dark text-sm border border-os-border-dark">
                        <Layers className="w-3.5 h-3.5" />
                        {resource.section}
                      </span>
                    )}
                    {resource.pricing && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${pricingStyle.bg} ${pricingStyle.text} ${pricingStyle.border}`}>
                        <DollarSign className="w-3.5 h-3.5" />
                        {resource.pricing}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="w-full max-w-4xl mx-auto px-6 py-8 md:px-12">
            {/* Description */}
            {resource.description && (
              <div className="mb-10">
                <h2 className="text-sm font-semibold text-brand-vanilla mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-8 h-px bg-brand-aperol" />
                  About
                </h2>
                <p className="text-lg leading-relaxed text-os-text-primary-dark/90">
                  {resource.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {(() => {
              const tags = parseTags(resource.tags);
              if (tags.length === 0) return null;
              return (
                <div className="mb-10">
                  <h2 className="text-sm font-semibold text-brand-vanilla mb-4 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-8 h-px bg-brand-aperol" />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-os-surface-dark/60 border border-os-border-dark/50 text-sm text-os-text-secondary-dark"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Quick Info Grid */}
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-brand-vanilla mb-4 uppercase tracking-wide flex items-center gap-2">
                <span className="w-8 h-px bg-brand-aperol" />
                Details
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {resource.featured && (
                  <div className="p-4 rounded-xl bg-os-surface-dark/60 border border-os-border-dark/50">
                    <div className="flex items-center gap-2 text-amber-400 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-medium uppercase tracking-wide">Featured</span>
                    </div>
                    <p className="text-sm text-brand-vanilla">Curated pick</p>
                  </div>
                )}

                {resource.opensource && (
                  <div className="p-4 rounded-xl bg-os-surface-dark/60 border border-os-border-dark/50">
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <Code className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Open Source</span>
                    </div>
                    <p className="text-sm text-brand-vanilla">Community driven</p>
                  </div>
                )}
              </div>
            </div>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <div className="mb-10 pt-8 border-t border-os-border-dark/30">
                <h2 className="text-sm font-semibold text-brand-vanilla mb-4 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-8 h-px bg-brand-aperol" />
                  Related Resources
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedResources.map((related) => {
                    const relatedFavicon = getFaviconUrl(related.url);
                    return (
                      <Link
                        key={related.id}
                        href={`/discover/inspo/${related.id}`}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-os-surface-dark/40 border border-os-border-dark/30 hover:border-brand-aperol/30 hover:bg-os-surface-dark/60 transition-all"
                      >
                        {/* Mini thumbnail with favicon fallback */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-os-surface-dark border border-os-border-dark flex-shrink-0 flex items-center justify-center">
                          {related.thumbnail ? (
                            <Image
                              src={related.thumbnail}
                              alt={related.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : relatedFavicon ? (
                            <Image
                              src={relatedFavicon}
                              alt={related.name}
                              width={28}
                              height={28}
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="text-sm font-medium text-os-text-secondary-dark">
                              {related.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-brand-vanilla group-hover:text-brand-aperol transition-colors truncate">
                            {related.name}
                          </h3>
                          <p className="text-xs text-os-text-secondary-dark truncate">
                            {related.section || related.category || 'Resource'}
                          </p>
                        </div>

                        <ExternalLink className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
