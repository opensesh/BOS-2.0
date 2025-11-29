'use client';

import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Plus, Check, Search } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsCardData } from '@/types';

interface Space {
  id: string;
  name: string;
  description?: string;
  articleCount: number;
  color: string;
}

interface AddToSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsCardData | null;
  onAddToSpace: (spaceId: string, article: NewsCardData) => void;
}

// Mock spaces data - in production this would come from a hook/API
const MOCK_SPACES: Space[] = [
  { id: '1', name: 'AI Research', description: 'Latest AI developments and papers', articleCount: 12, color: '#FE5102' },
  { id: '2', name: 'Design Inspiration', description: 'UI/UX trends and design systems', articleCount: 8, color: '#8B5CF6' },
  { id: '3', name: 'Tech News', description: 'Industry updates and announcements', articleCount: 23, color: '#3B82F6' },
  { id: '4', name: 'Brand Strategy', description: 'Branding case studies and insights', articleCount: 5, color: '#10B981' },
];

export function AddToSpaceModal({ isOpen, onClose, article, onAddToSpace }: AddToSpaceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpaces, setSelectedSpaces] = useState<Set<string>>(new Set());
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [spaces, setSpaces] = useState<Space[]>(MOCK_SPACES);

  // Filter spaces by search
  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedSpaces(new Set());
      setIsCreatingNew(false);
      setNewSpaceName('');
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
    
    const newSpace: Space = {
      id: `new-${Date.now()}`,
      name: newSpaceName.trim(),
      articleCount: 0,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    };
    
    setSpaces(prev => [...prev, newSpace]);
    setSelectedSpaces(prev => new Set([...prev, newSpace.id]));
    setNewSpaceName('');
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (article && selectedSpaces.size > 0) {
      selectedSpaces.forEach(spaceId => {
        onAddToSpace(spaceId, article);
      });
      onClose();
    }
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
                <p className="mt-1 text-xs text-os-text-secondary-dark">
                  {article.sources.length} sources
                </p>
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
          <div className="px-6 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {filteredSpaces.map((space) => (
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
                    style={{ backgroundColor: space.color }}
                  />
                  
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-brand-vanilla">
                      {space.name}
                    </p>
                    {space.description && (
                      <p className="text-xs text-os-text-secondary-dark line-clamp-1">
                        {space.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-os-text-secondary-dark">
                      {space.articleCount} articles
                    </span>
                    {selectedSpaces.has(space.id) && (
                      <Check className="w-4 h-4 text-brand-aperol" />
                    )}
                  </div>
                </button>
              ))}

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
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-os-border-dark mt-4">
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

