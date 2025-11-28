'use client';

import React from 'react';
import { InlineCitation } from './InlineCitation';

export interface SourceInfo {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  title?: string;
  snippet?: string;
}

export interface ContentSection {
  type: 'heading' | 'paragraph';
  content: string;
  level?: number; // For headings: 1, 2, 3
  citations?: SourceInfo[];
}

interface AnswerViewProps {
  query: string;
  sections: ContentSection[];
  sources: SourceInfo[];
  isStreaming?: boolean;
  showCitations?: boolean;
}

export function AnswerView({
  query,
  sections,
  sources,
  isStreaming = false,
  showCitations = true,
}: AnswerViewProps) {
  // Group sources by index for citation display
  const getSourcesForCitation = (citations?: SourceInfo[]): SourceInfo[] => {
    if (!citations || citations.length === 0) return [];
    return citations;
  };

  return (
    <div className="space-y-4">
      {/* User Query Display */}
      <div className="flex justify-end mb-6">
        <div className="bg-os-surface-dark/60 rounded-xl px-4 py-3 max-w-[80%]">
          <p className="text-[15px] text-os-text-primary-dark">{query}</p>
        </div>
      </div>

      {/* Answer Content */}
      <div className="chat-content">
        {sections.map((section, idx) => {
          if (section.type === 'heading') {
            const HeadingTag = `h${section.level || 2}` as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag
                key={idx}
                className={`
                  font-semibold text-os-text-primary-dark
                  ${section.level === 1 ? 'text-xl mt-6 mb-3' : ''}
                  ${section.level === 2 ? 'text-[17px] mt-5 mb-2' : ''}
                  ${section.level === 3 ? 'text-[15px] mt-4 mb-2' : ''}
                `}
              >
                {section.content}
              </HeadingTag>
            );
          }

          // Paragraph with optional inline citations
          const sectionSources = getSourcesForCitation(section.citations);
          
          return (
            <p
              key={idx}
              className="text-[15px] leading-[1.7] text-os-text-primary-dark/90 mb-4"
            >
              {section.content}
              {showCitations && sectionSources.length > 0 && (
                <>
                  {' '}
                  <InlineCitation
                    sources={sectionSources}
                    primarySource={sectionSources[0].name}
                    additionalCount={sectionSources.length - 1}
                  />
                </>
              )}
            </p>
          );
        })}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-os-text-secondary-dark">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-brand-aperol rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-aperol rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-aperol rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to parse markdown-like content into sections
export function parseContentToSections(
  content: string,
  sources: SourceInfo[] = []
): ContentSection[] {
  const lines = content.split('\n');
  const sections: ContentSection[] = [];
  let currentParagraph = '';

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      // Find any citation markers in the paragraph (e.g., [1], [2])
      const citationRegex = /\[(\d+)\]/g;
      const matches = currentParagraph.match(citationRegex);
      const citations: SourceInfo[] = [];
      
      if (matches) {
        matches.forEach((match) => {
          const index = parseInt(match.replace(/[\[\]]/g, ''), 10) - 1;
          if (sources[index]) {
            citations.push(sources[index]);
          }
        });
      }

      sections.push({
        type: 'paragraph',
        content: currentParagraph.replace(citationRegex, '').trim(),
        citations: citations.length > 0 ? citations : undefined,
      });
      currentParagraph = '';
    }
  };

  for (const line of lines) {
    // Check for headings
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h1Match) {
      flushParagraph();
      sections.push({ type: 'heading', content: h1Match[1], level: 1 });
    } else if (h2Match) {
      flushParagraph();
      sections.push({ type: 'heading', content: h2Match[1], level: 2 });
    } else if (h3Match) {
      flushParagraph();
      sections.push({ type: 'heading', content: h3Match[1], level: 3 });
    } else if (line.trim() === '') {
      flushParagraph();
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + line.trim();
    }
  }

  flushParagraph();
  return sections;
}

