'use client';

import React, { useState, useEffect } from 'react';
import { CornerDownRight, Loader2 } from 'lucide-react';

interface RelatedQuestionsProps {
  responseContent: string;
  originalQuery: string;
  onQuestionClick: (question: string) => void;
  modelUsed?: string;
}

export function RelatedQuestions({
  responseContent,
  originalQuery,
  onQuestionClick,
  modelUsed,
}: RelatedQuestionsProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (responseContent && responseContent.length > 100) {
      generateRelatedQuestions();
    }
  }, [responseContent]);

  const generateRelatedQuestions = async () => {
    setIsLoading(true);
    try {
      // Generate related questions based on the response content
      // This uses a simple extraction approach - can be enhanced with API call
      const generated = extractRelatedQuestions(responseContent, originalQuery);
      setQuestions(generated);
    } catch (error) {
      console.error('Error generating related questions:', error);
      // Fallback to generic related questions
      setQuestions(getGenericRelatedQuestions(originalQuery));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 text-os-text-secondary-dark text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating related questions...</span>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-[15px] font-semibold text-os-text-primary-dark mb-3">
        Related
      </h3>
      <div className="divide-y divide-os-border-dark/50">
        {questions.map((question, idx) => (
          <button
            key={idx}
            onClick={() => onQuestionClick(question)}
            className="w-full flex items-start gap-3 py-3 text-left hover:bg-os-surface-dark/30 transition-colors group -mx-2 px-2 rounded"
          >
            <CornerDownRight className="w-4 h-4 text-os-text-secondary-dark mt-0.5 flex-shrink-0" />
            <span className="text-[14px] text-os-text-primary-dark/80 group-hover:text-os-text-primary-dark transition-colors">
              {question}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Extract potential questions from the response content
function extractRelatedQuestions(content: string, originalQuery: string): string[] {
  const questions: string[] = [];
  
  // Extract key topics from the content
  const topics = extractTopics(content);
  
  // Generate questions based on topics and original query
  const queryLower = originalQuery.toLowerCase();
  
  if (queryLower.includes('what is') || queryLower.includes('what are')) {
    // For definition queries, suggest exploration questions
    topics.slice(0, 2).forEach((topic) => {
      questions.push(`How does ${topic} work in practice`);
    });
    questions.push(`What are the key benefits of ${extractMainSubject(originalQuery)}`);
    questions.push(`What are common examples of ${extractMainSubject(originalQuery)}`);
  } else if (queryLower.includes('how to') || queryLower.includes('how do')) {
    // For how-to queries, suggest related processes
    questions.push(`What are the best practices for ${extractMainSubject(originalQuery)}`);
    questions.push(`What tools can help with ${extractMainSubject(originalQuery)}`);
    topics.slice(0, 2).forEach((topic) => {
      questions.push(`How to measure success in ${topic}`);
    });
  } else {
    // Generic related questions
    topics.slice(0, 3).forEach((topic) => {
      questions.push(`What is the relationship between ${topic} and ${extractMainSubject(originalQuery)}`);
    });
    questions.push(`What are the latest trends in ${extractMainSubject(originalQuery)}`);
  }

  // Ensure we have 3-5 questions
  return questions.slice(0, 5);
}

// Extract main topics from content
function extractTopics(content: string): string[] {
  const topics: string[] = [];
  
  // Look for capitalized phrases that might be topics
  const capitalizedRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  const matches = content.match(capitalizedRegex) || [];
  
  // Filter out common words and duplicates
  const commonWords = ['The', 'This', 'That', 'These', 'Those', 'What', 'How', 'When', 'Where', 'Why', 'It', 'They', 'We', 'You', 'For', 'With', 'From', 'About'];
  const uniqueTopics = [...new Set(matches)]
    .filter(topic => !commonWords.includes(topic) && topic.length > 3)
    .slice(0, 5);
  
  return uniqueTopics;
}

// Extract the main subject from a query
function extractMainSubject(query: string): string {
  // Remove common question starters
  let subject = query
    .toLowerCase()
    .replace(/^(what is|what are|how to|how do|how does|why is|why are|when is|when are|where is|where are)\s+/i, '')
    .replace(/\?$/, '')
    .trim();
  
  // Remove articles
  subject = subject.replace(/^(a|an|the)\s+/i, '');
  
  return subject;
}

// Fallback generic questions
function getGenericRelatedQuestions(originalQuery: string): string[] {
  const subject = extractMainSubject(originalQuery);
  return [
    `How does ${subject} differ from similar concepts`,
    `What are the main components of ${subject}`,
    `How do companies measure ${subject}`,
    `What steps to create a ${subject} for a new business`,
    `Examples of successful ${subject} and why they worked`,
  ];
}
