'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Mic,
  Globe,
  Grid3x3,
  Paperclip,
  ArrowUp,
  Sparkles,
} from 'lucide-react';

interface FollowUpInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function FollowUpInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Ask a follow-up',
}: FollowUpInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

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

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative bg-os-surface-dark/40 backdrop-blur-sm rounded-xl
            border transition-all duration-200
            ${
              isFocused
                ? 'border-os-border-dark/60 ring-1 ring-os-border-dark/30'
                : 'border-os-border-dark/30 hover:border-os-border-dark/50'
            }
          `}
        >
          {/* Input area */}
          <div className="flex items-start gap-3 p-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-os-text-primary-dark placeholder:text-os-text-secondary-dark/60 resize-none focus:outline-none min-h-[24px]"
              rows={1}
              disabled={isLoading}
            />
          </div>

          {/* Footer toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-os-border-dark/20">
            {/* Left side - mode toggles */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-aperol/10 text-brand-aperol text-xs"
                title="Search mode"
              >
                <Search className="w-3 h-3" />
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                type="button"
                className="p-1.5 rounded-md text-os-text-secondary-dark/60 hover:text-os-text-primary-dark hover:bg-os-surface-dark/50 transition-colors"
                title="Research mode"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right side - action buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 rounded-md text-os-text-secondary-dark/60 hover:text-os-text-primary-dark hover:bg-os-surface-dark/50 transition-colors"
                title="Web search"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-md text-os-text-secondary-dark/60 hover:text-os-text-primary-dark hover:bg-os-surface-dark/50 transition-colors"
                title="More options"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-md text-os-text-secondary-dark/60 hover:text-os-text-primary-dark hover:bg-os-surface-dark/50 transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-md text-os-text-secondary-dark/60 hover:text-os-text-primary-dark hover:bg-os-surface-dark/50 transition-colors"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`
                  ml-1 p-1.5 rounded-md transition-all
                  ${
                    input.trim() && !isLoading
                      ? 'bg-os-text-secondary-dark/20 text-os-text-primary-dark hover:bg-os-text-secondary-dark/30'
                      : 'text-os-text-secondary-dark/30 cursor-not-allowed'
                  }
                `}
                title="Send"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
