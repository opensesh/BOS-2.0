'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Tag, 
  SortAsc, 
  SortDesc, 
  Check,
  Newspaper,
  ExternalLink,
  Search,
  Plus
} from 'lucide-react';
import { NewsCardData, NewsTopicCategory, NEWS_TOPIC_LABELS } from '@/types';
import { useDiscoverData } from '@/hooks/useDiscoverData';

interface SpaceArticlesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArticle: (article: NewsCardData) => void;
  addedArticleIds?: Set<string>;
}

type SortOption = 'publishedAt' | 'title' | 'sources';
type SortDirection = 'asc' | 'desc';

export function SpaceArticlesDrawer({
  isOpen,
  onClose,
  onAddArticle,
  addedArticleIds = new Set(),
}: SpaceArticlesDrawerProps) {
  const { newsData, loading } = useDiscoverData();
  const [sortBy, setSortBy] = useState<SortOption>('publishedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Combine all articles
  const allArticles = useMemo(() => {
    return [...newsData.weeklyUpdate, ...newsData.monthlyOutlook];
  }, [newsData]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on outside click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Get unique categories for filters
  const categories = useMemo(() => {
    const cats = new Set<NewsTopicCategory>();
    allArticles.forEach(a => {
      if (a.topicCategory) cats.add(a.topicCategory);
    });
    return ['all', ...Array.from(cats)];
  }, [allArticles]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let result = [...allArticles];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.summary.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(a => a.topicCategory === filterCategory);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'publishedAt':
          comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'sources':
          comparison = a.sources.length - b.sources.length;
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return result;
  }, [allArticles, filterCategory, searchQuery, sortBy, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-14 lg:top-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Drawer Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-14 lg:top-0 right-0 bottom-0 z-50 w-full max-w-[520px] bg-os-bg-darker border-l border-os-border-dark shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-14 lg:h-12 border-b border-os-border-dark shrink-0">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-brand-aperol" />
                <span className="font-display font-semibold text-brand-vanilla text-lg lg:text-base">
                  Add Articles
                </span>
                <span className="px-2 py-0.5 rounded-full bg-os-surface-dark text-xs text-os-text-secondary-dark">
                  {allArticles.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-border-dark transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-5 py-3 border-b border-os-border-dark/50 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-os-surface-dark border border-os-border-dark rounded-lg text-os-text-primary-dark placeholder:text-os-text-secondary-dark focus:outline-none focus:border-brand-aperol transition-colors"
                />
              </div>
            </div>

            {/* Filters & Sort */}
            <div className="px-5 py-3 border-b border-os-border-dark/50 space-y-3 shrink-0">
              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-os-text-secondary-dark">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-2 py-1 text-xs bg-os-surface-dark border border-os-border-dark rounded-md text-os-text-primary-dark focus:outline-none focus:border-brand-aperol"
                >
                  <option value="publishedAt">Date Published</option>
                  <option value="title">Title</option>
                  <option value="sources">Source Count</option>
                </select>
                <button
                  onClick={toggleSortDirection}
                  className="p-1 rounded hover:bg-os-surface-dark transition-colors"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? (
                    <SortAsc className="w-4 h-4 text-os-text-secondary-dark" />
                  ) : (
                    <SortDesc className="w-4 h-4 text-os-text-secondary-dark" />
                  )}
                </button>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-os-text-secondary-dark" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-2 py-1 text-xs bg-os-surface-dark border border-os-border-dark rounded-md text-os-text-primary-dark focus:outline-none focus:border-brand-aperol"
                  >
                    <option value="all">All Categories</option>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>
                        {NEWS_TOPIC_LABELS[cat as NewsTopicCategory] || cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-os-surface-dark flex items-center justify-center mb-4">
                    <Newspaper className="w-8 h-8 text-os-text-secondary-dark" />
                  </div>
                  <p className="text-os-text-secondary-dark text-sm">
                    {searchQuery || filterCategory !== 'all'
                      ? "No articles match your filters."
                      : "No articles available yet."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-os-border-dark/50">
                  {filteredArticles.map((article) => {
                    const isAdded = addedArticleIds.has(article.id);
                    return (
                      <div
                        key={article.id}
                        className={`px-5 py-4 transition-colors group ${
                          isAdded 
                            ? 'bg-brand-aperol/5' 
                            : 'hover:bg-os-surface-dark/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          {article.imageUrl && (
                            <div className="w-16 h-12 rounded-md overflow-hidden bg-os-surface-dark flex-shrink-0">
                              <img 
                                src={article.imageUrl} 
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-brand-vanilla line-clamp-2 mb-1">
                              {article.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-xs text-os-text-secondary-dark">
                              <span>{formatDate(article.publishedAt)}</span>
                              <span>•</span>
                              <span>{article.sources.length} sources</span>
                              {article.topicCategory && (
                                <>
                                  <span>•</span>
                                  <span className="text-brand-aperol/80">
                                    {NEWS_TOPIC_LABELS[article.topicCategory]}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Add Button */}
                          <button
                            onClick={() => !isAdded && onAddArticle(article)}
                            disabled={isAdded}
                            className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                              isAdded 
                                ? 'bg-brand-aperol/20 text-brand-aperol cursor-default'
                                : 'bg-os-surface-dark hover:bg-brand-aperol/20 text-os-text-secondary-dark hover:text-brand-aperol'
                            }`}
                            title={isAdded ? 'Added to space' : 'Add to space'}
                          >
                            {isAdded ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-os-border-dark shrink-0">
              <p className="text-[10px] text-os-text-secondary-dark text-center">
                Press <kbd className="px-1.5 py-0.5 rounded bg-os-border-dark text-brand-vanilla font-mono">ESC</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
