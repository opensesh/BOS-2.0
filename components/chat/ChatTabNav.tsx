'use client';

import { Sparkles, Globe, Image } from 'lucide-react';

export type ChatTab = 'answer' | 'links' | 'images';

interface ChatTabNavProps {
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
  hasLinks?: boolean;
  hasImages?: boolean;
  linksCount?: number;
  imagesCount?: number;
}

export function ChatTabNav({
  activeTab,
  onTabChange,
  hasLinks = false,
  hasImages = false,
  linksCount = 0,
  imagesCount = 0,
}: ChatTabNavProps) {
  const tabs = [
    {
      id: 'answer' as ChatTab,
      label: 'Answer',
      icon: Sparkles,
      available: true,
    },
    {
      id: 'links' as ChatTab,
      label: 'Links',
      icon: Globe,
      available: hasLinks,
      count: linksCount,
    },
    {
      id: 'images' as ChatTab,
      label: 'Images',
      icon: Image,
      available: hasImages,
      count: imagesCount,
    },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-os-border-dark">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isAvailable = tab.available;

        return (
          <button
            key={tab.id}
            onClick={() => isAvailable && onTabChange(tab.id)}
            disabled={!isAvailable}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative
              ${
                isActive
                  ? 'text-os-text-primary-dark'
                  : isAvailable
                  ? 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
                  : 'text-os-text-secondary-dark/40 cursor-not-allowed'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-xs text-os-text-secondary-dark">
                ({tab.count})
              </span>
            )}
            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-aperol" />
            )}
          </button>
        );
      })}
    </div>
  );
}

