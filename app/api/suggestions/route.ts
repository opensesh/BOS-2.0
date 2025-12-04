import { generateText } from 'ai';
import { getModelInstance } from '@/lib/ai/providers';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 10; // Fast responses for autocomplete

// Fallback suggestions by category
const FALLBACK_SUGGESTIONS = {
  search: [
    'Where can I find the fonts for my brand?',
    'What colors should I use for my brand?',
    'Show me brand logo guidelines',
    'What is my brand voice and tone?',
    'Where are the brand asset files?',
  ],
  research: [
    'Analyze brand identity systems and their impact on positioning',
    'Deep dive into brand consistency across touchpoints',
    'Research brand asset management best practices',
    'Analyze competitor brand strategies in our market',
    'Strategic framework for brand evolution decisions',
  ],
};

// Brand-specific suggestion seeds for contextual completions
const BRAND_CONTEXT_SEEDS = [
  'brand guidelines', 'brand colors', 'brand fonts', 'brand voice',
  'logo usage', 'brand assets', 'typography', 'color palette',
  'brand identity', 'visual style', 'brand messaging', 'tone of voice',
  'design system', 'brand standards', 'marketing materials',
];

interface SuggestionRequest {
  query?: string;
  mode?: 'search' | 'research';
  limit?: number;
}

export async function POST(req: Request) {
  try {
    const body: SuggestionRequest = await req.json();
    const { query = '', mode = 'search', limit = 6 } = body;

    // If no query, return trending/popular suggestions
    if (!query || query.length < 2) {
      const suggestions = await getTrendingSuggestions(mode, limit);
      return Response.json({ suggestions, source: 'trending' });
    }

    // Get contextual suggestions using LLM
    const suggestions = await getSmartSuggestions(query, mode, limit);
    return Response.json({ suggestions, source: 'ai' });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    // Return fallback suggestions on error
    const mode = 'search';
    return Response.json({ 
      suggestions: FALLBACK_SUGGESTIONS[mode], 
      source: 'fallback' 
    });
  }
}

/**
 * Get trending suggestions from search history or use smart defaults
 */
async function getTrendingSuggestions(
  mode: 'search' | 'research',
  limit: number
): Promise<string[]> {
  try {
    const supabase = await createClient();
    
    // Get recent popular searches from history
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('search_history')
      .select('query')
      .eq('mode', mode)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error || !data || data.length === 0) {
      // Return fallback suggestions
      return FALLBACK_SUGGESTIONS[mode].slice(0, limit);
    }
    
    // Aggregate and deduplicate
    const counts: Record<string, number> = {};
    for (const item of data) {
      const key = item.query.toLowerCase().trim();
      counts[key] = (counts[key] || 0) + 1;
    }
    
    // Sort by frequency and get top suggestions
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
    
    // If we don't have enough from history, mix in fallbacks
    if (sorted.length < limit) {
      const fallbacks = FALLBACK_SUGGESTIONS[mode]
        .filter(f => !sorted.includes(f.toLowerCase()))
        .slice(0, limit - sorted.length);
      return [...sorted, ...fallbacks];
    }
    
    return sorted;
  } catch {
    return FALLBACK_SUGGESTIONS[mode].slice(0, limit);
  }
}

/**
 * Generate smart autocomplete suggestions using LLM
 */
async function getSmartSuggestions(
  query: string,
  mode: 'search' | 'research',
  limit: number
): Promise<string[]> {
  // First, try to get matching historical queries
  const historicalMatches = await getHistoricalMatches(query, mode);
  
  // Generate LLM-powered completions
  const llmSuggestions = await generateLLMSuggestions(query, mode, limit);
  
  // Combine: prioritize historical matches, then LLM suggestions
  const combined = [...historicalMatches, ...llmSuggestions];
  
  // Deduplicate (case-insensitive)
  const seen = new Set<string>();
  const unique = combined.filter(s => {
    const key = s.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return unique.slice(0, limit);
}

/**
 * Get historical queries that match the current input
 */
async function getHistoricalMatches(
  query: string,
  mode: 'search' | 'research'
): Promise<string[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('search_history')
      .select('query')
      .eq('mode', mode)
      .ilike('query', `${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error || !data) return [];
    
    // Deduplicate
    const unique = [...new Set(data.map(d => d.query))];
    return unique.slice(0, 3); // Max 3 from history
  } catch {
    return [];
  }
}

/**
 * Generate contextual autocomplete suggestions using LLM
 */
async function generateLLMSuggestions(
  query: string,
  mode: 'search' | 'research',
  limit: number
): Promise<string[]> {
  const isResearch = mode === 'research';
  
  const prompt = `You are an autocomplete suggestion engine for a brand management system (Brand Operating System / BOS).
The user has started typing a ${isResearch ? 'deep research' : 'quick search'} query: "${query}"

Generate ${limit} natural, helpful autocomplete suggestions that complete or extend their query.
These should be questions or queries that someone managing their brand would ask.

Context topics include: ${BRAND_CONTEXT_SEEDS.slice(0, 10).join(', ')}

${isResearch 
  ? 'For research mode, suggest comprehensive analysis queries, strategic frameworks, and deep-dive investigations.'
  : 'For search mode, suggest quick, specific questions that can be answered directly.'}

Rules:
- Each suggestion MUST start with or naturally extend "${query}"
- Suggestions should be 5-15 words long
- Be specific and actionable
- Focus on brand-related topics
- Return ONLY the suggestions, one per line, no numbering or bullets
- Do not repeat the same suggestion with minor variations`;

  try {
    // Use a fast model for autocomplete
    const model = getModelInstance('claude-sonnet');
    
    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 300,
      temperature: 0.7,
    });
    
    // Parse suggestions from response
    const suggestions = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 150)
      .filter(s => !s.match(/^[\d\-\*\•]/)) // Remove numbered/bulleted items
      .slice(0, limit);
    
    return suggestions;
  } catch (error) {
    console.error('Error generating LLM suggestions:', error);
    
    // Return contextual fallbacks based on query
    const queryLower = query.toLowerCase();
    const fallbacks = FALLBACK_SUGGESTIONS[mode]
      .filter(f => f.toLowerCase().includes(queryLower) || queryLower.includes(f.toLowerCase().split(' ')[0]))
      .slice(0, limit);
    
    if (fallbacks.length > 0) return fallbacks;
    
    // Generate simple completions
    return BRAND_CONTEXT_SEEDS
      .filter(seed => seed.startsWith(queryLower) || queryLower.includes(seed.split(' ')[0]))
      .map(seed => `${query} ${seed}`)
      .slice(0, limit);
  }
}

// Also support GET for simple queries
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const mode = (searchParams.get('mode') as 'search' | 'research') || 'search';
  const limit = parseInt(searchParams.get('limit') || '6', 10);
  
  // Redirect to POST handler
  return POST(new Request(req.url, {
    method: 'POST',
    body: JSON.stringify({ query, mode, limit }),
  }));
}
