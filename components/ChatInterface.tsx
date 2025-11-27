'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
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
  User,
  Bot,
  Loader2,
} from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { BackgroundGradient } from './BackgroundGradient';
import { TypewriterText } from './TypewriterText';
import { SearchResearchToggle, SearchResearchSuggestions } from './ui/search-research-toggle';
import { ConnectorDropdown } from './ui/connector-dropdown';
import { ModelSelector } from './ui/model-selector';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { ModelId } from '@/lib/ai/providers';

interface Connector {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
}

export function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState<ModelId>('auto');
  const [localInput, setLocalInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showConnectorDropdown, setShowConnectorDropdown] = useState(false);
  const [showGridDropdown, setShowGridDropdown] = useState(false);
  const [showPaperclipDropdown, setShowPaperclipDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsMode, setSuggestionsMode] = useState<'search' | 'research'>('search');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const globeButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI SDK useChat hook (v5 API) - using append for programmatic message submission
  const { messages, append, status, error } = useChat({
    api: '/api/chat',
    body: { model: selectedModel },
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  
  // Use local input for controlled textarea
  const input = localInput;
  const setInput = setLocalInput;

  const connectors: Connector[] = [
    {
      id: 'web',
      icon: Globe,
      title: 'Web',
      description: 'Search across the entire Internet',
      enabled: true,
    },
    {
      id: 'academic',
      icon: GraduationCap,
      title: 'Academic',
      description: 'Search academic papers',
      enabled: false,
    },
    {
      id: 'social',
      icon: Users,
      title: 'Social',
      description: 'Discussions and opinions',
      enabled: false,
    },
    {
      id: 'finance',
      icon: DollarSign,
      title: 'Finance',
      description: 'Search SEC filings',
      enabled: false,
    },
    {
      id: 'gmail',
      icon: Mail,
      title: 'Gmail with Calendar',
      description: '',
      enabled: false,
    },
    {
      id: 'browse-all',
      icon: Share2,
      title: 'Browse all connectors',
      description: '',
      enabled: false,
    },
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
        // Replace interim transcript
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

  // Keyboard shortcuts - memoized to prevent recreation on every render
  const shortcuts = useMemo(
    () => ({
      'cmd+k': () => {
        textareaRef.current?.focus();
      },
      'ctrl+k': () => {
        textareaRef.current?.focus();
      },
      Escape: () => {
        textareaRef.current?.blur();
      },
    }),
    []
  );

  useKeyboardShortcuts(shortcuts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const userMessage = input.trim();
      setInput('');
      setShowSuggestions(false);
      // Use append with a properly formatted message object (AI SDK 5.x pattern)
      await append({
        role: 'user',
        content: userMessage,
      });
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

  // Helper to get message content (handles AI SDK 5.x parts format)
  const getMessageContent = (message: { content?: string; parts?: Array<{ type: string; text?: string }> }): string => {
    // First check for direct content string (simpler format)
    if (typeof message.content === 'string') {
      return message.content;
    }
    // Handle parts array format (AI SDK 5.x)
    if (Array.isArray(message.parts)) {
      return message.parts
        .filter((part): part is { type: string; text: string } => 
          part && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string'
        )
        .map((part) => part.text)
        .join('');
    }
    return '';
  };

  // Check if we have messages (chat mode) or not (landing mode)
  const hasMessages = messages.length > 0;

  return (
    <>
      <BackgroundGradient />

      {/* Main container - switches between centered landing and full chat view */}
      <div
        className={`fixed inset-0 z-20 flex flex-col ${
          hasMessages ? 'pt-4 pb-0' : 'items-center justify-center'
        }`}
      >
        {/* Messages Area - only shown when there are messages */}
        {hasMessages && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="max-w-3xl mx-auto space-y-6 pt-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-aperol/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-brand-aperol" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-brand-aperol text-white'
                        : 'bg-os-surface-dark text-os-text-primary-dark border border-os-border-dark'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{getMessageContent(message)}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-os-surface-dark border border-os-border-dark flex items-center justify-center">
                      <User className="w-4 h-4 text-os-text-secondary-dark" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-aperol/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-brand-aperol" />
                  </div>
                  <div className="bg-os-surface-dark rounded-xl px-4 py-3 border border-os-border-dark">
                    <Loader2 className="w-5 h-5 text-brand-aperol animate-spin" />
                  </div>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  Error: {error.message}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Landing content - only shown when no messages */}
        {!hasMessages && (
          <div className="w-full max-w-3xl px-4 mb-8 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-vanilla mb-2 tracking-tight font-display">
              Brand Operating System
            </h1>
            <TypewriterText />
          </div>
        )}

        {/* Input Area - always at bottom when in chat mode, centered when landing */}
        <div
          className={`w-full ${hasMessages ? 'border-t border-os-border-dark bg-os-bg-darker/80 backdrop-blur-xl' : ''}`}
        >
          <div className={`max-w-3xl mx-auto px-4 ${hasMessages ? 'py-4' : ''}`}>
            <form onSubmit={handleSubmit} className="relative">
              <div
                className={`
                relative bg-os-surface-dark/80 backdrop-blur-xl rounded-xl
                border transition-all duration-200
                ${
                  isFocused
                    ? 'border-brand-aperol shadow-lg shadow-brand-aperol/20'
                    : 'border-os-border-dark hover:border-os-border-dark/60'
                }
              `}
              >
                {/* Text Input */}
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

                {/* Footer Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-os-border-dark flex-nowrap gap-4">
                  {/* Left Side - Model Selector + Search/Research Toggle */}
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

                  {/* Right Side - Icon Buttons */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* Globe - Connectors */}
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
                        className={`
                          p-2 rounded-lg transition-all
                          ${
                            showConnectorDropdown
                              ? 'bg-brand-aperol/20 text-brand-aperol'
                              : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                          }
                        `}
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

                    {/* Grid */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowGridDropdown(!showGridDropdown);
                          setShowConnectorDropdown(false);
                          setShowPaperclipDropdown(false);
                        }}
                        className={`
                          p-2 rounded-lg transition-all
                          ${
                            showGridDropdown
                              ? 'bg-brand-aperol/20 text-brand-aperol'
                              : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                          }
                        `}
                        aria-label="More options"
                        title="More options"
                      >
                        <Grid3x3 className="w-5 h-5" />
                      </button>
                      {showGridDropdown && (
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-lg p-2 z-50">
                          <p className="text-sm text-os-text-secondary-dark p-2">
                            More options coming soon
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Paperclip */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPaperclipDropdown(!showPaperclipDropdown);
                          setShowConnectorDropdown(false);
                          setShowGridDropdown(false);
                        }}
                        className={`
                          p-2 rounded-lg transition-all
                          ${
                            showPaperclipDropdown
                              ? 'bg-brand-aperol/20 text-brand-aperol'
                              : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                          }
                        `}
                        aria-label="Attach file"
                        title="Attach file"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      {showPaperclipDropdown && (
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-lg p-2 z-50">
                          <p className="text-sm text-os-text-secondary-dark p-2">
                            Attachment options coming soon
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Microphone */}
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className={`
                        p-2 rounded-lg transition-all relative
                        ${
                          isListening
                            ? 'bg-brand-aperol text-white animate-pulse'
                            : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                        }
                      `}
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

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className={`
                        p-2 rounded-lg transition-all
                        ${
                          input.trim() && !isLoading
                            ? 'bg-brand-aperol text-white hover:bg-brand-aperol/90'
                            : 'text-os-text-secondary-dark/50 cursor-not-allowed'
                        }
                      `}
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

        {/* Fixed suggestions container - positioned directly below chat input when in landing mode */}
        {showSuggestions && !hasMessages && (
          <div className="w-full max-w-3xl mx-auto px-4 mt-4">
            <SearchResearchSuggestions mode={suggestionsMode} onQueryClick={handleQueryClick} />
          </div>
        )}
      </div>
    </>
  );
}
