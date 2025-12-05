'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, SlidersHorizontal } from 'lucide-react';
import { ComponentsNavigation } from './ComponentsNavigation';
import { ComponentPreview } from './ComponentPreview';
import { ComponentControls } from './ComponentControls';
import { ComponentDoc, ControlDefinition } from '@/lib/component-registry';
import { slideFromLeft, slideFromRight, overlayFade } from '@/lib/motion';

interface ComponentsLayoutProps {
  selectedComponent: ComponentDoc | null;
  selectedVariant: string;
  onSelectComponent: (componentId: string, variantId?: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ComponentsLayout({
  selectedComponent,
  selectedVariant,
  onSelectComponent,
  searchQuery,
  onSearchChange,
}: ComponentsLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [componentProps, setComponentProps] = useState<Record<string, any>>({});

  // Initialize props when component changes
  React.useEffect(() => {
    if (selectedComponent) {
      // Get variant props if applicable
      const variant = selectedComponent.variants?.find(v => v.id === selectedVariant);
      const variantProps = variant?.props || {};
      
      setComponentProps({
        ...selectedComponent.defaultProps,
        ...variantProps,
      });
    }
  }, [selectedComponent, selectedVariant]);

  const handlePropChange = useCallback((name: string, value: any) => {
    setComponentProps(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleResetProps = useCallback(() => {
    if (selectedComponent) {
      const variant = selectedComponent.variants?.find(v => v.id === selectedVariant);
      const variantProps = variant?.props || {};
      setComponentProps({
        ...selectedComponent.defaultProps,
        ...variantProps,
      });
    }
  }, [selectedComponent, selectedVariant]);

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans overflow-hidden">
      {/* Mobile/Tablet Nav Toggle - Fixed top left */}
      <button
        onClick={() => setIsNavOpen(true)}
        className="fixed top-4 left-4 z-50 xl:hidden p-2 rounded-lg bg-os-surface-dark border border-os-border-dark hover:bg-os-border-dark transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5 text-brand-vanilla" />
      </button>

      {/* Mobile/Tablet Controls Toggle - Fixed top right */}
      <button
        onClick={() => setIsControlsOpen(true)}
        className="fixed top-4 right-4 z-50 xl:hidden p-2 rounded-lg bg-os-surface-dark border border-os-border-dark hover:bg-os-border-dark transition-colors"
        aria-label="Open controls"
      >
        <SlidersHorizontal className="w-5 h-5 text-brand-vanilla" />
      </button>

      {/* Mobile/Tablet Navigation Overlay */}
      <AnimatePresence>
        {isNavOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 xl:hidden"
              variants={overlayFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsNavOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-os-bg-darker border-r border-os-border-dark xl:hidden"
              variants={slideFromLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between p-4 border-b border-os-border-dark">
                <span className="font-display font-semibold text-brand-vanilla">Components</span>
                <button
                  onClick={() => setIsNavOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-os-border-dark transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5 text-os-text-secondary-dark" />
                </button>
              </div>
              <ComponentsNavigation
                selectedComponentId={selectedComponent?.id}
                selectedVariantId={selectedVariant}
                onSelect={(componentId, variantId) => {
                  onSelectComponent(componentId, variantId);
                  setIsNavOpen(false);
                }}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Left Navigation - Fixed 280px */}
      <aside className="hidden xl:flex flex-col w-[280px] bg-os-bg-darker border-r border-os-border-dark flex-shrink-0">
        <div className="flex items-center gap-2 p-4 border-b border-os-border-dark">
          <span className="font-display font-semibold text-brand-vanilla text-lg">Components</span>
        </div>
        <ComponentsNavigation
          selectedComponentId={selectedComponent?.id}
          selectedVariantId={selectedVariant}
          onSelect={onSelectComponent}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </aside>

      {/* Main Content - Center Preview */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 xl:pt-0">
        <ComponentPreview
          component={selectedComponent}
          variant={selectedVariant}
          props={componentProps}
          onResetProps={handleResetProps}
        />
      </main>

      {/* Mobile/Tablet Controls Overlay */}
      <AnimatePresence>
        {isControlsOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 xl:hidden"
              variants={overlayFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsControlsOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-os-surface-dark border-l border-os-border-dark xl:hidden flex flex-col"
              variants={slideFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-os-border-dark">
                <span className="font-display font-semibold text-brand-vanilla">Controls</span>
                <button
                  onClick={() => setIsControlsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-os-border-dark transition-colors"
                  aria-label="Close controls"
                >
                  <X className="w-5 h-5 text-os-text-secondary-dark" />
                </button>
              </div>
              <ComponentControls
                component={selectedComponent}
                props={componentProps}
                onPropChange={handlePropChange}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Right Controls - Fixed 320px */}
      <aside className="hidden xl:flex flex-col w-[320px] bg-os-surface-dark border-l border-os-border-dark flex-shrink-0">
        <div className="flex items-center gap-4 px-4 h-12 border-b border-os-border-dark">
          <span className="font-display font-semibold text-brand-aperol">Controls</span>
          <span className="text-os-text-secondary-dark text-sm">Interactions</span>
          <span className="text-os-text-secondary-dark text-sm">Addons</span>
        </div>
        <ComponentControls
          component={selectedComponent}
          props={componentProps}
          onPropChange={handlePropChange}
        />
      </aside>
    </div>
  );
}
