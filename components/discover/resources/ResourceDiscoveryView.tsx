'use client';

import { Suspense } from 'react';
import ResourceDiscoveryCanvas from './ResourceDiscoveryCanvas';
import CategoryFilterBar from './CategoryFilterBar';
import ResourceTooltip from './ResourceTooltip';
import { useResourceDiscoveryStore } from '@/lib/stores/resource-discovery-store';

/**
 * ResourceDiscoveryView
 * 
 * Complete view component that combines:
 * - 3D particle visualization canvas
 * - Category filter bar
 * - Resource tooltip on hover
 * - Error handling
 * 
 * Usage:
 * ```tsx
 * import { ResourceDiscoveryView } from '@/components/discover/resources';
 * 
 * export default function DiscoverPage() {
 *   return (
 *     <div className="h-screen">
 *       <ResourceDiscoveryView />
 *     </div>
 *   );
 * }
 * ```
 */
export default function ResourceDiscoveryView() {
  const error = useResourceDiscoveryStore((state) => state.error);
  const resources = useResourceDiscoveryStore((state) => state.resources);
  const isLoading = useResourceDiscoveryStore((state) => state.isLoading);
  
  return (
    <div className="relative w-full h-full flex flex-col bg-os-charcoal overflow-hidden">
      {/* Header with filters */}
      <header className="relative z-10 p-4 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-nhdisplay font-bold text-xl text-os-vanilla">
              Resource Discovery
            </h1>
            <p className="text-sm text-neutral-400 font-nhtext">
              {isLoading 
                ? 'Loading resources...' 
                : `Explore ${resources.length} curated resources in 3D space`
              }
            </p>
          </div>
          
          {/* Stats */}
          {!isLoading && resources.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-2xl font-nhdisplay font-bold text-os-aperol">
                  {resources.length}
                </span>
                <p className="text-xs text-neutral-500 font-nhtext">Resources</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-nhdisplay font-bold text-os-vanilla">
                  {new Set(resources.map(r => r.category)).size}
                </span>
                <p className="text-xs text-neutral-500 font-nhtext">Categories</p>
              </div>
            </div>
          )}
        </div>
        
        <CategoryFilterBar />
      </header>
      
      {/* 3D Canvas */}
      <main className="relative flex-1 min-h-0">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 max-w-md text-center">
              <h2 className="font-nhdisplay font-bold text-lg text-red-400 mb-2">
                Failed to Load Resources
              </h2>
              <p className="text-sm text-red-300/80 font-nhtext mb-4">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg font-nhtext text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-os-charcoal">
              <div className="w-8 h-8 border-2 border-os-vanilla border-t-os-aperol rounded-full animate-spin" />
            </div>
          }>
            <ResourceDiscoveryCanvas />
          </Suspense>
        )}
        
        {/* Tooltip overlay */}
        <ResourceTooltip />
        
        {/* Instructions hint */}
        {!isLoading && !error && resources.length > 0 && (
          <div className="absolute bottom-6 right-6 z-10">
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-lg px-4 py-2">
              <p className="text-xs text-neutral-400 font-nhtext">
                <span className="text-neutral-300">Drag</span> to rotate • 
                <span className="text-neutral-300"> Scroll</span> to zoom • 
                <span className="text-neutral-300"> Click category</span> to focus
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


