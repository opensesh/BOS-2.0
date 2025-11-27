import React from 'react';
import { Compass, Lightbulb } from 'lucide-react';

type MainTabType = 'News' | 'Inspiration';
type NewsSubTabType = 'weekly-update' | 'monthly-outlook';
type InspirationSubTabType = 'short-form' | 'long-form' | 'blog';

interface DiscoverTabsProps {
  activeTab: MainTabType;
  activeSubTab?: NewsSubTabType | InspirationSubTabType;
  onTabChange: (tab: MainTabType) => void;
  onSubTabChange?: (subTab: NewsSubTabType | InspirationSubTabType) => void;
}

export function DiscoverTabs({ 
  activeTab, 
  activeSubTab,
  onTabChange, 
  onSubTabChange 
}: DiscoverTabsProps) {
  const mainTabs: { id: MainTabType; icon: React.ReactNode; label: string }[] = [
    { id: 'News', icon: <Compass className="w-4 h-4" />, label: 'News' },
    { id: 'Inspiration', icon: <Lightbulb className="w-4 h-4" />, label: 'Inspiration' },
  ];

  const newsSubTabs: { id: NewsSubTabType; label: string }[] = [
    { id: 'weekly-update', label: 'Weekly Update' },
    { id: 'monthly-outlook', label: 'Monthly Outlook' },
  ];

  const inspirationSubTabs: { id: InspirationSubTabType; label: string }[] = [
    { id: 'short-form', label: 'Short Form' },
    { id: 'long-form', label: 'Long Form' },
    { id: 'blog', label: 'Blog' },
  ];

  const currentSubTabs = activeTab === 'News' ? newsSubTabs : inspirationSubTabs;

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Main tabs */}
      <div className="flex items-center gap-2">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              activeTab === tab.id
                ? 'bg-os-surface-dark text-brand-aperol border-brand-aperol/20 shadow-sm'
                : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-tabs */}
      {onSubTabChange && (
        <div className="flex items-center gap-2">
          {currentSubTabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => onSubTabChange(subTab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeSubTab === subTab.id
                  ? 'bg-brand-aperol/10 text-brand-aperol'
                  : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark'
              }`}
            >
              {subTab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
