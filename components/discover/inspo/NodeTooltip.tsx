'use client';

import { useInspoStore } from '@/lib/stores/inspo-store';
import { ExternalLink } from 'lucide-react';

export function NodeTooltip() {
  const hoveredNodeId = useInspoStore((state) => state.hoveredNodeId);
  const resources = useInspoStore((state) => state.resources);
  
  if (hoveredNodeId === null || !resources[hoveredNodeId]) {
    return null;
  }
  
  const resource = resources[hoveredNodeId];
  
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className="bg-os-surface-dark/95 backdrop-blur-sm border border-os-border-dark rounded-xl px-4 py-3 shadow-xl min-w-[200px] max-w-[320px]">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-brand-vanilla truncate">
              {resource.name}
            </h3>
            {resource.description && (
              <p className="text-xs text-os-text-secondary-dark mt-1 line-clamp-2">
                {resource.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {resource.category && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-aperol/20 text-brand-aperol">
                  {resource.category}
                </span>
              )}
              {resource.pricing && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-os-border-dark text-os-text-secondary-dark">
                  {resource.pricing}
                </span>
              )}
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-os-text-secondary-dark flex-shrink-0 mt-0.5" />
        </div>
      </div>
    </div>
  );
}
