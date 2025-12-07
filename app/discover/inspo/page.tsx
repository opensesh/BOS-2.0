'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Box, Table2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { InspoHeader } from '@/components/discover/InspoHeader';
import { InspoTable } from '@/components/InspoTable';
import { useInspoStore, ViewMode } from '@/lib/stores/inspo-store';
import { getInspoResources, type InspoResource } from '@/lib/data/inspo';

// Dynamically import the 3D canvas and control panel to avoid SSR issues
const InspoCanvas = dynamic(
  () => import('@/components/discover/inspo/InspoCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
);

const ControlPanel = dynamic(
  () => import('@/components/discover/inspo/ControlPanel'),
  { ssr: false }
);

// Valid view modes for URL param validation
const VALID_VIEW_MODES: ViewMode[] = ['sphere', 'galaxy', 'grid', 'nebula', 'starfield', 'vortex'];

type DisplayMode = '3d' | 'table';

function InspoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode, setViewMode, isTransitioning, togglePanel } = useInspoStore();
  
  // Display mode state (3D vs Table)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('3d');
  const [resources, setResources] = useState<InspoResource[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch inspiration resources on mount
  useEffect(() => {
    async function fetchResources() {
      setIsLoadingData(true);
      const { data, error } = await getInspoResources();
      if (error) {
        console.error('Error fetching resources:', error);
      } else if (data) {
        setResources(data);
      }
      setIsLoadingData(false);
    }
    fetchResources();
  }, []);

  // Sync URL param with store on mount
  useEffect(() => {
    const viewParam = searchParams.get('view') as ViewMode | null;
    if (viewParam && VALID_VIEW_MODES.includes(viewParam)) {
      setViewMode(viewParam);
    }
    // Check for display mode in URL
    const displayParam = searchParams.get('display') as DisplayMode | null;
    if (displayParam === 'table' || displayParam === '3d') {
      setDisplayMode(displayParam);
    }
  }, [searchParams, setViewMode]);

  // Handle view mode change - update URL
  const handleViewModeChange = (mode: ViewMode) => {
    if (isTransitioning) return;
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`/discover/inspo?${params.toString()}`, { scroll: false });
  };

  // Handle display mode change
  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('display', mode);
    router.push(`/discover/inspo?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-os-bg-dark pt-14 lg:pt-0 relative">
        {/* Header - matches DiscoverLayout padding exactly */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
          <InspoHeader
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            isTransitioning={isTransitioning}
            onSettingsClick={togglePanel}
          />

          {/* Display Mode Toggle (3D Explorer | Table View) */}
          <div className="flex items-center justify-center mt-6">
            <div className="inline-flex items-center bg-os-surface-dark rounded-lg p-1 border border-os-border-dark">
              <button
                onClick={() => handleDisplayModeChange('3d')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  displayMode === '3d'
                    ? 'bg-brand-aperol text-white shadow-sm'
                    : 'text-os-text-secondary-dark hover:text-brand-vanilla'
                }`}
              >
                <Box className="w-4 h-4" />
                <span>3D Explorer</span>
              </button>
              <button
                onClick={() => handleDisplayModeChange('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  displayMode === 'table'
                    ? 'bg-brand-aperol text-white shadow-sm'
                    : 'text-os-text-secondary-dark hover:text-brand-vanilla'
                }`}
              >
                <Table2 className="w-4 h-4" />
                <span>Table View</span>
              </button>
            </div>
          </div>
        </div>

        {displayMode === '3d' ? (
          <>
            {/* Gradient fade overlay - seamless transition from header to canvas */}
            <div className="absolute top-14 lg:top-0 left-0 right-0 h-48 md:h-64 pointer-events-none z-[5]"
              style={{
                background: 'linear-gradient(to bottom, #141414 0%, #141414 50%, transparent 100%)'
              }}
            />

            {/* 3D Visualization - fills remaining space, pulled up to overlap with gradient */}
            <motion.div
              className="flex-1 w-full -mt-20 md:-mt-28"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <InspoCanvas />
            </motion.div>

            {/* Control Panel - drawer (only in 3D mode) */}
            <ControlPanel />
          </>
        ) : (
          /* Table View */
          <motion.div
            className="flex-1 w-full overflow-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full max-w-7xl mx-auto px-6 pb-12">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <InspoTable resources={resources} />
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function InspoPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-os-bg-dark pt-14 lg:pt-0">
          <div className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
            <div className="h-12" />
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </div>
    }>
      <InspoContent />
    </Suspense>
  );
}
