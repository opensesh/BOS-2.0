'use client';

import { useEffect, useRef } from 'react';

export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>
) {
  const shortcutsRef = useRef(shortcuts);

  // Keep shortcuts ref up to date without triggering re-renders
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      for (const [key, callback] of Object.entries(shortcutsRef.current)) {
        const [modifier, ...keys] = key.toLowerCase().split('+');
        const targetKey = keys.join('+') || modifier;

        if (modifier === 'cmd' || modifier === 'ctrl') {
          if (modKey && event.key.toLowerCase() === targetKey) {
            event.preventDefault();
            callback();
          }
        } else if (event.key.toLowerCase() === key.toLowerCase()) {
          if (!event.metaKey && !event.ctrlKey && !event.altKey) {
            callback();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty dependency array - only run once on mount
}

