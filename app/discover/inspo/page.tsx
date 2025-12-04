'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { InspoHeader } from '@/components/discover/InspoHeader';
import { useInspoStore, ViewMode } from '@/lib/stores/inspo-store';

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

function InspoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode, setViewMode, isTransitioning, togglePanel } = useInspoStore();

  // Sync URL param with store on mount
  useEffect(() => {
    const viewParam = searchParams.get('view') as ViewMode | null;
    if (viewParam && VALID_VIEW_MODES.includes(viewParam)) {
      setViewMode(viewParam);
    }
  }, [searchParams, setViewMode]);

  // Handle view mode change - update URL
  const handleViewModeChange = (mode: ViewMode) => {
    if (isTransitioning) return;
    setViewMode(mode);
    router.push(`/discover/inspo?view=${mode}`, { scroll: false });
  };

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-os-bg-dark pt-14 lg:pt-0 relative">
        {/* Header - matches DiscoverLayout padding */}
        <div className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
          <InspoHeader
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            isTransitioning={isTransitioning}
            onSettingsClick={togglePanel}
          />
        </div>

        {/* 3D Visualization - fills remaining space */}
        <motion.div
          className="flex-1 w-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <InspoCanvas />
        </motion.div>

        {/* Control Panel - drawer */}
        <ControlPanel />
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
