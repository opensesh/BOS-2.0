'use client';

import React, { useState, useMemo } from 'react';
import { ChatTabNav, ChatTab } from './ChatTabNav';
import { AnswerView, parseContentToSections, SourceInfo, ContentSection } from './AnswerView';
import { LinksView } from './LinksView';
import { ImagesView, ImageResult } from './ImagesView';
import { ResponseActions } from './ResponseActions';
import { RelatedQuestions } from './RelatedQuestions';
import { OverflowMenu } from './OverflowMenu';
import { ShareButton } from './ShareModal';

interface ChatResponseProps {
  query: string;
  content: string;
  sources?: SourceInfo[];
  images?: ImageResult[];
  isStreaming?: boolean;
  modelUsed?: string;
  onFollowUpClick: (question: string) => void;
  onRegenerate?: () => void;
}

export function ChatResponse({
  query,
  content,
  sources = [],
  images = [],
  isStreaming = false,
  modelUsed,
  onFollowUpClick,
  onRegenerate,
}: ChatResponseProps) {
  const [activeTab, setActiveTab] = useState<ChatTab>('answer');

  // Check if we should show citations (only for Perplexity models)
  const showCitations = useMemo(() => {
    return modelUsed?.includes('sonar') || modelUsed?.includes('perplexity');
  }, [modelUsed]);

  // Parse content into sections
  const sections = useMemo(() => {
    return parseContentToSections(content, sources);
  }, [content, sources]);

  const hasLinks = sources.length > 0;
  const hasImages = images.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with tabs and actions */}
      <div className="flex items-center justify-between mb-6">
        <ChatTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasLinks={hasLinks}
          hasImages={hasImages}
          linksCount={sources.length}
          imagesCount={images.length}
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          <OverflowMenu threadTitle={query} />
          <ShareButton />
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {activeTab === 'answer' && (
          <>
            <AnswerView
              query={query}
              sections={sections}
              sources={sources}
              isStreaming={isStreaming}
              showCitations={showCitations}
            />

            {/* Response actions */}
            {!isStreaming && content && (
              <ResponseActions
                sources={sources}
                content={content}
                onRegenerate={onRegenerate}
                showSources={hasLinks}
              />
            )}

            {/* Related questions */}
            {!isStreaming && content && (
              <RelatedQuestions
                responseContent={content}
                originalQuery={query}
                onQuestionClick={onFollowUpClick}
                modelUsed={modelUsed}
              />
            )}
          </>
        )}

        {activeTab === 'links' && (
          <LinksView query={query} sources={sources} />
        )}

        {activeTab === 'images' && (
          <ImagesView query={query} images={images} />
        )}
      </div>
    </div>
  );
}

