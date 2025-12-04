'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Globe, SortAsc, SortDesc, Trash2, ExternalLink } from 'lucide-react';

export interface SavedArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  savedAt: string;
  category: string;
  sourceName: string;
  sourceCount: number;
  imageUrl?: string;
}

interface SavedArticlesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedArticles: SavedArticle[];
  onRemove: (id: string) => void;
  onArticleClick: (slug: string) => void;
}

type SortOption = 'savedAt' | 'publishedAt' | 'title';
type SortDirection = 'asc' | 'desc';

export function SavedArticlesDrawer({
  isOpen,
  onClose,
  savedArticles,
  onRemove,
  onArticleClick,
}: SavedArticlesDrawerProps) {
  const [sortBy, setSortBy] = useState<SortOption>('savedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Get unique categories and sources for filters
  const categories = useMemo(() => {
    const cats = new Set(savedArticles.map(a => a.category));
    return ['all', ...Array.from(cats)];
  }, [savedArticles]);

  const sources = useMemo(() => {
    const srcs = new Set(savedArticles.map(a => a.sourceName));
    return ['all', ...Array.from(srcs)];
  }, [savedArticles]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let result = [...savedArticles];
    
    // Apply filters
    if (filterCategory !== 'all') {
      result = result.filter(a => a.category === filterCategory);
    }
    if (filterSource !== 'all') {
      result = result.filter(a => a.sourceName === filterSource);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'savedAt':
          comparison = new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
          break;
        case 'publishedAt':
          comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return result;
  }, [savedArticles, filterCategory, filterSource, sortBy, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - below mobile header on mobile/tablet, full height on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-14 lg:top-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Drawer Panel - below mobile header on mobile/tablet, full height on desktop */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-14 lg:top-0 right-0 bottom-0 z-50 w-full max-w-[480px] bg-os-bg-darker border-l border-os-border-dark shadow-2xl flex flex-col"
          >
            {/* Header - h-14 on mobile, h-12 on desktop to match Sidebar header */}
            <div className="flex items-center justify-between px-6 h-14 lg:h-12 border-b border-os-border-dark shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-brand-vanilla text-lg lg:text-base">
                  Saved Articles
                </span>
                <span className="px-2 py-0.5 rounded-full bg-os-surface-dark text-xs text-os-text-secondary-dark">
                  {savedArticles.length}
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
                  <option value="savedAt">Date Saved</option>
                  <option value="publishedAt">Date Published</option>
                  <option value="title">Title</option>
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
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-os-text-secondary-dark" />
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="px-2 py-1 text-xs bg-os-surface-dark border border-os-border-dark rounded-md text-os-text-primary-dark focus:outline-none focus:border-brand-aperol"
                  >
                    {sources.map(src => (
                      <option key={src} value={src}>
                        {src === 'all' ? 'All Sources' : src}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto">
              {filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-os-surface-dark flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-os-text-secondary-dark" />
                  </div>
                  <p className="text-os-text-secondary-dark text-sm">
                    {savedArticles.length === 0 
                      ? "No saved articles yet. Click the bookmark icon on any article to save it."
                      : "No articles match your filters."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-os-border-dark/50">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="px-5 py-4 hover:bg-os-surface-dark/30 transition-colors group"
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
                          <button
                            onClick={() => onArticleClick(article.slug)}
                            className="text-left w-full"
                          >
                            <h3 className="text-sm font-medium text-brand-vanilla hover:text-brand-aperol transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                          </button>
                          
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-os-text-secondary-dark">
                            <span>{article.sourceName}</span>
                            <span>•</span>
                            <span>{article.sourceCount} sources</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-os-text-secondary-dark/70">
                            <span>Saved {new Date(article.savedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onArticleClick(article.slug)}
                            className="p-1.5 rounded-md text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark transition-colors"
                            title="Open article"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemove(article.id)}
                            className="p-1.5 rounded-md text-os-text-secondary-dark hover:text-red-400 hover:bg-os-surface-dark transition-colors"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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

