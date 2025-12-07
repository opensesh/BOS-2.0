'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Box } from 'lucide-react';
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
 * Floating tooltip that follows the cursor and displays resource details.
 * Positioned near cursor with smart viewport edge detection.
 */
export default function InspoResourceTooltip({
  resource,
  mousePosition,
}: InspoResourceTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });
  
  // Offset from cursor
  const OFFSET_X = 15;
  const OFFSET_Y = 15;
  
  // Calculate position with viewport edge detection
  useEffect(() => {
    if (!resource || !tooltipRef.current) {
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
          }}
        >
          <div className="bg-black/90 backdrop-blur-md border border-neutral-700 rounded-lg p-3 shadow-2xl max-w-xs">
            {/* Header with thumbnail */}
            <div className="flex items-start gap-3 mb-2">
              {/* Category indicator / thumbnail */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                style={{ 
                  backgroundColor: `${categoryColor}20`,
                  border: `2px solid ${categoryColor}` 
                }}
              >
                {resource.thumbnail ? (
                  <img 
                    src={resource.thumbnail} 
                    alt={resource.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Box className="w-4 h-4" style={{ color: categoryColor }} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="font-bold text-white text-sm leading-tight truncate">
                  {resource.name}
                </h3>
                
                {/* Category badge */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <span className="text-xs text-neutral-400">
                    {resource.category || 'Uncategorized'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            {truncatedDescription && (
              <p className="text-xs text-neutral-400 mb-2 leading-relaxed">
                {truncatedDescription}
              </p>
            )}
            
            {/* Footer with pricing and action hint */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
              <div className="flex items-center gap-2">
                {resource.pricing && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    resource.pricing.toLowerCase() === 'free' 
                      ? 'bg-emerald-900/50 text-emerald-400'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {resource.pricing}
                  </span>
                )}
                {resource.featured && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-orange-900/50 text-orange-400">
                    Featured
                  </span>
                )}
              </div>
              
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                Click to visit
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
