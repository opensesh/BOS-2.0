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
  // Extract unique categories from resources
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    resources.forEach(resource => {
      if (resource.category) {
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
    <div className="flex flex-wrap items-center justify-center gap-2">
      {/* All button */}
      <motion.button
        onClick={() => onCategoryChange(null)}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
          transition-all duration-200 whitespace-nowrap
          ${activeCategory === null
            ? 'bg-brand-aperol text-white shadow-md shadow-brand-aperol/25'
            : 'bg-os-surface-dark/80 text-os-text-secondary-dark hover:text-brand-vanilla border border-os-border-dark/50'
          }
        `}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <span>All</span>
        <span className="opacity-60">({resources.length})</span>
      </motion.button>

      {/* Category buttons */}
      {categories.map((category) => {
        const isActive = activeCategory === category;
        const count = categoryCounts[category] || 0;

        return (
          <motion.button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              transition-all duration-200 whitespace-nowrap
              ${isActive
                ? 'bg-brand-aperol text-white shadow-md shadow-brand-aperol/25'
                : 'bg-os-surface-dark/80 text-os-text-secondary-dark hover:text-brand-vanilla border border-os-border-dark/50'
              }
            `}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{category}</span>
            <span className="opacity-60">({count})</span>
          </motion.button>
        );
      })}
    </div>
  );
}
