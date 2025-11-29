'use client';

import React from 'react';
import Image from 'next/image';
import { InlineSourceChips, groupSourcesForParagraph, SourceGroup } from './InlineSourceBadge';
import { ArticleSection, ParagraphSource, Source } from '@/types';

interface ArticleSummaryProps {
  // New enriched sections format
  sections?: ArticleSection[];
  // Legacy format support
  content?: string[];
  sources?: Source[];
  // Divider image
  dividerImageUrl?: string;
  imageAttribution?: string;
}

export function ArticleSummary({
  sections,
  content,
  sources = [],
  dividerImageUrl,
  imageAttribution,
}: ArticleSummaryProps) {
  // If we have enriched sections, render them
  if (sections && sections.length > 0) {
    return (
      <EnrichedArticleSummary
        sections={sections}
        dividerImageUrl={dividerImageUrl}
        imageAttribution={imageAttribution}
      />
    );
  }

  // Fallback to legacy content rendering
  return <LegacyArticleSummary content={content || []} sources={sources} />;
}

// New enriched article layout with sections
function EnrichedArticleSummary({
  sections,
  dividerImageUrl,
  imageAttribution,
}: {
  sections: ArticleSection[];
  dividerImageUrl?: string;
  imageAttribution?: string;
}) {
  // Find good spot to insert divider image (after intro section or 2nd section)
  const dividerIndex = Math.min(1, sections.length - 1);

  return (
    <div className="flex flex-col gap-8 text-base leading-relaxed text-os-text-primary-dark/90 font-sans">
      {sections.map((section, sectionIdx) => (
        <React.Fragment key={section.id}>
          {/* Section content */}
          <section className="flex flex-col gap-5">
            {/* Section title */}
            {section.title && (
              <h2 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla">
                {section.title}
              </h2>
            )}

            {/* Paragraphs */}
            {section.paragraphs.map((paragraph, paraIdx) => {
              // Group sources into multiple chips
              const sourceGroups = groupSourcesForParagraph(paragraph.sources);

              return (
                <p
                  key={`${section.id}-p-${paraIdx}`}
                  className="text-base md:text-lg leading-relaxed"
                >
                  {paragraph.content}
                  {sourceGroups.length > 0 && <InlineSourceChips sourceGroups={sourceGroups} />}
                </p>
              );
            })}
          </section>

          {/* Insert divider image after the designated section */}
          {sectionIdx === dividerIndex && dividerImageUrl && (
            <DividerImage imageUrl={dividerImageUrl} attribution={imageAttribution} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Full-width image divider component
function DividerImage({ imageUrl, attribution }: { imageUrl: string; attribution?: string }) {
  return (
    <div className="relative w-full my-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-os-surface-dark">
        <Image src={imageUrl} alt="Article illustration" fill className="object-cover" unoptimized />
      </div>
      {attribution && (
        <p className="text-xs text-os-text-secondary-dark mt-2 text-right font-mono">
          {attribution}
        </p>
      )}
    </div>
  );
}

// Legacy content rendering for backwards compatibility
function LegacyArticleSummary({ content, sources }: { content: string[]; sources: Source[] }) {
  // Convert legacy sources to ParagraphSource format
  const convertedSources: ParagraphSource[] = sources.map((s, idx) => ({
    id: s.id || `source-${idx}`,
    name: s.name,
    url: s.url,
    favicon: getFaviconUrl(s.url),
  }));

  // Distribute sources across paragraphs with multiple chips per paragraph
  const getSourcesForParagraph = (idx: number): ParagraphSource[] => {
    if (convertedSources.length === 0) return [];

    // Each paragraph gets 2-4 unique sources
    const sourcesPerParagraph = Math.max(2, Math.ceil(convertedSources.length / content.length));
    const startIdx = (idx * sourcesPerParagraph) % convertedSources.length;

    const result: ParagraphSource[] = [];
    for (let i = 0; i < sourcesPerParagraph && result.length < 4; i++) {
      const sourceIdx = (startIdx + i) % convertedSources.length;
      if (!result.find((s) => s.id === convertedSources[sourceIdx].id)) {
        result.push(convertedSources[sourceIdx]);
      }
    }

    return result;
  };

  return (
    <div className="flex flex-col gap-6 text-base leading-relaxed text-os-text-primary-dark/90 font-sans">
      {content.map((paragraph, idx) => {
        const paragraphSources = getSourcesForParagraph(idx);
        const sourceGroups = groupSourcesForParagraph(paragraphSources);

        return (
          <p key={idx} className="text-base md:text-lg leading-relaxed">
            {paragraph}
            {sourceGroups.length > 0 && <InlineSourceChips sourceGroups={sourceGroups} />}
          </p>
        );
      })}
    </div>
  );
}

// Helper function to get favicon URL
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}
