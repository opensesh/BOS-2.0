'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Mic,
  Globe,
  Paperclip,
  Send,
  Sparkles,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react';

interface AskFollowUpProps {
  articleTitle: string;
  articleSlug: string;
  articleImage?: string;
}

// Pinned chat input at bottom of article page
export function AskFollowUp({ articleTitle, articleSlug, articleImage }: AskFollowUpProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
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

    // Navigate to home with the article context and query
    // The query params will tell the chat to show the article reference card
    const searchParams = new URLSearchParams({
      q: query.trim(),
      articleRef: articleSlug,
      articleTitle: articleTitle,
      ...(articleImage && { articleImage }),
    });

    router.push(`/?${searchParams.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-os-bg-dark via-os-bg-dark to-transparent pt-8 pb-4 lg:pl-[56px]">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <form onSubmit={handleSubmit}>
          <div
            className={`
              relative bg-os-surface-dark/95 backdrop-blur-xl rounded-xl
              border transition-all duration-200 shadow-xl
              ${
                isFocused
                  ? 'border-brand-aperol shadow-brand-aperol/10'
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
                placeholder="Ask follow-up"
                className="w-full px-4 py-3 bg-transparent text-os-text-primary-dark placeholder:text-os-text-secondary-dark resize-none focus:outline-none min-h-[48px] max-h-[120px]"
                rows={1}
              />
            </div>

            {/* Footer toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-os-border-dark/50">
              {/* Left side - Search/Research Toggle */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-lg bg-brand-aperol text-white"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                  title="Deep Research"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
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
                  title="Globe"
                >
                  <Globe className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors"
                  title="Attach"
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

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      router.push(`/discover/${slug}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 p-3 mb-4 bg-os-surface-dark/50 rounded-xl border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all group text-left"
    >
      {/* Thumbnail */}
      {imageUrl && (
        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-os-bg-dark flex-shrink-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

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
export function InspirationReferenceCard({
  title,
  category,
  generationType,
  generationLabel,
}: {
  title: string;
  category: string;
  generationType?: string;
  generationLabel?: string;
}) {
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

  return (
    <div className="w-full flex items-start gap-3 p-3 mb-4 bg-os-surface-dark/50 rounded-xl border border-os-border-dark/50">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-brand-aperol/10 flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-xs text-os-text-secondary-dark">{getActionLabel()}</p>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-aperol/10 text-brand-aperol">
            {getCategoryLabel(category)}
          </span>
        </div>
        <p className="text-sm font-medium text-brand-vanilla line-clamp-1">
          {title}
        </p>
      </div>
    </div>
  );
}
