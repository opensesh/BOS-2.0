'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { MarkdownCodeViewer } from '@/components/brain/MarkdownCodeViewer';
import { TabSelector } from '@/components/brain/TabSelector';
import { BrainSettingsModal } from '@/components/brain/BrainSettingsModal';
import { ArrowLeft, Settings, Loader2 } from 'lucide-react';

// Define the available skills files
const skillFiles = [
  { id: 'system', label: 'System Configuration', file: 'claude.md', path: '/claude-data/claude.md' },
  { id: 'architecture', label: 'Architecture', file: 'architecture.md', path: '/claude-data/system/architecture.md' },
];

function SkillsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(skillFiles[0].id);
  const [content, setContent] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Set active tab from URL param on mount or when changed
  useEffect(() => {
    if (tabParam && skillFiles.some(s => s.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch content when active tab changes
  useEffect(() => {
    const activeFile = skillFiles.find(s => s.id === activeTab);
    if (activeFile) {
      setContent('Loading...');
      fetch(activeFile.path)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load content');
          return res.text();
        })
        .then(text => setContent(text))
        .catch(err => {
          console.error('Failed to load content:', err);
          setContent('Error loading content. Please check if the file exists.');
        });
    }
  }, [activeTab]);

  const activeFile = skillFiles.find(s => s.id === activeTab);

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-os-bg-dark">
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
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla">
              Skills
            </h1>
            <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
              Review the core system configuration and capabilities defined in the system prompts.
            </p>
          </div>

          {/* Tab Selector */}
          <TabSelector
            tabs={skillFiles.map(s => ({ id: s.id, label: s.label }))}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mb-6"
          />

          {/* Content */}
          <MarkdownCodeViewer
            filename={activeFile?.file || 'loading...'}
            content={content}
            maxLines={100}
          />
        </div>
      </div>

      {/* Settings Modal */}
      <BrainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultSection="personality"
      />
    </div>
  );
}

export default function SkillsPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen items-center justify-center bg-os-bg-dark text-os-text-primary-dark">
          <Loader2 className="w-8 h-8 animate-spin text-brand-aperol" />
        </div>
      }
    >
      <SkillsContent />
    </Suspense>
  );
}
