'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { MarkdownCodeViewer } from '@/components/brain/MarkdownCodeViewer';
import { BrainSettingsModal } from '@/components/brain/BrainSettingsModal';
import { PageTransition, MotionItem } from '@/lib/motion';
import { ArrowLeft, Settings } from 'lucide-react';

export default function ArchitecturePage() {
  const [content, setContent] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetch('/claude-data/system/architecture.md')
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => console.error('Failed to load architecture:', err));
  }, []);

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
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla leading-tight">
                Architecture
              </h1>
              <span className="px-2.5 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                Automatic
              </span>
            </div>
            <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
              This website is structured to serve both as a landing page for humans and as a
              well-organized resource for AI agent interpretation. Think of it as our brand brain
              that will continue to grow and extend use cases over time.
            </p>
          </MotionItem>

          {/* Content */}
          <MotionItem>
            <MarkdownCodeViewer
              filename="architecture.md"
              content={content || 'Loading...'}
              maxLines={50}
            />
          </MotionItem>
        </PageTransition>
      </div>

      {/* Settings Modal - Opens with architecture section (which is automatic) */}
      <BrainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultSection="architecture"
      />
    </div>
  );
}
