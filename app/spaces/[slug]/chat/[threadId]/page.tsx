'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { SpaceReferenceCard } from '@/components/spaces/SpaceReferenceCard';
import { SpaceResourceCards } from '@/components/spaces/SpaceResourceCards';
import { useSpaces } from '@/hooks/useSpaces';
import { useSpaceDiscussions, useDiscussionMessages } from '@/hooks/useSpaceDiscussions';
import { ModelId } from '@/lib/ai/providers';
import type { PageContext } from '@/lib/brand-knowledge';
import {
  FollowUpInput,
  ChatHeader,
  ChatContent,
  type FollowUpAttachment,
} from '@/components/chat';

interface ParsedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
}

export default function SpaceChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params.slug as string;
  const threadId = params.threadId as string;

  // URL params for new chat
  const initialQuery = searchParams.get('q');
  const isNew = searchParams.get('isNew') === 'true';

  const [selectedModel, setSelectedModel] = useState<ModelId>('auto');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'answer' | 'links' | 'images'>('answer');
  const [hasSubmittedInitial, setHasSubmittedInitial] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get space data
  const { getSpace, isLoaded: spacesLoaded } = useSpaces();
  const space = getSpace(slug);

  // Get discussion data
  const {
    discussions,
    createDiscussion,
    updateDiscussion,
    getDiscussion,
  } = useSpaceDiscussions(slug);

  const {
    messages: storedMessages,
    addMessage,
    setMessages: setStoredMessages,
  } = useDiscussionMessages(threadId);

  // Current discussion
  const discussion = getDiscussion(threadId);

  // Chat transport
  const chatTransport = useRef(
    new DefaultChatTransport({
      api: '/api/chat',
    })
  ).current;

  // AI SDK useChat hook
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: chatTransport,
    onError: (err) => {
      console.error('Chat error:', err);
      setSubmitError(err.message || 'An error occurred while sending your message');
    },
  });

  // Helper to get message content
  const getMessageContent = useCallback(
    (message: { content?: string; parts?: Array<{ type: string; text?: string }> }): string => {
      if (typeof message.content === 'string') return message.content;
      if (Array.isArray(message.parts)) {
        return message.parts
          .filter(
            (part): part is { type: string; text: string } =>
              part && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string'
          )
          .map((part) => part.text)
          .join('');
      }
      return '';
    },
    []
  );

  // Load stored messages on mount
  useEffect(() => {
    if (storedMessages.length > 0 && messages.length === 0) {
      // Convert stored messages to chat format
      const chatMessages = storedMessages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        createdAt: new Date(m.createdAt),
      }));
      setMessages(chatMessages as Parameters<typeof setMessages>[0]);
    }
  }, [storedMessages, messages.length, setMessages]);

  // Build space context for API calls
  const spaceContext = useMemo((): PageContext | undefined => {
    if (!space) return undefined;
    return {
      type: 'space',
      space: {
        id: space.id,
        title: space.title,
        instructions: space.instructions,
        fileCount: space.files?.length || 0,
        linkCount: space.links?.length || 0,
        taskCount: space.tasks?.length || 0,
        fileNames: space.files?.map(f => f.name),
        linkTitles: space.links?.map(l => l.title || l.url),
      },
    };
  }, [space]);

  // Handle initial query from URL (new chat)
  useEffect(() => {
    if (isNew && initialQuery && !hasSubmittedInitial && space && spaceContext) {
      setHasSubmittedInitial(true);

      // Create the discussion first
      const initChat = async () => {
        // Create discussion in Supabase/localStorage
        await createDiscussion(initialQuery.slice(0, 50), space.id);

        // Clear URL params
        router.replace(`/spaces/${slug}/chat/${threadId}`, { scroll: false });

        // Send the message with space context (no longer prepending context to message)
        await sendMessage(
          { text: initialQuery },
          { body: { model: selectedModel, context: spaceContext } }
        );
      };

      initChat();
    }
  }, [
    isNew,
    initialQuery,
    hasSubmittedInitial,
    space,
    spaceContext,
    slug,
    threadId,
    selectedModel,
    sendMessage,
    router,
    createDiscussion,
  ]);

  // Save messages to storage when they change
  useEffect(() => {
    if (messages.length > 0 && discussion) {
      const lastMessage = messages[messages.length - 1];
      const content = getMessageContent(lastMessage);

      // Save message
      addMessage(lastMessage.role, content);

      // Update discussion preview and count
      if (lastMessage.role === 'assistant' && content) {
        updateDiscussion(discussion.id, {
          preview: content.slice(0, 100),
          messageCount: messages.length,
        });
      }
    }
  }, [messages, discussion, addMessage, updateDiscussion, getMessageContent]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isLoading = status === 'submitted' || status === 'streaming';

  // Parse messages
  const parsedMessages: ParsedMessage[] = useMemo(() => {
    return messages.map((message) => ({
      id: message.id,
      role: message.role as 'user' | 'assistant',
      content: getMessageContent(message),
      modelUsed,
    }));
  }, [messages, modelUsed, getMessageContent]);

  // Thread title
  const threadTitle = useMemo(() => {
    const firstUserMessage = parsedMessages.find((m) => m.role === 'user');
    return firstUserMessage?.content.slice(0, 50) || discussion?.title || 'New Discussion';
  }, [parsedMessages, discussion]);

  // Handle follow-up submit
  const handleFollowUpSubmit = async (query: string, followUpAttachments?: FollowUpAttachment[]) => {
    if (!query.trim() && (!followUpAttachments || followUpAttachments.length === 0)) return;
    if (isLoading) return;

    try {
      if (followUpAttachments && followUpAttachments.length > 0) {
        const files = followUpAttachments.map((att) => ({
          type: 'file' as const,
          data: att.data,
          mimeType: att.mimeType,
        }));

        await sendMessage(
          { text: query.trim() || 'What do you see in this image?', files: files as unknown as FileList },
          { body: { model: selectedModel, context: spaceContext } }
        );
      } else {
        await sendMessage({ text: query.trim() }, { body: { model: selectedModel, context: spaceContext } });
      }
    } catch (err) {
      console.error('Failed to send follow-up:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push(`/spaces/${slug}`);
  };

  // Loading state
  if (!spacesLoaded) {
    return (
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-os-text-secondary-dark">Loading...</p>
        </div>
      </div>
    );
  }

  // Space not found
  if (!space) {
    return (
      <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-mono font-bold mb-4">Space Not Found</h1>
          <p className="text-os-text-secondary-dark mb-6">
            The space you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-aperol text-white rounded-lg hover:bg-brand-aperol/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Spaces
          </Link>
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        {/* Chat Header */}
        <ChatHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasLinks={false}
          hasImages={false}
          linksCount={0}
          imagesCount={0}
          threadTitle={threadTitle}
          onBack={handleBack}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4">
            {activeTab === 'answer' && (
              <>
                {/* Space Reference Card */}
                {hasMessages && (
                  <div className="pt-6">
                    <SpaceReferenceCard
                      spaceTitle={space.title}
                      spaceSlug={space.slug}
                      spaceIcon={space.icon}
                    />

                    {/* Space Resources */}
                    <SpaceResourceCards
                      files={space.files}
                      links={space.links}
                      instructions={space.instructions}
                      tasks={space.tasks}
                      isReadOnly
                    />
                  </div>
                )}

                {/* Messages */}
                {parsedMessages.map((message, idx) => {
                  if (message.role === 'user') {
                    const nextMessage = parsedMessages[idx + 1];
                    if (nextMessage?.role === 'assistant') {
                      return (
                        <ChatContent
                          key={message.id}
                          query={message.content}
                          content={nextMessage.content}
                          isStreaming={isLoading && idx === parsedMessages.length - 2}
                          modelUsed={nextMessage.modelUsed}
                          onFollowUpClick={handleFollowUpSubmit}
                          onRegenerate={() => handleFollowUpSubmit(message.content)}
                          isLastResponse={idx === parsedMessages.length - 2}
                        />
                      );
                    }
                    if (!nextMessage && isLoading) {
                      return (
                        <ChatContent
                          key={message.id}
                          query={message.content}
                          content=""
                          isStreaming={true}
                          onFollowUpClick={handleFollowUpSubmit}
                          isLastResponse={true}
                        />
                      );
                    }
                  }
                  return null;
                })}

                {/* Error display */}
                {(error || submitError) &&
                  !parsedMessages.some((m) => m.role === 'assistant' && m.content.length > 50) && (
                    <div className="py-4">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Error</p>
                          <p className="mt-1">{error?.message || submitError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                <div ref={messagesEndRef} />
              </>
            )}

            {activeTab === 'links' && (
              <div className="py-6">
                <p className="text-os-text-secondary-dark text-sm">No links available</p>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="py-6">
                <p className="text-os-text-secondary-dark text-sm">No images available</p>
              </div>
            )}
          </div>
        </div>

        {/* Follow-up input */}
        <div className="relative">
          <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-os-bg-dark to-transparent pointer-events-none" />
          <div className="bg-os-bg-dark px-4 py-4">
            <FollowUpInput
              onSubmit={handleFollowUpSubmit}
              isLoading={isLoading}
              placeholder="Ask a follow-up about this space"
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
