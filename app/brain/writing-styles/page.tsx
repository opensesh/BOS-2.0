'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { MarkdownCodeViewer } from '@/components/brain/MarkdownCodeViewer';
import { TabSelector } from '@/components/brain/TabSelector';
import { BrainSettingsModal } from '@/components/brain/BrainSettingsModal';
import { ArrowLeft, Settings, Loader2 } from 'lucide-react';

const writingStyles = [
  { id: 'blog', label: 'Blog', file: 'blog.md', path: '/claude-data/knowledge/writing-styles/blog.md' },
  { id: 'creative', label: 'Creative', file: 'creative.md', path: '/claude-data/knowledge/writing-styles/creative.md' },
  { id: 'long-form', label: 'Long Form', file: 'long-form.md', path: '/claude-data/knowledge/writing-styles/long-form.md' },
  { id: 'short-form', label: 'Short Form', file: 'short-form.md', path: '/claude-data/knowledge/writing-styles/short-form.md' },
  { id: 'strategic', label: 'Strategic', file: 'strategic.md', path: '/claude-data/knowledge/writing-styles/strategic.md' },
];

function WritingStylesContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState('blog');
  const [content, setContent] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Set active tab from URL param on mount
  useEffect(() => {
    if (tabParam && writingStyles.some(w => w.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    const activeFile = writingStyles.find(w => w.id === activeTab);
    if (activeFile) {
      fetch(activeFile.path)
        .then(res => res.text())
        .then(text => setContent(text))
        .catch(err => console.error('Failed to load content:', err));
    }
  }, [activeTab]);

  const activeFile = writingStyles.find(w => w.id === activeTab);

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-os-bg-dark pt-14 lg:pt-0">
        <div className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
          {/* Back Button & Settings Row */}
          <div className="flex items-center justify-between mb-8">
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
          </div>

          {/* Page Header */}
          <div className="flex flex-col gap-2 mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla leading-tight">
              Writing Styles
            </h1>
            <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
              Context-specific voice guidelines for different content types. From blog posts to 
              strategic communications, each style guide ensures consistent, on-brand messaging.
            </p>
          </div>

          {/* Tab Selector */}
          <TabSelector
            tabs={writingStyles.map(w => ({ id: w.id, label: w.label }))}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mb-6"
          />

          {/* Content */}
          <MarkdownCodeViewer
            filename={activeFile?.file || 'loading...'}
            content={content || 'Loading...'}
            maxLines={50}
          />
        </div>
      </div>

      {/* Settings Modal - Opens with writing section pre-selected */}
      <BrainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultSection="writing"
      />
    </div>
  );
}

export default function WritingStylesPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen items-center justify-center bg-os-bg-dark text-os-text-primary-dark">
          <Loader2 className="w-8 h-8 animate-spin text-brand-aperol" />
        </div>
      }
    >
      <WritingStylesContent />
    </Suspense>
  );
}
