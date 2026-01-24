'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BrainResource {
  id: string;
  name: string;
  url: string;
  icon: 'skills' | 'projects' | 'claude-md' | 'commands' | 'writing-styles' | 'custom';
  createdAt: string;
}

const STORAGE_KEY = 'bos-brain-resources';

// Default Claude resources
const DEFAULT_RESOURCES: BrainResource[] = [
  {
    id: 'skills-default',
    name: 'Skills',
    url: 'https://www.claude.com/blog/skills',
    icon: 'skills',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'projects-default',
    name: 'Projects',
    url: 'https://www.anthropic.com/news/projects',
    icon: 'projects',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'commands-default',
    name: 'Commands',
    url: 'https://code.claude.com/docs/en/slash-commands#custom-slash-commands',
    icon: 'commands',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'writing-styles-default',
    name: 'Writing Styles',
    url: 'https://support.claude.com/en/articles/10181068-configuring-and-using-styles',
    icon: 'writing-styles',
    createdAt: new Date().toISOString(),
  },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useBrainResources() {
  const [resources, setResources] = useState<BrainResource[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setResources(JSON.parse(stored));
      } catch {
        setResources(DEFAULT_RESOURCES);
      }
    } else {
      setResources(DEFAULT_RESOURCES);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    }
  }, [resources, isLoaded]);

  const addResource = useCallback(
    (resource: Omit<BrainResource, 'id' | 'createdAt'>): BrainResource => {
      const newResource: BrainResource = {
        ...resource,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setResources((prev) => [...prev, newResource]);
      return newResource;
    },
    []
  );

  const deleteResource = useCallback((resourceId: string): boolean => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
    return true;
  }, []);

  const updateResource = useCallback(
    (resourceId: string, updates: Partial<BrainResource>): boolean => {
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, ...updates } : r))
      );
      return true;
    },
    []
  );

  return {
    resources,
    isLoaded,
    addResource,
    deleteResource,
    updateResource,
  };
}

