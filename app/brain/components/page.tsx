'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { ComponentsDrawer } from '@/components/docs/ComponentsDrawer';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { ComponentsList } from '@/components/docs/ComponentsList';
import { PageTransition, MotionItem } from '@/lib/motion';
import { ArrowLeft, Loader2, LayoutList, PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getComponentById, getAllComponents, ComponentDoc } from '@/lib/component-registry';
// Initialize registry with components
import '@/lib/component-registry-data';

function ComponentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showListView, setShowListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<ComponentDoc | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('default');

  // Get component from URL params
  const componentIdFromUrl = searchParams.get('component');
  const variantIdFromUrl = searchParams.get('variant');
  const fromListParam = searchParams.get('from') === 'list';

  // Initialize from URL params
  useEffect(() => {
    if (componentIdFromUrl) {
      const component = getComponentById(componentIdFromUrl);
      if (component) {
        setSelectedComponent(component);
        setSelectedVariant(variantIdFromUrl || 'default');
      }
    } else {
      // Default to first component if none selected
      const allComponents = getAllComponents();
      if (allComponents.length > 0) {
        setSelectedComponent(allComponents[0]);
        setSelectedVariant('default');
      }
    }
  }, [componentIdFromUrl, variantIdFromUrl]);

  const handleSelectComponent = (componentId: string) => {
    const component = getComponentById(componentId);
    if (component) {
      setSelectedComponent(component);
      setSelectedVariant('default');
      
      // Update URL
      const params = new URLSearchParams();
      params.set('component', componentId);
      router.push(`/brain/components?${params.toString()}`);
    }
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariant(variantId);
    
    // Update URL
    if (selectedComponent) {
      const params = new URLSearchParams();
      params.set('component', selectedComponent.id);
      if (variantId !== 'default') {
        params.set('variant', variantId);
      }
      router.push(`/brain/components?${params.toString()}`);
    }
  };

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      
      {/* Component Navigation Drawer */}
      <ComponentsDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        selectedComponentId={selectedComponent?.id}
        onSelectComponent={(componentId) => {
          // Navigate to All Components view and highlight the selected component
          setShowListView(true);
          const component = getComponentById(componentId);
          if (component) {
            setSelectedComponent(component);
            setSelectedVariant('default');
          }
          // Update URL to include the component for reference
          const params = new URLSearchParams();
          params.set('component', componentId);
          params.set('from', 'drawer');
          router.push(`/brain/components?${params.toString()}`);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-os-bg-dark pt-14 lg:pt-0">
        <PageTransition className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
          {/* Back Button & Actions Row */}
          <MotionItem className="flex items-center justify-between mb-8">
            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              {/* Back to Brain - always shown */}
              <Link
                href="/brain"
                className="group inline-flex items-center gap-2 text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Back to Brain</span>
              </Link>
              
              {/* All Components breadcrumb - always shown when viewing a component */}
              {!showListView && (
                <>
                  <span className="text-os-text-secondary-dark/40">/</span>
                  <button
                    onClick={() => {
                      // Navigate to list view
                      setShowListView(true);
                      router.push('/brain/components');
                    }}
                    className="text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
                  >
                    <span className="text-sm font-medium">All Components</span>
                  </button>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* All Components Button */}
              <button
                onClick={() => {
                  if (showListView) {
                    setShowListView(false);
                  } else {
                    setShowListView(true);
                    // Clear 'from' param when opening list view directly
                    router.push('/brain/components');
                  }
                }}
                className={cn(
                  "group relative p-3 rounded-xl border transition-colors",
                  showListView 
                    ? "bg-brand-aperol/20 border-brand-aperol/50 text-brand-aperol" 
                    : "bg-os-surface-dark hover:bg-os-border-dark border-os-border-dark text-os-text-secondary-dark hover:text-brand-vanilla"
                )}
                title="All Components"
              >
                <LayoutList className="w-5 h-5 transition-colors" />
              </button>
              
              {/* Show Components Drawer Button */}
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className={cn(
                  "group relative p-3 rounded-xl border transition-colors",
                  isDrawerOpen 
                    ? "bg-brand-aperol/20 border-brand-aperol/50 text-brand-aperol" 
                    : "bg-os-surface-dark hover:bg-os-border-dark border-os-border-dark text-os-text-secondary-dark hover:text-brand-vanilla"
                )}
                title="Show Components"
              >
                <PanelRight className="w-5 h-5 transition-colors" />
              </button>
            </div>
          </MotionItem>

          {/* Page Header */}
          <MotionItem className="flex flex-col gap-2 mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla leading-tight">
              {showListView ? 'All Components' : (selectedComponent?.name || 'Components')}
            </h1>
            <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
              {showListView 
                ? 'Browse all registered components with metadata including creation date, category, and usage statistics.'
                : (selectedComponent?.description || 'Interactive component documentation and live preview. Select a component from the drawer to explore its props and variants.')}
            </p>
          </MotionItem>

          {/* Content - List View or Component Preview */}
          <MotionItem>
            {showListView ? (
              <ComponentsList 
                onSelectComponent={(componentId) => {
                  // Navigate with 'from=list' param for breadcrumb
                  const params = new URLSearchParams();
                  params.set('component', componentId);
                  params.set('from', 'list');
                  router.push(`/brain/components?${params.toString()}`);
                  setShowListView(false);
                  
                  // Also update local state
                  const component = getComponentById(componentId);
                  if (component) {
                    setSelectedComponent(component);
                    setSelectedVariant('default');
                  }
                }}
                onClose={() => setShowListView(false)}
              />
            ) : (
              <ComponentPreview
                component={selectedComponent}
                selectedVariant={selectedVariant}
                onVariantChange={handleVariantChange}
              />
            )}
          </MotionItem>
        </PageTransition>
      </div>
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen items-center justify-center bg-os-bg-dark text-os-text-primary-dark">
          <Loader2 className="w-8 h-8 animate-spin text-brand-aperol" />
        </div>
      }
    >
      <ComponentsContent />
    </Suspense>
  );
}
