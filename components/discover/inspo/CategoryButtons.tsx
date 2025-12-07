'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Code, 
  Layers, 
  Sparkles, 
  BookOpen, 
  Lightbulb,
  Shapes,
  Wand2
} from 'lucide-react';
import type { NormalizedResource } from '@/lib/data/inspo';

interface CategoryButtonsProps {
  resources: NormalizedResource[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

// Map category names to icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'design': Palette,
  'development': Code,
  'ui': Layers,
  'animation': Sparkles,
  'learning': BookOpen,
  'inspiration': Lightbulb,
  'tools': Wand2,
  'default': Shapes,
};

// Get icon for a category (case-insensitive matching)
function getCategoryIcon(category: string): React.ElementType {
  const lowerCategory = category.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lowerCategory.includes(key)) {
      return icon;
    }
  }
  return CATEGORY_ICONS.default;
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
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-center gap-2 px-4 py-2 min-w-max">
        {/* All button */}
        <motion.button
          onClick={() => onCategoryChange(null)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-200 whitespace-nowrap
            ${activeCategory === null
              ? 'bg-brand-aperol text-white shadow-lg shadow-brand-aperol/25'
              : 'bg-os-surface-dark text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark/80 border border-os-border-dark'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shapes className="w-4 h-4" />
          <span>All</span>
          <span className="text-xs opacity-70">({resources.length})</span>
        </motion.button>

        {/* Category buttons */}
        {categories.map((category) => {
          const Icon = getCategoryIcon(category);
          const isActive = activeCategory === category;
          const count = categoryCounts[category] || 0;

          return (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? 'bg-brand-aperol text-white shadow-lg shadow-brand-aperol/25'
                  : 'bg-os-surface-dark text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark/80 border border-os-border-dark'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              <span>{category}</span>
              <span className="text-xs opacity-70">({count})</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
