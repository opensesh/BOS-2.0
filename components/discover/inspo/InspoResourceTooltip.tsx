'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const DEFAULT_COLOR = '#9CA3AF';

interface InspoResourceTooltipProps {
  resource: NormalizedResource | null;
  mousePosition: { x: number; y: number };
}

/**
 * InspoResourceTooltip
 * 
 * Card-style tooltip that follows the cursor and displays resource details.
 * Uses fixed positioning at document level to avoid clipping.
 */
export default function InspoResourceTooltip({
  resource,
  mousePosition,
}: InspoResourceTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });
  
  // Offset from cursor
  const OFFSET_X = 20;
  const OFFSET_Y = 20;
  
  // Calculate position with viewport edge detection
  useEffect(() => {
    if (!resource) return;
    
    // Use requestAnimationFrame for smoother positioning
    requestAnimationFrame(() => {
      if (!tooltipRef.current) {
        setAdjustedPosition({ x: mousePosition.x + OFFSET_X, y: mousePosition.y + OFFSET_Y });
        return;
      }
      
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let x = mousePosition.x + OFFSET_X;
      let y = mousePosition.y + OFFSET_Y;
      
      // Prevent overflow on right edge
      if (x + rect.width > viewportWidth - 20) {
        x = mousePosition.x - rect.width - OFFSET_X;
      }
      
      // Prevent overflow on bottom edge
      if (y + rect.height > viewportHeight - 20) {
        y = mousePosition.y - rect.height - OFFSET_Y;
      }
      
      // Ensure not off-screen on left/top
      x = Math.max(20, x);
      y = Math.max(20, y);
      
      setAdjustedPosition({ x, y });
    });
  }, [mousePosition, resource]);
  
  const categoryColor = resource?.category
    ? CATEGORY_COLORS[resource.category] || DEFAULT_COLOR
    : DEFAULT_COLOR;
  
  // Truncate description to 100 chars
  const truncatedDescription = resource?.description
    ? resource.description.length > 100
      ? resource.description.slice(0, 100) + '...'
      : resource.description
    : null;
  
  return (
    <AnimatePresence>
      {resource && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 5 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-[100] pointer-events-none"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
          }}
        >
          {/* Card Container */}
          <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 shadow-xl max-w-xs">
            {/* Title */}
            <h3 className="text-white font-semibold text-base leading-tight mb-2">
              {resource.name}
            </h3>
            
            {/* Category Badge */}
            <span 
              className="inline-flex items-center text-xs px-2 py-1 rounded-full text-white/90"
              style={{ backgroundColor: categoryColor }}
            >
              {resource.category || 'Uncategorized'}
            </span>
            
            {/* Description */}
            {truncatedDescription && (
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                {truncatedDescription}
              </p>
            )}
            
            {/* Click hint */}
            <p className="text-zinc-500 text-xs mt-3 pt-2 border-t border-zinc-800">
              Click to open resource →
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
