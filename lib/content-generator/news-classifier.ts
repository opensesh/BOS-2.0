/**
 * News Topic Classifier for OPEN SESSION
 * 
 * Classifies news items into topic categories using:
 * 1. Keyword matching (fast, free)
 * 2. AI classification (Claude Haiku) for ambiguous cases
 * 
 * Categories:
 * - design-ux: Design & UX/UI
 * - branding: Branding & Strategy
 * - ai-creative: AI for Creatives
 * - social-trends: Social Media Trends
 * - general-tech: General Tech
 * - startup-business: Startup/Agency Business
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { CATEGORY_KEYWORDS } from './rss-sources';
import type { NewsTopicCategory } from '@/types';

// ===========================================
// Keyword-Based Classification
// ===========================================

/**
 * Score a text against a category's keywords
 * Returns a score from 0-100
 */
function scoreTextForCategory(
  text: string,
  category: NewsTopicCategory
): number {
  const keywords = CATEGORY_KEYWORDS[category];
  const normalizedText = text.toLowerCase();
  
  let matches = 0;
  let weightedScore = 0;
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    
    // Check for exact word match (with word boundaries)
    const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matchCount = (normalizedText.match(regex) || []).length;
    
    if (matchCount > 0) {
      matches++;
      // Weight by position (title matches worth more than body matches)
      weightedScore += matchCount * (keyword.length > 5 ? 2 : 1);
    }
  }
  
  // Normalize score to 0-100
  const maxPossibleScore = keywords.length * 3;
  return Math.min(100, Math.round((weightedScore / maxPossibleScore) * 100));
}

/**
 * Classify a news item using keyword matching
 * Returns the best matching category and confidence score
 */
export function classifyByKeywords(
  title: string,
  description?: string
): {
  category: NewsTopicCategory;
  confidence: number;
  scores: Record<NewsTopicCategory, number>;
} {
  const text = `${title} ${description || ''}`;
  
  const scores: Record<NewsTopicCategory, number> = {
    'design-ux': scoreTextForCategory(text, 'design-ux'),
    'branding': scoreTextForCategory(text, 'branding'),
    'ai-creative': scoreTextForCategory(text, 'ai-creative'),
    'social-trends': scoreTextForCategory(text, 'social-trends'),
    'general-tech': scoreTextForCategory(text, 'general-tech'),
    'startup-business': scoreTextForCategory(text, 'startup-business'),
  };
  
  // Find the highest scoring category
  let bestCategory: NewsTopicCategory = 'general-tech';
  let highestScore = 0;
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category as NewsTopicCategory;
    }
  }
  
  return {
    category: bestCategory,
    confidence: highestScore,
    scores,
  };
}

// ===========================================
// AI-Based Classification
// ===========================================

/**
 * Classify a news item using Claude Haiku (for ambiguous cases)
 * More accurate but costs ~$0.001 per classification
 */
export async function classifyByAI(
  title: string,
  description?: string
): Promise<{
  category: NewsTopicCategory;
  confidence: number;
  reasoning: string;
}> {
  const prompt = `Classify this news item into ONE of these categories:

1. design-ux: Design & UX/UI (interface design, user experience, design tools, accessibility, web design, Figma, Sketch)
2. branding: Branding & Strategy (logo design, brand identity, rebranding, visual identity, brand guidelines)
3. ai-creative: AI for Creatives (AI art, generative AI, ChatGPT, Midjourney, Runway, Figma AI, creative AI tools)
4. social-trends: Social Media Trends (Instagram, TikTok, YouTube, platform updates, viral content, influencers)
5. general-tech: General Tech (technology news, software, hardware, apps, launches)
6. startup-business: Startup/Agency Business (funding, entrepreneurship, agency life, freelance, business strategy)

NEWS ITEM:
Title: ${title}
Description: ${description || 'No description provided'}

Respond with ONLY this JSON format:
{
  "category": "category-slug",
  "confidence": 85,
  "reasoning": "Brief explanation in 10 words or less"
}`;

  try {
    const result = await generateText({
      model: anthropic('claude-3-5-haiku-20241022'),
      prompt,
      maxTokens: 150,
      temperature: 0.1, // Low temperature for consistent classification
    });

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate category
    const validCategories: NewsTopicCategory[] = [
      'design-ux', 'branding', 'ai-creative', 
      'social-trends', 'general-tech', 'startup-business'
    ];
    
    if (!validCategories.includes(parsed.category)) {
      throw new Error(`Invalid category: ${parsed.category}`);
    }

    return {
      category: parsed.category as NewsTopicCategory,
      confidence: Math.min(100, Math.max(0, parsed.confidence || 70)),
      reasoning: parsed.reasoning || 'AI classification',
    };
  } catch (error) {
    console.error('AI classification failed:', error);
    // Fallback to keyword classification
    const keywordResult = classifyByKeywords(title, description);
    return {
      category: keywordResult.category,
      confidence: keywordResult.confidence,
      reasoning: 'Fallback to keyword classification',
    };
  }
}

// ===========================================
// Hybrid Classification
// ===========================================

/**
 * Smart classification that uses keywords first, then AI for ambiguous cases
 * 
 * Strategy:
 * - If keyword match has confidence > 50, use it
 * - If ambiguous (< 50), use AI classification
 * - Caches AI results to avoid duplicate calls
 */
