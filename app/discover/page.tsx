'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DiscoverLayout } from '@/components/discover/DiscoverLayout';
import { TieredNewsDisplay } from '@/components/discover/TieredNewsDisplay';
import { InspirationAccordion } from '@/components/discover/InspirationAccordion';
import { WidgetPanel } from '@/components/discover/WidgetPanel';
import { useDiscoverData } from '@/hooks/useDiscoverData';
import { Sidebar } from '@/components/Sidebar';
import { SourcesDrawer } from '@/components/chat/SourcesDrawer';
import { SavedArticlesDrawer, SavedArticle } from '@/components/discover/SavedArticlesDrawer';
import { SourceInfo } from '@/components/chat/AnswerView';
import { NewsCardData } from '@/types';
import { Newspaper, Lightbulb, Bookmark } from 'lucide-react';

type MainTabType = 'News' | 'Inspiration';

export default function DiscoverPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTabType>('News');
  
  // Source Drawer State
  const [isSourcesDrawerOpen, setIsSourcesDrawerOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<SourceInfo[]>([]);
  
  // Saved Articles State
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());
  
  const { newsData, inspirationData, loading, error } = useDiscoverData();

  // Combine all news data
  const allNewsItems = [...newsData.weeklyUpdate, ...newsData.monthlyOutlook];

  const handleOpenSources = (sources: SourceInfo[]) => {
    setActiveSources(sources);
    setIsSourcesDrawerOpen(true);
  };

  // Handle saving/unsaving articles
  const handleSaveArticle = useCallback((item: NewsCardData, isSaved: boolean) => {
    if (isSaved) {
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

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <DiscoverLayout>
        {/* Header with tabs */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Tab navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-os-surface-dark/30 rounded-xl">
              <button
                onClick={() => setActiveTab('News')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${activeTab === 'News' 
                    ? 'bg-brand-vanilla text-brand-charcoal' 
                    : 'text-os-text-secondary-dark hover:text-brand-vanilla'
                  }
                `}
              >
                <Newspaper className="w-4 h-4" />
                News
              </button>
              <button
                onClick={() => setActiveTab('Inspiration')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${activeTab === 'Inspiration' 
                    ? 'bg-brand-vanilla text-brand-charcoal' 
                    : 'text-os-text-secondary-dark hover:text-brand-vanilla'
                  }
                `}
              >
                <Lightbulb className="w-4 h-4" />
                Inspiration
              </button>
            </div>

            {/* Saved articles button */}
            <button
              onClick={() => setIsSavedDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-os-border-dark/50 text-os-text-secondary-dark hover:text-brand-vanilla hover:border-os-border-dark transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-sm">Saved</span>
              {savedArticles.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand-aperol text-white text-xs font-medium">
                  {savedArticles.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main content with widgets */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cards section */}
          <div className="flex-1 min-w-0">
            {loading && (
              <div className="text-center py-20 text-os-text-secondary-dark">
                <div className="w-8 h-8 border-2 border-os-text-secondary-dark border-t-brand-aperol rounded-full animate-spin mx-auto mb-4" />
                Loading...
              </div>
            )}

            {error && (
              <div className="text-center py-20 text-red-500">
                Error: {error}
              </div>
            )}

            {!loading && !error && activeTab === 'News' && (
              <TieredNewsDisplay
                items={allNewsItems}
                onOpenSources={handleOpenSources}
                onSaveArticle={handleSaveArticle}
                savedArticleIds={savedArticleIds}
                lastUpdated={new Date().toISOString()}
              />
            )}

            {!loading && !error && activeTab === 'Inspiration' && (
              <InspirationAccordion
                shortForm={inspirationData.shortForm}
                longForm={inspirationData.longForm}
                blog={inspirationData.blog}
                lastUpdated={new Date().toISOString()}
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
