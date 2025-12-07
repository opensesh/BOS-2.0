'use client';

import React, { useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Box, Table2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { InspoTable } from '@/components/InspoTable';
import { getInspoResources, normalizeResource, type InspoResource, type NormalizedResource } from '@/lib/data/inspo';

// Dynamically import 3D components to avoid SSR issues
const InspoCanvas = dynamic<{
  resources?: NormalizedResource[];
  activeFilter?: string | null;
  activeSubFilter?: string | null;
  filteredResourceIds?: number[] | null;
  onResourceHover?: (resource: NormalizedResource | null, mousePosition: { x: number; y: number }) => void;
  onResourceClick?: (resource: NormalizedResource) => void;
}>(
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

// Import tooltip component
const InspoResourceTooltip = dynamic(
  () => import('@/components/discover/inspo/InspoResourceTooltip'),
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

// Import AI response component
const AIFilterResponse = dynamic(
  () => import('@/components/discover/inspo/AIFilterResponse').then(mod => ({ default: mod.AIFilterResponse })),
  { ssr: false }
);

type DisplayMode = '3d' | 'table';

/**
 * Simple semantic search function
 * Searches through resource name, description, category, subcategory, and tags
 * Returns matching resource IDs and a response message
 */
function semanticSearch(
  query: string, 
  resources: NormalizedResource[]
): { matchedIds: number[]; message: string } {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  // Score each resource based on relevance
  const scored = resources.map(resource => {
    let score = 0;
    const searchText = [
      resource.name,
      resource.description,
      resource.category,
      resource.subCategory,
      ...(resource.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Exact phrase match (highest score)
    if (searchText.includes(queryLower)) {
      score += 10;
    }
    
    // Word matches
    queryWords.forEach(word => {
      if (searchText.includes(word)) {
        score += 2;
      }
      // Partial word match
      if (searchText.split(/\s+/).some(w => w.startsWith(word))) {
        score += 1;
      }
    });
    
    // Boost for name matches
    if (resource.name?.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    return { resource, score };
  });
  
  // Filter to resources with positive scores, sorted by score
  const matches = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.resource);
  
  // Generate a natural response message
  let message = '';
  if (matches.length === 0) {
    message = `I couldn't find any resources matching "${query}". Try different keywords or browse the categories below.`;
  } else if (matches.length === 1) {
    message = `I found one resource that matches your search. It's "${matches[0].name}" from the ${matches[0].category || 'general'} category.`;
  } else if (matches.length <= 5) {
    const categories = [...new Set(matches.map(m => m.category).filter(Boolean))];
    message = `Great news! I found ${matches.length} resources for you. They span ${categories.length > 1 ? `categories like ${categories.slice(0, 2).join(' and ')}` : `the ${categories[0] || 'various'} category`}.`;
  } else {
    const topCategories = [...new Set(matches.slice(0, 10).map(m => m.category).filter(Boolean))];
    message = `I found ${matches.length} resources related to "${query}". Most are in ${topCategories.slice(0, 2).join(' and ')} categories. The highlighted nodes are your matches!`;
  }
  
  return {
    matchedIds: matches.map(m => m.id),
    message
  };
}

function InspoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Display mode state (3D vs Table)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('3d');
  const [resources, setResources] = useState<InspoResource[]>([]);
  const [normalizedResources, setNormalizedResources] = useState<NormalizedResource[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Category and subcategory filter state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  
  // AI chat filter state
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [filteredResourceIds, setFilteredResourceIds] = useState<number[] | null>(null);
  
  // Hover state for 3D tooltip
  const [hoveredResource, setHoveredResource] = useState<NormalizedResource | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    setActiveSubCategory(null); // Reset subcategory when category changes
    // Clear AI filter when manually selecting category
    setAiResponse(null);
    setFilteredResourceIds(null);
  };

  // Handle subcategory change
  const handleSubCategoryChange = (subCategory: string | null) => {
    setActiveSubCategory(subCategory);
    // Clear AI filter when manually selecting subcategory
    setAiResponse(null);
    setFilteredResourceIds(null);
  };

  // Handle chat submission - semantic search
  const handleChatSubmit = useCallback((query: string) => {
    setIsProcessing(true);
    
    // Clear category filters when using AI search
    setActiveCategory(null);
    setActiveSubCategory(null);
    
    // Simulate slight delay for natural feel
    setTimeout(() => {
      const { matchedIds, message } = semanticSearch(query, normalizedResources);
      setFilteredResourceIds(matchedIds.length > 0 ? matchedIds : null);
      setAiResponse(message);
      setIsProcessing(false);
    }, 500);
  }, [normalizedResources]);

  // Dismiss AI response
  const handleDismissAiResponse = useCallback(() => {
    setAiResponse(null);
    setFilteredResourceIds(null);
  }, []);

  // Handle resource hover from 3D canvas
  const handleResourceHover = useCallback((
    resource: NormalizedResource | null,
    position: { x: number; y: number }
  ) => {
    setHoveredResource(resource);
    setMousePosition(position);
  }, []);

  // Handle resource click - navigate to internal resource page
  const handleResourceClick = useCallback((resource: NormalizedResource) => {
    router.push(`/discover/inspo/${resource.id}`);
  }, [router]);

  // Calculate visible resource count
  const visibleResourceCount = useMemo(() => {
    if (filteredResourceIds) {
      return filteredResourceIds.length;
    }
    if (activeSubCategory) {
      return normalizedResources.filter(r => 
        r.category === activeCategory && r.subCategory === activeSubCategory
      ).length;
    }
    if (activeCategory) {
      return normalizedResources.filter(r => r.category === activeCategory).length;
    }
    return normalizedResources.length;
  }, [normalizedResources, activeCategory, activeSubCategory, filteredResourceIds]);

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-os-bg-dark pt-14 lg:pt-0 relative">
        
        {/* Header - compact for maximizing canvas space */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 md:px-12 md:py-6">
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
              <div className="flex items-center bg-os-surface-dark rounded-lg p-1 border border-os-border-dark">
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
            </div>
          </div>
        </div>

        {displayMode === '3d' ? (
          /* 3D Explorer Layout: Canvas between header and controls */
          <div className="flex-1 flex flex-col min-h-0">
            {/* 3D Visualization - takes available space above controls */}
            <div className="flex-1 relative min-h-0">
              {/* Top gradient fade */}
              <div 
                className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to bottom, #141414 0%, transparent 100%)'
                }}
              />
              {/* Bottom gradient fade - blends into controls area */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
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
                <InspoCanvas 
                  resources={normalizedResources}
                  activeFilter={activeCategory}
                  activeSubFilter={activeSubCategory}
                  filteredResourceIds={filteredResourceIds}
                  onResourceHover={handleResourceHover}
                  onResourceClick={handleResourceClick}
                />
              </motion.div>
            </div>

            {/* Bottom controls - fixed height, proper spacing */}
            <div className="flex-shrink-0 relative z-20 bg-os-bg-dark">
              {/* Top gradient overlay for seamless blend */}
              <div 
                className="absolute -top-8 left-0 right-0 h-8 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, #141414 100%)'
                }}
              />
              
              <div className="w-full max-w-2xl mx-auto px-6 pt-2 pb-6 space-y-3">
                {/* AI Response - appears above chat when active */}
                <AIFilterResponse
                  message={aiResponse}
                  isTyping={isProcessing}
                  onDismiss={handleDismissAiResponse}
                  matchCount={filteredResourceIds?.length}
                />
                
                {/* Chat Input */}
                <InspoChat 
                  onSubmit={handleChatSubmit}
                  isLoading={isProcessing}
                  placeholder="Describe what you're looking for... (e.g., 'tools for YouTube creators')"
                />
                
                {/* Category Buttons */}
                {isLoadingData ? (
                  <div className="flex justify-center">
                    <div className="w-5 h-5 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <CategoryButtons 
                    resources={normalizedResources}
                    activeCategory={activeCategory}
                    activeSubCategory={activeSubCategory}
                    onCategoryChange={handleCategoryChange}
                    onSubCategoryChange={handleSubCategoryChange}
                  />
                )}
                
                {/* Resource count */}
                <p className="text-center text-xs text-os-text-secondary-dark/80">
                  {filteredResourceIds
                    ? `${visibleResourceCount} matching resource${visibleResourceCount !== 1 ? 's' : ''}`
                    : activeSubCategory
                      ? `${visibleResourceCount} resources in "${activeSubCategory}"`
                      : activeCategory 
                        ? `${visibleResourceCount} resources in "${activeCategory}"`
                        : `${normalizedResources.length} inspiration resources`
                  }
                </p>
              </div>
            </div>
            
            {/* Tooltip - rendered at page level with fixed positioning */}
            <InspoResourceTooltip
              resource={hoveredResource}
              mousePosition={mousePosition}
            />
          </div>
        ) : (
          /* Table View */
          <motion.div
            className="flex-1 w-full overflow-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full max-w-6xl mx-auto px-6 md:px-12 pb-12">
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