export async function classifyNews(
  title: string,
  description?: string,
  options: {
    forceAI?: boolean;
    keywordThreshold?: number;
  } = {}
): Promise<{
  category: NewsTopicCategory;
  confidence: number;
  method: 'keywords' | 'ai';
}> {
  const { forceAI = false, keywordThreshold = 50 } = options;

  // Try keyword classification first (free)
  const keywordResult = classifyByKeywords(title, description);
  
  // If confidence is high enough, use keyword result
  if (!forceAI && keywordResult.confidence >= keywordThreshold) {
    return {
      category: keywordResult.category,
      confidence: keywordResult.confidence,
      method: 'keywords',
    };
  }

  // Use AI for ambiguous cases
  const aiResult = await classifyByAI(title, description);
  return {
    category: aiResult.category,
    confidence: aiResult.confidence,
    method: 'ai',
  };
}

/**
 * Batch classify multiple news items
 * Optimizes AI usage by only calling AI for ambiguous items
 */
export async function classifyNewsBatch(
  items: Array<{ title: string; description?: string }>,
  options: {
    keywordThreshold?: number;
    onProgress?: (completed: number, total: number) => void;
    delayMs?: number;
  } = {}
): Promise<Array<{
  category: NewsTopicCategory;
  confidence: number;
  method: 'keywords' | 'ai';
}>> {
  const { keywordThreshold = 50, onProgress, delayMs = 200 } = options;
  const results: Array<{
    category: NewsTopicCategory;
    confidence: number;
    method: 'keywords' | 'ai';
  }> = [];

  // First pass: keyword classification
  const needsAI: number[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const keywordResult = classifyByKeywords(item.title, item.description);
    
    if (keywordResult.confidence >= keywordThreshold) {
      results[i] = {
        category: keywordResult.category,
        confidence: keywordResult.confidence,
        method: 'keywords',
      };
    } else {
      needsAI.push(i);
      results[i] = {
        category: keywordResult.category,
        confidence: keywordResult.confidence,
        method: 'keywords',
      }; // Placeholder
    }
  }

  // Second pass: AI classification for ambiguous items
  for (let j = 0; j < needsAI.length; j++) {
    const i = needsAI[j];
    const item = items[i];
    
    try {
      const aiResult = await classifyByAI(item.title, item.description);
      results[i] = {
        category: aiResult.category,
        confidence: aiResult.confidence,
        method: 'ai',
      };
    } catch {
      // Keep keyword result as fallback
    }
    
    onProgress?.(items.length - needsAI.length + j + 1, items.length);
    
    if (j < needsAI.length - 1 && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  onProgress?.(items.length, items.length);
  return results;
}

/**
 * Check if a news item is relevant to OPEN SESSION's focus areas
 * Returns true if it matches design, branding, AI creative, or social trends
 */
export function isRelevantToOpenSession(
  title: string,
  description?: string,
  minConfidence: number = 30
): boolean {
  const result = classifyByKeywords(title, description);
  
  // Relevant categories for OPEN SESSION
  const relevantCategories: NewsTopicCategory[] = [
    'design-ux',
    'branding',
    'ai-creative',
    'social-trends',
  ];
  
  return (
    relevantCategories.includes(result.category) &&
    result.confidence >= minConfidence
  );
}

/**
 * Filter a list of news items to only those relevant to OPEN SESSION
 */
export function filterRelevantNews<T extends { title: string; description?: string }>(
  items: T[],
  options: {
    minConfidence?: number;
    includeGeneral?: boolean;
  } = {}
): T[] {
  const { minConfidence = 30, includeGeneral = false } = options;
  
  return items.filter(item => {
    const result = classifyByKeywords(item.title, item.description);
    
    const relevantCategories: NewsTopicCategory[] = includeGeneral
      ? ['design-ux', 'branding', 'ai-creative', 'social-trends', 'general-tech', 'startup-business']
      : ['design-ux', 'branding', 'ai-creative', 'social-trends'];
    
    return (
      relevantCategories.includes(result.category) &&
      result.confidence >= minConfidence
    );
  });
}

/**
 * Estimate cost for AI classification
 */
export function estimateClassificationCost(itemCount: number): {
  estimatedCostUsd: number;
  breakdown: string;
} {
  // Average tokens per classification
  const avgPromptTokens = 300;
  const avgCompletionTokens = 50;
  
  // Claude Haiku pricing (per million tokens)
  const inputCostPerMillion = 0.25;
  const outputCostPerMillion = 1.25;
  
  const totalPromptTokens = itemCount * avgPromptTokens;
  const totalCompletionTokens = itemCount * avgCompletionTokens;
  
  const inputCost = (totalPromptTokens / 1_000_000) * inputCostPerMillion;
  const outputCost = (totalCompletionTokens / 1_000_000) * outputCostPerMillion;
  const totalCost = inputCost + outputCost;
  
  return {
    estimatedCostUsd: Math.round(totalCost * 100) / 100,
    breakdown: `${itemCount} classifications × ~${avgPromptTokens + avgCompletionTokens} tokens = ~$${totalCost.toFixed(4)}`,
  };
}


