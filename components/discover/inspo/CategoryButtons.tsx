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
  // Extract unique categories from resources (exclude "All" as we add it manually)
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    resources.forEach(resource => {
      if (resource.category && resource.category.toLowerCase() !== 'all') {
        categorySet.add(resource.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [resources]);

  // Count resources per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach(resource => {
      if (resource.category) {
        counts[resource.category] = (counts[resource.category] || 0) + 1;
      }
    });
    return counts;
  }, [resources]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* All button */}
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
  );
}
