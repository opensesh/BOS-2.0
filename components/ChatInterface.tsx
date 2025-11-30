'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DefaultChatTransport } from 'ai';
import {
  Mic,
  Paperclip,
  Send,
  Globe,
  Grid3x3,
  GraduationCap,
  Users,
  DollarSign,
  Mail,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { BackgroundGradient } from './BackgroundGradient';
import { TypewriterText } from './TypewriterText';
import { SearchResearchToggle, SearchResearchSuggestions } from './ui/search-research-toggle';
import { ConnectorDropdown } from './ui/connector-dropdown';
import { ModelSelector } from './ui/model-selector';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { ModelId } from '@/lib/ai/providers';
import { useChatContext } from '@/lib/chat-context';
import {
  FollowUpInput,
  SourceInfo,
  ImageResult,
  ChatHeader,
  ChatContent,
} from './chat';
import { ArticleReferenceCard, InspirationReferenceCard } from './discover/article/AskFollowUp';

// Article reference context from discover page
interface ArticleContext {
  title: string;
  slug: string;
  imageUrl?: string;
}

// Ideas reference context from generate ideas
interface InspirationContext {
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
  const [showGridDropdown, setShowGridDropdown] = useState(false);
  const [showPaperclipDropdown, setShowPaperclipDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsMode, setSuggestionsMode] = useState<'search' | 'research'>('search');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'answer' | 'links' | 'images'>('answer');
  const [articleContext, setArticleContext] = useState<ArticleContext | null>(null);
  const [inspirationContext, setInspirationContext] = useState<InspirationContext | null>(null);
  const [hasProcessedUrlParams, setHasProcessedUrlParams] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const globeButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat context for cross-component communication
  const { shouldResetChat, acknowledgeChatReset, addToHistory } = useChatContext();

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
          addToHistory(title, preview);
        }
      }
      resetChat();
      setArticleContext(null);
      setInspirationContext(null);
      acknowledgeChatReset();
    }
  }, [shouldResetChat, acknowledgeChatReset, resetChat, messages, addToHistory, getMessageContent]);

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
      
      // Set the article context
      setArticleContext({
        title: articleTitle,
        slug: articleRef,
        imageUrl: articleImage || undefined,
      });

      // Clear URL params without reload
      router.replace('/', { scroll: false });

      // Auto-submit the query with longer delay to ensure state is cleared
      setTimeout(() => {
        sendMessage({ text: query });
      }, 250);
    }
    // Handle standalone query (from ideas prompts / generate ideas)
    else if (query && !articleRef) {
      // Mark as processed immediately to prevent re-runs
      setHasProcessedUrlParams(true);
      
      // Reset existing messages to ensure proper message alternation
      setMessages([]);
      setArticleContext(null);
      
      // Check for inspiration context in URL params
      const inspirationTitle = searchParams.get('inspirationTitle');
      const inspirationCategory = searchParams.get('inspirationCategory');
      const inspirationSlug = searchParams.get('inspirationSlug');
      const generationType = searchParams.get('generationType');
      const generationLabel = searchParams.get('generationLabel');
      
      if (inspirationTitle && inspirationCategory) {
        setInspirationContext({
          title: inspirationTitle,
          category: inspirationCategory,
          slug: inspirationSlug || undefined,
          generationType: generationType || undefined,
          generationLabel: generationLabel || undefined,
        });
      } else {
        setInspirationContext(null);
      }
      
      // Clear URL params without reload
      router.replace('/', { scroll: false });

      // Auto-submit the query with longer delay to ensure state is cleared
      setTimeout(() => {
        sendMessage({ text: query });
      }, 250);
    }
  }, [searchParams, router, sendMessage, setMessages, hasProcessedUrlParams]);

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
    { id: 'web', icon: Globe, title: 'Web', description: 'Search across the entire Internet', enabled: true },
    { id: 'academic', icon: GraduationCap, title: 'Academic', description: 'Search academic papers', enabled: false },
    { id: 'social', icon: Users, title: 'Social', description: 'Discussions and opinions', enabled: false },
    { id: 'finance', icon: DollarSign, title: 'Finance', description: 'Search SEC filings', enabled: false },
    { id: 'gmail', icon: Mail, title: 'Gmail with Calendar', description: '', enabled: false },
    { id: 'browse-all', icon: Share2, title: 'Browse all connectors', description: '', enabled: false },
  ];

  const [activeConnectors, setActiveConnectors] = useState<Set<string>>(new Set(['web']));

  const handleToggleConnector = (id: string) => {
    if (id === 'browse-all') return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!input.trim() || isLoading) return;
    
    if (typeof sendMessage !== 'function') {
      setSubmitError('Chat is not ready. Please refresh the page and try again.');
      return;
    }
    
    const userMessage = input.trim();
    setInput('');
    setShowSuggestions(false);
    
    try {
      await sendMessage({ text: userMessage }, { body: { model: selectedModel } });
    } catch (err) {
      console.error('Failed to send message:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to send message');
      setInput(userMessage);
    }
  };

  const handleFollowUpSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;
    
    try {
      await sendMessage({ text: query }, { body: { model: selectedModel } });
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

  const handleQueryClick = useCallback((queryText: string) => {
    setInput(queryText);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  }, []);

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
      setShowGridDropdown(false);
      setShowPaperclipDropdown(false);
    };

    if (showConnectorDropdown || showGridDropdown || showPaperclipDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showConnectorDropdown, showGridDropdown, showPaperclipDropdown]);

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

  const hasMessages = messages.length > 0;

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
                    {inspirationContext && parsedMessages.length > 0 && !articleContext && (
                      <div className="pt-6">
                        <InspirationReferenceCard
                          title={inspirationContext.title}
                          category={inspirationContext.category}
                          slug={inspirationContext.slug}
                          generationType={inspirationContext.generationType}
                          generationLabel={inspirationContext.generationLabel}
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
          <>
            <div className="w-full max-w-3xl px-4 mb-8 text-center">
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
            </div>

            <div className="w-full">
              <div className="max-w-3xl mx-auto px-4">
                <form onSubmit={handleSubmit} className="relative">
                  <div
                    className={`
                      relative bg-os-surface-dark/80 backdrop-blur-xl rounded-xl
                      border transition-all duration-200
                      ${isFocused
                        ? 'border-brand-aperol shadow-lg shadow-brand-aperol/20'
                        : 'border-os-border-dark hover:border-os-border-dark/60'
                      }
                    `}
                  >
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Ask anything. Type @ for mentions and / for shortcuts."
                        className="w-full px-4 py-4 bg-transparent text-os-text-primary-dark placeholder:text-os-text-secondary-dark resize-none focus:outline-none min-h-[60px] max-h-[300px]"
                        rows={1}
                        aria-label="Chat input"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 border-t border-os-border-dark flex-nowrap gap-4">
                      <div className="flex items-center gap-2">
                        <ModelSelector
                          selectedModel={selectedModel}
                          onModelChange={setSelectedModel}
                          disabled={isLoading}
                        />
                        <div className="w-px h-6 bg-os-border-dark" />
                        <SearchResearchToggle
                          onQueryClick={handleQueryClick}
                          onModeChange={handleModeChange}
                          showSuggestions={showSuggestions}
                        />
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="relative">
                          <button
                            ref={globeButtonRef}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConnectorDropdown(!showConnectorDropdown);
                              setShowGridDropdown(false);
                              setShowPaperclipDropdown(false);
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
                              setShowGridDropdown(!showGridDropdown);
                              setShowConnectorDropdown(false);
                              setShowPaperclipDropdown(false);
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              showGridDropdown
                                ? 'bg-brand-aperol/20 text-brand-aperol'
                                : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                            }`}
                            aria-label="More options"
                            title="More options"
                          >
                            <Grid3x3 className="w-5 h-5" />
                          </button>
                          {showGridDropdown && (
                            <div className="absolute bottom-full right-0 mb-2 w-64 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-lg p-2 z-50">
                              <p className="text-sm text-os-text-secondary-dark p-2">More options coming soon</p>
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPaperclipDropdown(!showPaperclipDropdown);
                              setShowConnectorDropdown(false);
                              setShowGridDropdown(false);
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              showPaperclipDropdown
                                ? 'bg-brand-aperol/20 text-brand-aperol'
                                : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                            }`}
                            aria-label="Attach file"
                            title="Attach file"
                          >
                            <Paperclip className="w-5 h-5" />
                          </button>
                          {showPaperclipDropdown && (
                            <div className="absolute bottom-full right-0 mb-2 w-64 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-lg p-2 z-50">
                              <p className="text-sm text-os-text-secondary-dark p-2">Attachment options coming soon</p>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleMicClick}
                          className={`p-2 rounded-lg transition-all relative ${
                            isListening
                              ? 'bg-brand-aperol text-white animate-pulse'
                              : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                          }`}
                          aria-label="Voice input"
                          title={isListening ? 'Stop recording' : 'Start voice input'}
                        >
                          <Mic className="w-5 h-5" />
                          {voiceError && (
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
                              {voiceError}
                            </span>
                          )}
                        </button>

                        <button
                          type="submit"
                          disabled={!input.trim() || isLoading}
                          className={`p-2 rounded-lg transition-all ${
                            input.trim() && !isLoading
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
                  </div>
                </form>
              </div>
            </div>

            {showSuggestions && (
              <div className="w-full max-w-3xl mx-auto px-4 mt-4">
                <SearchResearchSuggestions mode={suggestionsMode} onQueryClick={handleQueryClick} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
