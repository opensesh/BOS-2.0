'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DiscoverLayout } from '@/components/discover/DiscoverLayout';
import { DiscoverHeader } from '@/components/discover/DiscoverHeader';
import { CardGrid } from '@/components/discover/CardGrid';
import { WidgetPanel } from '@/components/discover/WidgetPanel';
import { useDiscoverData } from '@/hooks/useDiscoverData';
import { Sidebar } from '@/components/Sidebar';
import { SourcesDrawer } from '@/components/chat/SourcesDrawer';
import { SavedArticlesDrawer, SavedArticle } from '@/components/discover/SavedArticlesDrawer';
import { SourceInfo } from '@/components/chat/AnswerView';
import { NewsCardData } from '@/types';

type MainTabType = 'News' | 'Inspiration';
type NewsTypeOption = 'all' | 'ai' | 'design' | 'tech' | 'finance';
type InspirationTypeOption = 'all' | 'short-form' | 'long-form' | 'blog';

export default function DiscoverPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTabType>('News');
  const [activeNewsType, setActiveNewsType] = useState<NewsTypeOption>('all');
  const [activeInspirationType, setActiveInspirationType] = useState<InspirationTypeOption>('all');
  
  // Source Drawer State
  const [isSourcesDrawerOpen, setIsSourcesDrawerOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<SourceInfo[]>([]);
  
  // Saved Articles State
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());
  
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

  // Handle saving/unsaving articles
  const handleSaveArticle = useCallback((item: NewsCardData, isSaved: boolean) => {
    if (isSaved) {
      // Add to saved
      const savedArticle: SavedArticle = {
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        publishedAt: item.publishedAt,
        savedAt: new Date().toISOString(),
        category: item.category || 'News',
        sourceName: item.sources[0]?.name || 'Unknown',
        sourceCount: item.sources.length,
        imageUrl: item.imageUrl,
      };
      setSavedArticles(prev => [savedArticle, ...prev]);
      setSavedArticleIds(prev => new Set([...prev, item.id]));
    } else {
      // Remove from saved
      setSavedArticles(prev => prev.filter(a => a.id !== item.id));
      setSavedArticleIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  }, []);

  const handleRemoveSavedArticle = useCallback((id: string) => {
    setSavedArticles(prev => prev.filter(a => a.id !== id));
    setSavedArticleIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const handleSavedArticleClick = useCallback((slug: string) => {
    setIsSavedDrawerOpen(false);
    router.push(`/discover/${slug}`);
  }, [router]);

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
          savedCount={savedArticles.length}
          onOpenSaved={() => setIsSavedDrawerOpen(true)}
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
                onSaveArticle={handleSaveArticle}
                savedArticleIds={savedArticleIds}
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

      {/* Saved Articles Drawer */}
      <SavedArticlesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedArticles={savedArticles}
        onRemove={handleRemoveSavedArticle}
        onArticleClick={handleSavedArticleClick}
      />
    </div>
  );
}
