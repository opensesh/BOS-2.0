'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink } from 'lucide-react';
import type { InspoResource } from '@/lib/data/inspo';

interface InspoTableProps {
  resources: InspoResource[];
}

type SortField = 'name' | 'category' | 'section' | 'pricing';
type SortDirection = 'asc' | 'desc' | null;

export function InspoTable({ resources }: InspoTableProps) {
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
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedResources.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-os-text-secondary-dark">
                  No resources match the selected filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedResources.map((resource) => (
                <tr
                  key={resource.id}
                  className="border-b border-os-border-dark/50 hover:bg-os-surface-dark/30 transition-colors group"
                >
                  {/* Name Column - Hyperlinked */}
                  <td className="p-4">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-os-text-primary-dark hover:text-brand-aperol transition-colors group-hover:underline"
                    >
                      <span className="font-medium">{resource.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </a>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
