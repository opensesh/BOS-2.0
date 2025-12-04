'use client';

import { createClient } from './client';
import type { ChatSession, ChatMessage, SearchHistoryItem, ChatSessionInsert, SearchHistoryInsert } from './types';

// Generate a unique session ID for the browser session
let browserSessionId: string | null = null;

// Track if tables are available (to avoid repeated error logs)
let tablesChecked = false;
let tablesAvailable = true;

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  if (!browserSessionId) {
    // Try to get from sessionStorage first (persists across page reloads in same tab)
    browserSessionId = sessionStorage.getItem('chat_session_id');
    
    if (!browserSessionId) {
      // Generate new session ID
      browserSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chat_session_id', browserSessionId);
    }
  }
  
  return browserSessionId;
}

/**
 * Check if Supabase tables are available
 * Returns false if tables don't exist (gracefully degrades)
 */
async function checkTablesAvailable(): Promise<boolean> {
  if (tablesChecked) return tablesAvailable;
  
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('chat_sessions')
      .select('id')
      .limit(1);
    
    tablesChecked = true;
    tablesAvailable = !error || !error.message.includes('does not exist');
    
    if (!tablesAvailable) {
      console.info('Chat history tables not yet created. Run the migration in lib/supabase/migrations/001_chat_history.sql');
    }
    
    return tablesAvailable;
  } catch {
    tablesChecked = true;
    tablesAvailable = false;
    return false;
  }
}

/**
 * Chat History Service
 * Handles persistence of chat sessions and search history to Supabase
 */
export const chatService = {
  /**
   * Save or update a chat session
   */
  async saveSession(
    title: string,
    messages: ChatMessage[],
    existingId?: string
  ): Promise<ChatSession | null> {
    // Check if tables are available
    if (!(await checkTablesAvailable())) {
      return null;
    }
    
    const supabase = createClient();
    const sessionId = getSessionId();
    
    const preview = messages.find(m => m.role === 'assistant')?.content.slice(0, 150) || null;
    
    if (existingId) {
      // Update existing session
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          title,
          preview,
          messages: messages as unknown as ChatSession['messages'],
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating chat session:', error);
        return null;
      }
      return data as ChatSession;
    }
    
    // Create new session
    const insert: ChatSessionInsert = {
      session_id: sessionId,
      title,
      preview,
      messages: messages as unknown as ChatSession['messages'],
    };
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert(insert)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
    
    return data as ChatSession;
  },
  
  /**
   * Get all chat sessions (most recent first)
   */
  async getSessions(limit = 50): Promise<ChatSession[]> {
    // Check if tables are available
    if (!(await checkTablesAvailable())) {
      return [];
    }
    
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
    
    return (data || []) as ChatSession[];
  },
  
  /**
   * Get a single session by ID
   */
  async getSession(id: string): Promise<ChatSession | null> {
    // Check if tables are available
    if (!(await checkTablesAvailable())) {
      return null;
    }
    
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching chat session:', error);
      return null;
    }
    
    return data as ChatSession;
  },
  
  /**
   * Delete a chat session
   */
  async deleteSession(id: string): Promise<boolean> {
    // Check if tables are available
    if (!(await checkTablesAvailable())) {
      return false;
    }
    
    const supabase = createClient();
    
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }
    
    return true;
  },
  
  /**
   * Log a search query to history
   */
  async logSearch(query: string, mode: 'search' | 'research' = 'search'): Promise<void> {
    // Check if tables are available
    if (!(await checkTablesAvailable())) {
      return;
    }
    
    const supabase = createClient();
    const sessionId = getSessionId();
    
    const insert: SearchHistoryInsert = {
      session_id: sessionId,
      query,
      mode,
    };
    
    const { error } = await supabase
      .from('search_history')
      .insert(insert);
    
    if (error) {
      console.error('Error logging search:', error);
    }
  },
  
  /**
   * Get recent search history
   */
  async getSearchHistory(limit = 20): Promise<SearchHistoryItem[]> {
    // Check if tables are available
    if (!(await checkTablesAvailable())) {
      return [];
    }
    
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
    
    return (data || []) as SearchHistoryItem[];
  },
  
  /**
   * Get popular/trending searches (aggregated)
   */
  async getTrendingSearches(limit = 10): Promise<{ query: string; count: number }[]> {
    // Check if tables are available
    if (!(await checkTablesAvailable())) {
      return [];
    }
    
    const supabase = createClient();
    
    // Get searches from the last 7 days, grouped by query
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('search_history')
      .select('query')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(500); // Get recent to aggregate
    
    if (error) {
      console.error('Error fetching trending searches:', error);
      return [];
    }
    
    // Aggregate by query (case-insensitive)
    const counts: Record<string, { query: string; count: number }> = {};
    for (const item of data || []) {
      const key = item.query.toLowerCase().trim();
      if (!counts[key]) {
        counts[key] = { query: item.query, count: 0 };
      }
      counts[key].count++;
    }
    
    // Sort by count and return top results
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
  
  /**
   * Search existing queries for autocomplete
   */
  async searchQueries(partialQuery: string, limit = 5): Promise<string[]> {
    // Check if tables are available
    if (!(await checkTablesAvailable())) {
      return [];
    }
    
    const supabase = createClient();
    
    if (!partialQuery || partialQuery.length < 2) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('search_history')
      .select('query')
      .ilike('query', `${partialQuery}%`)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error searching queries:', error);
      return [];
    }
    
    // Deduplicate and return unique queries
    const unique = [...new Set((data || []).map(d => d.query))];
    return unique.slice(0, limit);
  },
};

export type { ChatSession, ChatMessage, SearchHistoryItem };
