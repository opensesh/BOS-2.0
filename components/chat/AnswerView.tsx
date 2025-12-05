'use client';

import React from 'react';
import { InlineCitation } from './InlineCitation';
import { BrandResourceCards, BrandResourceCardProps } from './BrandResourceCard';
import { DotFlowPulse } from '@/components/ui/dot-flow-loader';
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
            const level = section.level || 2;
            const className = `font-bold text-os-text-primary-dark ${
              level === 1 ? 'text-[18px] mt-5 mb-1' : ''
            } ${
              level === 2 ? 'text-[17px] mt-4 mb-1' : ''
            } ${
              level === 3 ? 'text-[16px] mt-3 mb-0.5' : ''
            }`.trim();
            
            if (level === 1) return <h1 key={idx} className={className}>{section.content}</h1>;
            if (level === 2) return <h2 key={idx} className={className}>{section.content}</h2>;
            return <h3 key={idx} className={className}>{section.content}</h3>;
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

        {/* Streaming indicator with DotFlow animation */}
        {isStreaming && (
          <div className="py-1">
            <DotFlowPulse showText={true} textInterval={2500} />
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

      // Clean content of all citation and resource markers
      const resourceMarkerRegex = /\[resource:\w+(?:-\w+)?\]/g;
      const cleanContent = currentParagraph
        .replace(numberedCitationRegex, '')
        .replace(brandCitationRegex, '')
        .replace(resourceMarkerRegex, '')
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
      // Convert bullet lists with 4+ items into prose paragraphs
      // This creates more readable, flowing text
      if (currentList.length >= 4 && !containsCodeOrPaths(currentList)) {
        // Join list items into a flowing paragraph
        const proseContent = convertListToProse(currentList);
        sections.push({
          type: 'paragraph',
          content: proseContent,
        });
      } else {
        // Keep as list for short lists or technical content
        sections.push({
          type: 'list',
          content: '',
          items: [...currentList],
        });
      }
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

    // Helper to clean markers from any content
    const cleanMarkers = (text: string) => text
      .replace(/\[\d+\]/g, '')
      .replace(/\[source:\w+\]/g, '')
      .replace(/\[resource:\w+(?:-\w+)?\]/g, '')
      .trim();

    if (h1Match) {
      flushParagraph();
      flushList();
      sections.push({ type: 'heading', content: cleanMarkers(h1Match[1]), level: 1 });
    } else if (h2Match) {
      flushParagraph();
      flushList();
      sections.push({ type: 'heading', content: cleanMarkers(h2Match[1]), level: 2 });
    } else if (h3Match) {
      flushParagraph();
      flushList();
      sections.push({ type: 'heading', content: cleanMarkers(h3Match[1]), level: 3 });
    } else if (listMatch || numberedListMatch) {
      flushParagraph();
      inList = true;
      currentList.push(cleanMarkers((listMatch || numberedListMatch)![1]));
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
 * Check if list items contain code, paths, or technical content that should remain as bullets
 */
function containsCodeOrPaths(items: string[]): boolean {
  const technicalPatterns = [
    /^\/[\w-]+/, // File paths starting with /
    /\.(svg|png|jpg|woff2?|ttf|css|js|tsx?)/, // File extensions
    /#[0-9A-Fa-f]{3,8}/, // Hex colors
    /^\d+(\.\d+)?px/, // Pixel values
    /^[A-Z][a-z]+:/, // Label: value format
    /`[^`]+`/, // Inline code
    /^\d+\.\s/, // Numbered steps
  ];
  
  return items.some(item => 
    technicalPatterns.some(pattern => pattern.test(item))
  );
}

/**
 * Convert a list of bullet points into flowing prose
 */
function convertListToProse(items: string[]): string {
  // Clean up items and join with appropriate connectors
  const cleaned = items.map(item => {
    // Remove leading bullet-like characters and clean up
    let text = item.trim();
    // Ensure first letter is lowercase for joining (unless it's a proper noun)
    if (text.length > 0 && text[0] === text[0].toUpperCase() && !isProperNoun(text)) {
      text = text[0].toLowerCase() + text.slice(1);
    }
    // Remove trailing periods for joining
    text = text.replace(/\.$/, '');
    return text;
  });

  // Build prose with varied connectors
  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return cleaned[0] + '.';
  if (cleaned.length === 2) return `${capitalizeFirst(cleaned[0])} and ${cleaned[1]}.`;
  
  // For 3+ items, create flowing prose
  const connectors = ['Additionally,', 'Furthermore,', 'Also,', 'This includes', 'Moreover,'];
  let result = capitalizeFirst(cleaned[0]);
  
  for (let i = 1; i < cleaned.length; i++) {
    if (i === cleaned.length - 1) {
      // Last item
      result += `, and ${cleaned[i]}`;
    } else if (i % 3 === 0 && i < cleaned.length - 1) {
      // Every 3rd item, start a new sentence for readability
      result += `. ${connectors[i % connectors.length]} ${cleaned[i]}`;
    } else {
      result += `, ${cleaned[i]}`;
    }
  }
  
  return result + '.';
}

/**
 * Check if text starts with a proper noun (simple heuristic)
 */
function isProperNoun(text: string): boolean {
  const properNounPatterns = [
    /^(Open Session|OPEN SESSION|Neue Haas|OffBit|Brand OS|BOS)/i,
    /^[A-Z][a-z]+\s+[A-Z]/, // Two capitalized words
  ];
  return properNounPatterns.some(p => p.test(text));
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text[0].toUpperCase() + text.slice(1);
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
