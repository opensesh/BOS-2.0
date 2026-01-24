/**
 * Supabase database types for chat history
 *
 * Uses existing tables: `chats` and `messages`
 */

// Database row types (matching existing Supabase schema)
export interface DbChat {
  id: string;
  user_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  model: string | null;
  created_at: string;
}

// Application-level types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string | null;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Insert types
export interface ChatInsert {
  title: string;
  user_id?: string | null;
}

export interface MessageInsert {
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

// Legacy types for backwards compatibility
export interface SearchHistoryItem {
  id: string;
  session_id: string;
  query: string;
  mode: 'search' | 'research';
  created_at: string;
}

export type SearchHistoryInsert = Omit<SearchHistoryItem, 'id' | 'created_at'>;

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      chats: {
        Row: DbChat;
        Insert: ChatInsert;
        Update: Partial<ChatInsert>;
      };
      messages: {
        Row: DbMessage;
        Insert: MessageInsert;
        Update: Partial<MessageInsert>;
      };
      search_history: {
        Row: SearchHistoryItem;
        Insert: SearchHistoryInsert;
        Update: Partial<SearchHistoryInsert>;
      };
    };
  };
}
