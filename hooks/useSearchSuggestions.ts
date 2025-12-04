'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSuggestionsOptions {
  mode: 'search' | 'research';
  debounceMs?: number;
  minQueryLength?: number;
  maxSuggestions?: number;
}

interface UseSuggestionsResult {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  fetchSuggestions: (query: string) => void;
  clearSuggestions: () => void;
}

/**
 * Hook for fetching smart search suggestions
 * Provides real-time autocomplete as the user types
 */
export function useSearchSuggestions({
  mode,
  debounceMs = 200,
  minQueryLength = 2,
  maxSuggestions = 6,
}: UseSuggestionsOptions): UseSuggestionsResult {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef<string>('');

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // If query is too short, fetch trending/default suggestions
    if (!query || query.length < minQueryLength) {
      // Debounce the fetch for trending suggestions
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await fetch('/api/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '', mode, limit: maxSuggestions }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
          }
        } catch {
          // Silently fail for trending suggestions
        } finally {
          setIsLoading(false);
        }
      }, 100);
      return;
    }

    // Store query for comparison
    lastQueryRef.current = query;

    // Debounce the actual API call
    debounceTimeoutRef.current = setTimeout(async () => {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, mode, limit: maxSuggestions }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        
        // Only update if this is still the latest query
        if (query === lastQueryRef.current) {
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error fetching suggestions:', err);
        setError('Failed to fetch suggestions');
        // Keep existing suggestions on error
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [mode, debounceMs, minQueryLength, maxSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Refetch when mode changes
  useEffect(() => {
    if (lastQueryRef.current) {
      fetchSuggestions(lastQueryRef.current);
    }
  }, [mode, fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clearSuggestions,
  };
}

/**
 * Log a search query to history
 */
export async function logSearchQuery(query: string, mode: 'search' | 'research'): Promise<void> {
  try {
    // Dynamic import to avoid server-side issues
    const { chatService } = await import('@/lib/supabase/chat-service');
    await chatService.logSearch(query, mode);
  } catch (error) {
    console.error('Error logging search:', error);
  }
}
