'use client';

import React from 'react';
import { InlineCitation } from './InlineCitation';
import { BrandResourceCards, BrandResourceCardProps } from './BrandResourceCard';
import {
  BRAND_PAGE_ROUTES,
  BRAND_SOURCES,
} from '@/lib/brand-knowledge';

export interface SourceInfo {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  title?: string;
  snippet?: string;
  // Extended for brand sources
  type?: 'external' | 'brand-doc' | 'asset';
  path?: string;
  thumbnail?: string;
}

export interface ContentSection {
  type: 'heading' | 'paragraph' | 'list';
  content: string;
  level?: number; // For headings: 1, 2, 3
  citations?: SourceInfo[];
  items?: string[]; // For lists
}

interface AnswerViewProps {
  query: string;
  sections: ContentSection[];
  sources: SourceInfo[];
  isStreaming?: boolean;
  showCitations?: boolean;
  resourceCards?: BrandResourceCardProps[];
}

export function AnswerView({
  query,
  sections,
  sources,
  isStreaming = false,
  showCitations = true,
  resourceCards = [],
}: AnswerViewProps) {
  // Group sources by index for citation display
  const getSourcesForCitation = (citations?: SourceInfo[]): SourceInfo[] => {
    if (!citations || citations.length === 0) return [];
    return citations;
  };

  return (
    <div>
      {/* User Query Display - Right aligned bubble */}
      <div className="flex justify-end mb-6">
        <div className="bg-os-surface-dark/50 rounded-2xl px-4 py-2.5 max-w-[85%]">
          <p className="text-[15px] text-os-text-primary-dark">{query}</p>
        </div>
      </div>

      {/* Answer Content - Tighter spacing like Perplexity */}
      <div className="space-y-3">
        {sections.map((section, idx) => {
          if (section.type === 'heading') {
            const HeadingTag = `h${section.level || 2}` as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag
                key={idx}
                className={`
                  font-bold text-os-text-primary-dark
                  ${section.level === 1 ? 'text-[18px] mt-5 mb-1' : ''}
                  ${section.level === 2 ? 'text-[17px] mt-4 mb-1' : ''}
                  ${section.level === 3 ? 'text-[16px] mt-3 mb-0.5' : ''}
                `}
              >
                {section.content}
              </HeadingTag>
            );
          }

          if (section.type === 'list' && section.items) {
            return (
              <ul key={idx} className="space-y-0.5 pl-5 list-disc marker:text-os-text-secondary-dark">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-[15px] leading-[1.6] text-os-text-primary-dark/90 pl-1">
                    {item}
                  </li>
                ))}
              </ul>
            );
          }

          // Paragraph with optional inline citations
          const sectionSources = getSourcesForCitation(section.citations);
          
          return (
            <p
              key={idx}
              className="text-[15px] leading-[1.6] text-os-text-primary-dark/90"
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
          <div className="flex items-center gap-2 text-os-text-secondary-dark py-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-brand-aperol rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-aperol rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-aperol rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Brand Resource Cards */}
        {!isStreaming && resourceCards.length > 0 && (
          <BrandResourceCards cards={resourceCards} />
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
  let currentList: string[] = [];
  let inList = false;

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      // Find numbered citation markers (e.g., [1], [2])
      const numberedCitationRegex = /\[(\d+)\]/g;
      // Find brand source citation markers (e.g., [source:brand_identity])
      const brandCitationRegex = /\[source:(\w+)\]/g;

      const citations: SourceInfo[] = [];

      // Process numbered citations
      const numberedMatches = currentParagraph.match(numberedCitationRegex);
      if (numberedMatches) {
        numberedMatches.forEach((match) => {
          const index = parseInt(match.replace(/[\[\]]/g, ''), 10) - 1;
          if (sources[index]) {
            citations.push({ ...sources[index], type: 'external' });
          }
        });
      }

      // Process brand source citations
      const brandMatches = currentParagraph.match(brandCitationRegex);
      if (brandMatches) {
        brandMatches.forEach((match) => {
          const sourceId = match.replace(/\[source:|]/g, '');
          const brandSource = BRAND_SOURCES[sourceId];
          if (brandSource) {
            citations.push({
              id: brandSource.id,
              name: brandSource.name,
              url: brandSource.path,
              title: brandSource.title,
              snippet: brandSource.snippet,
              type: 'brand-doc',
              path: brandSource.path,
            });
          }
        });
      }

      // Clean content of all citation markers
      const cleanContent = currentParagraph
        .replace(numberedCitationRegex, '')
        .replace(brandCitationRegex, '')
        .trim();

      sections.push({
        type: 'paragraph',
        content: cleanContent,
        citations: citations.length > 0 ? citations : undefined,
      });
      currentParagraph = '';
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      sections.push({
        type: 'list',
        content: '',
        items: [...currentList],
      });
      currentList = [];
      inList = false;
    }
  };

  for (const line of lines) {
    // Check for headings
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);
    
    // Check for list items
    const listMatch = line.match(/^[-*]\s+(.+)$/);
    const numberedListMatch = line.match(/^\d+\.\s+(.+)$/);

    if (h1Match) {
      flushParagraph();
      flushList();
      sections.push({ type: 'heading', content: h1Match[1], level: 1 });
    } else if (h2Match) {
      flushParagraph();
      flushList();
      sections.push({ type: 'heading', content: h2Match[1], level: 2 });
    } else if (h3Match) {
      flushParagraph();
      flushList();
      sections.push({ type: 'heading', content: h3Match[1], level: 3 });
    } else if (listMatch || numberedListMatch) {
      flushParagraph();
      inList = true;
      currentList.push((listMatch || numberedListMatch)![1]);
    } else if (line.trim() === '') {
      flushParagraph();
      flushList();
    } else {
      if (inList) {
        flushList();
      }
      currentParagraph += (currentParagraph ? ' ' : '') + line.trim();
    }
  }

  flushParagraph();
  flushList();
  return sections;
}

/**
 * Extract resource cards from AI response content
 * Parses [resource:topic] markers and returns card props
 */
export function extractResourceCards(content: string): BrandResourceCardProps[] {
  const resourceRegex = /\[resource:(\w+(?:-\w+)?)\]/g;
  const cards: BrandResourceCardProps[] = [];
  const seenHrefs = new Set<string>();
  let match;

  while ((match = resourceRegex.exec(content)) !== null) {
    const topic = match[1];
    const route = BRAND_PAGE_ROUTES[topic];

    if (route && !seenHrefs.has(route.href)) {
      seenHrefs.add(route.href);
      cards.push({
        title: route.title,
        description: route.description,
        href: route.href,
        icon: route.icon,
        thumbnail: route.thumbnail,
      });
    }
  }

  return cards;
}

/**
 * Remove resource markers from content for display
 */
export function cleanResourceMarkers(content: string): string {
  return content.replace(/\[resource:\w+(?:-\w+)?\]/g, '').trim();
}
