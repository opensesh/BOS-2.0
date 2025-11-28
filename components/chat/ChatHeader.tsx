'use client';

import React from 'react';
import { ArrowLeft, Sparkles, Globe, Image } from 'lucide-react';
import { OverflowMenu } from './OverflowMenu';
import { ShareButton } from './ShareModal';
import { SourceInfo } from './AnswerView';
import { ImageResult } from './ImagesView';

export type ChatTab = 'answer' | 'links' | 'images';

interface ChatHeaderProps {
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
  hasLinks?: boolean;
  hasImages?: boolean;
  linksCount?: number;
  imagesCount?: number;
  threadTitle?: string;
  onBack?: () => void;
}

export function ChatHeader({
  activeTab,
  onTabChange,
  hasLinks = false,
  hasImages = false,
  linksCount = 0,
  imagesCount = 0,
  threadTitle = 'New Thread',
  onBack,
}: ChatHeaderProps) {
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
    <div className="sticky top-0 z-30 bg-os-bg-dark border-b border-os-border-dark/50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Left side - Back button and tabs */}
          <div className="flex items-center gap-2">
            {/* Back button */}
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 -ml-1.5 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark transition-colors"
                title="Back to home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {/* Tabs */}
            <div className="flex items-center">
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
                      flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all relative
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
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-aperol rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1">
            <OverflowMenu threadTitle={threadTitle} />
            <ShareButton />
          </div>
        </div>
      </div>
    </div>
  );
}

