'use client';

import React, { useState } from 'react';
import { DiscoverLayout } from '@/components/discover/DiscoverLayout';
import { DiscoverHeader } from '@/components/discover/DiscoverHeader';
import { CardGrid } from '@/components/discover/CardGrid';
import { WidgetPanel } from '@/components/discover/WidgetPanel';
import { useDiscoverData } from '@/hooks/useDiscoverData';
import { Sidebar } from '@/components/Sidebar';
import { SourcesDrawer } from '@/components/chat/SourcesDrawer';
import { SourceInfo } from '@/components/chat/AnswerView';

type MainTabType = 'News' | 'Inspiration';
type NewsTypeOption = 'all' | 'ai' | 'design' | 'tech' | 'finance';
type InspirationTypeOption = 'all' | 'short-form' | 'long-form' | 'blog';

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<MainTabType>('News');
  const [activeNewsType, setActiveNewsType] = useState<NewsTypeOption>('all');
  const [activeInspirationType, setActiveInspirationType] = useState<InspirationTypeOption>('all');
  
  // Source Drawer State
  const [isSourcesDrawerOpen, setIsSourcesDrawerOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<SourceInfo[]>([]);
  
  const { newsData, inspirationData, loading, error } = useDiscoverData();

  // Get current type based on main tab
  const currentType = activeTab === 'News' 
    ? activeNewsType 
    : activeInspirationType;

  // Get cards based on active tab and type
  const getCurrentCards = () => {
    if (activeTab === 'News') {
      // Combine all news data (no more weekly/monthly split)
      const allNews = [...newsData.weeklyUpdate, ...newsData.monthlyOutlook];
      // In the future, filter by topic (ai, design, tech, finance)
      // For now, return all
      return allNews;
    } else {
      // Filter inspiration by type
      switch (activeInspirationType) {
        case 'short-form':
          return inspirationData.shortForm;
        case 'long-form':
          return inspirationData.longForm;
        case 'blog':
          return inspirationData.blog;
        case 'all':
        default:
          return [...inspirationData.shortForm, ...inspirationData.longForm, ...inspirationData.blog];
      }
    }
  };

  const handleTypeChange = (type: NewsTypeOption | InspirationTypeOption) => {
    if (activeTab === 'News') {
      setActiveNewsType(type as NewsTypeOption);
    } else {
      setActiveInspirationType(type as InspirationTypeOption);
    }
  };

  const handleOpenSources = (sources: SourceInfo[]) => {
    setActiveSources(sources);
    setIsSourcesDrawerOpen(true);
  };

  const currentCards = getCurrentCards();

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <DiscoverLayout>
        {/* Header with tabs */}
        <DiscoverHeader 
          activeTab={activeTab} 
          activeType={currentType}
          onTabChange={setActiveTab}
          onTypeChange={handleTypeChange}
        />

        {/* Main content with widgets */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cards section */}
          <div className="flex-1 min-w-0">
            {loading && (
              <div className="text-center py-20 text-os-text-secondary-dark">
                <div className="w-8 h-8 border-2 border-os-text-secondary-dark border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                Loading...
              </div>
            )}

            {error && (
              <div className="text-center py-20 text-red-500">
                Error: {error}
              </div>
            )}

            {!loading && !error && (
              <CardGrid 
                cards={currentCards} 
                type={activeTab === 'News' ? 'news' : 'inspiration'}
                onOpenSources={handleOpenSources}
              />
            )}
          </div>

          {/* Widget panel - integrated into content */}
          <div className="hidden lg:block">
            <WidgetPanel />
          </div>
        </div>
      </DiscoverLayout>
      
      {/* Sources Drawer */}
      <SourcesDrawer 
        isOpen={isSourcesDrawerOpen}
        onClose={() => setIsSourcesDrawerOpen(false)}
        sources={activeSources}
      />
    </div>
  );
}
