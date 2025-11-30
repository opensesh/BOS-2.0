'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Bookmark, Calendar, SlidersHorizontal, X, Check } from 'lucide-react';
import { SourcesSettings } from './SourcesSettings';
import { NewsTopicCategory, NEWS_TOPIC_LABELS } from '@/types';

type MainTabType = 'News' | 'Ideas';
type NewsTypeOption = 'all' | NewsTopicCategory;
type IdeasTypeOption = 'all' | 'short-form' | 'long-form' | 'blog';
type DateOption = 'today' | 'week' | 'month';

interface DiscoverHeaderProps {
  activeTab: MainTabType;
  activeType: NewsTypeOption | IdeasTypeOption;
  onTabChange: (tab: MainTabType) => void;
  onTypeChange: (type: NewsTypeOption | IdeasTypeOption) => void;
  savedCount?: number;
  onOpenSaved?: () => void;
  lastUpdated?: string;
  selectedDate?: DateOption;
  onDateChange?: (date: DateOption) => void;
}

// All available news categories
const ALL_NEWS_CATEGORIES: { id: NewsTypeOption; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'design-ux', label: NEWS_TOPIC_LABELS['design-ux'] },
  { id: 'branding', label: NEWS_TOPIC_LABELS['branding'] },
  { id: 'ai-creative', label: NEWS_TOPIC_LABELS['ai-creative'] },
  { id: 'social-trends', label: NEWS_TOPIC_LABELS['social-trends'] },
  { id: 'general-tech', label: NEWS_TOPIC_LABELS['general-tech'] },
  { id: 'startup-business', label: NEWS_TOPIC_LABELS['startup-business'] },
];

// Default visible categories (user can customize)
const DEFAULT_VISIBLE_CATEGORIES: NewsTypeOption[] = [
  'all', 'design-ux', 'ai-creative', 'social-trends'
];

const IDEAS_TYPES: { id: IdeasTypeOption; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'short-form', label: 'Short Form' },
  { id: 'long-form', label: 'Long Form' },
  { id: 'blog', label: 'Blog' },
];

const DATE_OPTIONS: { id: DateOption; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
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
  selectedDate = 'today',
  onDateChange,
}: DiscoverHeaderProps) {
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<NewsTypeOption[]>(DEFAULT_VISIBLE_CATEGORIES);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Load category preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CATEGORY_PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as NewsTypeOption[];
        // Ensure 'all' is always included
        if (!parsed.includes('all')) {
          parsed.unshift('all');
        }
        setVisibleCategories(parsed);
      }
    } catch {
      // Use defaults if parsing fails
    }
  }, []);

  // Save category preferences to localStorage
  const saveCategories = (categories: NewsTypeOption[]) => {
    setVisibleCategories(categories);
    try {
      localStorage.setItem(CATEGORY_PREFS_KEY, JSON.stringify(categories));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  };

  const currentDateLabel = DATE_OPTIONS.find(d => d.id === selectedDate)?.label || 'Today';

  // Get visible filter options based on tab
  const getFilterOptions = () => {
    if (activeTab === 'Ideas') {
      return IDEAS_TYPES;
    }
    // For News, filter to only visible categories
    return ALL_NEWS_CATEGORIES.filter(cat => visibleCategories.includes(cat.id));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
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
    if (categoryId === 'all') return; // Can't remove 'all'
    
    const newCategories = visibleCategories.includes(categoryId)
      ? visibleCategories.filter(c => c !== categoryId)
      : [...visibleCategories, categoryId];
    
    saveCategories(newCategories);
  };

  const filterOptions = getFilterOptions();

  return (
    <>
      {/* Header row */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Top row: Title, Tabs, and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Title and Tabs */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Title */}
            <h1 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla">
              Discover
            </h1>
            
            {/* Tabs - inline with title, with animated indicator */}
            <div className="flex items-center gap-1 relative">
              <button
                onClick={() => handleTabChange('News')}
                className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'News'
                    ? 'text-brand-aperol'
                    : 'text-os-text-secondary-dark hover:text-brand-vanilla'
                }`}
              >
                {activeTab === 'News' && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 bg-brand-aperol/15 border border-brand-aperol/30 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">News</span>
              </button>
              <button
                onClick={() => handleTabChange('Ideas')}
                className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'Ideas'
                    ? 'text-brand-aperol'
                    : 'text-os-text-secondary-dark hover:text-brand-vanilla'
                }`}
              >
                {activeTab === 'Ideas' && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 bg-brand-aperol/15 border border-brand-aperol/30 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">Ideas</span>
              </button>
            </div>
          </div>

          {/* Right: Action icons */}
          <div className="flex items-center gap-1">
            {/* Date Filter Icon */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className={`p-2 rounded-lg transition-colors group ${
                  isDateDropdownOpen ? 'bg-os-surface-dark' : 'hover:bg-os-surface-dark'
                }`}
                title={`Date: ${currentDateLabel}`}
              >
                <Calendar className={`w-5 h-5 transition-colors ${
                  selectedDate !== 'today' ? 'text-brand-aperol' : 'text-os-text-secondary-dark group-hover:text-brand-vanilla'
                }`} />
              </button>

              {isDateDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 py-1.5 bg-os-surface-dark border border-os-border-dark rounded-lg shadow-lg min-w-[120px] z-50">
                  {DATE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        onDateChange?.(option.id);
                        setIsDateDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                        selectedDate === option.id
                          ? 'text-brand-aperol bg-brand-aperol/10'
                          : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-bg-dark'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

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

            {/* Manage Categories (News only) */}
            {activeTab === 'News' && (
              <button
                onClick={() => setIsManageCategoriesOpen(true)}
                className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors group"
                title="Manage Categories"
              >
                <SlidersHorizontal className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
              </button>
            )}

            {/* Settings Gear Icon */}
            <button
              onClick={() => setIsSourcesOpen(true)}
              className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors group"
              title="Manage Sources"
            >
              <Settings className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onTypeChange(option.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeType === option.id
                  ? 'bg-brand-aperol/15 text-brand-aperol border border-brand-aperol/30'
                  : 'bg-os-surface-dark/60 text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark border border-os-border-dark/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manage Categories Modal */}
      {isManageCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-os-surface-dark border border-os-border-dark rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="p-4">
              <p className="text-sm text-os-text-secondary-dark mb-4">
                Choose which categories to show in your filter bar.
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

            {/* Modal Footer */}
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

      {/* Sources Settings Modal */}
      <SourcesSettings 
        isOpen={isSourcesOpen} 
        onClose={() => setIsSourcesOpen(false)} 
      />
    </>
  );
}
