'use client';

import React from 'react';
import { AnswerView, parseContentToSections, extractResourceCards, SourceInfo } from './AnswerView';
import { ResponseActions } from './ResponseActions';
import { RelatedQuestions } from './RelatedQuestions';

interface ChatContentProps {
  query: string;
  content: string;
  sources?: SourceInfo[];
  isStreaming?: boolean;
  modelUsed?: string;
  onFollowUpClick: (question: string) => void;
  onRegenerate?: () => void;
  isLastResponse?: boolean;
}

export function ChatContent({
  query,
  content,
  sources = [],
  isStreaming = false,
  modelUsed,
  onFollowUpClick,
  onRegenerate,
  isLastResponse = true,
}: ChatContentProps) {
  // Check if we should show citations (only for Perplexity models)
  const showCitations = modelUsed?.includes('sonar') || modelUsed?.includes('perplexity');

  // Parse content into sections
  const sections = React.useMemo(() => {
    return parseContentToSections(content, sources);
  }, [content, sources]);

  // Extract resource cards from content
  const resourceCards = React.useMemo(() => {
    return extractResourceCards(content);
  }, [content]);

  const hasLinks = sources.length > 0;

  return (
    <div className="py-6">
      <AnswerView
        query={query}
        sections={sections}
        sources={sources}
        isStreaming={isStreaming}
        showCitations={showCitations}
        resourceCards={resourceCards}
      />

      {/* Response actions - shown for all completed responses */}
      {!isStreaming && content && (
        <ResponseActions
          sources={sources}
          resourceCards={resourceCards}
          content={content}
          query={query}
          onRegenerate={onRegenerate}
          showSources={hasLinks}
          modelUsed={modelUsed}
        />
      )}

      {/* Related questions - only on last response */}
      {!isStreaming && content && isLastResponse && (
        <RelatedQuestions
          responseContent={content}
          originalQuery={query}
          onQuestionClick={onFollowUpClick}
          modelUsed={modelUsed}
        />
      )}
    </div>
  );
}

