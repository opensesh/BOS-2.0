'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DiscoverLayout } from '@/components/discover/DiscoverLayout';
import { DiscoverHeader } from '@/components/discover/DiscoverHeader';
import { CardGrid } from '@/components/discover/CardGrid';
import { IdeaCardGrid } from '@/components/discover/IdeaCardGrid';
import { WidgetPanel } from '@/components/discover/WidgetPanel';
import { AddToSpaceModal } from '@/components/discover/AddToSpaceModal';
import { useDiscoverData } from '@/hooks/useDiscoverData';
import { Sidebar } from '@/components/Sidebar';
import { SourcesDrawer } from '@/components/chat/SourcesDrawer';
import { SavedArticlesDrawer, SavedArticle } from '@/components/discover/SavedArticlesDrawer';
import { SourceInfo } from '@/components/chat/AnswerView';
import { NewsCardData, NewsTopicCategory } from '@/types';

type MainTabType = 'News' | 'Ideas';
type NewsTypeOption = 'all' | NewsTopicCategory;
type IdeasTypeOption = 'all' | 'short-form' | 'long-form' | 'blog';
type DateFilterOption = 'today' | 'week' | 'month';

export default function DiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<MainTabType>('News');
  const [activeNewsType, setActiveNewsType] = useState<NewsTypeOption>('all');
  const [activeIdeasType, setActiveIdeasType] = useState<IdeasTypeOption>('all');
  const [selectedDate, setSelectedDate] = useState<DateFilterOption>('today');
  
  // Source Drawer State
  const [isSourcesDrawerOpen, setIsSourcesDrawerOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<SourceInfo[]>([]);
  
  // Saved Articles State
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());
  
  // Add to Space Modal State
  const [isAddToSpaceOpen, setIsAddToSpaceOpen] = useState(false);
  const [articleToAdd, setArticleToAdd] = useState<NewsCardData | null>(null);
  
  const { newsData, ideaData, loading, error } = useDiscoverData();

  // Read tab from URL params on mount and when searchParams change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'Ideas' || tabParam === 'Inspiration') {
      setActiveTab('Ideas');
    } else if (tabParam === 'News') {
      setActiveTab('News');
    }
  }, [searchParams]);

  // Get current type based on main tab
  const currentType = activeTab === 'News'
    ? activeNewsType
    : activeIdeasType;

  // Get cards based on active tab and type
  const getCurrentCards = () => {
    if (activeTab === 'News') {
      // Combine all news data and sort by published date (newest first)
      const allNews = [...newsData.weeklyUpdate, ...newsData.monthlyOutlook];
      // Sort by timestamp (most recent first)
      allNews.sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA;
      });
      // In the future, filter by topic (ai, design, tech, finance)
      // For now, return all
      return allNews;
    } else {
      // Filter ideas by type
      switch (activeIdeasType) {
        case 'short-form':
          return ideaData.shortForm;
        case 'long-form':
          return ideaData.longForm;
        case 'blog':
          return ideaData.blog;
        case 'all':
        default:
          return [...ideaData.shortForm, ...ideaData.longForm, ...ideaData.blog];
      }
    }
  };

  const handleTypeChange = (type: NewsTypeOption | IdeasTypeOption) => {
    if (activeTab === 'News') {
      setActiveNewsType(type as NewsTypeOption);
    } else {
      setActiveIdeasType(type as IdeasTypeOption);
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

  // Handle Add to Space
  const handleAddToSpace = useCallback((article: NewsCardData) => {
    setArticleToAdd(article);
    setIsAddToSpaceOpen(true);
  }, []);

  const handleConfirmAddToSpace = useCallback((spaceId: string, article: NewsCardData) => {
    // In production, this would save to the database
    console.log(`Added article "${article.title}" to space ${spaceId}`);
    // You could show a toast notification here
  }, []);

  const currentCards = getCurrentCards();

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <DiscoverLayout>
        {/* Header with tabs, last updated, and date filter */}
        <DiscoverHeader 
          activeTab={activeTab} 
          activeType={currentType}
          onTabChange={setActiveTab}
          onTypeChange={handleTypeChange}
          savedCount={savedArticles.length}
          onOpenSaved={() => setIsSavedDrawerOpen(true)}
          lastUpdated={new Date().toISOString()}
          selectedDate={selectedDate}
          onDateChange={(date) => setSelectedDate(date as DateFilterOption)}
        />

        {/* Main content with widgets */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cards section with animated tab content */}
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

            {/* Animated tab content transition */}
            <AnimatePresence mode="wait">
              {!loading && !error && activeTab === 'News' && (
                <motion.div
                  key="news-content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ 
                    duration: 0.25, 
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <CardGrid
                    cards={currentCards}
                    type="news"
                    onOpenSources={handleOpenSources}
                    onSaveArticle={handleSaveArticle}
                    savedArticleIds={savedArticleIds}
                    onAddToSpace={handleAddToSpace}
                  />
                </motion.div>
              )}

              {!loading && !error && activeTab === 'Ideas' && (
                <motion.div
                  key="ideas-content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ 
                    duration: 0.25, 
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <IdeaCardGrid
                    items={[...ideaData.shortForm, ...ideaData.longForm, ...ideaData.blog]}
                    activeFilter={activeIdeasType}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Widget panel - animated based on active tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'News' && (
              <motion.div 
                key="widget-panel"
                className="hidden lg:block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <WidgetPanel />
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* Add to Space Modal */}
      <AddToSpaceModal
        isOpen={isAddToSpaceOpen}
        onClose={() => {
          setIsAddToSpaceOpen(false);
          setArticleToAdd(null);
        }}
        article={articleToAdd}
        onAddToSpace={handleConfirmAddToSpace}
      />
    </div>
  );
}
