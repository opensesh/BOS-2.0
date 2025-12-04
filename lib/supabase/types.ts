/**
 * Supabase database types for chat history and search suggestions
 * 
 * Run this SQL in Supabase to create the tables:
 * 
 * -- Chat sessions table
 * CREATE TABLE chat_sessions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   session_id TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   preview TEXT,
 *   messages JSONB NOT NULL DEFAULT '[]',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Search history for smart suggestions
 * CREATE TABLE search_history (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   session_id TEXT NOT NULL,
 *   query TEXT NOT NULL,
 *   mode TEXT NOT NULL DEFAULT 'search', -- 'search' or 'research'
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Index for faster lookups
 * CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
 * CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
 * CREATE INDEX idx_search_history_session_id ON search_history(session_id);
 * CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);
 * CREATE INDEX idx_search_history_query ON search_history USING gin(to_tsvector('english', query));
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  session_id: string;
  title: string;
  preview: string | null;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface SearchHistoryItem {
  id: string;
  session_id: string;
  query: string;
  mode: 'search' | 'research';
  created_at: string;
}

// Insert types (without auto-generated fields)
export type ChatSessionInsert = Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>;
export type SearchHistoryInsert = Omit<SearchHistoryItem, 'id' | 'created_at'>;

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      chat_sessions: {
        Row: ChatSession;
        Insert: ChatSessionInsert;
        Update: Partial<ChatSessionInsert>;
      };
      search_history: {
        Row: SearchHistoryItem;
        Insert: SearchHistoryInsert;
        Update: Partial<SearchHistoryInsert>;
      };
    };
  };
}
