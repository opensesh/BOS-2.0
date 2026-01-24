'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Bookmark, ChevronDown, ArrowUpDown, Check, X, Filter, SlidersHorizontal } from 'lucide-react';
import { NewsTopicCategory, NEWS_TOPIC_LABELS } from '@/types';

type MainTabType = 'News' | 'Ideas';
type NewsTypeOption = 'all' | NewsTopicCategory;
type IdeasTypeOption = 'all' | 'short-form' | 'long-form' | 'blog';
type SortOption = 'newest' | 'oldest' | 'sources';

interface DiscoverHeaderProps {
  activeTab: MainTabType;
  activeType: NewsTypeOption | IdeasTypeOption;
  onTabChange: (tab: MainTabType) => void;
  onTypeChange: (type: NewsTypeOption | IdeasTypeOption) => void;
  savedCount?: number;
  onOpenSaved?: () => void;
  onSettingsClick?: () => void;
  sortOption?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

// All available news categories
const ALL_NEWS_CATEGORIES: { id: NewsTypeOption; label: string }[] = [
  { id: 'all', label: 'All Topics' },
  { id: 'ai-creative', label: NEWS_TOPIC_LABELS['ai-creative'] },
  { id: 'design-ux', label: NEWS_TOPIC_LABELS['design-ux'] },
  { id: 'branding', label: NEWS_TOPIC_LABELS['branding'] },
  { id: 'social-trends', label: NEWS_TOPIC_LABELS['social-trends'] },
  { id: 'general-tech', label: NEWS_TOPIC_LABELS['general-tech'] },
  { id: 'startup-business', label: NEWS_TOPIC_LABELS['startup-business'] },
];

const IDEAS_TYPES: { id: IdeasTypeOption; label: string }[] = [
  { id: 'all', label: 'All Types' },
  { id: 'short-form', label: 'Short Form' },
  { id: 'long-form', label: 'Long Form' },
  { id: 'blog', label: 'Blog' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'sources', label: 'Most Sources' },
];

// LocalStorage key for category preferences
const CATEGORY_PREFS_KEY = 'discover-visible-categories';

export function DiscoverHeader({ 
  activeTab, 
  activeType, 
  onTabChange, 
  onTypeChange,
  savedCount = 0,
  onOpenSaved,
  onSettingsClick,
  sortOption = 'newest',
  onSortChange,
}: DiscoverHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<NewsTypeOption[]>(['all', ...Object.keys(NEWS_TOPIC_LABELS) as NewsTopicCategory[]]);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Load category preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CATEGORY_PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as NewsTypeOption[];
        if (!parsed.includes('all')) {
          parsed.unshift('all');
        }
        setVisibleCategories(parsed);
      }
    } catch {
      // Use defaults
    }
  }, []);

  // Save category preferences to localStorage
  const saveCategories = (categories: NewsTypeOption[]) => {
    setVisibleCategories(categories);
    try {
      localStorage.setItem(CATEGORY_PREFS_KEY, JSON.stringify(categories));
    } catch {
      // Silently fail
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset type to 'all' when switching tabs
  const handleTabChange = (tab: MainTabType) => {
    onTabChange(tab);
    onTypeChange('all');
  };

  // Toggle category visibility
  const toggleCategory = (categoryId: NewsTypeOption) => {
    if (categoryId === 'all') return;
    
    const newCategories = visibleCategories.includes(categoryId)
      ? visibleCategories.filter(c => c !== categoryId)
      : [...visibleCategories, categoryId];
    
    saveCategories(newCategories);
  };

  // Get filter options based on tab
  const filterOptions = activeTab === 'Ideas' 
    ? IDEAS_TYPES 
    : ALL_NEWS_CATEGORIES.filter(cat => visibleCategories.includes(cat.id));

  const currentFilterLabel = filterOptions.find(f => f.id === activeType)?.label || 'All';
  const currentSortLabel = SORT_OPTIONS.find(s => s.id === sortOption)?.label || 'Newest';
  const hasActiveFilter = activeType !== 'all';

  return (
    <>
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Left: Title and Tabs */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla">
            Discover
          </h1>
          
          {/* Tab Pills */}
          <div className="flex items-center bg-os-surface-dark/50 rounded-full p-1">
            <button
              onClick={() => handleTabChange('News')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'News'
                  ? 'bg-brand-aperol text-white'
                  : 'text-os-text-secondary-dark hover:text-brand-vanilla'
              }`}
            >
              News
            </button>
            <button
              onClick={() => handleTabChange('Ideas')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'Ideas'
                  ? 'bg-brand-aperol text-white'
                  : 'text-os-text-secondary-dark hover:text-brand-vanilla'
              }`}
            >
              Ideas
            </button>
            <Link
              href="/discover/inspo"
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-os-text-secondary-dark hover:text-brand-vanilla"
            >
              Inspo
            </Link>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                hasActiveFilter
                  ? 'bg-brand-aperol/15 text-brand-aperol border border-brand-aperol/30'
                  : 'bg-os-surface-dark/60 text-os-text-secondary-dark hover:text-brand-vanilla border border-os-border-dark/30 hover:border-os-border-dark'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{currentFilterLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 py-2 bg-os-surface-dark border border-os-border-dark rounded-xl shadow-xl min-w-[200px] z-50">
                <div className="px-3 pb-2 mb-2 border-b border-os-border-dark">
                  <span className="text-xs font-semibold text-os-text-secondary-dark uppercase tracking-wide">
                    {activeTab === 'News' ? 'Topic' : 'Format'}
                  </span>
                </div>
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onTypeChange(option.id);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                      activeType === option.id
                        ? 'text-brand-aperol bg-brand-aperol/10'
                        : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-bg-dark'
                    }`}
                  >
                    <span>{option.label}</span>
                    {activeType === option.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
                
                {/* Manage Categories (News only) */}
                {activeTab === 'News' && (
                  <>
                    <div className="border-t border-os-border-dark my-2" />
                    <button
                      onClick={() => {
                        setIsFilterOpen(false);
                        setIsManageCategoriesOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-bg-dark transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Manage Categories</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sort Dropdown (News only) */}
          {activeTab === 'News' && (
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-os-surface-dark/60 text-os-text-secondary-dark hover:text-brand-vanilla border border-os-border-dark/30 hover:border-os-border-dark transition-all"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="absolute top-full right-0 mt-2 py-2 bg-os-surface-dark border border-os-border-dark rounded-xl shadow-xl min-w-[160px] z-50">
                  <div className="px-3 pb-2 mb-2 border-b border-os-border-dark">
                    <span className="text-xs font-semibold text-os-text-secondary-dark uppercase tracking-wide">
                      Sort By
                    </span>
                  </div>
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        onSortChange?.(option.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                        sortOption === option.id
                          ? 'text-brand-aperol bg-brand-aperol/10'
                          : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-bg-dark'
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortOption === option.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Button */}
          <button
            onClick={onOpenSaved}
            className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors group relative"
            title="Saved Articles"
          >
            <Bookmark className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-brand-aperol text-white text-[10px] font-bold rounded-full">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors group"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
          </button>
        </div>
      </div>

      {/* Manage Categories Modal */}
      {isManageCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-os-surface-dark border border-os-border-dark rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-os-border-dark">
              <h2 className="text-lg font-display font-semibold text-brand-vanilla">
                Manage Categories
              </h2>
              <button
                onClick={() => setIsManageCategoriesOpen(false)}
                className="p-1.5 rounded-lg hover:bg-os-bg-dark transition-colors"
              >
                <X className="w-5 h-5 text-os-text-secondary-dark" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-os-text-secondary-dark mb-4">
                Choose which categories appear in your filter menu.
              </p>
              
              <div className="space-y-2">
                {ALL_NEWS_CATEGORIES.filter(c => c.id !== 'all').map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      visibleCategories.includes(category.id)
                        ? 'bg-brand-aperol/10 border border-brand-aperol/30'
                        : 'bg-os-bg-dark/50 border border-os-border-dark/30 hover:border-os-border-dark'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      visibleCategories.includes(category.id)
                        ? 'text-brand-vanilla'
                        : 'text-os-text-secondary-dark'
                    }`}>
                      {category.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      visibleCategories.includes(category.id)
                        ? 'bg-brand-aperol'
                        : 'bg-os-surface-dark border border-os-border-dark'
                    }`}>
                      {visibleCategories.includes(category.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-os-border-dark">
              <button
                onClick={() => setIsManageCategoriesOpen(false)}
                className="w-full py-2.5 px-4 bg-brand-aperol hover:bg-brand-aperol/90 text-white font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
