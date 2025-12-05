'use client';

import React, { useState, useMemo } from 'react';
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
import { SpaceArticlesDrawer } from '@/components/spaces/SpaceArticlesDrawer';
import {
  Upload,
  Link as LinkIcon,
  FileText,
  ListTodo,
  MessageSquare,
  Newspaper,
  Plus,
} from 'lucide-react';
import { NewsCardData } from '@/types';

type ModalType = 'files' | 'links' | 'instructions' | 'tasks' | 'articles' | null;

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

  // Track added article IDs for the drawer
  const addedArticleIds = useMemo(() => {
    const ids = new Set<string>();
    space?.links?.forEach(link => {
      // Check if link has an articleId property (for articles added from drawer)
      if (link.articleId) {
        ids.add(link.articleId);
      }
    });
    return ids;
  }, [space?.links]);

  // Handle adding an article to the space
  const handleAddArticle = (article: NewsCardData) => {
    if (!space) return;
    
    // Add the article as a link with additional metadata
    addLink(space.id, {
      url: `/discover/${article.slug}`,
      title: article.title,
      description: article.summary,
      articleId: article.id,
    });
    
    // Close the drawer after adding
    setActiveModal(null);
  };

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

  const hasResources =
    (space.files && space.files.length > 0) ||
    (space.links && space.links.length > 0) ||
    (space.instructions && space.instructions.trim()) ||
    (space.tasks && space.tasks.length > 0);

  // Resource button configuration
  const resourceButtons = [
    {
      id: 'files' as const,
      icon: Upload,
      label: 'Files',
      count: space.files?.length || 0,
      hasContent: (space.files?.length || 0) > 0,
    },
    {
      id: 'links' as const,
      icon: LinkIcon,
      label: 'Links',
      count: space.links?.length || 0,
      hasContent: (space.links?.length || 0) > 0,
    },
    {
      id: 'articles' as const,
      icon: Newspaper,
      label: 'Articles',
      count: addedArticleIds.size,
      hasContent: addedArticleIds.size > 0,
    },
    {
      id: 'instructions' as const,
      icon: FileText,
      label: 'Instructions',
      count: 0,
      hasContent: !!(space.instructions && space.instructions.trim()),
    },
    {
      id: 'tasks' as const,
      icon: ListTodo,
      label: 'Tasks',
      count: space.tasks?.length || 0,
      hasContent: (space.tasks?.length || 0) > 0,
    },
  ];

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

            {/* Resource Button Rail */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-3.5 h-3.5 text-os-text-secondary-dark" />
                <span className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wide">
                  Resources
                </span>
                <div className="flex-1 h-px bg-os-border-dark/50" />
              </div>
              
              <div className="flex items-start gap-1">
                {resourceButtons.map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.id}
                      onClick={() => setActiveModal(btn.id)}
                      className="group relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl hover:bg-os-surface-dark/80 transition-all duration-200"
                    >
                      {/* Icon Container */}
                      <div className={`
                        relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                        ${btn.hasContent 
                          ? 'bg-brand-aperol/10 text-brand-aperol group-hover:bg-brand-aperol/20' 
                          : 'bg-os-surface-dark text-os-text-secondary-dark group-hover:bg-os-border-dark group-hover:text-os-text-primary-dark'
                        }
                      `}>
                        <Icon className="w-5 h-5" />
                        
                        {/* Count Badge */}
                        {btn.count > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold rounded-full bg-brand-aperol text-white">
                            {btn.count}
                          </span>
                        )}
                        
                        {/* Dot indicator for instructions (no count) */}
                        {btn.id === 'instructions' && btn.hasContent && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-aperol" />
                        )}
                      </div>
                      
                      {/* Label */}
                      <span className={`
                        text-[11px] font-medium transition-colors duration-200
                        ${btn.hasContent 
                          ? 'text-os-text-primary-dark' 
                          : 'text-os-text-secondary-dark group-hover:text-os-text-primary-dark'
                        }
                      `}>
                        {btn.label}
                      </span>
                    </button>
                  );
                })}
              </div>
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

      <SpaceArticlesDrawer
        isOpen={activeModal === 'articles'}
        onClose={() => setActiveModal(null)}
        onAddArticle={handleAddArticle}
        addedArticleIds={addedArticleIds}
      />
    </div>
  );
}
