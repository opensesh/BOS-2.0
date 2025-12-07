'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink } from 'lucide-react';
import type { InspoResource, NormalizedResource } from '@/lib/data/inspo';
import { normalizeResource } from '@/lib/data/inspo';

// Get favicon URL from domain using Google's service
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

// Thumbnail component with fallback to favicon
function ResourceThumbnail({ resource }: { resource: NormalizedResource }) {
  const [imgError, setImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const faviconUrl = getFaviconUrl(resource.url);
  const hasThumbnail = resource.thumbnail && !imgError;
  const hasFavicon = faviconUrl && !faviconError;

  // Fallback: colored initial
  if (!hasThumbnail && !hasFavicon) {
    const initial = resource.name.charAt(0).toUpperCase();
    return (
      <div className="w-10 h-10 rounded-lg bg-os-surface-dark border border-os-border-dark flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-medium text-os-text-secondary-dark">{initial}</span>
      </div>
    );
  }

  // Show thumbnail if available
  if (hasThumbnail) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-os-surface-dark border border-os-border-dark flex-shrink-0 relative">
        <Image
          src={resource.thumbnail!}
          alt={resource.name}
          fill
          sizes="40px"
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback to favicon
  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden bg-os-surface-dark border border-os-border-dark flex items-center justify-center flex-shrink-0">
      <Image
        src={faviconUrl}
        alt={resource.name}
        width={24}
        height={24}
        className="object-contain"
        onError={() => setFaviconError(true)}
        unoptimized
      />
    </div>
  );
}

interface InspoTableProps {
  resources: InspoResource[];
}

type SortField = 'name' | 'category' | 'section' | 'pricing';
type SortDirection = 'asc' | 'desc' | null;

