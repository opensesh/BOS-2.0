'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { SpaceHeader } from '@/components/SpaceHeader';
import { SpaceChatInput } from '@/components/spaces/SpaceChatInput';
import { SpaceResourceCards } from '@/components/spaces/SpaceResourceCards';
import { DiscussionCard } from '@/components/spaces/SpaceReferenceCard';
import { useSpaces } from '@/hooks/useSpaces';
import { useSpaceDiscussions } from '@/hooks/useSpaceDiscussions';
import { AddFilesModal } from '@/components/spaces/AddFilesModal';
import { AddLinksModal } from '@/components/spaces/AddLinksModal';
import { AddInstructionsModal } from '@/components/spaces/AddInstructionsModal';
import { AddTasksModal } from '@/components/spaces/AddTasksModal';
import {
  Upload,
  Link as LinkIcon,
  FileText,
  Calendar,
  MessageSquare,
} from 'lucide-react';

type ModalType = 'files' | 'links' | 'instructions' | 'tasks' | null;

export default function SpacePage() {
  const params = useParams();
  const router = useRouter();
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

  const {
    discussions,
    isLoading: discussionsLoading,
    createDiscussion,
  } = useSpaceDiscussions(slug);

  const space = getSpace(slug);

  // Check if this is a user space (can be edited/deleted) or an example space
  const isUserSpace = spaces.some((s) => s.slug === slug);

  // Handle starting a new chat
  const handleStartChat = async (query: string, discussionId: string) => {
    if (!space) return;

    // Navigate to the chat page
    const searchParams = new URLSearchParams({
      q: query,
      spaceId: space.id,
      spaceTitle: space.title,
      ...(space.icon && { spaceIcon: space.icon }),
      isNew: 'true',
    });

    router.push(`/spaces/${slug}/chat/${discussionId}?${searchParams.toString()}`);
  };

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

  const hasResources =
    (space.files && space.files.length > 0) ||
    (space.links && space.links.length > 0) ||
    (space.instructions && space.instructions.trim()) ||
    (space.tasks && space.tasks.length > 0);

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex overflow-hidden relative pt-14 lg:pt-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-4xl mx-auto px-6 py-8 md:px-12 md:py-12">
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
              onRename={
                isUserSpace
                  ? (newTitle) => updateSpace(space.id, { title: newTitle })
                  : undefined
              }
            />

            {/* Description */}
            {space.description && (
              <p className="text-os-text-secondary-dark mb-8">{space.description}</p>
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

            {/* Resource Cards */}
            {hasResources && (
              <SpaceResourceCards
                files={space.files}
                links={space.links}
                instructions={space.instructions}
                tasks={space.tasks}
                onRemoveFile={isUserSpace ? (fileId) => removeFile(space.id, fileId) : undefined}
                onRemoveLink={isUserSpace ? (linkId) => removeLink(space.id, linkId) : undefined}
                onToggleTask={isUserSpace ? (taskId) => toggleTask(space.id, taskId) : undefined}
                onRemoveTask={isUserSpace ? (taskId) => removeTask(space.id, taskId) : undefined}
                isReadOnly={!isUserSpace}
              />
            )}

            {/* Recent Discussions Section */}
            <div className="border-t border-os-border-dark pt-8">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-os-text-secondary-dark" />
                <h2 className="text-xl font-semibold text-os-text-primary-dark">
                  Recent discussions
                </h2>
              </div>

              {discussionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin" />
                </div>
              ) : discussions.length > 0 ? (
                <div className="space-y-3">
                  {discussions.map((discussion) => (
                    <DiscussionCard
                      key={discussion.id}
                      id={discussion.id}
                      title={discussion.title}
                      preview={discussion.preview}
                      messageCount={discussion.messageCount}
                      updatedAt={discussion.updatedAt}
                      spaceSlug={space.slug}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-os-text-secondary-dark">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="mb-2">No discussions yet</p>
                  <p className="text-sm">
                    Start a conversation below to begin exploring this space.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom padding for fixed chat input */}
            <div className="h-32" />
          </div>
        </div>
      </main>

      {/* Fixed Chat Input at Bottom */}
      <SpaceChatInput
        spaceSlug={space.slug}
        spaceId={space.id}
        spaceTitle={space.title}
        spaceIcon={space.icon}
        onStartChat={handleStartChat}
      />

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
