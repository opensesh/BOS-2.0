'use client';

import React from 'react';
import { ComponentDoc, componentRegistry } from './component-registry';

// Import actual components
import { BrandLoader } from '@/components/ui/brand-loader';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { FlipCard, FlipCardPersistent } from '@/components/ui/FlipCard';
import { TabSelector } from '@/components/brain/TabSelector';

// ============================================
// DESIGN SYSTEM COMPONENTS
// ============================================

// BrandLoader Component
const BrandLoaderDoc: ComponentDoc = {
  id: 'brand-loader',
  name: 'BrandLoader',
  description: 'A loading indicator component that displays the Brand OS logo with customizable animation variants. Use this component to indicate loading states throughout the application.',
  category: 'design-system',
  component: BrandLoader,
  defaultProps: {
    size: 60,
    variant: 'pulse',
  },
  controls: [
    {
      name: 'size',
      type: 'range',
      description: 'The size of the loader in pixels',
      defaultValue: 60,
      min: 20,
      max: 200,
      step: 10,
    },
    {
      name: 'variant',
      type: 'select',
      description: 'Animation style',
      defaultValue: 'pulse',
      options: [
        { label: 'Pulse', value: 'pulse' },
        { label: 'Rotate', value: 'rotate' },
      ],
    },
  ],
  variants: [
    { id: 'small', name: 'Small', props: { size: 30, variant: 'pulse' } },
    { id: 'large', name: 'Large', props: { size: 120, variant: 'pulse' } },
    { id: 'rotating', name: 'Rotating', props: { size: 60, variant: 'rotate' } },
  ],
};

// FlipCard Component
const FlipCardDoc: ComponentDoc = {
  id: 'flip-card',
  name: 'FlipCard',
  description: 'A 3D flip card component using Framer Motion. Perfect for revealing additional information or switching between two views with a smooth flip animation.',
  category: 'design-system',
  component: ({ isFlipped, flipDuration }: { isFlipped: boolean; flipDuration: number }) => (
    <FlipCard
      isFlipped={isFlipped}
      flipDuration={flipDuration}
      front={
        <div className="p-6 bg-os-surface-dark rounded-xl border border-os-border-dark min-w-[200px]">
          <h3 className="text-brand-vanilla font-semibold mb-2">Front Side</h3>
          <p className="text-os-text-secondary-dark text-sm">Click to flip</p>
        </div>
      }
      back={
        <div className="p-6 bg-brand-aperol/20 rounded-xl border border-brand-aperol min-w-[200px]">
          <h3 className="text-brand-aperol font-semibold mb-2">Back Side</h3>
          <p className="text-os-text-secondary-dark text-sm">Click to flip back</p>
        </div>
      }
    />
  ),
  defaultProps: {
    isFlipped: false,
    flipDuration: 0.6,
  },
  controls: [
    {
      name: 'isFlipped',
      type: 'boolean',
      description: 'Whether the card is flipped to show the back',
      defaultValue: false,
    },
    {
      name: 'flipDuration',
      type: 'range',
      description: 'Duration of the flip animation in seconds',
      defaultValue: 0.6,
      min: 0.2,
      max: 2,
      step: 0.1,
    },
  ],
  variants: [
    { id: 'flipped', name: 'Flipped', props: { isFlipped: true, flipDuration: 0.6 } },
    { id: 'fast', name: 'Fast Animation', props: { isFlipped: false, flipDuration: 0.3 } },
    { id: 'slow', name: 'Slow Animation', props: { isFlipped: false, flipDuration: 1.5 } },
  ],
};

// TabSelector Component
const TabSelectorDoc: ComponentDoc = {
  id: 'tab-selector',
  name: 'TabSelector',
  description: 'A flexible tab selector component with pill-style active state. Use for navigation between different content sections or view modes.',
  category: 'design-system',
  component: ({ activeTab }: { activeTab: string }) => {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'details', label: 'Details' },
      { id: 'reviews', label: 'Reviews' },
    ];
    return (
      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onChange={() => {}}
      />
    );
  },
  defaultProps: {
    activeTab: 'overview',
  },
  controls: [
    {
      name: 'activeTab',
      type: 'select',
      description: 'Currently active tab',
      defaultValue: 'overview',
      options: [
        { label: 'Overview', value: 'overview' },
        { label: 'Details', value: 'details' },
        { label: 'Reviews', value: 'reviews' },
      ],
    },
  ],
  variants: [
    { id: 'details-active', name: 'Details Active', props: { activeTab: 'details' } },
    { id: 'reviews-active', name: 'Reviews Active', props: { activeTab: 'reviews' } },
  ],
};

