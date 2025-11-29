'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, Bookmark, Calendar } from 'lucide-react';
import { SourcesSettings } from './SourcesSettings';

type MainTabType = 'News' | 'Inspiration';
type NewsTypeOption = 'all' | 'ai' | 'design' | 'tech' | 'finance';
type InspirationTypeOption = 'all' | 'short-form' | 'long-form' | 'blog';
type DateOption = 'today' | 'week' | 'month';

interface DiscoverHeaderProps {
  activeTab: MainTabType;
  activeType: NewsTypeOption | InspirationTypeOption;
  onTabChange: (tab: MainTabType) => void;
  onTypeChange: (type: NewsTypeOption | InspirationTypeOption) => void;
  savedCount?: number;
  onOpenSaved?: () => void;
  lastUpdated?: string;
  selectedDate?: DateOption;
  onDateChange?: (date: DateOption) => void;
}

const NEWS_TYPES: { id: NewsTypeOption; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI & ML' },
  { id: 'design', label: 'Design' },
  { id: 'tech', label: 'Technology' },
  { id: 'finance', label: 'Finance' },
];

const INSPIRATION_TYPES: { id: InspirationTypeOption; label: string }[] = [
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

export function DiscoverHeader({ 
  activeTab, 
  activeType, 
  onTabChange, 
  onTypeChange,
  savedCount = 0,
  onOpenSaved,
  lastUpdated,
  selectedDate = 'today',
  onDateChange,
}: DiscoverHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Just now';
    try {
      const date = new Date(lastUpdated);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Just now';
    }
  };

  const typeOptions = activeTab === 'News' ? NEWS_TYPES : INSPIRATION_TYPES;
  const currentTypeLabel = typeOptions.find(t => t.id === activeType)?.label || 'All';

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
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

  const currentDateLabel = DATE_OPTIONS.find(d => d.id === selectedDate)?.label || 'Today';

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Discover Title with Last Updated */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-vanilla">
              Discover
            </h1>
            <span className="flex items-center gap-1.5 text-xs text-os-text-secondary-dark">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-aperol animate-pulse" />
              {formatLastUpdated()}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleTabChange('News')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'News'
                  ? 'bg-brand-aperol/15 text-brand-aperol border border-brand-aperol/30'
                  : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark border border-transparent'
              }`}
            >
              News
            </button>
            <button
              onClick={() => handleTabChange('Inspiration')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'Inspiration'
                  ? 'bg-brand-aperol/15 text-brand-aperol border border-brand-aperol/30'
                  : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark border border-transparent'
              }`}
            >
              Inspiration
            </button>

            {/* Type Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeType !== 'all'
                    ? 'bg-os-surface-dark text-brand-vanilla border-os-border-dark'
                    : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark border-transparent'
                }`}
              >
                {currentTypeLabel}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 py-1.5 bg-os-surface-dark border border-os-border-dark rounded-lg shadow-lg min-w-[140px] z-50">
                  {typeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        onTypeChange(option.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                        activeType === option.id
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
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1">
          {/* Date Filter Icon */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className={`p-2.5 rounded-lg transition-colors group ${
                isDateDropdownOpen ? 'bg-os-surface-dark' : 'hover:bg-os-surface-dark'
              }`}
              title={`Filter: ${currentDateLabel}`}
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
            className="p-2.5 rounded-lg hover:bg-os-surface-dark transition-colors group relative"
            title="Saved Articles"
          >
            <Bookmark className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-brand-aperol text-white text-[10px] font-bold rounded-full">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>

          {/* Settings Gear Icon */}
          <button
            onClick={() => setIsSourcesOpen(true)}
            className="p-2.5 rounded-lg hover:bg-os-surface-dark transition-colors group"
            title="Manage Sources"
          >
            <Settings className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
          </button>
        </div>
      </div>

      {/* Sources Settings Modal */}
      <SourcesSettings 
        isOpen={isSourcesOpen} 
        onClose={() => setIsSourcesOpen(false)} 
      />
    </>
  );
}
