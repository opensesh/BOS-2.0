'use client';

import React from 'react';
import { AnswerView, parseContentToSections, SourceInfo } from './AnswerView';
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

  const hasLinks = sources.length > 0;

  return (
    <div className="py-6">
      <AnswerView
        query={query}
        sections={sections}
        sources={sources}
        isStreaming={isStreaming}
        showCitations={showCitations}
      />

      {/* Response actions - only on last response */}
      {!isStreaming && content && isLastResponse && (
        <ResponseActions
          sources={sources}
          content={content}
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

