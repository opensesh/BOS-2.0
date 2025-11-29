'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface ContentSubHeaderProps {
  lastUpdated?: string;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

const DATE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this-week', label: 'This Week' },
  { id: 'this-month', label: 'This Month' },
];

export function ContentSubHeader({
  lastUpdated,
  selectedDate = 'today',
  onDateChange,
}: ContentSubHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Today at 8:00 AM';
    try {
      const date = new Date(lastUpdated);
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
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch {
      return lastUpdated;
    }
  };

  const currentDateLabel = DATE_OPTIONS.find(d => d.id === selectedDate)?.label || 'Today';

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Last updated */}
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full bg-brand-aperol animate-pulse" />
        <span className="text-os-text-secondary-dark">
          Last updated: {formatLastUpdated()}
        </span>
      </div>

      {/* Date filter dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-os-border-dark/50 bg-os-surface-dark/30 text-brand-vanilla text-sm hover:bg-os-surface-dark/50 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          {currentDateLabel}
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 py-2 bg-os-surface-dark border border-os-border-dark rounded-lg shadow-lg min-w-[140px] z-50">
            {DATE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onDateChange?.(option.id);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
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
    </div>
  );
}
