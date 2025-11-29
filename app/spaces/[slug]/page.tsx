'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { SpaceHeader } from '@/components/SpaceHeader';
import { useSpaces } from '@/hooks/useSpaces';
import { SPACE_THREADS } from '@/lib/mock-data';
import { AddFilesModal } from '@/components/spaces/AddFilesModal';
import { AddLinksModal } from '@/components/spaces/AddLinksModal';
import { AddInstructionsModal } from '@/components/spaces/AddInstructionsModal';
import { AddTasksModal } from '@/components/spaces/AddTasksModal';
import {
  Upload,
  Link as LinkIcon,
  FileText,
  Calendar,
  Send,
  Globe,
  Grid,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  Clock,
  Paperclip,
  Mic,
} from 'lucide-react';

type ModalType = 'files' | 'links' | 'instructions' | 'tasks' | null;

export default function SpacePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  const {
    spaces,
    exampleSpaces,
    isLoaded,
    getSpace,
    deleteSpace,
    updateSpace,
    addFile,
    removeFile,
    addLink,
    removeLink,
    updateInstructions,
    addTask,
    toggleTask,
    removeTask,
  } = useSpaces();
  
  const space = getSpace(slug);
  const threads = SPACE_THREADS[slug] || [];

  // Check if this is a user space (can be edited/deleted) or an example space
  const isUserSpace = spaces.some((s) => s.slug === slug);

  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-os-text-secondary-dark">Loading...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-mono font-bold mb-4">Space Not Found</h1>
          <p className="text-os-text-secondary-dark">
            The space you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const getButtonCountBadge = (count: number) => {
    if (count === 0) return null;
    return (
      <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-brand-aperol/20 text-brand-aperol">
        {count}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex overflow-hidden relative pt-14 lg:pt-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
            {/* Back Button */}
            <Link 
              href="/spaces"
              className="group inline-flex items-center gap-2 text-os-text-secondary-dark hover:text-brand-aperol transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Spaces</span>
            </Link>

            {/* Header */}
            <SpaceHeader
              title={space.title}
              icon={space.icon}
              spaceId={isUserSpace ? space.id : undefined}
              onDelete={isUserSpace ? deleteSpace : undefined}
              onRename={isUserSpace ? (newTitle) => updateSpace(space.id, { title: newTitle }) : undefined}
            />

            {/* Description */}
            {space.description && (
              <p className="text-os-text-secondary-dark mb-8">
                {space.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setActiveModal('files')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-os-surface-dark hover:bg-os-border-dark text-os-text-primary-dark transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Add files</span>
                {getButtonCountBadge(space.files?.length || 0)}
              </button>
              <button
                onClick={() => setActiveModal('links')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-os-surface-dark hover:bg-os-border-dark text-os-text-primary-dark transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="text-sm">Add links</span>
                {getButtonCountBadge(space.links?.length || 0)}
              </button>
              <button
                onClick={() => setActiveModal('instructions')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-os-surface-dark hover:bg-os-border-dark text-os-text-primary-dark transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Add instructions</span>
                {space.instructions && (
                  <span className="ml-1.5 w-2 h-2 rounded-full bg-brand-aperol" />
                )}
              </button>
              <button
                onClick={() => setActiveModal('tasks')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-os-surface-dark hover:bg-os-border-dark text-os-text-primary-dark transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Add tasks</span>
                {getButtonCountBadge(space.tasks?.length || 0)}
              </button>
            </div>

            {/* Input Card */}
            <div className="mb-8 p-6 rounded-xl bg-os-surface-dark border border-os-border-dark">
              <textarea
                placeholder={`Ask anything about ${space.title}. Type / for shortcuts.`}
                className="
                  w-full bg-transparent border-none outline-none
                  text-os-text-primary-dark placeholder-os-text-secondary-dark
                  resize-none
                  min-h-[100px]
                "
                rows={4}
              />
              
              {/* Input Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-os-border-dark">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors">
                    <Globe className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors">
                    <Grid className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors">
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors">
                    <Clock className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors">
                    <Mic className="w-4 h-4 text-brand-aperol" />
                  </button>
                </div>
                <button className="p-2 rounded-lg bg-brand-aperol hover:bg-brand-aperol/80 text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* My Threads Section */}
            <div className="border-t border-os-border-dark pt-8">
              <h2 className="text-xl font-semibold text-os-text-primary-dark mb-4 pb-2 border-b border-os-border-dark">
                My threads
              </h2>
              
              {threads.length > 0 ? (
                <div className="space-y-3">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="
                        p-4 rounded-lg
                        bg-os-surface-dark/50 border border-os-border-dark
                        hover:bg-os-surface-dark hover:border-os-border-dark
                        transition-all cursor-pointer
                      "
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-os-text-primary-dark mb-1">
                            {thread.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-os-text-secondary-dark">
                            <span>{thread.messageCount} messages</span>
                            <span>•</span>
                            <span>{thread.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-os-text-secondary-dark">
                  <p className="mb-2">Your threads will appear here.</p>
                  <p>Ask anything above to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions Sidebar (Desktop) */}
        <div className="hidden md:block w-16 shrink-0 border-l border-os-border-dark p-4">
          {/* Action sidebar can go here */}
        </div>
      </main>

      {/* Modals */}
      <AddFilesModal
        isOpen={activeModal === 'files'}
        onClose={() => setActiveModal(null)}
        onAddFile={(file) => addFile(space.id, file)}
        existingFiles={space.files}
        onRemoveFile={isUserSpace ? (fileId) => removeFile(space.id, fileId) : undefined}
      />

      <AddLinksModal
        isOpen={activeModal === 'links'}
        onClose={() => setActiveModal(null)}
        onAddLink={(link) => addLink(space.id, link)}
        existingLinks={space.links}
        onRemoveLink={isUserSpace ? (linkId) => removeLink(space.id, linkId) : undefined}
      />

      <AddInstructionsModal
        isOpen={activeModal === 'instructions'}
        onClose={() => setActiveModal(null)}
        onSave={(instructions) => updateInstructions(space.id, instructions)}
        existingInstructions={space.instructions}
      />

      <AddTasksModal
        isOpen={activeModal === 'tasks'}
        onClose={() => setActiveModal(null)}
        onAddTask={(task) => addTask(space.id, task)}
        existingTasks={space.tasks}
        onToggleTask={isUserSpace ? (taskId) => toggleTask(space.id, taskId) : undefined}
        onRemoveTask={isUserSpace ? (taskId) => removeTask(space.id, taskId) : undefined}
      />
    </div>
  );
}
