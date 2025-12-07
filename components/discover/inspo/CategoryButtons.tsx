'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { NormalizedResource } from '@/lib/data/inspo';

interface CategoryButtonsProps {
  resources: NormalizedResource[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function CategoryButtons({ 
  resources, 
  activeCategory, 
  onCategoryChange 
}: CategoryButtonsProps) {
  // Extract unique categories from resources (exclude "All" variants as we add it manually)
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    resources.forEach(resource => {
      if (resource.category) {
        const cat = resource.category.trim();
        // Skip any variation of "All"
        if (cat.toLowerCase() !== 'all' && cat !== '') {
          categorySet.add(cat);
        }
      }
    });
    // Sort alphabetically but move "AI" to the end
    return Array.from(categorySet).sort((a, b) => {
      if (a.toUpperCase() === 'AI') return 1;
      if (b.toUpperCase() === 'AI') return -1;
      return a.localeCompare(b);
    });
  }, [resources]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-center gap-1.5 min-w-max px-2">
        {/* All button - resets filter */}
        <motion.button
          onClick={() => onCategoryChange(null)}
          className={`
            px-2.5 py-1 rounded-full text-[11px] font-medium
            transition-all duration-200 whitespace-nowrap
            ${activeCategory === null
              ? 'bg-brand-aperol text-white'
              : 'bg-os-surface-dark/60 text-os-text-secondary-dark hover:text-brand-vanilla border border-os-border-dark/40'
            }
          `}
          whileTap={{ scale: 0.95 }}
        >
          All
        </motion.button>

        {/* Category buttons */}
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                px-2.5 py-1 rounded-full text-[11px] font-medium
                transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? 'bg-brand-aperol text-white'
                  : 'bg-os-surface-dark/60 text-os-text-secondary-dark hover:text-brand-vanilla border border-os-border-dark/40'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
