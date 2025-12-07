'use client';

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Settings, Box, Table2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { InspoTable } from '@/components/InspoTable';
import { useInspoStore } from '@/lib/stores/inspo-store';
import { getInspoResources, normalizeResource, type InspoResource, type NormalizedResource } from '@/lib/data/inspo';

// Dynamically import 3D components to avoid SSR issues
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

// Import InspoChat and CategoryButtons
const InspoChat = dynamic(
  () => import('@/components/discover/inspo/InspoChat').then(mod => ({ default: mod.InspoChat })),
  { ssr: false }
);

const CategoryButtons = dynamic(
  () => import('@/components/discover/inspo/CategoryButtons').then(mod => ({ default: mod.CategoryButtons })),
  { ssr: false }
);

type DisplayMode = '3d' | 'table';

function InspoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { togglePanel } = useInspoStore();
  
  // Display mode state (3D vs Table)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('3d');
  const [resources, setResources] = useState<InspoResource[]>([]);
  const [normalizedResources, setNormalizedResources] = useState<NormalizedResource[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Category filter state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Chat state
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch inspiration resources on mount
  useEffect(() => {
    async function fetchResources() {
      setIsLoadingData(true);
      setFetchError(null);
      const { data, error } = await getInspoResources();
      if (error) {
        console.error('Error fetching resources:', error);
        setFetchError(error.message || 'Failed to load resources');
      } else if (data) {
        setResources(data);
        setNormalizedResources(data.map(normalizeResource));
      }
      setIsLoadingData(false);
    }
    fetchResources();
  }, []);

  // Sync display mode from URL on mount
  useEffect(() => {
    const displayParam = searchParams.get('display') as DisplayMode | null;
    if (displayParam === 'table' || displayParam === '3d') {
      setDisplayMode(displayParam);
    }
  }, [searchParams]);

  // Handle display mode change
  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('display', mode);
    router.push(`/discover/inspo?${params.toString()}`, { scroll: false });
  };

  // Handle category change
  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    // Future: This will trigger filtering in the 3D visualization
  };

  // Handle chat submission
  const handleChatSubmit = (query: string) => {
    setIsProcessing(true);
    console.log('Inspo chat query:', query);
    // Future: This will filter/search the 3D visualization
    setTimeout(() => setIsProcessing(false), 1000);
  };

  // Filtered resources based on category
  const filteredResources = useMemo(() => {
    if (!activeCategory) return normalizedResources;
    return normalizedResources.filter(r => r.category === activeCategory);
  }, [normalizedResources, activeCategory]);

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-os-bg-dark pt-14 lg:pt-0 relative">
        
        {/* Header */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 md:px-12 md:py-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title and Tabs */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla">
                Discover
              </h1>

              {/* Tab Pills */}
              <div className="flex items-center bg-os-surface-dark/50 rounded-full p-1">
                <Link
                  href="/discover"
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-os-text-secondary-dark hover:text-brand-vanilla"
                >
                  News
                </Link>
                <Link
                  href="/discover?tab=Ideas"
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-os-text-secondary-dark hover:text-brand-vanilla"
                >
                  Ideas
                </Link>
                <Link
                  href="/discover/inspo"
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 bg-brand-aperol text-white"
                >
                  Inspo
                </Link>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {/* Display Mode Toggle (3D / Table) */}
              <div className="flex items-center bg-os-surface-dark rounded-lg p-1 border border-os-border-dark mr-1">
                <button
                  onClick={() => handleDisplayModeChange('3d')}
                  className={`p-2 rounded-md transition-all ${
                    displayMode === '3d'
                      ? 'bg-brand-aperol text-white'
                      : 'text-os-text-secondary-dark hover:text-brand-vanilla'
                  }`}
                  title="3D Explorer"
                >
                  <Box className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDisplayModeChange('table')}
                  className={`p-2 rounded-md transition-all ${
                    displayMode === 'table'
                      ? 'bg-brand-aperol text-white'
                      : 'text-os-text-secondary-dark hover:text-brand-vanilla'
                  }`}
                  title="Table View"
                >
                  <Table2 className="w-4 h-4" />
                </button>
              </div>

              {/* Settings */}
              <button
                onClick={togglePanel}
                className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors group"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {displayMode === '3d' ? (
          /* 3D Explorer Layout: Canvas → Categories → Chat */
          <div className="flex-1 flex flex-col min-h-0">
            {/* 3D Visualization - fixed smaller height */}
            <div className="relative flex-shrink-0" style={{ height: '45vh', minHeight: '280px', maxHeight: '400px' }}>
              {/* Gradient fade overlays */}
              <div 
                className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to bottom, #141414 0%, transparent 100%)'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to top, #141414 0%, transparent 100%)'
                }}
              />
              
              <motion.div
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <InspoCanvas />
              </motion.div>
            </div>

            {/* Category Buttons */}
            <div className="flex-shrink-0 py-4">
              {isLoadingData ? (
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <CategoryButtons 
                  resources={normalizedResources}
                  activeCategory={activeCategory}
                  onCategoryChange={handleCategoryChange}
                />
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Chat Input - fixed at bottom */}
            <div className="flex-shrink-0 w-full max-w-2xl mx-auto px-6 pb-8">
              <InspoChat 
                onSubmit={handleChatSubmit}
                isLoading={isProcessing}
                placeholder="Search or describe what you're looking for..."
              />
              
              {/* Resource count */}
              <p className="text-center text-xs text-os-text-secondary-dark mt-3">
                {activeCategory 
                  ? `${filteredResources.length} resources in "${activeCategory}"`
                  : `${normalizedResources.length} inspiration resources`
                }
              </p>
            </div>

            {/* Control Panel (3D Settings Drawer) */}
            <ControlPanel />
          </div>
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
              ) : fetchError ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-os-text-secondary-dark mb-2">Unable to load resources</p>
                  <p className="text-sm text-os-text-secondary-dark/60">{fetchError}</p>
                </div>
              ) : resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-os-text-secondary-dark mb-2">No inspiration resources found</p>
                  <p className="text-sm text-os-text-secondary-dark/60">
                    Check that the table exists and RLS policies allow public read access
                  </p>
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
