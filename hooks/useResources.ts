'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrandResource } from '@/types';

const STORAGE_KEY = 'bos-brand-resources';

// Default resources
const DEFAULT_RESOURCES: BrandResource[] = [
  {
    id: 'google-drive-default',
    name: 'Google Drive',
    url: 'https://drive.google.com',
    icon: 'google-drive',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'figma-default',
    name: 'Figma',
    url: 'https://figma.com',
    icon: 'figma',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notion-default',
    name: 'Notion',
    url: 'https://notion.so',
    icon: 'notion',
    createdAt: new Date().toISOString(),
  },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useResources() {
  const [resources, setResources] = useState<BrandResource[]>([]);
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
    (resource: Omit<BrandResource, 'id' | 'createdAt'>): BrandResource => {
      const newResource: BrandResource = {
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
    (resourceId: string, updates: Partial<BrandResource>): boolean => {
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