// Modal Wrapper for demonstration
const ModalDemo = ({ title, isOpen, size }: { title: string; isOpen: boolean; size: 'sm' | 'md' | 'lg' }) => {
  if (!isOpen) {
    return (
      <div className="p-4 bg-os-surface-dark rounded-xl border border-os-border-dark text-center">
        <p className="text-os-text-secondary-dark text-sm">Toggle &apos;isOpen&apos; to see the modal</p>
      </div>
    );
  }
  
  return (
    <div className="relative bg-black/60 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
      <div className={`w-full ${size === 'sm' ? 'max-w-sm' : size === 'md' ? 'max-w-md' : 'max-w-lg'} rounded-xl bg-os-surface-dark border border-os-border-dark`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-os-border-dark">
          <h2 className="text-lg font-display font-semibold text-brand-vanilla">{title}</h2>
          <button className="p-1.5 rounded-lg text-os-text-secondary-dark hover:text-brand-vanilla">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-os-text-secondary-dark">This is the modal content area.</p>
        </div>
      </div>
    </div>
  );
};

const ModalDoc: ComponentDoc = {
  id: 'modal',
  name: 'Modal',
  description: 'A dialog overlay component with backdrop blur, escape key handling, and focus trapping. Available in three sizes: small, medium, and large.',
  category: 'design-system',
  component: ModalDemo,
  defaultProps: {
    title: 'Modal Title',
    isOpen: true,
    size: 'md',
  },
  controls: [
    {
      name: 'title',
      type: 'text',
      description: 'Modal header title',
      defaultValue: 'Modal Title',
      required: true,
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the modal is visible',
      defaultValue: true,
    },
    {
      name: 'size',
      type: 'select',
      description: 'Modal width size',
      defaultValue: 'md',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
  ],
  variants: [
    { id: 'small', name: 'Small', props: { title: 'Small Modal', isOpen: true, size: 'sm' } },
    { id: 'large', name: 'Large', props: { title: 'Large Modal', isOpen: true, size: 'lg' } },
  ],
};

// Button Component (generic demo)
const ButtonDemo = ({ 
  label, 
  variant, 
  disabled 
}: { 
  label: string; 
  variant: 'primary' | 'secondary' | 'ghost'; 
  disabled: boolean;
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium text-sm transition-colors';
  const variantClasses = {
    primary: 'bg-brand-aperol hover:bg-brand-aperol/80 text-white',
    secondary: 'bg-os-surface-dark hover:bg-os-border-dark border border-os-border-dark text-brand-vanilla',
    ghost: 'hover:bg-os-surface-dark text-os-text-secondary-dark hover:text-brand-vanilla',
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

const ButtonDoc: ComponentDoc = {
  id: 'button',
  name: 'Button',
  description: 'A versatile button component with multiple variants. Use primary for main CTAs, secondary for alternative actions, and ghost for subtle interactions.',
  category: 'design-system',
  component: ButtonDemo,
  defaultProps: {
    label: 'Click me',
    variant: 'primary',
    disabled: false,
  },
  controls: [
    {
      name: 'label',
      type: 'text',
      description: 'Button text label',
      defaultValue: 'Click me',
      required: true,
    },
    {
      name: 'variant',
      type: 'select',
      description: 'Visual style variant',
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Ghost', value: 'ghost' },
      ],
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Whether the button is disabled',
      defaultValue: false,
    },
  ],
  variants: [
    { id: 'secondary', name: 'Secondary', props: { label: 'Secondary', variant: 'secondary', disabled: false } },
    { id: 'ghost', name: 'Ghost', props: { label: 'Ghost', variant: 'ghost', disabled: false } },
    { id: 'disabled', name: 'Disabled', props: { label: 'Disabled', variant: 'primary', disabled: true } },
  ],
};

// Color Swatch Component (for demonstrating colors)
const ColorSwatchDemo = ({ 
  color, 
  name, 
  showLabel 
}: { 
  color: string; 
  name: string; 
  showLabel: boolean;
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="w-20 h-20 rounded-xl border border-os-border-dark shadow-lg"
        style={{ backgroundColor: color }}
      />
      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-medium text-brand-vanilla">{name}</p>
          <p className="text-xs text-os-text-secondary-dark font-mono">{color}</p>
        </div>
      )}
    </div>
  );
};

const ColorSwatchDoc: ComponentDoc = {
  id: 'color-swatch',
  name: 'ColorSwatch',
  description: 'A color display component for showcasing brand colors. Use in style guides and color documentation.',
  category: 'design-system',
  component: ColorSwatchDemo,
  defaultProps: {
    color: '#FE5102',
    name: 'Aperol',
    showLabel: true,
  },
  controls: [
    {
      name: 'color',
      type: 'color',
      description: 'The color to display',
      defaultValue: '#FE5102',
    },
    {
      name: 'name',
      type: 'text',
      description: 'Color name label',
      defaultValue: 'Aperol',
    },
    {
      name: 'showLabel',
      type: 'boolean',
      description: 'Show color name and hex value',
      defaultValue: true,
    },
  ],
  variants: [
    { id: 'vanilla', name: 'Vanilla', props: { color: '#FFFAEE', name: 'Vanilla', showLabel: true } },
    { id: 'charcoal', name: 'Charcoal', props: { color: '#191919', name: 'Charcoal', showLabel: true } },
    { id: 'no-label', name: 'No Label', props: { color: '#FE5102', name: 'Aperol', showLabel: false } },
  ],
};

// ============================================
// APPLICATION COMPONENTS (Placeholder examples)
// ============================================

// Discover - NewsCard placeholder
const NewsCardDemo = ({
  title,
  source,
  imageUrl,
}: {
  title: string;
  source: string;
  imageUrl: string;
}) => {
  return (
    <div className="rounded-xl bg-os-surface-dark border border-os-border-dark overflow-hidden max-w-sm">
      <div className="aspect-video bg-os-border-dark relative">
        <div className="absolute inset-0 flex items-center justify-center text-os-text-secondary-dark text-sm">
          {imageUrl || 'Image'}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-os-text-secondary-dark mb-2">{source}</p>
        <h3 className="text-sm font-medium text-brand-vanilla line-clamp-2">{title}</h3>
      </div>
    </div>
  );
};

const NewsCardDoc: ComponentDoc = {
  id: 'news-card',
  name: 'NewsCard',
  description: 'A card component for displaying news articles in the Discover section. Features image, source, and title.',
  category: 'application',
  page: 'Discover',
  component: NewsCardDemo,
  defaultProps: {
    title: 'Breaking: New Design System Released',
    source: 'Design News',
    imageUrl: '',
  },
  controls: [
    {
      name: 'title',
      type: 'text',
      description: 'Article headline',
      defaultValue: 'Breaking: New Design System Released',
      required: true,
    },
    {
      name: 'source',
      type: 'text',
      description: 'News source name',
      defaultValue: 'Design News',
    },
    {
      name: 'imageUrl',
      type: 'text',
      description: 'Cover image URL',
      defaultValue: '',
    },
  ],
  variants: [
    { id: 'tech-news', name: 'Tech News', props: { title: 'AI Advances in 2024', source: 'Tech Weekly', imageUrl: '' } },
  ],
};

// ============================================
// REGISTER ALL COMPONENTS
// ============================================

export function initializeRegistry() {
  // Clear existing
  componentRegistry.designSystem = [];
  componentRegistry.application = {};

  // Add Design System components
  componentRegistry.designSystem = [
    BrandLoaderDoc,
    ButtonDoc,
    ModalDoc,
    FlipCardDoc,
    TabSelectorDoc,
    ColorSwatchDoc,
  ];

  // Add Application components
  componentRegistry.application = {
    Discover: [NewsCardDoc],
  };
}

// Auto-initialize on import
initializeRegistry();
