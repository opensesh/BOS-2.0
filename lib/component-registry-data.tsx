'use client';

import React from 'react';
import { ComponentDoc, componentRegistry } from './component-registry';

// ============================================
// DESIGN SYSTEM IMPORTS
// ============================================
import { BrandLoader } from '@/components/ui/brand-loader';
import { Modal } from '@/components/ui/Modal';
import { FlipCard } from '@/components/ui/FlipCard';
import { TabSelector } from '@/components/brain/TabSelector';
import { DotLoader } from '@/components/ui/dot-loader';
import { SearchResearchToggle } from '@/components/ui/search-research-toggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TypewriterText } from '@/components/TypewriterText';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { Brandmark } from '@/components/Brandmark';

// ============================================
// APPLICATION IMPORTS
// ============================================
// Discover
import { SpaceCard } from '@/components/SpaceCard';
import { IdeaCard } from '@/components/discover/IdeaCard';
import { TieredNewsCard } from '@/components/discover/TieredNewsCard';
import { MarketWidget } from '@/components/discover/MarketWidget';
import { WeatherWidget } from '@/components/discover/WeatherWidget';

// Chat
import { ChatTabNav, type ChatTab } from '@/components/chat/ChatTabNav';
import { RelatedQuestions } from '@/components/chat/RelatedQuestions';

// Finance
import { StockStats } from '@/components/finance/StockStats';
import { CompanyProfile } from '@/components/finance/CompanyProfile';

// Spaces
import { SpaceResourceCards } from '@/components/spaces/SpaceResourceCards';

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

