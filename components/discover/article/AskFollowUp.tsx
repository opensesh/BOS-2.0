'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Mic,
  Globe,
  Paperclip,
  Send,
  Brain,
  Compass,
  Palette,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react';
import { ModelId } from '@/lib/ai/providers';
import { useAttachments } from '@/hooks/useAttachments';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { AttachmentPreview, DragOverlay } from '@/components/chat/AttachmentPreview';
import { SearchResearchToggle } from '@/components/ui/search-research-toggle';
import { ConnectorDropdown } from '@/components/ui/connector-dropdown';
import { ModelSelector } from '@/components/ui/model-selector';

interface AskFollowUpProps {
  articleTitle: string;
  articleSlug: string;
  articleImage?: string;
  articleSummary?: string; // First few paragraphs for context
  articleSections?: string[]; // Section titles
  sourceCount?: number;
}

interface Connector {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
}

// Pinned chat input at bottom of article page - matches home page style
export function AskFollowUp({ 
  articleTitle, 
  articleSlug, 
  articleImage,
  articleSummary,
  articleSections,
  sourceCount,
}: AskFollowUpProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>('auto');
  const [showConnectorDropdown, setShowConnectorDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsMode, setSuggestionsMode] = useState<'search' | 'research'>('search');
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const globeButtonRef = useRef<HTMLButtonElement>(null);

  // Connectors (matching homepage)
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

  // Voice recognition
  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition((finalTranscript) => {
    setQuery((prev) => prev + (prev ? ' ' : '') + finalTranscript);
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

  // Update input with live transcript
  useEffect(() => {
    if (transcript && isListening) {
      setQuery((prev) => {
        const base = prev.replace(transcript, '').trim();
        return base + (base ? ' ' : '') + transcript;
      });
    }
  }, [transcript, isListening]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [query]);

  // Close connector dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowConnectorDropdown(false);
    };

    if (showConnectorDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showConnectorDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && attachments.length === 0) return;

    // Store article context in sessionStorage for the chat interface
    // This allows passing more data than URL params can handle
    const articleContext = {
      title: articleTitle,
      slug: articleSlug,
      summary: articleSummary,
      sections: articleSections,
      sourceCount: sourceCount,
    };
    sessionStorage.setItem('articleContext', JSON.stringify(articleContext));

    // Navigate to home with the article context and query
    // URLSearchParams handles encoding automatically
    const searchParams = new URLSearchParams();
    searchParams.set('q', query.trim());
    searchParams.set('articleRef', articleSlug);
    searchParams.set('articleTitle', articleTitle);
    if (articleImage) {
      // Decode any HTML entities in the image URL before encoding
      searchParams.set('articleImage', articleImage.replace(/&amp;/g, '&'));
    }

    clearAttachments();
    router.push(`/?${searchParams.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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

  const handleQueryClick = useCallback((queryText: string) => {
    setQuery(queryText);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:pl-[56px]">
      {/* Solid background with gradient fade at top */}
      <div className="absolute inset-0 bg-os-bg-dark" />
      <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-os-bg-dark to-transparent pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto px-6 md:px-12 pb-4 pt-2">
        <form onSubmit={handleSubmit}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                addFiles(e.target.files);
                e.target.value = '';
              }
            }}
            className="hidden"
          />

          <div
            className={`
              relative bg-os-surface-dark/80 backdrop-blur-xl rounded-xl
              border transition-all duration-200 shadow-xl
              ${
                isDragging
                  ? 'border-brand-aperol shadow-lg shadow-brand-aperol/20'
                  : isFocused
                    ? 'border-brand-aperol shadow-brand-aperol/10'
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
              compact
            />

            {/* Input area */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onPaste={handlePaste}
                placeholder={attachments.length > 0 ? "Add a message or send with images..." : "Ask follow-up about this article..."}
                className="w-full px-4 py-4 bg-transparent text-os-text-primary-dark placeholder:text-os-text-secondary-dark resize-none focus:outline-none min-h-[60px] max-h-[150px]"
                rows={1}
                aria-label="Follow-up question input"
              />
            </div>

            {/* Footer toolbar - matching homepage layout */}
            <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t border-os-border-dark gap-2 sm:gap-4">
              {/* Left side - Search/Research Toggle */}
              <div className="flex items-center gap-2 sm:gap-3">
                <SearchResearchToggle
                  onQueryClick={handleQueryClick}
                  onModeChange={handleModeChange}
                  showSuggestions={showSuggestions}
                />
              </div>

              {/* Right side - action buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Model Selector */}
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  disabled={false}
                />

                <div className="hidden sm:block w-px h-5 bg-os-border-dark" />

                {/* Globe - Connectors */}
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

                {/* Attach */}
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

                {/* Voice input with animation */}
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

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!query.trim() && attachments.length === 0}
                  className={`p-2 rounded-lg transition-all ${
                    (query.trim() || attachments.length > 0)
                      ? 'bg-brand-aperol text-white hover:bg-brand-aperol/90'
                      : 'text-os-text-secondary-dark/50 cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                  title="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Article reference card shown at top of follow-up chat responses
export function ArticleReferenceCard({
  title,
  slug,
  imageUrl,
  onNavigate,
}: {
  title: string;
  slug: string;
  imageUrl?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      router.push(`/discover/${slug}`);
    }
  };

  // Decode HTML entities in URL (e.g., &amp; -> &)
  const decodedImageUrl = imageUrl?.replace(/&amp;/g, '&');

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 p-3 mb-4 bg-os-surface-dark/50 rounded-xl border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all group text-left"
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-os-bg-dark flex-shrink-0">
        {decodedImageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-os-surface-dark via-os-bg-dark to-os-surface-dark" />
            )}
            <Image
              src={decodedImageUrl}
              alt={title}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              unoptimized
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          // Fallback icon when no image or error
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
            <svg className="w-6 h-6 text-os-text-secondary-dark/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-os-text-secondary-dark mb-0.5">Follow up to</p>
        <p className="text-sm font-medium text-brand-vanilla group-hover:text-brand-aperol transition-colors line-clamp-1">
          {title}
        </p>
      </div>

      {/* Arrow */}
      <ArrowUpRight className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors flex-shrink-0" />
    </button>
  );
}

// Ideas reference card shown at top of generate ideas chat responses
export function IdeaReferenceCard({
  title,
  category,
  slug,
  generationType,
  generationLabel,
}: {
  title: string;
  category: string;
  slug?: string;
  generationType?: string;
  generationLabel?: string;
}) {
  const router = useRouter();
  
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'short-form':
        return 'Short Form';
      case 'long-form':
        return 'Long Form';
      case 'blog':
        return 'Blog';
      default:
        return cat;
    }
  };

  // Get action label based on generation type
  const getActionLabel = () => {
    if (generationLabel) return `Generating ${generationLabel.toLowerCase()}`;
    if (!generationType) return 'Generating content';
    
    // Map generation types to friendly labels
    const typeLabels: Record<string, string> = {
      'image': 'Generating image concepts',
      'copy': 'Generating copy & captions',
      'art-direction': 'Generating art direction',
      'resources': 'Generating resources',
      'script': 'Generating script outline',
      'hooks': 'Generating hooks & intros',
      'storyboard': 'Generating storyboard',
      'outline': 'Generating table of contents',
      'titles': 'Generating title ideas',
      'similar': 'Analyzing similar content',
    };
    
    return typeLabels[generationType] || 'Generating content';
  };

  // Get icon based on generation type
  const getIcon = () => {
    if (!generationType) return <Lightbulb className="w-5 h-5 text-brand-aperol" />;
    
    // Icons mapped to types
    switch (generationType) {
      case 'image':
        return <span className="text-lg">🖼️</span>;
      case 'copy':
        return <span className="text-lg">✏️</span>;
      case 'art-direction':
        return <span className="text-lg">🎨</span>;
      case 'resources':
        return <span className="text-lg">📁</span>;
      case 'script':
        return <span className="text-lg">📜</span>;
      case 'hooks':
        return <span className="text-lg">💡</span>;
      case 'storyboard':
        return <span className="text-lg">🎬</span>;
      case 'outline':
        return <span className="text-lg">📋</span>;
      case 'titles':
        return <span className="text-lg">📝</span>;
      case 'similar':
        return <span className="text-lg">🔍</span>;
      default:
        return <Lightbulb className="w-5 h-5 text-brand-aperol" />;
    }
  };

  const handleClick = () => {
    if (slug) {
      router.push(`/discover/ideas/${slug}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!slug}
      className={`w-full flex items-center gap-3 p-3 mb-4 bg-os-surface-dark/50 rounded-xl border border-os-border-dark/50 text-left ${
        slug ? 'hover:border-brand-aperol/30 cursor-pointer group' : ''
      } transition-all`}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-brand-aperol/10 flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-os-text-secondary-dark mb-0.5">{getActionLabel()}</p>
        <p className={`text-sm font-medium text-brand-vanilla line-clamp-1 ${slug ? 'group-hover:text-brand-aperol' : ''} transition-colors`}>
          {title}
        </p>
      </div>

      {/* Category tag - subtle, on the right */}
      <span className="px-2 py-1 rounded text-[10px] font-medium bg-os-bg-dark/60 text-os-text-secondary-dark border border-os-border-dark/30 flex-shrink-0">
        {getCategoryLabel(category)}
      </span>

      {/* Arrow indicator if clickable */}
      {slug && (
        <ArrowUpRight className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors flex-shrink-0" />
      )}
    </button>
  );
}
