'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles } from 'lucide-react';
import {
  useResourceDiscoveryStore,
  selectCategories,
  selectSubCategories
} from '@/lib/stores/resource-discovery-store';
import { DEFAULT_CATEGORY_COLORS } from '@/types/resource-discovery';
import { cn } from '@/lib/utils';

/**
 * CategoryFilterBar
 * 
 * Horizontal filter bar with:
 * - Category pills with color indicators
 * - Optional section sub-filters
 * - Search input
 * - Clear filters button
 */
export default function CategoryFilterBar() {
  const filter = useResourceDiscoveryStore((state) => state.filter);
  const resources = useResourceDiscoveryStore((state) => state.resources);
  const setActiveCategory = useResourceDiscoveryStore((state) => state.setActiveCategory);
  const setActiveSubCategory = useResourceDiscoveryStore((state) => state.setActiveSubCategory);
  const setSearchQuery = useResourceDiscoveryStore((state) => state.setSearchQuery);
  const clearFilters = useResourceDiscoveryStore((state) => state.clearFilters);
  const isLoading = useResourceDiscoveryStore((state) => state.isLoading);
  
  // Get unique categories and sections
  const categories = useMemo(() => 
    selectCategories(useResourceDiscoveryStore.getState()),
    [resources]
  );
  
  const subCategories = useMemo(() =>
    selectSubCategories(useResourceDiscoveryStore.getState()),
    [resources, filter.activeCategory]
  );
  
  // Count resources per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach(r => {
      const cat = r.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [resources]);
  
  const hasActiveFilters = filter.activeCategory || filter.searchQuery;
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-neutral-900/50 rounded-xl animate-pulse">
        <div className="h-8 w-20 bg-neutral-800 rounded-full" />
        <div className="h-8 w-24 bg-neutral-800 rounded-full" />
        <div className="h-8 w-16 bg-neutral-800 rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-3">
      {/* Main filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* All button */}
        <button
          onClick={() => clearFilters()}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full font-nhtext text-sm transition-all duration-200',
            !filter.activeCategory
              ? 'bg-os-vanilla text-os-charcoal'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
          )}
        >
          <Sparkles className="w-4 h-4" />
          All
          <span className="text-xs opacity-60">
            ({resources.length})
          </span>
        </button>
        
        {/* Category pills */}
        {categories.map((category) => {
          const isActive = filter.activeCategory === category;
          const color = DEFAULT_CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLORS.default;
          const count = categoryCounts[category] || 0;
          
          return (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(isActive ? null : category)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full font-nhtext text-sm transition-all duration-200',
                isActive
                  ? 'bg-os-vanilla text-os-charcoal'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Color indicator */}
              <span 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {category}
              <span className="text-xs opacity-60">
                ({count})
              </span>
            </motion.button>
          );
        })}
        
        {/* Search input */}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="pl-9 pr-4 py-2 bg-neutral-800 text-neutral-200 rounded-full text-sm font-nhtext placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-os-aperol/50 w-48 transition-all duration-200"
          />
        </div>
        
        {/* Clear filters button */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-os-aperol/20 text-os-aperol rounded-full text-sm font-nhtext hover:bg-os-aperol/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Sub-category sub-filters (when category is active) */}
      <AnimatePresence>
        {filter.activeCategory && subCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <span className="text-xs text-neutral-500 font-nhtext">
              Sub-categories:
            </span>
            {subCategories.map((subCategory) => {
              const isActive = filter.activeSubCategory === subCategory;

              return (
                <button
                  key={subCategory}
                  onClick={() => setActiveSubCategory(isActive ? null : subCategory)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-nhtext transition-all duration-200',
                    isActive
                      ? 'bg-os-aperol text-white'
                      : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                  )}
                >
                  {subCategory}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
