'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Mic,
  Globe,
  Paperclip,
  Send,
  Sparkles,
  Lightbulb,
} from 'lucide-react';

interface SpaceChatInputProps {
  spaceSlug: string;
  spaceId: string;
  spaceTitle: string;
  spaceIcon?: string;
  placeholder?: string;
  onStartChat?: (query: string, discussionId: string) => void;
}

/**
 * Chat input for space pages - matches the home page style
 * When submitted, navigates to the space chat page with the query
 */
export function SpaceChatInput({
  spaceSlug,
  spaceId,
  spaceTitle,
  spaceIcon,
  placeholder,
  onStartChat,
}: SpaceChatInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState<'search' | 'research' | 'reason'>('search');
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Generate a new discussion ID
    const discussionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // If callback provided, use it
    if (onStartChat) {
      onStartChat(query.trim(), discussionId);
      setQuery('');
      return;
    }

    // Navigate to the space chat page with the query
    const searchParams = new URLSearchParams({
      q: query.trim(),
      spaceId,
      spaceTitle,
      ...(spaceIcon && { spaceIcon }),
      isNew: 'true',
    });

    router.push(`/spaces/${spaceSlug}/chat/${discussionId}?${searchParams.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const defaultPlaceholder = `Ask anything about ${spaceTitle}. Type / for shortcuts.`;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative bg-os-surface-dark/80 backdrop-blur-xl rounded-xl
            border transition-all duration-200
            ${
              isFocused
                ? 'border-brand-aperol shadow-lg shadow-brand-aperol/10'
                : 'border-os-border-dark hover:border-os-border-dark/80'
            }
          `}
        >
          {/* Input area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder || defaultPlaceholder}
              className="w-full px-4 py-4 bg-transparent text-os-text-primary-dark placeholder:text-os-text-secondary-dark resize-none focus:outline-none min-h-[100px] max-h-[200px]"
              rows={3}
            />
          </div>

          {/* Footer toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-os-border-dark/50">
            {/* Left side - Search/Research/Reason Toggle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMode('search')}
                className={`
                  p-2 rounded-lg transition-all
                  ${
                    mode === 'search'
                      ? 'bg-brand-aperol text-white'
                      : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                  }
                `}
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMode('research')}
                className={`
                  p-2 rounded-lg transition-all
                  ${
                    mode === 'research'
                      ? 'bg-brand-aperol text-white'
                      : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                  }
                `}
                title="Deep Research"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMode('reason')}
                className={`
                  p-2 rounded-lg transition-all
                  ${
                    mode === 'reason'
                      ? 'bg-brand-aperol text-white'
                      : 'text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark'
                  }
                `}
                title="Reason"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            </div>

            {/* Right side - action buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                title="Connectors"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!query.trim()}
                className={`
                  p-2 rounded-lg transition-all
                  ${
                    query.trim()
                      ? 'bg-brand-aperol text-white hover:bg-brand-aperol/90'
                      : 'text-os-text-secondary-dark/50 cursor-not-allowed'
                  }
                `}
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
