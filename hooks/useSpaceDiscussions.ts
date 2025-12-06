'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SpaceDiscussion, SpaceDiscussionMessage } from '@/types';

const DISCUSSIONS_STORAGE_KEY = 'bos-space-discussions';
const MESSAGES_STORAGE_KEY = 'bos-space-messages';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook for managing space discussions with Supabase
 * Falls back to localStorage if Supabase is not configured
 */
export function useSpaceDiscussions(spaceSlug: string) {
  const [discussions, setDiscussions] = useState<SpaceDiscussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Load discussions
  useEffect(() => {
    const loadDiscussions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try Supabase first
        const supabase = createClient();
        const { data, error: supabaseError } = await supabase
          .from('space_discussions')
          .select('*')
          .eq('space_slug', spaceSlug)
          .order('updated_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        setDiscussions(
          (data || []).map((d) => ({
            id: d.id,
            spaceId: d.space_id,
            spaceSlug: d.space_slug,
            title: d.title,
            preview: d.preview,
            messageCount: d.message_count,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }))
        );
      } catch {
        // Fall back to localStorage
        console.log('Supabase not available, using localStorage');
        setUseLocalStorage(true);

        const stored = localStorage.getItem(DISCUSSIONS_STORAGE_KEY);
        if (stored) {
          try {
            const all: SpaceDiscussion[] = JSON.parse(stored);
            setDiscussions(all.filter((d) => d.spaceSlug === spaceSlug));
          } catch {
            setDiscussions([]);
          }
        }
      }

      setIsLoading(false);
    };

    loadDiscussions();
  }, [spaceSlug]);

  // Save to localStorage when using fallback
  const saveToLocalStorage = useCallback((updatedDiscussions: SpaceDiscussion[]) => {
    const stored = localStorage.getItem(DISCUSSIONS_STORAGE_KEY);
    let all: SpaceDiscussion[] = [];
    if (stored) {
      try {
        all = JSON.parse(stored);
      } catch {
        all = [];
      }
    }

    // Replace discussions for this space
    const otherSpaces = all.filter((d) => d.spaceSlug !== spaceSlug);
    localStorage.setItem(
      DISCUSSIONS_STORAGE_KEY,
      JSON.stringify([...otherSpaces, ...updatedDiscussions])
    );
  }, [spaceSlug]);

  // Create a new discussion
  const createDiscussion = useCallback(
    async (title: string, spaceId: string): Promise<SpaceDiscussion | null> => {
      const now = new Date().toISOString();
      const newDiscussion: SpaceDiscussion = {
        id: generateId(),
        spaceId,
        spaceSlug,
        title,
        preview: '',
        messageCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      try {
        if (!useLocalStorage) {
          const supabase = createClient();
          const { data, error: supabaseError } = await supabase
            .from('space_discussions')
            .insert({
              id: newDiscussion.id,
              space_id: spaceId,
              space_slug: spaceSlug,
              title,
              preview: '',
              message_count: 0,
              created_at: now,
              updated_at: now,
            })
            .select()
            .single();

          if (supabaseError) throw supabaseError;

          const discussion: SpaceDiscussion = {
            id: data.id,
            spaceId: data.space_id,
            spaceSlug: data.space_slug,
            title: data.title,
            preview: data.preview,
            messageCount: data.message_count,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };

          setDiscussions((prev) => [discussion, ...prev]);
          return discussion;
        }

        // localStorage fallback
        setDiscussions((prev) => {
          const updated = [newDiscussion, ...prev];
          saveToLocalStorage(updated);
          return updated;
        });
        return newDiscussion;
      } catch (err) {
        console.error('Failed to create discussion:', err);
        setError('Failed to create discussion');
        return null;
      }
    },
    [spaceSlug, useLocalStorage, saveToLocalStorage]
  );

  // Update discussion (e.g., after new message)
  const updateDiscussion = useCallback(
    async (
      discussionId: string,
      updates: Partial<Pick<SpaceDiscussion, 'title' | 'preview' | 'messageCount'>>
    ): Promise<boolean> => {
      const now = new Date().toISOString();

      try {
        if (!useLocalStorage) {
          const supabase = createClient();
          const { error: supabaseError } = await supabase
            .from('space_discussions')
            .update({
              ...(updates.title && { title: updates.title }),
              ...(updates.preview && { preview: updates.preview }),
              ...(updates.messageCount !== undefined && { message_count: updates.messageCount }),
              updated_at: now,
            })
            .eq('id', discussionId);

          if (supabaseError) throw supabaseError;
        }

        setDiscussions((prev) => {
          const updated = prev.map((d) =>
            d.id === discussionId
              ? { ...d, ...updates, updatedAt: now }
              : d
          );
          if (useLocalStorage) {
            saveToLocalStorage(updated);
          }
          return updated;
        });

        return true;
      } catch (err) {
        console.error('Failed to update discussion:', err);
        setError('Failed to update discussion');
        return false;
      }
    },
    [useLocalStorage, saveToLocalStorage]
  );

  // Delete a discussion
  const deleteDiscussion = useCallback(
    async (discussionId: string): Promise<boolean> => {
      try {
        if (!useLocalStorage) {
          const supabase = createClient();
          
          // Delete messages first
          await supabase
            .from('space_discussion_messages')
            .delete()
            .eq('discussion_id', discussionId);

          // Then delete discussion
          const { error: supabaseError } = await supabase
            .from('space_discussions')
            .delete()
            .eq('id', discussionId);

          if (supabaseError) throw supabaseError;
        }

        setDiscussions((prev) => {
          const updated = prev.filter((d) => d.id !== discussionId);
          if (useLocalStorage) {
            saveToLocalStorage(updated);
            // Also clean up messages
            const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
            if (storedMessages) {
              try {
                const allMessages: SpaceDiscussionMessage[] = JSON.parse(storedMessages);
                localStorage.setItem(
                  MESSAGES_STORAGE_KEY,
                  JSON.stringify(allMessages.filter((m) => m.discussionId !== discussionId))
                );
              } catch {
                // Ignore
              }
            }
          }
          return updated;
        });

        return true;
      } catch (err) {
        console.error('Failed to delete discussion:', err);
        setError('Failed to delete discussion');
        return false;
      }
    },
    [useLocalStorage, saveToLocalStorage]
  );

  // Get a single discussion
  const getDiscussion = useCallback(
    (discussionId: string): SpaceDiscussion | undefined => {
      return discussions.find((d) => d.id === discussionId);
    },
    [discussions]
  );

  return {
    discussions,
    isLoading,
    error,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    getDiscussion,
    useLocalStorage,
  };
}

