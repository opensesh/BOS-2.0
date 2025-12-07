'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronRight, ChevronDown, Box, Layers, X } from 'lucide-react';
import { buildNavigationTree, NavItem, getAllComponents } from '@/lib/component-registry';
import { cn } from '@/lib/utils';

interface ComponentsDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedComponentId?: string;
  onSelectComponent: (componentId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ComponentsDrawer({
  isOpen,
  onToggle,
  selectedComponentId,
  onSelectComponent,
  searchQuery,
  onSearchChange,
}: ComponentsDrawerProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['application', 'design-system']));
  // Use local search state to prevent focus loss during typing
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const navigationTree = useMemo(() => buildNavigationTree(), []);
  const allComponents = useMemo(() => getAllComponents(), []);
  
  // Sync local state with parent when drawer opens or parent changes externally
  useEffect(() => {
    if (isOpen && searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [isOpen, searchQuery]);
  
  // Debounce the parent update to prevent excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        onSearchChange(localSearchQuery);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [localSearchQuery, searchQuery, onSearchChange]);

  // Collect all expandable item IDs for auto-expand on search
  const allExpandableIds = useMemo(() => {
    const ids = new Set<string>();
    const collectIds = (items: NavItem[]) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          ids.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(navigationTree);
    return ids;
  }, [navigationTree]);

  // Filter to only show categories and components (not variants)
  const filteredTree = useMemo(() => {
    const query = localSearchQuery.toLowerCase().trim();
    
    const filterNavItems = (items: NavItem[]): NavItem[] => {
      return items.reduce<NavItem[]>((acc, item) => {
        if (item.type === 'variant') return acc;
        
        if (item.type === 'component') {
          if (!query || item.name.toLowerCase().includes(query)) {
            acc.push({ ...item, children: undefined });
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
  }, [navigationTree, localSearchQuery]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Auto-expand all folders when searching
  useEffect(() => {
    if (localSearchQuery.trim()) {
      // Expand all folders when searching
      setExpandedItems(new Set(allExpandableIds));
    }
  }, [localSearchQuery, allExpandableIds]);

  // Auto-expand to show selected component
  useEffect(() => {
    if (selectedComponentId && !localSearchQuery.trim()) {
      const component = allComponents.find(c => c.id === selectedComponentId);
      if (component) {
        setExpandedItems(prev => {
          const next = new Set(prev);
          next.add(component.category === 'application' ? 'application' : 'design-system');
          if (component.page) {
            next.add(`page-${component.page.toLowerCase()}`);
          }
          return next;
        });
      }
    }
  }, [selectedComponentId, allComponents, localSearchQuery]);

  // Handle search input change - update local state immediately
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setLocalSearchQuery(e.target.value);
  }, []);

  // Handle component selection
  const handleComponentSelect = useCallback((componentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectComponent(componentId);
  }, [onSelectComponent]);

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = item.componentId === selectedComponentId;
    
    const paddingLeft = depth * 12 + 12;

    const getIcon = () => {
      switch (item.type) {
        case 'category':
          return <Layers className="w-4 h-4" />;
        case 'page':
          return <Box className="w-4 h-4" />;
        case 'component':
          return <Box className="w-4 h-4" />;
        default:
          return null;
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (hasChildren) {
        toggleExpanded(item.id);
      }
      if (item.componentId) {
        handleComponentSelect(item.componentId, e);
      }
    };

    return (
      <div key={item.id}>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'w-full flex items-center gap-2 py-2 pr-3 text-left transition-colors',
            item.type === 'category' && 'text-[11px] font-semibold uppercase tracking-wider text-os-text-secondary-dark hover:text-brand-vanilla',
            item.type === 'page' && 'text-sm font-medium text-brand-vanilla hover:bg-os-surface-dark',
            item.type === 'component' && 'text-sm text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark',
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

  // Handle key events in search to prevent bubbling
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    // Allow escape to close drawer
    if (e.key === 'Escape') {
      onToggle();
    }
  }, [onToggle]);

  // Handle clearing the search
  const handleClearSearch = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalSearchQuery('');
    onSearchChange('');
    searchInputRef.current?.focus();
  }, [onSearchChange]);

  return (
    <>
      {/* Drawer - Right side, consistent across all viewports */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - only on mobile/tablet */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-14 lg:top-0 z-40 bg-black/40 lg:bg-transparent lg:pointer-events-none"
              onClick={onToggle}
            />
            
            {/* Drawer panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-14 lg:top-0 right-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-os-bg-darker border-l border-os-border-dark flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button - h-12 to match Sidebar header */}
              <div className="flex items-center justify-between px-3 h-12 border-b border-os-border-dark shrink-0">
                <span className="font-display font-semibold text-brand-vanilla text-sm">Components</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="p-1.5 rounded-lg hover:bg-os-border-dark transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4 text-os-text-secondary-dark" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-os-border-dark shrink-0">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Find components"
                      value={localSearchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                      autoComplete="off"
                      className="w-full pl-9 pr-8 py-2 text-sm bg-os-bg-dark border border-os-border-dark rounded-lg text-brand-vanilla placeholder:text-os-text-secondary-dark focus:outline-none focus:border-brand-aperol/50 transition-colors"
                    />
                    {localSearchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-os-surface-dark transition-colors"
                      >
                        <X className="w-3 h-3 text-os-text-secondary-dark" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