// Brandmark Component
const BrandmarkDoc: ComponentDoc = {
  id: 'brandmark',
  name: 'Brandmark',
  description: 'The Brand OS logo mark component. Renders the vanilla-colored brandmark SVG at a configurable size.',
  category: 'design-system',
  component: Brandmark,
  defaultProps: {
    size: 48,
  },
  controls: [
    {
      name: 'size',
      type: 'range',
      description: 'Size of the brandmark in pixels',
      defaultValue: 48,
      min: 16,
      max: 128,
      step: 8,
    },
  ],
  variants: [
    { id: 'small', name: 'Small (24px)', props: { size: 24 } },
    { id: 'medium', name: 'Medium (48px)', props: { size: 48 } },
    { id: 'large', name: 'Large (96px)', props: { size: 96 } },
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

// Color Swatch Component
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

// ThemeToggle Component
const ThemeToggleDemo = ({ isCollapsed }: { isCollapsed: boolean }) => {
  return (
    <div className="bg-os-surface-dark rounded-lg p-2 w-fit">
      <ThemeToggle isCollapsed={isCollapsed} />
    </div>
  );
};

const ThemeToggleDoc: ComponentDoc = {
  id: 'theme-toggle',
  name: 'ThemeToggle',
  description: 'A button component that toggles between light and dark mode. Displays sun/moon icons based on current theme state.',
  category: 'design-system',
  component: ThemeToggleDemo,
  defaultProps: {
    isCollapsed: false,
  },
  controls: [
    {
      name: 'isCollapsed',
      type: 'boolean',
      description: 'Show icon only (collapsed sidebar mode)',
      defaultValue: false,
    },
  ],
  variants: [
    { id: 'collapsed', name: 'Collapsed', props: { isCollapsed: true } },
    { id: 'expanded', name: 'Expanded', props: { isCollapsed: false } },
  ],
};

// TypewriterText Component
const TypewriterTextDoc: ComponentDoc = {
  id: 'typewriter-text',
  name: 'TypewriterText',
  description: 'An animated text component that cycles through phrases with a typewriter effect. Used for dynamic hero text and engaging taglines.',
  category: 'design-system',
  component: TypewriterText,
  defaultProps: {},
  controls: [],
  variants: [],
};

// BackgroundGradient Component
const BackgroundGradientDemo = ({ fadeOut }: { fadeOut: boolean }) => {
  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-os-bg-dark">
      <BackgroundGradient fadeOut={fadeOut} />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-brand-vanilla text-sm">Content overlays the gradient</p>
      </div>
    </div>
  );
};

const BackgroundGradientDoc: ComponentDoc = {
  id: 'background-gradient',
  name: 'BackgroundGradient',
  description: 'A decorative background component with animated gradient blobs and grid pattern. Used for visual interest on landing pages and empty states.',
  category: 'design-system',
  component: BackgroundGradientDemo,
  defaultProps: {
    fadeOut: false,
  },
  controls: [
    {
      name: 'fadeOut',
      type: 'boolean',
      description: 'Whether the gradient should be faded out',
      defaultValue: false,
    },
  ],
  variants: [
    { id: 'visible', name: 'Visible', props: { fadeOut: false } },
    { id: 'faded', name: 'Faded Out', props: { fadeOut: true } },
  ],
};

// DotLoader Component
const DOT_LOADER_FRAMES = [
  [0, 1, 2, 7, 8, 9, 14, 15, 16],
  [3, 4, 5, 10, 11, 12, 17, 18, 19],
  [6, 13, 20, 21, 22, 23, 24, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45],
  [25, 26, 32, 33, 39, 40, 46, 47, 48],
];

const DotLoaderDemo = ({ isPlaying, duration }: { isPlaying: boolean; duration: number }) => {
  return (
    <div className="flex items-center justify-center p-8 bg-os-surface-dark rounded-xl">
      <DotLoader
        frames={DOT_LOADER_FRAMES}
        isPlaying={isPlaying}
        duration={duration}
        dotClassName="bg-os-text-secondary-dark/30 [&.active]:bg-brand-aperol"
      />
    </div>
  );
};

const DotLoaderDoc: ComponentDoc = {
  id: 'dot-loader',
  name: 'DotLoader',
  description: 'A 7x7 dot matrix loader that animates through frames. Perfect for loading states with a retro/digital aesthetic.',
  category: 'design-system',
  component: DotLoaderDemo,
  defaultProps: {
    isPlaying: true,
    duration: 100,
  },
  controls: [
    {
      name: 'isPlaying',
      type: 'boolean',
      description: 'Whether the animation is playing',
      defaultValue: true,
    },
    {
      name: 'duration',
      type: 'range',
      description: 'Frame duration in milliseconds',
      defaultValue: 100,
      min: 50,
      max: 500,
      step: 50,
    },
  ],
  variants: [
    { id: 'fast', name: 'Fast', props: { isPlaying: true, duration: 50 } },
    { id: 'slow', name: 'Slow', props: { isPlaying: true, duration: 300 } },
    { id: 'paused', name: 'Paused', props: { isPlaying: false, duration: 100 } },
  ],
};

// SearchResearchToggle Component
const SearchResearchToggleDoc: ComponentDoc = {
  id: 'search-research-toggle',
  name: 'SearchResearchToggle',
  description: 'An iOS-style toggle for switching between Search and Research modes. Shows contextual suggestions and upsell prompts on hover.',
  category: 'design-system',
  component: SearchResearchToggle,
  defaultProps: {},
  controls: [],
  variants: [],
};

// ============================================
// APPLICATION COMPONENTS - CHAT
// ============================================

// ChatTabNav Component
const ChatTabNavDemo = ({ activeTab, hasLinks, hasImages }: { activeTab: ChatTab; hasLinks: boolean; hasImages: boolean }) => {
  return (
    <div className="bg-os-surface-dark rounded-lg">
      <ChatTabNav
        activeTab={activeTab}
        onTabChange={() => {}}
        hasLinks={hasLinks}
        hasImages={hasImages}
        linksCount={hasLinks ? 12 : 0}
        imagesCount={hasImages ? 6 : 0}
      />
    </div>
  );
};

const ChatTabNavDoc: ComponentDoc = {
  id: 'chat-tab-nav',
  name: 'ChatTabNav',
  description: 'Tab navigation for chat responses. Switches between Answer, Links, and Images views. Tabs are disabled when no content is available.',
  category: 'application',
  page: 'Chat',
  component: ChatTabNavDemo,
  defaultProps: {
    activeTab: 'answer',
    hasLinks: true,
    hasImages: true,
  },
  controls: [
    {
      name: 'activeTab',
      type: 'select',
      description: 'Currently active tab',
      defaultValue: 'answer',
      options: [
        { label: 'Answer', value: 'answer' },
        { label: 'Links', value: 'links' },
        { label: 'Images', value: 'images' },
      ],
    },
    {
      name: 'hasLinks',
      type: 'boolean',
      description: 'Whether links are available',
      defaultValue: true,
    },
    {
      name: 'hasImages',
      type: 'boolean',
      description: 'Whether images are available',
      defaultValue: true,
    },
  ],
  variants: [
    { id: 'links-active', name: 'Links Active', props: { activeTab: 'links', hasLinks: true, hasImages: true } },
    { id: 'images-active', name: 'Images Active', props: { activeTab: 'images', hasLinks: true, hasImages: true } },
    { id: 'answer-only', name: 'Answer Only', props: { activeTab: 'answer', hasLinks: false, hasImages: false } },
  ],
};

// RelatedQuestions Component
const RelatedQuestionsDemo = () => {
  const mockQuestions = [
    'How does brand identity differ from brand image?',
    'What are the key elements of a successful brand strategy?',
    'How do companies measure brand value?',
  ];

  return (
    <div className="bg-os-surface-dark rounded-lg p-4 max-w-md">
      <h3 className="text-[15px] font-semibold text-os-text-primary-dark mb-3">
        Related
      </h3>
      <div className="divide-y divide-os-border-dark/50">
        {mockQuestions.map((question, idx) => (
          <button
            key={idx}
            className="w-full flex items-start gap-3 py-3 text-left hover:bg-os-surface-dark/30 transition-colors group -mx-2 px-2 rounded"
          >
            <svg className="w-4 h-4 text-os-text-secondary-dark mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 10 4 15 9 20" />
              <path d="M20 4v7a4 4 0 0 1-4 4H4" />
            </svg>
            <span className="text-[14px] text-os-text-primary-dark/80 group-hover:text-os-text-primary-dark transition-colors">
              {question}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const RelatedQuestionsDoc: ComponentDoc = {
  id: 'related-questions',
  name: 'RelatedQuestions',
  description: 'Displays contextually related follow-up questions based on the AI response. Questions are generated from the response content and original query.',
  category: 'application',
  page: 'Chat',
  component: RelatedQuestionsDemo,
  defaultProps: {},
  controls: [],
  variants: [],
};

// ============================================
// APPLICATION COMPONENTS - DISCOVER
// ============================================

// NewsCard Demo
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

// TieredNewsCard Component
const TieredNewsCardDemo = ({
  title = 'The Future of AI in Design',
  summary = 'Artificial intelligence is transforming how designers work.',
  tier = 'featured',
  variant = 'compact',
}: {
  title?: string;
  summary?: string;
  tier?: 'featured' | 'summary' | 'quick';
  variant?: 'featured' | 'compact';
}) => {
  const safeTitle = title || 'News Article';
  const safeSummary = summary || 'Article summary text.';
  
  const mockItem = {
    id: 'demo-1',
    slug: 'demo-article',
    title: safeTitle,
    summary: safeSummary,
    sources: [
      { id: '1', name: 'TechCrunch', url: 'https://techcrunch.com' },
      { id: '2', name: 'The Verge', url: 'https://theverge.com' },
      { id: '3', name: 'Wired', url: 'https://wired.com' },
    ],
    publishedAt: '2 hours ago',
    category: 'weekly-update' as const,
    tier: tier || 'featured',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  };

  // Use appropriate max-width based on variant
  const containerClass = variant === 'featured' 
    ? 'w-full max-w-2xl' 
    : 'w-full max-w-xs';

  return (
    <div className={containerClass}>
      <TieredNewsCard item={mockItem} variant={variant || 'compact'} />
    </div>
  );
};

const TieredNewsCardDoc: ComponentDoc = {
  id: 'tiered-news-card',
  name: 'TieredNewsCard',
  description: 'A news card with tiered content levels: featured (40+ sources), summary (AI-generated), and quick (external link). Supports featured and compact variants.',
  category: 'application',
  page: 'Discover',
  component: TieredNewsCardDemo,
  defaultProps: {
    title: 'The Future of AI in Design: A Comprehensive Analysis',
    summary: 'Artificial intelligence is transforming how designers work, from automated layouts to intelligent asset generation.',
    tier: 'featured',
    variant: 'compact',
  },
  controls: [
    {
      name: 'title',
      type: 'text',
      description: 'Article headline',
      defaultValue: 'The Future of AI in Design',
      required: true,
    },
    {
      name: 'summary',
      type: 'text',
      description: 'Article summary text',
      defaultValue: 'Artificial intelligence is transforming how designers work.',
    },
    {
      name: 'tier',
      type: 'select',
      description: 'Content tier level',
      defaultValue: 'featured',
      options: [
        { label: 'Featured (40+ sources)', value: 'featured' },
        { label: 'Summary (AI Generated)', value: 'summary' },
        { label: 'Quick (External Link)', value: 'quick' },
      ],
    },
    {
      name: 'variant',
      type: 'select',
      description: 'Card layout variant',
      defaultValue: 'compact',
      options: [
        { label: 'Featured (Large)', value: 'featured' },
        { label: 'Compact (Grid)', value: 'compact' },
      ],
    },
  ],
  variants: [
    { id: 'featured-tier', name: 'Featured Tier', props: { title: 'Major Industry Shift', summary: 'In-depth analysis with 40+ sources.', tier: 'featured', variant: 'compact' } },
    { id: 'summary-tier', name: 'Summary Tier', props: { title: 'AI Summary Article', summary: 'AI-generated summary of the news.', tier: 'summary', variant: 'compact' } },
    { id: 'quick-tier', name: 'Quick Tier', props: { title: 'Quick News Update', summary: 'External link to original source.', tier: 'quick', variant: 'compact' } },
  ],
};

// IdeaCard Component
const IdeaCardDemo = ({
  title = 'Behind-the-scenes look at our design process',
  description = 'Show the messy middle of creating something great.',
  category = 'short-form',
  variant = 'compact',
}: {
  title?: string;
  description?: string;
  category?: 'short-form' | 'long-form' | 'blog';
  variant?: 'featured' | 'compact';
}) => {
  // Ensure title is never undefined to prevent getFormatLabel error
  const safeTitle = title || 'Content Idea';
  const safeDescription = description || 'Idea description';
  
  const mockItem = {
    id: 'demo-idea-1',
    slug: 'demo-idea',
    title: safeTitle,
    description: safeDescription,
    sources: [
      { id: '1', name: 'Source 1', url: '#' },
      { id: '2', name: 'Source 2', url: '#' },
    ],
    category: category || 'short-form',
    isPrompt: true as const,
    textureIndex: 3,
    format: 'reel' as const, // Provide explicit format to avoid title parsing
  };

  return (
    <div className="w-full max-w-sm">
      <IdeaCard item={mockItem} variant={variant || 'compact'} />
    </div>
  );
};

const IdeaCardDoc: ComponentDoc = {
  id: 'idea-card',
  name: 'IdeaCard',
  description: 'A card for content ideas/prompts with textured backgrounds. Displays title, description, category badge, and source count. Available in featured and compact variants.',
  category: 'application',
  page: 'Discover',
  component: IdeaCardDemo,
  defaultProps: {
    title: 'Behind-the-scenes look at our design process',
    description: 'Show the messy middle of creating something great - the iterations, the failures, and the breakthroughs.',
    category: 'short-form',
    variant: 'compact',
  },
  controls: [
    {
      name: 'title',
      type: 'text',
      description: 'Idea title',
      defaultValue: 'Behind-the-scenes look at our design process',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      description: 'Idea description',
      defaultValue: 'Show the messy middle of creating something great.',
    },
    {
      name: 'category',
      type: 'select',
      description: 'Content category',
      defaultValue: 'short-form',
      options: [
        { label: 'Short Form', value: 'short-form' },
        { label: 'Long Form', value: 'long-form' },
        { label: 'Blog', value: 'blog' },
      ],
    },
    {
      name: 'variant',
      type: 'select',
      description: 'Card layout variant',
      defaultValue: 'compact',
      options: [
        { label: 'Featured (Large)', value: 'featured' },
        { label: 'Compact (Grid)', value: 'compact' },
      ],
    },
  ],
  variants: [
    { id: 'short-form', name: 'Short Form', props: { title: 'Reel: 5 Design Tips', description: 'Quick tips for better designs.', category: 'short-form', variant: 'compact' } },
    { id: 'long-form', name: 'Long Form', props: { title: 'Tutorial: Building a Design System', description: 'Complete walkthrough.', category: 'long-form', variant: 'compact' } },
    { id: 'blog', name: 'Blog Post', props: { title: 'Article: The Future of UX', description: 'Thought leadership piece.', category: 'blog', variant: 'compact' } },
  ],
};

// MarketWidget Component
const MarketWidgetDoc: ComponentDoc = {
  id: 'market-widget',
  name: 'MarketWidget',
  description: 'A stock market widget showing watchlist with live data, sparkline charts, and an editable back side using FlipCard. Links to finance pages.',
  category: 'application',
  page: 'Discover',
  component: MarketWidget,
  defaultProps: {},
  controls: [],
  variants: [],
};

// WeatherWidget Component
const WeatherWidgetDoc: ComponentDoc = {
  id: 'weather-widget',
  name: 'WeatherWidget',
  description: 'A weather forecast widget showing current conditions and 5-day forecast. Uses FlipCard for location editing with city search.',
  category: 'application',
  page: 'Discover',
  component: WeatherWidget,
  defaultProps: {},
  controls: [],
  variants: [],
};

// ============================================
// APPLICATION COMPONENTS - FINANCE
// ============================================

// StockStats Component
const StockStatsDemo = () => {
  const mockQuote = {
    symbol: 'AAPL',
    shortName: 'Apple Inc.',
    regularMarketPrice: 195.27,
    regularMarketChange: 2.35,
    regularMarketChangePercent: 1.22,
    regularMarketPreviousClose: 192.92,
    regularMarketOpen: 193.50,
    regularMarketDayHigh: 196.10,
    regularMarketDayLow: 192.80,
    regularMarketVolume: 52847600,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
    marketCap: 3012000000000,
    trailingPE: 30.5,
    epsTrailingTwelveMonths: 6.40,
    currency: 'USD',
  };

  return (
    <div className="bg-os-surface-dark rounded-lg p-4 max-w-2xl">
      <StockStats quote={mockQuote} />
    </div>
  );
};

const StockStatsDoc: ComponentDoc = {
  id: 'stock-stats',
  name: 'StockStats',
  description: 'Displays key financial statistics for a stock including price, volume, market cap, P/E ratio, and 52-week range. Grid layout with loading skeleton.',
  category: 'application',
  page: 'Finance',
  component: StockStatsDemo,
  defaultProps: {},
  controls: [],
  variants: [],
};

// CompanyProfile Component
const CompanyProfileDemo = () => {
  const mockProfile = {
    symbol: 'AAPL',
    shortName: 'Apple Inc.',
    longBusinessSummary: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home and accessories.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    fullTimeEmployees: 164000,
    city: 'Cupertino',
    state: 'California',
    country: 'United States',
    website: 'https://www.apple.com',
    companyOfficers: [
      { name: 'Tim Cook', title: 'CEO' },
      { name: 'Luca Maestri', title: 'CFO' },
    ],
  };

  return (
    <div className="bg-os-surface-dark rounded-lg p-4 max-w-lg">
      <CompanyProfile profile={mockProfile} />
    </div>
  );
};

const CompanyProfileDoc: ComponentDoc = {
  id: 'company-profile',
  name: 'CompanyProfile',
  description: 'Displays company information including business description, sector, industry, employee count, location, and key executives. Expandable description.',
  category: 'application',
  page: 'Finance',
  component: CompanyProfileDemo,
  defaultProps: {},
  controls: [],
  variants: [],
};

// ============================================
// APPLICATION COMPONENTS - SPACES
// ============================================

// SpaceCard Component
const SpaceCardDemo = ({
  title,
  description,
  icon,
  isPrivate,
  isCreate,
}: {
  title: string;
  description: string;
  icon: string;
  isPrivate: boolean;
  isCreate: boolean;
}) => {
  if (isCreate) {
    return (
      <div className="max-w-sm">
        <SpaceCard isCreate onCreateClick={() => {}} />
      </div>
    );
  }

  const mockSpace = {
    id: 'demo-space',
    slug: 'demo-space',
    title,
    description,
    icon,
    isPrivate,
    lastModified: '2 hr. ago',
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="max-w-sm">
      <SpaceCard space={mockSpace} />
    </div>
  );
};

const SpaceCardDoc: ComponentDoc = {
  id: 'space-card',
  name: 'SpaceCard',
  description: 'A card component for displaying Spaces - collaborative workspaces. Shows title, description, icon, privacy status, and last modified time. Also has a "Create Space" variant.',
  category: 'application',
  page: 'Spaces',
  component: SpaceCardDemo,
  defaultProps: {
    title: 'Brand Guidelines',
    description: 'Central hub for all brand assets, guidelines, and documentation.',
    icon: '📐',
    isPrivate: false,
    isCreate: false,
  },
  controls: [
    {
      name: 'title',
      type: 'text',
      description: 'Space title',
      defaultValue: 'Brand Guidelines',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      description: 'Space description',
      defaultValue: 'Central hub for all brand assets.',
    },
    {
      name: 'icon',
      type: 'text',
      description: 'Emoji icon',
      defaultValue: '📐',
    },
    {
      name: 'isPrivate',
      type: 'boolean',
      description: 'Whether the space is private',
      defaultValue: false,
    },
    {
      name: 'isCreate',
      type: 'boolean',
      description: 'Show as create card',
      defaultValue: false,
    },
  ],
  variants: [
    { id: 'private', name: 'Private Space', props: { title: 'Secret Project', description: 'Private workspace.', icon: '🔒', isPrivate: true, isCreate: false } },
    { id: 'create', name: 'Create Card', props: { title: '', description: '', icon: '', isPrivate: false, isCreate: true } },
  ],
};

// SpaceResourceCards Component
const SpaceResourceCardsDemo = () => {
  const mockFiles = [
    { id: '1', name: 'brand-guidelines.pdf', size: 2400000, type: 'application/pdf', addedAt: new Date().toISOString() },
    { id: '2', name: 'logo-pack.zip', size: 8500000, type: 'application/zip', addedAt: new Date().toISOString() },
  ];

  const mockLinks = [
    { id: '1', url: 'https://figma.com/file/abc', title: 'Design System', addedAt: new Date().toISOString() },
    { id: '2', url: '/discover/ai-trends', title: 'AI Trends Article', articleId: 'ai-trends', addedAt: new Date().toISOString() },
  ];

  const mockTasks = [
    { id: '1', title: 'Review brand colors', completed: true, createdAt: new Date().toISOString() },
    { id: '2', title: 'Update typography scale', completed: false, createdAt: new Date().toISOString() },
  ];

  return (
    <div className="max-w-lg">
      <SpaceResourceCards
        files={mockFiles}
        links={mockLinks}
        instructions="Use brand voice guidelines for all content."
        tasks={mockTasks}
      />
    </div>
  );
};

const SpaceResourceCardsDoc: ComponentDoc = {
  id: 'space-resource-cards',
  name: 'SpaceResourceCards',
  description: 'A unified grid of space resources including files, links, articles, instructions, and tasks. Compact card design with remove and toggle actions.',
  category: 'application',
  page: 'Spaces',
  component: SpaceResourceCardsDemo,
  defaultProps: {},
  controls: [],
  variants: [],
};

// ============================================
// REGISTER ALL COMPONENTS
// ============================================

export function initializeRegistry() {
  // Clear existing
  componentRegistry.designSystem = [];
  componentRegistry.application = {};

  // Add Design System components (12 total)
  componentRegistry.designSystem = [
    BrandLoaderDoc,
    BrandmarkDoc,
    ButtonDoc,
    ModalDoc,
    FlipCardDoc,
    TabSelectorDoc,
    ColorSwatchDoc,
    ThemeToggleDoc,
    TypewriterTextDoc,
    BackgroundGradientDoc,
    DotLoaderDoc,
    SearchResearchToggleDoc,
  ];

  // Add Application components
  componentRegistry.application = {
    Chat: [
      ChatTabNavDoc,
      RelatedQuestionsDoc,
    ],
    Discover: [
      NewsCardDoc,
      TieredNewsCardDoc,
      IdeaCardDoc,
      MarketWidgetDoc,
      WeatherWidgetDoc,
    ],
    Finance: [
      StockStatsDoc,
      CompanyProfileDoc,
    ],
    Spaces: [
      SpaceCardDoc,
      SpaceResourceCardsDoc,
    ],
  };
}

// Auto-initialize on import
initializeRegistry();
