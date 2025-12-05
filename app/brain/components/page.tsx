'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ComponentsLayout } from '@/components/docs';
import { getComponentById, getAllComponents, ComponentDoc } from '@/lib/component-registry';
// Initialize registry with components
import '@/lib/component-registry-data';

export default function ComponentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<ComponentDoc | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('docs');

  // Get component and variant from URL params
  const componentIdFromUrl = searchParams.get('component');
  const variantIdFromUrl = searchParams.get('variant');

  // Initialize from URL params
  useEffect(() => {
    if (componentIdFromUrl) {
      const component = getComponentById(componentIdFromUrl);
      if (component) {
        setSelectedComponent(component);
        setSelectedVariant(variantIdFromUrl || 'docs');
      }
    } else {
      // Default to first component if none selected
      const allComponents = getAllComponents();
      if (allComponents.length > 0) {
        setSelectedComponent(allComponents[0]);
        setSelectedVariant('docs');
      }
    }
  }, [componentIdFromUrl, variantIdFromUrl]);

  const handleSelectComponent = (componentId: string, variantId?: string) => {
    const component = getComponentById(componentId);
    if (component) {
      setSelectedComponent(component);
      setSelectedVariant(variantId || 'docs');
      
      // Update URL
      const params = new URLSearchParams();
      params.set('component', componentId);
      if (variantId) {
        params.set('variant', variantId);
      }
      router.push(`/brain/components?${params.toString()}`);
    }
  };

  return (
    <ComponentsLayout
      selectedComponent={selectedComponent}
      selectedVariant={selectedVariant}
      onSelectComponent={handleSelectComponent}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  );
}
