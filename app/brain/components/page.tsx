'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { ComponentsDrawer } from '@/components/docs/ComponentsDrawer';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { PageTransition, MotionItem } from '@/lib/motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getComponentById, getAllComponents, ComponentDoc } from '@/lib/component-registry';
// Initialize registry with components
import '@/lib/component-registry-data';

function ComponentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<ComponentDoc | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('default');

  // Get component from URL params
  const componentIdFromUrl = searchParams.get('component');
  const variantIdFromUrl = searchParams.get('variant');

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
        onSelectComponent={handleSelectComponent}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-os-bg-dark pt-14 lg:pt-0">
        <PageTransition className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
          {/* Back Button Row */}
          <MotionItem className="mb-8">
            <Link
              href="/brain"
              className="group inline-flex items-center gap-2 text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Brain</span>
            </Link>
          </MotionItem>

          {/* Page Header */}
          <MotionItem className="flex flex-col gap-2 mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla leading-tight">
              {selectedComponent?.name || 'Components'}
            </h1>
            <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
              {selectedComponent?.description || 'Interactive component documentation and live preview. Select a component from the drawer to explore its props and variants.'}
            </p>
          </MotionItem>

          {/* Component Preview */}
          <MotionItem>
            <ComponentPreview
              component={selectedComponent}
              selectedVariant={selectedVariant}
              onVariantChange={handleVariantChange}
            />
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
