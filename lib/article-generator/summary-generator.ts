import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

/**
 * Summary Generator for Tier 2 Content
 * 
 * Uses Claude Haiku for cost-effective AI summary generation.
 * ~500 tokens output = ~$0.01 per summary
 * 
 * Budget: ~50 summaries/month = ~$0.50/month
 */

export interface SummaryInput {
  title: string;
  description: string;
  sources: Array<{ name: string; url: string }>;
}

export interface SummaryResult {
  summary: string;
  generatedAt: string;
  model: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

// System prompt for generating brand-voice summaries
const SUMMARY_SYSTEM_PROMPT = `You are a brand strategist and creative writer for BRAND-OS, a design and branding agency. Your task is to create concise, informative summaries of news articles and topics.

Writing Style:
- Use first person plural (we, us, our) when appropriate
- Active voice, present tense
- Balance expertise with accessibility
- Never gatekeep knowledge
- Be friendly, creative, and visionary

Output Format:
- Write exactly 2-3 paragraphs
- First paragraph: Key facts and what happened
- Second paragraph: Why it matters for brands/designers
- Third paragraph (optional): Actionable insight or forward-looking perspective
- Total length: 150-250 words
- No headers, bullet points, or formatting - just flowing paragraphs`;

/**
 * Generate an AI summary for a news item
 * Uses Claude Haiku for fast, cost-effective generation
 */
export async function generateSummary(input: SummaryInput): Promise<SummaryResult> {
  const { title, description, sources } = input;
  
  // Build the prompt
  const sourceList = sources
    .map(s => `- ${s.name}: ${s.url}`)
    .join('\n');
  
  const userPrompt = `Create a summary for this news topic:

Title: ${title}

Description: ${description}

Sources:
${sourceList}

Write a 2-3 paragraph summary that explains what happened and why it matters for brand designers and creative professionals.`;

  try {
    const result = await generateText({
      model: anthropic('claude-3-5-haiku-20241022'),
      system: SUMMARY_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 500,
      temperature: 0.7,
    });

    return {
      summary: result.text.trim(),
      generatedAt: new Date().toISOString(),
      model: 'claude-3-5-haiku-20241022',
      tokenUsage: result.usage?.inputTokens && result.usage?.outputTokens ? {
        promptTokens: result.usage.inputTokens,
        completionTokens: result.usage.outputTokens,
      } : undefined,
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate summaries for multiple items in batch
 * Includes rate limiting to avoid API throttling
 */
export async function generateSummariesBatch(
  items: SummaryInput[],
  options: {
    delayMs?: number;
    onProgress?: (completed: number, total: number) => void;
    onError?: (item: SummaryInput, error: Error) => void;
  } = {}
): Promise<Map<string, SummaryResult>> {
  const { delayMs = 500, onProgress, onError } = options;
  const results = new Map<string, SummaryResult>();
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    try {
      const summary = await generateSummary(item);
      results.set(item.title, summary);
      
      onProgress?.(i + 1, items.length);
      
      // Rate limiting delay between requests
      if (i < items.length - 1 && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(item, err);
      console.error(`Failed to generate summary for "${item.title}":`, err.message);
    }
  }
  
  return results;
}

/**
 * Estimate token usage for a summary request
 * Useful for cost estimation before running batch operations
 */
export function estimateTokenUsage(input: SummaryInput): { promptTokens: number; completionTokens: number } {
  // Rough estimate: ~4 chars per token
  const promptText = `${SUMMARY_SYSTEM_PROMPT}\n${input.title}\n${input.description}\n${input.sources.map(s => s.url).join('\n')}`;
  const promptTokens = Math.ceil(promptText.length / 4);
  
  // Estimated output: 200 words * 1.3 tokens/word
  const completionTokens = 260;
  
  return { promptTokens, completionTokens };
}

/**
 * Estimate cost for generating summaries
 * Based on Claude Haiku pricing: $0.25/1M input, $1.25/1M output
 */
export function estimateCost(itemCount: number): { 
  estimatedCostUsd: number; 
  breakdown: string;
} {
  // Average tokens per summary
  const avgPromptTokens = 300;
  const avgCompletionTokens = 260;
  
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
    breakdown: `${itemCount} summaries × ~${avgPromptTokens + avgCompletionTokens} tokens = ~$${totalCost.toFixed(4)}`,
  };
}

