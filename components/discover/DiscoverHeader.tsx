'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, Bookmark } from 'lucide-react';
import { SourcesSettings } from './SourcesSettings';

type MainTabType = 'News' | 'Inspiration';
type NewsTypeOption = 'all' | 'ai' | 'design' | 'tech' | 'finance';
type InspirationTypeOption = 'all' | 'short-form' | 'long-form' | 'blog';

interface DiscoverHeaderProps {
  activeTab: MainTabType;
  activeType: NewsTypeOption | InspirationTypeOption;
  onTabChange: (tab: MainTabType) => void;
  onTypeChange: (type: NewsTypeOption | InspirationTypeOption) => void;
  savedCount?: number;
  onOpenSaved?: () => void;
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

export function DiscoverHeader({ 
  activeTab, 
  activeType, 
  onTabChange, 
  onTypeChange,
  savedCount = 0,
  onOpenSaved,
}: DiscoverHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const typeOptions = activeTab === 'News' ? NEWS_TYPES : INSPIRATION_TYPES;
  const currentTypeLabel = typeOptions.find(t => t.id === activeType)?.label || 'All';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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

  return (
    <>
      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          {/* Discover Title */}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-vanilla">
            Discover
          </h1>

          {/* Tabs */}
          <div className="flex items-center gap-2">
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeType !== 'all'
                    ? 'bg-os-surface-dark text-brand-vanilla border-os-border-dark'
                    : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark border-transparent'
                }`}
              >
                {currentTypeLabel}
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 py-2 bg-os-surface-dark border border-os-border-dark rounded-lg shadow-lg min-w-[160px] z-50">
                  {typeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        onTypeChange(option.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
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
          {/* Saved Button */}
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-os-surface-dark transition-colors group"
            title="Saved Articles"
          >
            <Bookmark className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
            {savedCount > 0 && (
              <span className="text-xs font-medium text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors">
                {savedCount}
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
