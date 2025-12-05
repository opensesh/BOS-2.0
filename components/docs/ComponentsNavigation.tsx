'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronRight, ChevronDown, FileText, Layers, Box } from 'lucide-react';
import { buildNavigationTree, NavItem, getAllComponents } from '@/lib/component-registry';
import { cn } from '@/lib/utils';

interface ComponentsNavigationProps {
  selectedComponentId?: string;
  selectedVariantId?: string;
  onSelect: (componentId: string, variantId?: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ComponentsNavigation({
  selectedComponentId,
  selectedVariantId,
  onSelect,
  searchQuery,
  onSearchChange,
}: ComponentsNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['application', 'design-system']));
  
  const navigationTree = useMemo(() => buildNavigationTree(), []);
  const allComponents = useMemo(() => getAllComponents(), []);

  // Filter components based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return navigationTree;

    const query = searchQuery.toLowerCase();
    
    const filterNavItems = (items: NavItem[]): NavItem[] => {
      return items.reduce<NavItem[]>((acc, item) => {
        if (item.type === 'component') {
          // Check if component name matches
          if (item.name.toLowerCase().includes(query)) {
            acc.push(item);
          }
        } else if (item.children) {
          const filteredChildren = filterNavItems(item.children);
          if (filteredChildren.length > 0) {
            acc.push({
              ...item,
              children: filteredChildren,
            });
          }
        }
        return acc;
      }, []);
    };

    return filterNavItems(navigationTree);
  }, [navigationTree, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Auto-expand to show selected component
  React.useEffect(() => {
    if (selectedComponentId) {
      const component = allComponents.find(c => c.id === selectedComponentId);
      if (component) {
        setExpandedItems(prev => {
          const next = new Set(prev);
          // Expand the category
          next.add(component.category === 'application' ? 'application' : 'design-system');
          // Expand the page if it's an application component
          if (component.page) {
            next.add(`page-${component.page.toLowerCase()}`);
          }
          // Expand the component itself
          next.add(selectedComponentId);
          return next;
        });
      }
    }
  }, [selectedComponentId, allComponents]);

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = item.componentId === selectedComponentId && 
                       (item.variantId === selectedVariantId || (!item.variantId && !selectedVariantId));
    
    const paddingLeft = depth * 12 + 12;

    const getIcon = () => {
      switch (item.type) {
        case 'category':
          return <Layers className="w-4 h-4" />;
        case 'page':
          return <Box className="w-4 h-4" />;
        case 'component':
          return <Box className="w-4 h-4" />;
        case 'variant':
          return <FileText className="w-4 h-4" />;
        default:
          return null;
      }
    };

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            }
            if (item.componentId) {
              onSelect(item.componentId, item.variantId);
            }
          }}
          className={cn(
            'w-full flex items-center gap-2 py-2 pr-3 text-left transition-colors',
            item.type === 'category' && 'text-[11px] font-semibold uppercase tracking-wider text-os-text-secondary-dark hover:text-brand-vanilla',
            item.type === 'page' && 'text-sm font-medium text-brand-vanilla hover:bg-os-surface-dark',
            item.type === 'component' && 'text-sm text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark',
            item.type === 'variant' && 'text-sm text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark',
            isSelected && 'bg-brand-aperol/10 text-brand-aperol hover:bg-brand-aperol/15',
          )}
          style={{ paddingLeft }}
        >
          {hasChildren && (
            <span className="flex-shrink-0 text-os-text-secondary-dark">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          {!hasChildren && item.type !== 'category' && (
            <span className="w-3 flex-shrink-0" />
          )}
          <span className={cn(
            'flex-shrink-0',
            isSelected ? 'text-brand-aperol' : 'text-os-text-secondary-dark'
          )}>
            {getIcon()}
          </span>
          <span className="truncate">{item.name}</span>
        </button>

        {/* Children */}
        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {item.children?.map(child => renderNavItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 border-b border-os-border-dark">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark" />
            <input
              type="text"
              placeholder="Find components"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-os-bg-dark border border-os-border-dark rounded-lg text-brand-vanilla placeholder:text-os-text-secondary-dark focus:outline-none focus:border-brand-aperol/50 transition-colors"
            />
          </div>
          <button
            className="p-2 rounded-lg border border-os-border-dark bg-os-bg-dark hover:bg-os-surface-dark transition-colors"
            aria-label="Add component"
          >
            <Plus className="w-4 h-4 text-os-text-secondary-dark" />
          </button>
        </div>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {filteredTree.length === 0 ? (
          <div className="px-4 py-8 text-center text-os-text-secondary-dark text-sm">
            No components found
          </div>
        ) : (
          filteredTree.map(item => renderNavItem(item))
        )}
      </div>
    </div>
  );
}
