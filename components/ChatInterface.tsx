'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DefaultChatTransport } from 'ai';
import { motion } from 'framer-motion';
import {
  Mic,
  Paperclip,
  Send,
  Globe,
  Brain,
  Compass,
  Palette,
  AlertCircle,
} from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { BackgroundGradient } from './BackgroundGradient';
import { TypewriterText } from './TypewriterText';
import { SearchResearchToggle, SearchResearchSuggestions } from './ui/search-research-toggle';
import { ConnectorDropdown } from './ui/connector-dropdown';
import { ModelSelector } from './ui/model-selector';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useAttachments, Attachment } from '@/hooks/useAttachments';
import { ModelId } from '@/lib/ai/providers';
import { useChatContext } from '@/lib/chat-context';
import { fadeIn, fadeInUp, staggerContainer } from '@/lib/motion';
import type { PageContext } from '@/lib/brand-knowledge';
import {
  FollowUpInput,
  SourceInfo,
  ImageResult,
  ChatHeader,
  ChatContent,
  AttachmentPreview,
  DragOverlay,
  type FollowUpAttachment,
} from './chat';
import { ArticleReferenceCard, IdeaReferenceCard } from './discover/article/AskFollowUp';

// Article reference context from discover page
interface ArticleContext {
  title: string;
  slug: string;
  imageUrl?: string;
}

// Ideas reference context from generate ideas
interface IdeaContext {
  title: string;
  category: string;
  slug?: string;
  generationType?: string;
  generationLabel?: string;
}

interface Connector {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
}

// Interface for parsed message with sources
interface ParsedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceInfo[];
  images?: ImageResult[];
  modelUsed?: string;
}

