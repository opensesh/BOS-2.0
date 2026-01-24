'use client';

import { useState, useEffect, useCallback } from 'react';
import { Space, SpaceFile, SpaceLink, SpaceTask } from '@/types';
import { SPACES, EXAMPLE_SPACES } from '@/lib/mock-data';

const STORAGE_KEY = 'bos-spaces';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [exampleSpaces] = useState<Space[]>(EXAMPLE_SPACES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSpaces(JSON.parse(stored));
      } catch {
        setSpaces(SPACES);
      }
    } else {
      setSpaces(SPACES);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
    }
  }, [spaces, isLoaded]);

  const getSpace = useCallback(
    (slug: string): Space | undefined => {
      return spaces.find((s) => s.slug === slug) || exampleSpaces.find((s) => s.slug === slug);
    },
    [spaces, exampleSpaces]
  );

  const createSpace = useCallback((title: string, description?: string, icon?: string): Space => {
    const newSpace: Space = {
      id: generateId(),
      slug: generateSlug(title),
      title,
      description,
      icon,
      isPrivate: true,
      lastModified: 'Just now',
      createdAt: new Date().toISOString(),
      threadCount: 0,
      files: [],
      links: [],
      instructions: '',
      tasks: [],
    };
    setSpaces((prev) => [...prev, newSpace]);
    return newSpace;
  }, []);

  const deleteSpace = useCallback((spaceId: string): boolean => {
    setSpaces((prev) => {
      const filtered = prev.filter((s) => s.id !== spaceId);
      return filtered;
    });
    return true;
  }, []);

  const updateSpace = useCallback((spaceId: string, updates: Partial<Space>): boolean => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId
          ? { ...s, ...updates, lastModified: 'Just now' }
          : s
      )
    );
    return true;
  }, []);

  // File operations
  const addFile = useCallback(
    (spaceId: string, file: Omit<SpaceFile, 'id' | 'addedAt'>): boolean => {
      const newFile: SpaceFile = {
        ...file,
        id: generateId(),
        addedAt: new Date().toISOString(),
      };
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === spaceId
            ? { ...s, files: [...(s.files || []), newFile], lastModified: 'Just now' }
            : s
        )
      );
      return true;
    },
    []
  );

  const removeFile = useCallback((spaceId: string, fileId: string): boolean => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId
          ? { ...s, files: (s.files || []).filter((f) => f.id !== fileId), lastModified: 'Just now' }
          : s
      )
    );
    return true;
  }, []);

  // Link operations
  const addLink = useCallback(
    (spaceId: string, link: Omit<SpaceLink, 'id' | 'addedAt'>): boolean => {
      const newLink: SpaceLink = {
        ...link,
        id: generateId(),
        addedAt: new Date().toISOString(),
      };
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === spaceId
            ? { ...s, links: [...(s.links || []), newLink], lastModified: 'Just now' }
            : s
        )
      );
      return true;
    },
    []
  );

  const removeLink = useCallback((spaceId: string, linkId: string): boolean => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId
          ? { ...s, links: (s.links || []).filter((l) => l.id !== linkId), lastModified: 'Just now' }
          : s
      )
    );
    return true;
  }, []);

  // Instructions operations
  const updateInstructions = useCallback((spaceId: string, instructions: string): boolean => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId
          ? { ...s, instructions, lastModified: 'Just now' }
          : s
      )
    );
    return true;
  }, []);

  // Task operations
  const addTask = useCallback(
    (spaceId: string, task: Omit<SpaceTask, 'id' | 'createdAt' | 'completed'>): boolean => {
      const newTask: SpaceTask = {
        ...task,
        id: generateId(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === spaceId
            ? { ...s, tasks: [...(s.tasks || []), newTask], lastModified: 'Just now' }
            : s
        )
      );
      return true;
    },
    []
  );

  const toggleTask = useCallback((spaceId: string, taskId: string): boolean => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId
          ? {
              ...s,
              tasks: (s.tasks || []).map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
              lastModified: 'Just now',
            }
          : s
      )
    );
    return true;
  }, []);

  const removeTask = useCallback((spaceId: string, taskId: string): boolean => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId
          ? { ...s, tasks: (s.tasks || []).filter((t) => t.id !== taskId), lastModified: 'Just now' }
          : s
      )
    );
    return true;
  }, []);

  return {
    spaces,
    exampleSpaces,
    isLoaded,
    getSpace,
    createSpace,
    deleteSpace,
    updateSpace,
    addFile,
    removeFile,
    addLink,
    removeLink,
    updateInstructions,
    addTask,
    toggleTask,
    removeTask,
  };
}


