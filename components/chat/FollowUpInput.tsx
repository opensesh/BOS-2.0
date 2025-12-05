'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Globe,
  Paperclip,
  Send,
  Brain,
  Compass,
  Palette,
} from 'lucide-react';
import { ModelId } from '@/lib/ai/providers';
import { useAttachments } from '@/hooks/useAttachments';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { AttachmentPreview, DragOverlay } from './AttachmentPreview';
import { SearchResearchToggle, SearchResearchSuggestions } from '../ui/search-research-toggle';
import { ConnectorDropdown } from '../ui/connector-dropdown';
import { ModelSelector } from '../ui/model-selector';

export interface FollowUpAttachment {
  type: 'image';
  data: string;
  mimeType: string;
}

interface Connector {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
}

interface FollowUpInputProps {
  onSubmit: (query: string, attachments?: FollowUpAttachment[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  selectedModel?: ModelId;
  onModelChange?: (model: ModelId) => void;
}

export function FollowUpInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Ask a follow-up',
  selectedModel = 'auto',
  onModelChange,
}: FollowUpInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showConnectorDropdown, setShowConnectorDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsMode, setSuggestionsMode] = useState<'search' | 'research'>('search');
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

  // Update input with live transcript
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

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
    // Allow submission with just attachments (no text required)
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const query = input.trim();
    const currentAttachments = attachments.length > 0
      ? attachments.map(att => ({
          type: 'image' as const,
          data: att.preview,
          mimeType: att.file.type,
        }))
      : undefined;

    setInput('');
    clearAttachments();
    setShowSuggestions(false);
    onSubmit(query, currentAttachments);
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

  const handleQueryClick = useCallback((queryText: string, submit = false) => {
    setInput(queryText);
    setShowSuggestions(false);
    
    if (submit && queryText.trim() && !isLoading) {
      setInput('');
      onSubmit(queryText, undefined);
    } else {
      textareaRef.current?.focus();
    }
  }, [isLoading, onSubmit]);

  return (
    <div className="max-w-3xl mx-auto">
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
              e.target.value = ''; // Reset to allow same file selection
            }
          }}
          className="hidden"
        />

        <div
          className={`
            relative bg-os-surface-dark/80 backdrop-blur-xl rounded-xl
            border transition-all duration-200
            ${
              isDragging
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
            compact
          />

          {/* Input area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onPaste={handlePaste}
              placeholder={attachments.length > 0 ? "Add a message or send with images..." : placeholder}
              className="w-full px-4 py-4 bg-transparent text-os-text-primary-dark placeholder:text-os-text-secondary-dark resize-none focus:outline-none min-h-[60px] max-h-[300px]"
              rows={1}
              aria-label="Follow-up input"
              disabled={isLoading}
            />
          </div>

          {/* Toolbar - matching homepage layout */}
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
                onModelChange={onModelChange || (() => {})}
                disabled={isLoading}
              />

              <div className="hidden sm:block w-px h-5 bg-os-border-dark" />

              {/* Connectors dropdown */}
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

              {/* Attachment button */}
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

              {/* Mic button with animation */}
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

          {/* Suggestions - inside container, below toolbar (matching homepage) */}
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
  );
}