export function ChatInterface() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<ModelId>('auto');
  const [localInput, setLocalInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showConnectorDropdown, setShowConnectorDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsMode, setSuggestionsMode] = useState<'search' | 'research'>('search');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'answer' | 'links' | 'images'>('answer');
  const [articleContext, setArticleContext] = useState<ArticleContext | null>(null);
  const [ideaContext, setIdeaContext] = useState<IdeaContext | null>(null);
  const [hasProcessedUrlParams, setHasProcessedUrlParams] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const globeButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat context for cross-component communication
  const { 
    shouldResetChat, 
    acknowledgeChatReset, 
    addToHistory, 
    setCurrentSessionId,
    currentSessionId,
  } = useChatContext();

  // Create transport once - stable reference
  const chatTransport = useRef(new DefaultChatTransport({
    api: '/api/chat',
  })).current;

  // AI SDK useChat hook (v5 API)
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: chatTransport,
    onError: (err) => {
      console.error('Chat error:', err);
      setSubmitError(err.message || 'An error occurred while sending your message');
    },
  });

  // Derive hasMessages early so it can be used in effects
  const hasMessages = messages.length > 0;

  // Reset chat function
  const resetChat = useCallback(() => {
    setMessages([]);
    setActiveTab('answer');
    setLocalInput('');
    setSubmitError(null);
  }, [setMessages]);

  // Helper to get message content (defined early for use in effect)
  const getMessageContent = useCallback((message: { content?: string; parts?: Array<{ type: string; text?: string }> }): string => {
    if (typeof message.content === 'string') return message.content;
    if (Array.isArray(message.parts)) {
      return message.parts
        .filter((part): part is { type: string; text: string } => 
          part && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string'
        )
        .map((part) => part.text)
        .join('');
    }
    return '';
  }, []);

  // Listen for reset signals from context (e.g., sidebar navigation)
  useEffect(() => {
    if (shouldResetChat) {
      // Save current chat to history if there are messages
      if (messages.length > 0) {
        const firstUserMessage = messages.find(m => m.role === 'user');
        const firstAssistantMessage = messages.find(m => m.role === 'assistant');
        if (firstUserMessage) {
          const title = getMessageContent(firstUserMessage).slice(0, 50) || 'Untitled Chat';
          const preview = firstAssistantMessage 
            ? getMessageContent(firstAssistantMessage).slice(0, 100)
            : '';
          // Convert messages to the format expected by chat history
          const chatMessages = messages.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: getMessageContent(m),
            timestamp: new Date().toISOString(),
          }));
          addToHistory(title, preview, chatMessages);
        }
      }
      resetChat();
      setArticleContext(null);
      setIdeaContext(null);
      setCurrentSessionId(null);
      acknowledgeChatReset();
    }
  }, [shouldResetChat, acknowledgeChatReset, resetChat, messages, addToHistory, getMessageContent, setCurrentSessionId]);

  // Auto-save session when streaming completes (status changes from streaming to ready)
  const prevStatusRef = useRef(status);
  useEffect(() => {
    // Only save when transitioning from streaming/submitted to ready with messages
    if (
      (prevStatusRef.current === 'streaming' || prevStatusRef.current === 'submitted') &&
      status === 'ready' &&
      messages.length > 0
    ) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
      
      if (firstUserMessage && lastAssistantMessage) {
        const title = getMessageContent(firstUserMessage).slice(0, 100) || 'Untitled Chat';
        const preview = getMessageContent(lastAssistantMessage).slice(0, 150);
        
        // Convert messages to chat history format
        const chatMessages = messages.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: getMessageContent(m),
          timestamp: new Date().toISOString(),
        }));
        
        // Save to history (this also updates Supabase)
        addToHistory(title, preview, chatMessages);
      }
    }
    prevStatusRef.current = status;
  }, [status, messages, addToHistory, getMessageContent]);

  // Process URL search params for article follow-up queries or prompt pre-fill
  useEffect(() => {
    if (hasProcessedUrlParams) return;

    const query = searchParams.get('q');
    const articleRef = searchParams.get('articleRef');
    const articleTitle = searchParams.get('articleTitle');
    const articleImage = searchParams.get('articleImage');

    // Handle article context queries (from article pages)
    if (query && articleRef && articleTitle) {
      // Mark as processed immediately to prevent re-runs
      setHasProcessedUrlParams(true);
      
      // Reset existing messages to ensure proper message alternation
      setMessages([]);
      
      // Decode the title (URL params might have encoding issues)
      const decodedTitle = decodeURIComponent(articleTitle).replace(/&amp;/g, '&');
      const decodedImage = articleImage ? decodeURIComponent(articleImage).replace(/&amp;/g, '&') : undefined;
      
      // Try to get full article context from sessionStorage (set by AskFollowUp)
      let storedArticleContext: { 
        title: string; 
        slug: string; 
        summary?: string; 
        sections?: string[];
        sourceCount?: number;
      } | null = null;
      
      try {
        const stored = sessionStorage.getItem('articleContext');
        if (stored) {
          storedArticleContext = JSON.parse(stored);
          // Clear it after reading
          sessionStorage.removeItem('articleContext');
        }
      } catch (e) {
        console.error('Failed to parse stored article context:', e);
      }
      
      // Set the article context for UI display
      setArticleContext({
        title: decodedTitle,
        slug: articleRef,
        imageUrl: decodedImage,
      });

      // Clear URL params without reload
      router.replace('/', { scroll: false });

      // Auto-submit the query with longer delay to ensure state is fully cleared
      // Using requestAnimationFrame + setTimeout for more reliable timing
      requestAnimationFrame(() => {
        setTimeout(async () => {
          try {
            const decodedQuery = decodeURIComponent(query);
            console.log('Auto-submitting article follow-up:', { 
              query: decodedQuery, 
              model: selectedModel,
              hasStoredContext: !!storedArticleContext,
              summaryLength: storedArticleContext?.summary?.length || 0,
            });
            // Build context for the API with full article content
            const context: PageContext = {
              type: 'article',
              article: {
                title: decodedTitle,
                slug: articleRef,
                summary: storedArticleContext?.summary,
                sections: storedArticleContext?.sections,
                sourceCount: storedArticleContext?.sourceCount,
              },
            };
            await sendMessage({ text: decodedQuery }, { body: { model: selectedModel, context } });
          } catch (err) {
            console.error('Failed to send article follow-up:', err);
            setSubmitError(err instanceof Error ? err.message : 'Failed to send message');
          }
        }, 100);
      });
    }
    // Handle standalone query (from ideas prompts / generate ideas)
    else if (query && !articleRef) {
      // Mark as processed immediately to prevent re-runs
      setHasProcessedUrlParams(true);
      
      // Reset existing messages to ensure proper message alternation
      setMessages([]);
      setArticleContext(null);
      
      // Check for idea context in URL params (support both old and new param names)
      const ideaTitle = searchParams.get('ideaTitle') || searchParams.get('inspirationTitle');
      const ideaCategory = searchParams.get('ideaCategory') || searchParams.get('inspirationCategory');
      const ideaSlug = searchParams.get('ideaSlug') || searchParams.get('inspirationSlug');
      const generationType = searchParams.get('generationType');
      const generationLabel = searchParams.get('generationLabel');
      
      if (ideaTitle && ideaCategory) {
        setIdeaContext({
          title: decodeURIComponent(ideaTitle),
          category: decodeURIComponent(ideaCategory),
          slug: ideaSlug ? decodeURIComponent(ideaSlug) : undefined,
          generationType: generationType || undefined,
          generationLabel: generationLabel ? decodeURIComponent(generationLabel) : undefined,
        });
      } else {
        setIdeaContext(null);
      }
      
      // Clear URL params without reload
      router.replace('/', { scroll: false });

      // Auto-submit the query with longer delay to ensure state is fully cleared
      requestAnimationFrame(() => {
        setTimeout(async () => {
          try {
            const decodedQuery = decodeURIComponent(query);
            console.log('Auto-submitting idea query:', { query: decodedQuery, model: selectedModel });
            // Build context for the API if we have idea context
            const context: PageContext | undefined = (ideaTitle && ideaCategory) ? {
              type: 'idea',
              idea: {
                title: decodeURIComponent(ideaTitle),
                category: decodeURIComponent(ideaCategory),
                generationType: generationType || undefined,
                generationLabel: generationLabel ? decodeURIComponent(generationLabel) : undefined,
              },
            } : undefined;
            await sendMessage({ text: decodedQuery }, { body: { model: selectedModel, context } });
          } catch (err) {
            console.error('Failed to send idea generation:', err);
            setSubmitError(err instanceof Error ? err.message : 'Failed to send message');
          }
        }, 100);
      });
    }
  }, [searchParams, router, sendMessage, setMessages, hasProcessedUrlParams, selectedModel, setSubmitError]);

  // status can be: 'submitted' | 'streaming' | 'ready' | 'error'
  const isLoading = status === 'submitted' || status === 'streaming';
  
  // Clear submit error when user starts typing
  useEffect(() => {
    if (localInput && submitError) {
      setSubmitError(null);
    }
  }, [localInput, submitError]);
  
  // Use local input for controlled textarea
  const input = localInput;
  const setInput = setLocalInput;

  const connectors: Connector[] = [
    { id: 'web', icon: Globe, title: 'Web', description: 'Search across the entire internet', enabled: true },
    { id: 'brand', icon: Palette, title: 'Brand', description: 'Access brand assets and guidelines', enabled: true },
    { id: 'brain', icon: Brain, title: 'Brain', description: 'Search brand knowledge base', enabled: true },
    { id: 'discover', icon: Compass, title: 'Discover', description: 'Explore curated content and ideas', enabled: false },
  ];

  const [activeConnectors, setActiveConnectors] = useState<Set<string>>(new Set(['web', 'brand', 'brain']));

  const handleToggleConnector = (id: string) => {
    setActiveConnectors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updatedConnectors = connectors.map((connector) => ({
    ...connector,
    enabled: activeConnectors.has(connector.id),
  }));

  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition((finalTranscript) => {
    setInput((prev) => prev + (prev ? ' ' : '') + finalTranscript);
    resetTranscript();
  });

  // Attachment handling
  const {
    attachments,
    isDragging,
    error: attachmentError,
    addFiles,
    removeAttachment,
    clearAttachments,
    clearError: clearAttachmentError,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    fileInputRef,
    openFilePicker,
  } = useAttachments();

  useEffect(() => {
    if (transcript && isListening) {
      setInput((prev) => {
        const base = prev.replace(transcript, '').trim();
        return base + (base ? ' ' : '') + transcript;
      });
    }
  }, [transcript, isListening]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcuts
  const shortcuts = useMemo(
    () => ({
      'cmd+k': () => textareaRef.current?.focus(),
      'ctrl+k': () => textareaRef.current?.focus(),
      Escape: () => textareaRef.current?.blur(),
    }),
    []
  );

  useKeyboardShortcuts(shortcuts);

  // Build PageContext from current article/idea context for API calls
  const pageContext = useMemo((): PageContext | undefined => {
    if (articleContext) {
      return {
        type: 'article',
        article: {
          title: articleContext.title,
          slug: articleContext.slug,
          // Note: We don't have full article content here, but the title is sufficient for context
        },
      };
    }
    if (ideaContext) {
      return {
        type: 'idea',
        idea: {
          title: ideaContext.title,
          category: ideaContext.category,
          generationType: ideaContext.generationType,
          generationLabel: ideaContext.generationLabel,
        },
      };
    }
    return undefined;
  }, [articleContext, ideaContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Allow submission with just attachments (no text required)
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;

    if (typeof sendMessage !== 'function') {
      setSubmitError('Chat is not ready. Please refresh the page and try again.');
      return;
    }

    const userMessage = input.trim();
    const currentAttachments = [...attachments];
    setInput('');
    clearAttachments();
    setShowSuggestions(false);

    try {
      // Build message with attachments using FileUIPart format for AI SDK compatibility
      if (currentAttachments.length > 0) {
        // Convert attachments to FileUIPart format
        const files = currentAttachments.map(att => ({
          type: 'file' as const,
          data: att.preview, // Base64 data URL
          mimeType: att.file.type,
        }));

        // Use type assertion to satisfy AI SDK types
        await sendMessage(
          { text: userMessage || 'What do you see in this image?', files: files as unknown as FileList },
          { body: { model: selectedModel, context: pageContext } }
        );
      } else {
        await sendMessage({ text: userMessage }, { body: { model: selectedModel, context: pageContext } });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to send message');
      setInput(userMessage);
    }
  };

  const handleFollowUpSubmit = async (query: string, followUpAttachments?: FollowUpAttachment[]) => {
    // Allow submission with just attachments (no text required)
    if (!query.trim() && (!followUpAttachments || followUpAttachments.length === 0)) return;
    if (isLoading) return;

    try {
      // Build message with attachments using FileUIPart format for AI SDK compatibility
      if (followUpAttachments && followUpAttachments.length > 0) {
        // Convert attachments to FileUIPart format
        const files = followUpAttachments.map(att => ({
          type: 'file' as const,
          data: att.data, // Base64 data URL
          mimeType: att.mimeType,
        }));

        // Use type assertion to satisfy AI SDK types
        await sendMessage(
          { text: query.trim() || 'What do you see in this image?', files: files as unknown as FileList },
          { body: { model: selectedModel, context: pageContext } }
        );
      } else {
        await sendMessage({ text: query.trim() }, { body: { model: selectedModel, context: pageContext } });
      }
    } catch (err) {
      console.error('Failed to send follow-up:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQueryClick = useCallback(async (queryText: string, submit = false) => {
    setInput(queryText);
    setShowSuggestions(false);
    
    if (submit && queryText.trim()) {
      // Log the search to history
      try {
        const { logSearchQuery } = await import('@/hooks/useSearchSuggestions');
        await logSearchQuery(queryText, suggestionsMode);
      } catch (err) {
        console.error('Error logging search:', err);
      }
      
      // Submit the query immediately
      if (!isLoading && typeof sendMessage === 'function') {
        setInput('');
        try {
          await sendMessage({ text: queryText }, { body: { model: selectedModel, context: pageContext } });
        } catch (err) {
          console.error('Failed to send message:', err);
          setSubmitError(err instanceof Error ? err.message : 'Failed to send message');
          setInput(queryText);
        }
      }
    } else {
      textareaRef.current?.focus();
    }
  }, [isLoading, sendMessage, selectedModel, suggestionsMode, pageContext]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleModeChange = useCallback((show: boolean, mode: 'search' | 'research') => {
    setShowSuggestions(show);
    setSuggestionsMode(mode);
  }, []);

  const handleConnectorDropdownClose = useCallback(() => {
    setShowConnectorDropdown(false);
  }, []);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowConnectorDropdown(false);
    };

    if (showConnectorDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showConnectorDropdown]);

  // Parse messages into our format
  const parsedMessages: ParsedMessage[] = useMemo(() => {
    return messages.map((message) => ({
      id: message.id,
      role: message.role as 'user' | 'assistant',
      content: getMessageContent(message),
      sources: [],
      images: [],
      modelUsed,
    }));
  }, [messages, modelUsed]);

  // Get all sources and images from messages
  const allSources = useMemo(() => {
    return parsedMessages.flatMap(m => m.sources || []);
  }, [parsedMessages]);

  const allImages = useMemo(() => {
    return parsedMessages.flatMap(m => m.images || []);
  }, [parsedMessages]);

  // Get first query for thread title
  const threadTitle = useMemo(() => {
    const firstUserMessage = parsedMessages.find(m => m.role === 'user');
    return firstUserMessage?.content.slice(0, 50) || 'New Thread';
  }, [parsedMessages]);

  return (
    <>
      <BackgroundGradient fadeOut={hasMessages} />
      {hasMessages && <div className="fixed inset-0 z-0 bg-os-bg-dark" />}

      <div className={`fixed inset-0 z-20 flex flex-col ${hasMessages ? '' : 'items-center justify-center'}`}>
        {/* Chat Mode */}
        {hasMessages && (
          <div className="flex flex-col h-full">
            {/* Single sticky header */}
            <ChatHeader
              activeTab={activeTab}
              onTabChange={setActiveTab}
              hasLinks={allSources.length > 0}
              hasImages={allImages.length > 0}
              linksCount={allSources.length}
              imagesCount={allImages.length}
              threadTitle={threadTitle}
              onBack={resetChat}
            />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4">
                {activeTab === 'answer' && (
                  <>
                    {/* Article Reference Card - shown when following up from an article */}
                    {articleContext && parsedMessages.length > 0 && (
                      <div className="pt-6">
                        <ArticleReferenceCard
                          title={articleContext.title}
                          slug={articleContext.slug}
                          imageUrl={articleContext.imageUrl}
                        />
                      </div>
                    )}

                    {/* Ideas Reference Card - shown when generating ideas */}
                    {ideaContext && parsedMessages.length > 0 && !articleContext && (
                      <div className="pt-6">
                        <IdeaReferenceCard
                          title={ideaContext.title}
                          category={ideaContext.category}
                          slug={ideaContext.slug}
                          generationType={ideaContext.generationType}
                          generationLabel={ideaContext.generationLabel}
                        />
                      </div>
                    )}

                    {parsedMessages.map((message, idx) => {
                      if (message.role === 'user') {
                        const nextMessage = parsedMessages[idx + 1];
                        if (nextMessage?.role === 'assistant') {
                          return (
                            <ChatContent
                              key={message.id}
                              query={message.content}
                              content={nextMessage.content}
                              sources={nextMessage.sources}
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
                  </>
                )}

                {activeTab === 'links' && (
                  <div className="py-6">
                    {/* Links view content */}
                    <p className="text-os-text-secondary-dark text-sm">
                      {allSources.length > 0 
                        ? `${allSources.length} sources found`
                        : 'No links available'
                      }
                    </p>
                  </div>
                )}

                {activeTab === 'images' && (
                  <div className="py-6">
                    {/* Images view content */}
                    <p className="text-os-text-secondary-dark text-sm">
                      {allImages.length > 0 
                        ? `${allImages.length} images found`
                        : 'No images available'
                      }
                    </p>
                  </div>
                )}

                {/* Error display - only show if no successful content was generated */}
                {(error || submitError) && !parsedMessages.some(m => m.role === 'assistant' && m.content.length > 50) && (
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
              </div>
            </div>

            {/* Follow-up input */}
            <div className="relative">
              <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-os-bg-dark to-transparent pointer-events-none" />
              <div className="bg-os-bg-dark px-4 py-4">
                <FollowUpInput
                  onSubmit={handleFollowUpSubmit}
                  isLoading={isLoading}
                  placeholder="Ask a follow-up"
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
            </div>
          </div>
        )}

        {/* Landing Mode */}
        {!hasMessages && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="contents"
          >
            <motion.div 
              className="w-full max-w-3xl px-4 mb-8 text-center"
              variants={fadeInUp}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-vanilla mb-2 tracking-tight font-display">
                Brand Operating System
              </h1>
              <TypewriterText />
              
              {(error || submitError) && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-3 text-left">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="mt-1">{error?.message || submitError}</p>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div className="w-full" variants={fadeInUp}>
              <div className="max-w-3xl mx-auto px-4">
                <form onSubmit={handleSubmit} className="relative">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        addFiles(e.target.files);
                        e.target.value = ''; // Reset to allow same file selection
                      }
                    }}
                    className="hidden"
                  />

                  <div
                    className={`
                      relative bg-os-surface-dark/80 backdrop-blur-xl rounded-xl
                      border transition-all duration-200
                      ${isDragging
                        ? 'border-brand-aperol shadow-lg shadow-brand-aperol/20'
                        : isFocused
                          ? 'border-brand-aperol shadow-lg shadow-brand-aperol/20'
                          : 'border-os-border-dark hover:border-os-border-dark/60'
                      }
                    `}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {/* Drag overlay */}
                    <DragOverlay isDragging={isDragging} />

                    {/* Attachment preview */}
                    <AttachmentPreview
                      attachments={attachments}
                      onRemove={removeAttachment}
                      error={attachmentError}
                      onClearError={clearAttachmentError}
                    />

                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onPaste={handlePaste}
                        placeholder={attachments.length > 0 ? "Add a message or send with images..." : "Ask anything. Type @ for mentions and / for shortcuts."}
                        className="w-full px-4 py-4 bg-transparent text-os-text-primary-dark placeholder:text-os-text-secondary-dark resize-none focus:outline-none min-h-[60px] max-h-[300px]"
                        rows={1}
                        aria-label="Chat input"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Toolbar - always visible */}
                    <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t border-os-border-dark gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <SearchResearchToggle
                          onQueryClick={handleQueryClick}
                          onModeChange={handleModeChange}
                          showSuggestions={showSuggestions}
                        />
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        <ModelSelector
                          selectedModel={selectedModel}
                          onModelChange={setSelectedModel}
                          disabled={isLoading}
                        />

                        <div className="hidden sm:block w-px h-5 bg-os-border-dark" />
                        <div className="relative">
                          <button
                            ref={globeButtonRef}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConnectorDropdown(!showConnectorDropdown);
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              showConnectorDropdown
                                ? 'bg-brand-aperol/20 text-brand-aperol'
                                : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                            }`}
                            aria-label="Connectors"
                            title="Connectors"
                          >
                            <Globe className="w-5 h-5" />
                          </button>
                          <ConnectorDropdown
                            isOpen={showConnectorDropdown}
                            onClose={handleConnectorDropdownClose}
                            connectors={updatedConnectors}
                            onToggleConnector={handleToggleConnector}
                            triggerRef={globeButtonRef as React.RefObject<HTMLElement>}
                          />
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openFilePicker();
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              attachments.length > 0
                                ? 'bg-brand-aperol/20 text-brand-aperol'
                                : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                            }`}
                            aria-label="Attach images"
                            title="Attach images (or paste/drag & drop)"
                          >
                            <Paperclip className="w-5 h-5" />
                            {attachments.length > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-aperol text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                                {attachments.length}
                              </span>
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          {/* Pulsing rings when recording */}
                          {isListening && (
                            <>
                              <motion.div
                                className="absolute inset-0 rounded-lg bg-brand-aperol/30"
                                initial={{ scale: 1, opacity: 0.6 }}
                                animate={{
                                  scale: [1, 1.8, 2.2],
                                  opacity: [0.6, 0.3, 0],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: 'easeOut',
                                }}
                              />
                              <motion.div
                                className="absolute inset-0 rounded-lg bg-brand-aperol/20"
                                initial={{ scale: 1, opacity: 0.4 }}
                                animate={{
                                  scale: [1, 1.5, 1.8],
                                  opacity: [0.4, 0.2, 0],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: 'easeOut',
                                  delay: 0.3,
                                }}
                              />
                            </>
                          )}
                          <motion.button
                            type="button"
                            onClick={handleMicClick}
                            className={`relative p-2 rounded-lg transition-colors ${
                              isListening
                                ? 'bg-brand-aperol text-white'
                                : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                            }`}
                            aria-label="Voice input"
                            title={isListening ? 'Stop recording' : 'Start voice input'}
                            whileTap={{ scale: 0.92 }}
                            animate={isListening ? {
                              scale: [1, 1.05, 1],
                            } : { scale: 1 }}
                            transition={isListening ? {
                              duration: 0.8,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            } : { duration: 0.15 }}
                          >
                            <motion.div
                              animate={isListening ? { rotate: [0, -8, 8, -8, 0] } : { rotate: 0 }}
                              transition={isListening ? {
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 1,
                                ease: 'easeInOut',
                              } : { duration: 0.15 }}
                            >
                              <Mic className="w-5 h-5" />
                            </motion.div>
                          </motion.button>
                          {voiceError && (
                            <motion.span
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-red-400 whitespace-nowrap bg-os-surface-dark px-2 py-1 rounded"
                            >
                              {voiceError}
                            </motion.span>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={(!input.trim() && attachments.length === 0) || isLoading}
                          className={`p-2 rounded-lg transition-all ${
                            (input.trim() || attachments.length > 0) && !isLoading
                              ? 'bg-brand-aperol text-white hover:bg-brand-aperol/90'
                              : 'text-os-text-secondary-dark/50 cursor-not-allowed'
                          }`}
                          aria-label="Send message"
                          title="Send message"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Suggestions - inside container, below toolbar */}
                    {showSuggestions && (
                      <div className="border-t border-os-border-dark">
                        <SearchResearchSuggestions 
                          mode={suggestionsMode} 
                          onQueryClick={handleQueryClick}
                        />
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
}