export function InspoTable({ resources: rawResources }: InspoTableProps) {
  const router = useRouter();

  // Normalize resources to handle PascalCase column names from Supabase
  const resources: NormalizedResource[] = useMemo(() =>
    rawResources.map(normalizeResource), [rawResources]);
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [pricingFilter, setPricingFilter] = useState<string>('all');

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const categories = new Set<string>();
    const sections = new Set<string>();
    const pricings = new Set<string>();

    resources.forEach((resource) => {
      if (resource.category) categories.add(resource.category);
      if (resource.section) sections.add(resource.section);
      if (resource.pricing) pricings.add(resource.pricing);
    });

    return {
      categories: Array.from(categories).sort(),
      sections: Array.from(sections).sort(),
      pricings: Array.from(pricings).sort(),
    };
  }, [resources]);

  // Apply filters and sorting
  const filteredAndSortedResources = useMemo(() => {
    let filtered = resources.filter((resource) => {
      const categoryMatch = categoryFilter === 'all' || resource.category === categoryFilter;
      const sectionMatch = sectionFilter === 'all' || resource.section === sectionFilter;
      const pricingMatch = pricingFilter === 'all' || resource.pricing === pricingFilter;
      return categoryMatch && sectionMatch && pricingMatch;
    });

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';
        
        const comparison = aValue.toString().localeCompare(bValue.toString());
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [resources, categoryFilter, sectionFilter, pricingFilter, sortField, sortDirection]);

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 opacity-40" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-brand-aperol" />;
    }
    return <ChevronDown className="w-4 h-4 text-brand-aperol" />;
  };

  return (
    <div className="w-full">
      {/* Filters - Sticky */}
      <div className="sticky top-0 z-10 bg-os-bg-dark border-b border-os-border-dark backdrop-blur-sm bg-opacity-95">
        <div className="flex flex-wrap gap-4 p-4">
          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category-filter" className="text-xs font-accent uppercase tracking-wider text-os-text-secondary-dark">
              Category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-os-surface-dark border border-os-border-dark rounded-lg text-sm text-os-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol transition-colors cursor-pointer hover:border-brand-aperol/30"
            >
              <option value="all">All Categories</option>
              {filterOptions.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="section-filter" className="text-xs font-accent uppercase tracking-wider text-os-text-secondary-dark">
              Section
            </label>
            <select
              id="section-filter"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 bg-os-surface-dark border border-os-border-dark rounded-lg text-sm text-os-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol transition-colors cursor-pointer hover:border-brand-aperol/30"
            >
              <option value="all">All Sections</option>
              {filterOptions.sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Filter */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pricing-filter" className="text-xs font-accent uppercase tracking-wider text-os-text-secondary-dark">
              Pricing
            </label>
            <select
              id="pricing-filter"
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value)}
              className="px-3 py-2 bg-os-surface-dark border border-os-border-dark rounded-lg text-sm text-os-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol transition-colors cursor-pointer hover:border-brand-aperol/30"
            >
              <option value="all">All Pricing</option>
              {filterOptions.pricings.map((pricing) => (
                <option key={pricing} value={pricing}>
                  {pricing}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end ml-auto">
            <div className="px-3 py-2 text-sm text-os-text-secondary-dark">
              <span className="font-accent text-brand-aperol">{filteredAndSortedResources.length}</span>
              {' '}of{' '}
              <span className="font-accent">{resources.length}</span>
              {' '}resources
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-os-border-dark">
              {/* Thumbnail Header */}
              <th className="w-16 p-4">
                <span className="sr-only">Thumbnail</span>
              </th>

              {/* Name Header */}
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-accent uppercase tracking-wider text-os-text-secondary-dark hover:text-brand-aperol transition-colors group"
                >
                  Name
                  {getSortIcon('name')}
                </button>
              </th>

              {/* Category Header */}
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-2 text-xs font-accent uppercase tracking-wider text-os-text-secondary-dark hover:text-brand-aperol transition-colors group"
                >
                  Category
                  {getSortIcon('category')}
                </button>
              </th>

              {/* Section Header */}
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('section')}
                  className="flex items-center gap-2 text-xs font-accent uppercase tracking-wider text-os-text-secondary-dark hover:text-brand-aperol transition-colors group"
                >
                  Section
                  {getSortIcon('section')}
                </button>
              </th>

              {/* Pricing Header */}
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('pricing')}
                  className="flex items-center gap-2 text-xs font-accent uppercase tracking-wider text-os-text-secondary-dark hover:text-brand-aperol transition-colors group"
                >
                  Pricing
                  {getSortIcon('pricing')}
                </button>
              </th>

              {/* Actions Header */}
              <th className="w-20 p-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedResources.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-os-text-secondary-dark">
                  No resources match the selected filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedResources.map((resource) => (
                <tr
                  key={resource.id}
                  onClick={() => router.push(`/discover/inspo/${resource.id}`)}
                  className="border-b border-os-border-dark/50 hover:bg-os-surface-dark/30 transition-colors group cursor-pointer"
                >
                  {/* Thumbnail Column */}
                  <td className="p-4">
                    <ResourceThumbnail resource={resource} />
                  </td>

                  {/* Name Column - Links to detail page */}
                  <td className="p-4">
                    <span className="font-medium text-os-text-primary-dark group-hover:text-brand-aperol transition-colors">
                      {resource.name}
                    </span>
                  </td>

                  {/* Category Column */}
                  <td className="p-4 text-os-text-secondary-dark">
                    {resource.category || '—'}
                  </td>

                  {/* Section Column */}
                  <td className="p-4 text-os-text-secondary-dark">
                    {resource.section || '—'}
                  </td>

                  {/* Pricing Column */}
                  <td className="p-4">
                    {resource.pricing ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-os-surface-dark text-xs font-accent text-os-text-primary-dark border border-os-border-dark">
                        {resource.pricing}
                      </span>
                    ) : (
                      <span className="text-os-text-secondary-dark">—</span>
                    )}
                  </td>

                  {/* Actions Column - External Link */}
                  <td className="p-4">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-os-surface-dark border border-os-border-dark text-os-text-secondary-dark hover:text-brand-aperol hover:border-brand-aperol/30 transition-all"
                      title={`Visit ${resource.name}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
