'use client';

import { createClient } from './client';
import type { ChatSession, ChatMessage, DbChat, DbMessage, ChatInsert, MessageInsert } from './types';

// Track if tables are available (to avoid repeated error logs)
let tablesChecked = false;
let tablesAvailable = true;

/**
 * Check if Supabase tables are available
 * Returns false if tables don't exist (gracefully degrades)
 */
async function checkTablesAvailable(): Promise<boolean> {
  if (tablesChecked) return tablesAvailable;

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('chats')
      .select('id')
      .limit(1);

    tablesChecked = true;

    if (!error) {
      tablesAvailable = true;
      return true;
    }

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';

    const isTableMissing =
      errorMessage.includes('does not exist') ||
      errorMessage.includes('relation') ||
      errorCode === '42P01' ||
      errorCode === 'PGRST116';

    tablesAvailable = false;

    if (isTableMissing) {
      console.info('Chat history: Supabase tables not available. Chat history disabled.');
    }

    return false;
  } catch {
    tablesChecked = true;
    tablesAvailable = false;
    return false;
  }
}

/**
 * Convert database message to app message format
 */
function dbMessageToAppMessage(msg: DbMessage): ChatMessage {
  return {
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    model: msg.model || undefined,
    timestamp: msg.created_at,
  };
}

/**
 * Chat History Service
 * Uses existing `chats` and `messages` tables in Supabase
 */
export const chatService = {
  /**
   * Save a new chat session or update existing one
   */
  async saveSession(
    title: string,
    messages: ChatMessage[],
    existingId?: string
  ): Promise<ChatSession | null> {
    if (!(await checkTablesAvailable())) {
      return null;
    }

    const supabase = createClient();
    const preview = messages.find(m => m.role === 'assistant')?.content.slice(0, 150) || null;

    try {
      if (existingId) {
        // Update existing chat title
        const { error: updateError } = await supabase
          .from('chats')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', existingId);

        if (updateError) {
          console.error('Error updating chat:', updateError);
          return null;
        }

        // Get existing messages to find new ones
        const { data: existingMessages } = await supabase
          .from('messages')
          .select('id')
          .eq('chat_id', existingId);

        const existingIds = new Set((existingMessages || []).map(m => m.id));

        // Insert only new messages
        const newMessages = messages.filter(m => !existingIds.has(m.id));

        if (newMessages.length > 0) {
          const messagesToInsert: MessageInsert[] = newMessages.map(m => ({
            chat_id: existingId,
            role: m.role,
            content: m.content,
            model: m.model,
          }));

          const { error: msgError } = await supabase
            .from('messages')
            .insert(messagesToInsert);

          if (msgError) {
            console.error('Error inserting messages:', msgError);
          }
        }

        return {
          id: existingId,
          title,
          preview,
          messages,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      // Create new chat (user_id is null for anonymous/demo users)
      const chatInsert: ChatInsert = { title, user_id: null };

      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert(chatInsert)
        .select()
        .single();

      if (chatError || !chat) {
        console.error('Error creating chat:', chatError);
        return null;
      }

      // Insert all messages
      if (messages.length > 0) {
        const messagesToInsert: MessageInsert[] = messages.map(m => ({
          chat_id: chat.id,
          role: m.role,
          content: m.content,
          model: m.model,
        }));

        const { error: msgError } = await supabase
          .from('messages')
          .insert(messagesToInsert);

        if (msgError) {
          console.error('Error inserting messages:', msgError);
        }
      }

      return {
        id: chat.id,
        title: chat.title,
        preview,
        messages,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
      };
    } catch (error) {
      console.error('Error in saveSession:', error);
      return null;
    }
  },

  /**
   * Get all chat sessions (most recent first)
   * Returns ALL sessions globally for demo visibility
   */
  async getSessions(limit = 50): Promise<ChatSession[]> {
    if (!(await checkTablesAvailable())) {
      return [];
    }

    const supabase = createClient();

    try {
      // Fetch chats ordered by most recent
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (chatsError || !chats) {
        if (chatsError?.message && !chatsError.message.includes('does not exist')) {
          console.error('Error fetching chats:', chatsError.message);
        }
        return [];
      }

      // Fetch messages for all chats
      const chatIds = chats.map(c => c.id);

      const { data: allMessages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('Error fetching messages:', msgError);
      }

      // Group messages by chat_id
      const messagesByChat: Record<string, DbMessage[]> = {};
      for (const msg of allMessages || []) {
        if (!messagesByChat[msg.chat_id]) {
          messagesByChat[msg.chat_id] = [];
        }
        messagesByChat[msg.chat_id].push(msg);
      }

      // Transform to ChatSession format
      return chats.map((chat: DbChat) => {
        const chatMessages = (messagesByChat[chat.id] || []).map(dbMessageToAppMessage);
        const preview = chatMessages.find(m => m.role === 'assistant')?.content.slice(0, 150) || null;

        return {
          id: chat.id,
          title: chat.title,
          preview,
          messages: chatMessages,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
        };
      });
    } catch (error) {
      console.error('Error in getSessions:', error);
      return [];
    }
  },

  /**
   * Get a single session by ID with all messages
   */
  async getSession(id: string): Promise<ChatSession | null> {
    if (!(await checkTablesAvailable())) {
      return null;
    }

    const supabase = createClient();

    try {
      // Fetch chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', id)
        .single();

      if (chatError || !chat) {
        console.error('Error fetching chat:', chatError);
        return null;
      }

      // Fetch messages
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('Error fetching messages:', msgError);
      }

      const chatMessages = (messages || []).map(dbMessageToAppMessage);
      const preview = chatMessages.find(m => m.role === 'assistant')?.content.slice(0, 150) || null;

      return {
        id: chat.id,
        title: chat.title,
        preview,
        messages: chatMessages,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
      };
    } catch (error) {
      console.error('Error in getSession:', error);
      return null;
    }
  },

  /**
   * Delete a chat session and its messages
   */
  async deleteSession(id: string): Promise<boolean> {
    if (!(await checkTablesAvailable())) {
      return false;
    }

    const supabase = createClient();

    try {
      // Delete messages first (foreign key constraint)
      await supabase
        .from('messages')
        .delete()
        .eq('chat_id', id);

      // Delete chat
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting chat:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSession:', error);
      return false;
    }
  },

  /**
   * Log a search query (stub - implement if search_history table exists)
   */
  async logSearch(_query: string, _mode: 'search' | 'research' = 'search'): Promise<void> {
    // Search history logging disabled - table may not exist
  },

  /**
   * Get recent search history (stub)
   */
  async getSearchHistory(_limit = 20): Promise<Array<{ query: string; mode: string; created_at: string }>> {
    return [];
  },

  /**
   * Get trending searches (stub)
   */
  async getTrendingSearches(_limit = 10): Promise<Array<{ query: string; count: number }>> {
    return [];
  },

  /**
   * Search queries for autocomplete (stub)
   */
  async searchQueries(_partialQuery: string, _limit = 5): Promise<string[]> {
    return [];
  },
};

export type { ChatSession, ChatMessage };
