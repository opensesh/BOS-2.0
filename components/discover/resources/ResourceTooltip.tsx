'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Tag, Folder, Box } from 'lucide-react';
import { useResourceDiscoveryStore } from '@/lib/stores/resource-discovery-store';
import { DEFAULT_CATEGORY_COLORS } from '@/types/resource-discovery';

/**
 * ResourceTooltip
 * 
 * Floating tooltip that displays resource details on hover
 * Positioned in the corner to not obscure the 3D visualization
 */
export default function ResourceTooltip() {
  const hoveredResourceId = useResourceDiscoveryStore((state) => state.hoveredResourceId);
  const resources = useResourceDiscoveryStore((state) => state.resources);
  
  const hoveredResource = useMemo(() => {
    if (!hoveredResourceId) return null;
    return resources.find(r => r.id === hoveredResourceId);
  }, [hoveredResourceId, resources]);
  
  const categoryColor = hoveredResource?.category 
    ? DEFAULT_CATEGORY_COLORS[hoveredResource.category] || DEFAULT_CATEGORY_COLORS.default
    : DEFAULT_CATEGORY_COLORS.default;
  
  return (
    <AnimatePresence>
      {hoveredResource && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-6 left-6 z-20 max-w-sm"
        >
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-xl p-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              {/* Thumbnail or placeholder */}
              <div 
                className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden"
                style={{ borderColor: categoryColor, borderWidth: 2 }}
              >
                {hoveredResource.thumbnail ? (
                  <img 
                    src={hoveredResource.thumbnail} 
                    alt={hoveredResource.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Box className="w-5 h-5 text-neutral-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-nhdisplay font-bold text-os-vanilla text-base leading-tight truncate">
                  {hoveredResource.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <span className="text-xs text-neutral-400 font-nhtext">
                    {hoveredResource.category || 'Uncategorized'}
                  </span>
                  {hoveredResource.subCategory && (
                    <>
                      <span className="text-neutral-600">•</span>
                      <span className="text-xs text-neutral-500 font-nhtext">
                        {hoveredResource.subCategory}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            {hoveredResource.description && (
              <p className="text-sm text-neutral-400 font-nhtext mb-3 line-clamp-2">
                {hoveredResource.description}
              </p>
            )}
            
            {/* Tags */}
            {hoveredResource.tags && hoveredResource.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Tag className="w-3 h-3 text-neutral-500" />
                {hoveredResource.tags.slice(0, 4).map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded text-xs font-nhtext"
                  >
                    {tag}
                  </span>
                ))}
                {hoveredResource.tags.length > 4 && (
                  <span className="text-xs text-neutral-500">
                    +{hoveredResource.tags.length - 4} more
                  </span>
                )}
              </div>
            )}
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <div className="flex items-center gap-3">
                {hoveredResource.pricing && (
                  <span className={`text-xs font-nhtext px-2 py-0.5 rounded ${
                    hoveredResource.pricing.toLowerCase() === 'free' 
                      ? 'bg-emerald-900/50 text-emerald-400'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {hoveredResource.pricing}
                  </span>
                )}
                {hoveredResource.featured && (
                  <span className="text-xs font-nhtext px-2 py-0.5 rounded bg-os-aperol/20 text-os-aperol">
                    Featured
                  </span>
                )}
              </div>
              
              <a 
                href={hoveredResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-os-vanilla transition-colors font-nhtext"
                onClick={(e) => e.stopPropagation()}
              >
                Visit
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


