'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Mic,
  Globe,
  Grid3x3,
  Paperclip,
  Send,
  Sparkles,
  ChevronDown,
  GraduationCap,
  Users,
  DollarSign,
  Mail,
  Share2,
} from 'lucide-react';
import { ModelId, models } from '@/lib/ai/providers';

interface FollowUpInputProps {
  onSubmit: (query: string) => void;
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
  const [mode, setMode] = useState<'search' | 'research'>('search');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showConnectorDropdown, setShowConnectorDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
      if (connectorRef.current && !connectorRef.current.contains(event.target as Node)) {
        setShowConnectorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const currentModel = models[selectedModel];

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative bg-os-surface-dark/80 backdrop-blur-xl rounded-xl
            border transition-all duration-200
            ${
              isFocused
                ? 'border-brand-aperol shadow-lg shadow-brand-aperol/20'
                : 'border-os-border-dark hover:border-os-border-dark/80'
            }
          `}
        >
          {/* Input area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="w-full px-4 py-4 bg-transparent text-os-text-primary-dark placeholder:text-os-text-secondary-dark resize-none focus:outline-none min-h-[60px] max-h-[150px]"
              rows={1}
              disabled={isLoading}
            />
          </div>

          {/* Footer toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-os-border-dark">
            {/* Left side - Model Selector + Search/Research Toggle */}
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <div className="relative" ref={modelSelectorRef}>
                <button
                  type="button"
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-brand-aperol" />
                  <span>{currentModel?.name || 'Auto'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Model dropdown - opens upward */}
                {showModelSelector && (
                  <div className="absolute left-0 bottom-full mb-2 w-56 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-xl z-50 py-1">
                    {Object.values(models).map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          onModelChange?.(model.id);
                          setShowModelSelector(false);
                        }}
                        className={`
                          w-full flex items-start gap-3 px-3 py-2 text-left transition-colors
                          ${selectedModel === model.id 
                            ? 'bg-os-bg-dark text-os-text-primary-dark' 
                            : 'text-os-text-secondary-dark hover:bg-os-bg-dark hover:text-os-text-primary-dark'
                          }
                        `}
                      >
                        <Sparkles className="w-4 h-4 mt-0.5 text-brand-aperol flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{model.name}</p>
                          <p className="text-xs text-os-text-secondary-dark">{model.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-os-border-dark" />

              {/* Search/Research Toggle */}
              <div className="flex items-center bg-os-bg-dark rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setMode('search')}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-all
                    ${mode === 'search' 
                      ? 'bg-brand-aperol text-white' 
                      : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
                    }
                  `}
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMode('research')}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-all
                    ${mode === 'research' 
                      ? 'bg-brand-aperol text-white' 
                      : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
                    }
                  `}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right side - action buttons */}
            <div className="flex items-center gap-1">
              {/* Globe - Connectors */}
              <div className="relative" ref={connectorRef}>
                <button
                  type="button"
                  onClick={() => setShowConnectorDropdown(!showConnectorDropdown)}
                  className={`
                    p-2 rounded-lg transition-all
                    ${showConnectorDropdown 
                      ? 'bg-brand-aperol/20 text-brand-aperol' 
                      : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                    }
                  `}
                  title="Connectors"
                >
                  <Globe className="w-5 h-5" />
                </button>

                {/* Connector dropdown - opens upward */}
                {showConnectorDropdown && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-xl z-50 py-1">
                    <ConnectorItem icon={Globe} title="Web" description="Search the Internet" active />
                    <ConnectorItem icon={GraduationCap} title="Academic" description="Search papers" />
                    <ConnectorItem icon={Users} title="Social" description="Discussions" />
                    <ConnectorItem icon={DollarSign} title="Finance" description="SEC filings" />
                  </div>
                )}
              </div>

              <button
                type="button"
                className="p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                title="More options"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Submit button */}
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
                title="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function ConnectorItem({ 
  icon: Icon, 
  title, 
  description, 
  active = false 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
        ${active 
          ? 'bg-os-bg-dark text-os-text-primary-dark' 
          : 'text-os-text-secondary-dark hover:bg-os-bg-dark hover:text-os-text-primary-dark'
        }
      `}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-brand-aperol' : ''}`} />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-os-text-secondary-dark">{description}</p>
      </div>
    </button>
  );
}
