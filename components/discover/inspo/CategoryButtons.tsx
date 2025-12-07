'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { NormalizedResource } from '@/lib/data/inspo';

/**
 * Category Color Mapping (matching ResourceNodes)
 */
const CATEGORY_COLORS: Record<string, string> = {
  'Community': '#3B82F6',
  'Contractors': '#8B5CF6',
  'Inspiration': '#FF5102',
  'Learning': '#10B981',
  'Templates': '#F59E0B',
  'Tools': '#EC4899',
  'AI': '#06B6D4',
};

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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  // Extract unique categories from resources
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    resources.forEach(resource => {
      if (resource.category) {
        const cat = resource.category.trim();
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

        {/* Category buttons with color-coded hover */}
        {categories.map((category) => {
          const isActive = activeCategory === category;
          const isHovered = hoveredCategory === category;
          const categoryColor = CATEGORY_COLORS[category] || '#9CA3AF';

          return (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`
                px-2.5 py-1 rounded-full text-[11px] font-medium
                transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? 'text-white'
                  : 'bg-os-surface-dark/60 text-os-text-secondary-dark border border-os-border-dark/40'
                }
              `}
              style={{
                backgroundColor: isActive 
                  ? categoryColor 
                  : isHovered 
                    ? `${categoryColor}20` 
                    : undefined,
                borderColor: isHovered && !isActive ? categoryColor : undefined,
                color: isHovered && !isActive ? categoryColor : undefined,
              }}
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
