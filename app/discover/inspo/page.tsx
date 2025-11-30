'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/Sidebar';
import { DiscoverLayout } from '@/components/discover/DiscoverLayout';
import { InspoHeader } from '@/components/discover/InspoHeader';
import { useInspoStore, ViewMode } from '@/lib/stores/inspo-store';

// Dynamically import the 3D canvas to avoid SSR issues
const InspoCanvas = dynamic(
  () => import('@/components/discover/inspo/InspoCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[60vh] flex items-center justify-center rounded-2xl bg-os-surface-dark/50">
        <div className="w-8 h-8 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
);

function InspoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode, setViewMode, isTransitioning } = useInspoStore();

  // Sync URL param with store on mount
  useEffect(() => {
    const viewParam = searchParams.get('view') as ViewMode | null;
    if (viewParam && ['sphere', 'galaxy', 'grid'].includes(viewParam)) {
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
      <DiscoverLayout>
        {/* Header with tabs and filters */}
        <InspoHeader
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          isTransitioning={isTransitioning}
        />

        {/* 3D Visualization Container */}
        <div className="w-full h-[60vh] rounded-2xl overflow-hidden bg-os-surface-dark/50 border border-os-border-dark/30">
          <InspoCanvas />
        </div>
      </DiscoverLayout>
    </div>
  );
}

export default function InspoPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
        <Sidebar />
        <DiscoverLayout>
          <div className="h-12 mb-6" /> {/* Placeholder for header */}
          <div className="w-full h-[60vh] flex items-center justify-center rounded-2xl bg-os-surface-dark/50 border border-os-border-dark/30">
            <div className="w-8 h-8 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin" />
          </div>
        </DiscoverLayout>
      </div>
    }>
      <InspoContent />
    </Suspense>
  );
}