/**
 * Hook for managing messages within a specific discussion
 */
export function useDiscussionMessages(discussionId: string | null) {
  const [messages, setMessages] = useState<SpaceDiscussionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Load messages
  useEffect(() => {
    if (!discussionId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);

      try {
        const supabase = createClient();
        const { data, error: supabaseError } = await supabase
          .from('space_discussion_messages')
          .select('*')
          .eq('discussion_id', discussionId)
          .order('created_at', { ascending: true });

        if (supabaseError) throw supabaseError;

        setMessages(
          (data || []).map((m) => ({
            id: m.id,
            discussionId: m.discussion_id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            createdAt: m.created_at,
          }))
        );
      } catch {
        // Fall back to localStorage
        setUseLocalStorage(true);

        const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
        if (stored) {
          try {
            const all: SpaceDiscussionMessage[] = JSON.parse(stored);
            setMessages(all.filter((m) => m.discussionId === discussionId));
          } catch {
            setMessages([]);
          }
        }
      }

      setIsLoading(false);
    };

    loadMessages();
  }, [discussionId]);

  // Add a message
  const addMessage = useCallback(
    async (
      role: 'user' | 'assistant',
      content: string
    ): Promise<SpaceDiscussionMessage | null> => {
      if (!discussionId) return null;

      const now = new Date().toISOString();
      const newMessage: SpaceDiscussionMessage = {
        id: generateId(),
        discussionId,
        role,
        content,
        createdAt: now,
      };

      try {
        if (!useLocalStorage) {
          const supabase = createClient();
          const { data, error: supabaseError } = await supabase
            .from('space_discussion_messages')
            .insert({
              id: newMessage.id,
              discussion_id: discussionId,
              role,
              content,
              created_at: now,
            })
            .select()
            .single();

          if (supabaseError) throw supabaseError;

          const message: SpaceDiscussionMessage = {
            id: data.id,
            discussionId: data.discussion_id,
            role: data.role,
            content: data.content,
            createdAt: data.created_at,
          };

          setMessages((prev) => [...prev, message]);
          return message;
        }

        // localStorage fallback
        setMessages((prev) => {
          const updated = [...prev, newMessage];
          const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
          let all: SpaceDiscussionMessage[] = [];
          if (stored) {
            try {
              all = JSON.parse(stored);
            } catch {
              all = [];
            }
          }
          localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([...all, newMessage]));
          return updated;
        });

        return newMessage;
      } catch (err) {
        console.error('Failed to add message:', err);
        return null;
      }
    },
    [discussionId, useLocalStorage]
  );

  // Clear messages (for new chat)
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    addMessage,
    clearMessages,
    setMessages,
  };
}


