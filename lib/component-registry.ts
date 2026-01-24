'use client';

import React from 'react';

// Control type definitions
export type ControlType = 
  | 'text' 
  | 'number' 
  | 'boolean' 
  | 'color' 
  | 'select' 
  | 'range';

export interface ControlDefinition {
  name: string;
  type: ControlType;
  description?: string;
  defaultValue?: any;
  options?: { label: string; value: string | number | boolean }[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export interface ComponentVariant {
  id: string;
  name: string;
  props: Record<string, any>;
}

export interface ComponentDoc {
  id: string;
  name: string;
  description: string;
  category: 'application' | 'design-system';
  page?: string; // For application components (e.g., 'Discover', 'Finance')
  component: React.ComponentType<any>;
  defaultProps: Record<string, any>;
  controls: ControlDefinition[];
  variants?: ComponentVariant[];
  code?: string; // Optional code snippet for display
}

export interface ComponentCategory {
  id: string;
  name: string;
  components: ComponentDoc[];
}

// Registry structure organized by category
export interface ComponentRegistry {
  application: {
    [page: string]: ComponentDoc[];
  };
  designSystem: ComponentDoc[];
}

// Initial empty registry - will be populated with actual components
export const componentRegistry: ComponentRegistry = {
  application: {},
  designSystem: [],
};

// Helper to get all components as flat array
export function getAllComponents(): ComponentDoc[] {
  const appComponents = Object.values(componentRegistry.application).flat();
  return [...appComponents, ...componentRegistry.designSystem];
}

// Helper to get component by ID
export function getComponentById(id: string): ComponentDoc | undefined {
  return getAllComponents().find(c => c.id === id);
}

// Helper to get components by category
export function getComponentsByCategory(category: 'application' | 'design-system'): ComponentDoc[] {
  if (category === 'application') {
    return Object.values(componentRegistry.application).flat();
  }
  return componentRegistry.designSystem;
}

// Helper to get application pages
export function getApplicationPages(): string[] {
  return Object.keys(componentRegistry.application);
}

// Navigation tree structure for the sidebar
export interface NavItem {
  id: string;
  name: string;
  type: 'category' | 'page' | 'component' | 'variant';
  children?: NavItem[];
  componentId?: string;
  variantId?: string;
}

export function buildNavigationTree(): NavItem[] {
  const tree: NavItem[] = [];

  // Application section
  const applicationPages = getApplicationPages();
  if (applicationPages.length > 0) {
    const applicationSection: NavItem = {
      id: 'application',
      name: 'APPLICATION',
      type: 'category',
      children: [],
    };

    applicationPages.forEach(page => {
      const pageComponents = componentRegistry.application[page];
      const pageItem: NavItem = {
        id: `page-${page.toLowerCase()}`,
        name: page,
        type: 'page',
        children: [],
      };

      pageComponents.forEach(component => {
        // Components are leaf nodes - variants are shown as pills in the preview
        const componentItem: NavItem = {
          id: component.id,
          name: component.name,
          type: 'component',
          componentId: component.id,
        };

        pageItem.children?.push(componentItem);
      });

      applicationSection.children?.push(pageItem);
    });

    tree.push(applicationSection);
  }

  // Design System section
  if (componentRegistry.designSystem.length > 0) {
    const designSystemSection: NavItem = {
      id: 'design-system',
      name: 'DESIGN SYSTEM',
      type: 'category',
      children: [],
    };

    componentRegistry.designSystem.forEach(component => {
      // Components are leaf nodes - variants are shown as pills in the preview
      const componentItem: NavItem = {
        id: component.id,
        name: component.name,
        type: 'component',
        componentId: component.id,
      };

      designSystemSection.children?.push(componentItem);
    });

    tree.push(designSystemSection);
  }

  return tree;
}
