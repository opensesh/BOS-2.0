'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { MarkdownCodeViewer } from '@/components/brain/MarkdownCodeViewer';
import { TabSelector } from '@/components/brain/TabSelector';
import { BrainSettingsModal } from '@/components/brain/BrainSettingsModal';
import { PageTransition, MotionItem } from '@/lib/motion';
import { ArrowLeft, Settings } from 'lucide-react';

const brandGuidelines = [
  { id: 'brand-identity', label: 'Brand Identity', file: 'OS_brand identity.md', path: '/claude-data/knowledge/core/OS_brand identity.md' },
  { id: 'brand-messaging', label: 'Brand Messaging', file: 'OS_brand messaging.md', path: '/claude-data/knowledge/core/OS_brand messaging.md' },
  { id: 'art-direction', label: 'Art Direction', file: 'OS_art direction.md', path: '/claude-data/knowledge/core/OS_art direction.md' },
];

export default function BrandIdentityPage() {
  const [activeTab, setActiveTab] = useState('brand-identity');
  const [content, setContent] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const activeFile = brandGuidelines.find(g => g.id === activeTab);
    if (activeFile) {
      fetch(activeFile.path)
        .then(res => res.text())
        .then(text => setContent(text))
        .catch(err => console.error('Failed to load content:', err));
    }
  }, [activeTab]);

  const activeFile = brandGuidelines.find(g => g.id === activeTab);

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-os-bg-dark pt-14 lg:pt-0">
        <PageTransition className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
          {/* Back Button & Settings Row */}
          <MotionItem className="flex items-center justify-between mb-8">
            <Link
              href="/brain"
              className="group inline-flex items-center gap-2 text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Brain</span>
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-xl bg-os-surface-dark hover:bg-os-border-dark border border-os-border-dark transition-colors group"
              title="Brain Settings"
            >
              <Settings className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
            </button>
          </MotionItem>

          {/* Page Header */}
          <MotionItem className="flex flex-col gap-2 mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla leading-tight">
              Brand Identity
            </h1>
            <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
              Core brand documentation that defines our identity, messaging, and visual direction.
              These files help AI understand and maintain brand consistency across all content.
            </p>
          </MotionItem>

          {/* Tab Selector */}
          <MotionItem className="mb-6">
            <TabSelector
              tabs={brandGuidelines.map(g => ({ id: g.id, label: g.label }))}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </MotionItem>

          {/* Content */}
          <MotionItem>
            <MarkdownCodeViewer
              filename={activeFile?.file || 'loading...'}
              content={content || 'Loading...'}
              maxLines={50}
            />
          </MotionItem>
        </PageTransition>
      </div>

      {/* Settings Modal - Opens with guidelines section pre-selected */}
      <BrainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultSection="guidelines"
      />
    </div>
  );
}
