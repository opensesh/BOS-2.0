'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function TabSelector({ tabs, activeTab, onChange, className = '' }: TabSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? 'bg-brand-aperol text-brand-charcoal'
                  : 'bg-os-surface-dark text-os-text-secondary-dark hover:bg-os-border-dark hover:text-brand-vanilla border border-os-border-dark'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}


