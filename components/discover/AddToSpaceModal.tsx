'use client';

import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Plus, Check, Search, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpaces } from '@/hooks/useSpaces';

// Generic article data that works with both NewsCardData and DiscoverArticle
export interface ArticleForSpace {
  title: string;
  slug: string;
  imageUrl?: string;
  sourceCount?: number;
  url?: string;
}

interface AddToSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: ArticleForSpace | null;
  onSuccess?: (spaceTitles: string[]) => void;
}

// Color palette for space indicators
const SPACE_COLORS = [
  '#FE5102', // Brand aperol
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

function getSpaceColor(index: number): string {
  return SPACE_COLORS[index % SPACE_COLORS.length];
}

export function AddToSpaceModal({ isOpen, onClose, article, onSuccess }: AddToSpaceModalProps) {
  const { spaces, exampleSpaces, createSpace, addLink } = useSpaces();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpaces, setSelectedSpaces] = useState<Set<string>>(new Set());
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedSpaceNames, setAddedSpaceNames] = useState<string[]>([]);

  // Combine user spaces and example spaces for display
  const allSpaces = [...spaces, ...exampleSpaces];

  // Filter spaces by search
  const filteredSpaces = allSpaces.filter(space =>
    space.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedSpaces(new Set());
      setIsCreatingNew(false);
      setNewSpaceName('');
      setShowSuccess(false);
      setAddedSpaceNames([]);
    }
  }, [isOpen]);

  const toggleSpace = (spaceId: string) => {
    setSelectedSpaces(prev => {
      const next = new Set(prev);
      if (next.has(spaceId)) {
        next.delete(spaceId);
      } else {
        next.add(spaceId);
      }
      return next;
    });
  };

  const handleCreateSpace = () => {
    if (!newSpaceName.trim()) return;
    
    const newSpace = createSpace(newSpaceName.trim());
    setSelectedSpaces(prev => new Set([...prev, newSpace.id]));
    setNewSpaceName('');
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (!article || selectedSpaces.size === 0) return;

    const articleUrl = article.url || `/discover/${article.slug}`;
    const spaceTitles: string[] = [];

    selectedSpaces.forEach(spaceId => {
      const space = allSpaces.find(s => s.id === spaceId);
      if (space) {
        spaceTitles.push(space.title);
        // Add article as a link to the space
        addLink(spaceId, {
          url: articleUrl,
          title: article.title,
          description: `Added from Discover • ${article.sourceCount || 0} sources`,
        });
      }
    });

    // Show success state
    setAddedSpaceNames(spaceTitles);
    setShowSuccess(true);
    onSuccess?.(spaceTitles);

    // Close after showing success briefly
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen || !article) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-os-bg-dark rounded-2xl border border-os-border-dark shadow-2xl overflow-hidden"
        >
          {/* Success State */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-os-bg-dark"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                  className="w-16 h-16 rounded-full bg-brand-aperol/10 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-brand-aperol" />
                </motion.div>
                <h3 className="text-lg font-semibold text-brand-vanilla mb-2">
                  Added to {addedSpaceNames.length === 1 ? 'Space' : 'Spaces'}
                </h3>
                <p className="text-sm text-os-text-secondary-dark text-center px-4">
                  {addedSpaceNames.join(', ')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-os-border-dark">
            <div className="flex items-center gap-3">
              <FolderPlus className="w-5 h-5 text-brand-aperol" />
              <h2 className="text-lg font-semibold text-brand-vanilla">Add to Space</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors"
            >
              <X className="w-5 h-5 text-os-text-secondary-dark" />
            </button>
          </div>

          {/* Article Preview */}
          <div className="px-6 py-4 border-b border-os-border-dark bg-os-surface-dark/30">
            <div className="flex gap-4">
              {article.imageUrl && (
                <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-os-surface-dark flex-shrink-0">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-brand-vanilla line-clamp-2">
                  {article.title}
                </h3>
                {article.sourceCount !== undefined && article.sourceCount > 0 && (
                  <p className="mt-1 text-xs text-os-text-secondary-dark">
                    {article.sourceCount} sources
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark" />
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-os-surface-dark rounded-lg border border-os-border-dark/50 text-sm text-brand-vanilla placeholder:text-os-text-secondary-dark focus:outline-none focus:border-brand-aperol/50 transition-colors"
              />
            </div>
          </div>

          {/* Spaces List */}
          <div className="px-6 max-h-64 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {filteredSpaces.length === 0 && !isCreatingNew ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-os-text-secondary-dark mb-3">
                    {searchQuery ? 'No spaces found' : 'No spaces yet'}
                  </p>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="text-sm text-brand-aperol hover:text-brand-aperol/80 transition-colors"
                  >
                    Create your first space
                  </button>
                </div>
              ) : (
                filteredSpaces.map((space, index) => {
                  const isUserSpace = spaces.some(s => s.id === space.id);
                  const linkCount = space.links?.length || 0;
                  
                  return (
                    <button
                      key={space.id}
                      onClick={() => toggleSpace(space.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        selectedSpaces.has(space.id)
                          ? 'bg-brand-aperol/10 border border-brand-aperol/30'
                          : 'bg-os-surface-dark/50 border border-transparent hover:bg-os-surface-dark'
                      }`}
                    >
                      {/* Color indicator */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getSpaceColor(index) }}
                      />
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-brand-vanilla truncate">
                            {space.title}
                          </p>
                          {!isUserSpace && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-os-surface-dark text-os-text-secondary-dark">
                              Example
                            </span>
                          )}
                        </div>
                        {space.description && (
                          <p className="text-xs text-os-text-secondary-dark line-clamp-1">
                            {space.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-os-text-secondary-dark">
                          {linkCount} {linkCount === 1 ? 'link' : 'links'}
                        </span>
                        {selectedSpaces.has(space.id) && (
                          <Check className="w-4 h-4 text-brand-aperol" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}

              {/* Create New Space */}
              {isCreatingNew ? (
                <div className="flex items-center gap-2 p-3 bg-os-surface-dark/50 rounded-xl">
                  <input
                    type="text"
                    placeholder="Space name..."
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateSpace()}
                    autoFocus
                    className="flex-1 px-3 py-2 bg-os-bg-dark rounded-lg border border-os-border-dark text-sm text-brand-vanilla placeholder:text-os-text-secondary-dark focus:outline-none focus:border-brand-aperol/50"
                  />
                  <button
                    onClick={handleCreateSpace}
                    disabled={!newSpaceName.trim()}
                    className="px-4 py-2 rounded-lg bg-brand-aperol text-white text-sm font-medium hover:bg-brand-aperol/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingNew(false);
                      setNewSpaceName('');
                    }}
                    className="p-2 rounded-lg hover:bg-os-bg-dark transition-colors"
                  >
                    <X className="w-4 h-4 text-os-text-secondary-dark" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-os-border-dark/50 hover:border-brand-aperol/30 hover:bg-os-surface-dark/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-os-surface-dark flex items-center justify-center group-hover:bg-brand-aperol/10 transition-colors">
                    <Plus className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
                  </div>
                  <span className="text-sm text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors">
                    Create new space
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-os-border-dark mt-4">
            <p className="text-xs text-os-text-secondary-dark">
              {selectedSpaces.size > 0 
                ? `${selectedSpaces.size} space${selectedSpaces.size !== 1 ? 's' : ''} selected`
                : 'Select spaces to add this article'
              }
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selectedSpaces.size === 0}
                className="px-5 py-2 rounded-lg bg-brand-aperol text-white text-sm font-medium hover:bg-brand-aperol/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to {selectedSpaces.size > 0 ? selectedSpaces.size : ''} Space{selectedSpaces.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
