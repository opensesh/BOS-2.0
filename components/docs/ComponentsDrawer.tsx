'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronRight, ChevronDown, Box, Layers, PanelLeftClose, PanelLeft } from 'lucide-react';
import { buildNavigationTree, NavItem, getAllComponents, ComponentDoc } from '@/lib/component-registry';
import { cn } from '@/lib/utils';
import { slideFromLeft, overlayFade } from '@/lib/motion';

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
  
  const navigationTree = useMemo(() => buildNavigationTree(), []);
  const allComponents = useMemo(() => getAllComponents(), []);

  // Filter to only show categories and components (not variants)
  const filteredTree = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    const filterNavItems = (items: NavItem[]): NavItem[] => {
      return items.reduce<NavItem[]>((acc, item) => {
        // Skip variants in the tree - they'll be shown as pills in the preview
        if (item.type === 'variant') return acc;
        
        if (item.type === 'component') {
          // Check if component name matches search
          if (!query || item.name.toLowerCase().includes(query)) {
            // Return component without children (variants)
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
          next.add(component.category === 'application' ? 'application' : 'design-system');
          if (component.page) {
            next.add(`page-${component.page.toLowerCase()}`);
          }
          return next;
        });
      }
    }
  }, [selectedComponentId, allComponents]);

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

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            }
            if (item.componentId) {
              onSelectComponent(item.componentId);
            }
          }}
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
    <>
      {/* Toggle button when closed - positioned inline with nav items (between Home and Brand) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-[56px] top-[120px] z-30 hidden lg:flex items-center justify-center w-6 h-12 bg-os-surface-dark border border-os-border-dark border-l-0 rounded-r-lg hover:bg-os-border-dark transition-colors"
          aria-label="Open component drawer"
        >
          <PanelLeft className="w-4 h-4 text-os-text-secondary-dark" />
        </button>
      )}

      {/* Desktop Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex flex-col bg-os-bg-darker border-r border-os-border-dark flex-shrink-0 overflow-hidden h-full"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between p-3 border-b border-os-border-dark">
              <span className="font-display font-semibold text-brand-vanilla text-sm">Components</span>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-os-border-dark transition-colors"
                aria-label="Close drawer"
              >
                <PanelLeftClose className="w-4 h-4 text-os-text-secondary-dark" />
              </button>
            </div>

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
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile/Tablet - Overlay drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 top-14 z-40 bg-black/50 lg:hidden"
              variants={overlayFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onToggle}
            />
            <motion.aside
              className="fixed top-14 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-os-bg-darker border-r border-os-border-dark lg:hidden flex flex-col"
              variants={slideFromLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-os-border-dark">
                <span className="font-display font-semibold text-brand-vanilla">Components</span>
                <button
                  onClick={onToggle}
                  className="p-1.5 rounded-lg hover:bg-os-border-dark transition-colors"
                  aria-label="Close drawer"
                >
                  <PanelLeftClose className="w-5 h-5 text-os-text-secondary-dark" />
                </button>
              </div>

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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
