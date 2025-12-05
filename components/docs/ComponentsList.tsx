'use client';

import React from 'react';
import { getAllComponents, ComponentDoc } from '@/lib/component-registry';
import { Box, Calendar, Layout, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComponentsListProps {
  onSelectComponent: (componentId: string) => void;
  onClose: () => void;
}

export function ComponentsList({ onSelectComponent, onClose }: ComponentsListProps) {
  const allComponents = getAllComponents();

  // Group by category
  const designSystemComponents = allComponents.filter(c => c.category === 'design-system');
  const applicationComponents = allComponents.filter(c => c.category === 'application');

  // Mock usage data - in a real app this would come from analytics
  const getUsageCount = (id: string) => {
    const mockUsage: Record<string, number> = {
      'brand-loader': 12,
      'button': 45,
      'modal': 23,
      'flip-card': 8,
      'tab-selector': 15,
      'color-swatch': 6,
      'news-card': 18,
    };
    return mockUsage[id] || Math.floor(Math.random() * 20) + 1;
  };

  // Mock created dates
  const getCreatedDate = (id: string) => {
    const mockDates: Record<string, string> = {
      'brand-loader': '2024-01-15',
      'button': '2024-01-10',
      'modal': '2024-01-12',
      'flip-card': '2024-02-01',
      'tab-selector': '2024-01-20',
      'color-swatch': '2024-02-15',
      'news-card': '2024-02-20',
    };
    return mockDates[id] || '2024-03-01';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSelect = (componentId: string) => {
    onSelectComponent(componentId);
    onClose();
  };

  const ComponentRow = ({ component }: { component: ComponentDoc }) => (
    <button
      onClick={() => handleSelect(component.id)}
      className="w-full flex items-center gap-4 p-4 hover:bg-os-surface-dark transition-colors text-left border-b border-os-border-dark/50 last:border-b-0"
    >
      {/* Icon */}
      <div className="p-2 rounded-lg bg-os-surface-dark border border-os-border-dark">
        <Box className="w-5 h-5 text-brand-aperol" />
      </div>

      {/* Name & Description */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-brand-vanilla truncate">
          {component.name}
        </h3>
        <p className="text-xs text-os-text-secondary-dark truncate">
          {component.description}
        </p>
      </div>

      {/* Page/Category */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-os-text-secondary-dark min-w-[100px]">
        <Layout className="w-3.5 h-3.5" />
        <span>{component.page || 'Design System'}</span>
      </div>

      {/* Created Date */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-os-text-secondary-dark min-w-[100px]">
        <Calendar className="w-3.5 h-3.5" />
        <span>{formatDate(getCreatedDate(component.id))}</span>
      </div>

      {/* Usage Count */}
      <div className="flex items-center gap-1.5 text-xs text-os-text-secondary-dark min-w-[60px]">
        <Hash className="w-3.5 h-3.5" />
        <span>{getUsageCount(component.id)} uses</span>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Design System Components */}
      {designSystemComponents.length > 0 && (
        <div className="bg-os-surface-dark rounded-xl border border-os-border-dark overflow-hidden">
          <div className="px-4 py-3 border-b border-os-border-dark bg-os-bg-darker">
            <h2 className="text-sm font-semibold text-brand-vanilla uppercase tracking-wider">
              Design System
            </h2>
            <p className="text-xs text-os-text-secondary-dark mt-0.5">
              {designSystemComponents.length} components
            </p>
          </div>
          <div>
            {designSystemComponents.map(component => (
              <ComponentRow key={component.id} component={component} />
            ))}
          </div>
        </div>
      )}

      {/* Application Components */}
      {applicationComponents.length > 0 && (
        <div className="bg-os-surface-dark rounded-xl border border-os-border-dark overflow-hidden">
          <div className="px-4 py-3 border-b border-os-border-dark bg-os-bg-darker">
            <h2 className="text-sm font-semibold text-brand-vanilla uppercase tracking-wider">
              Application
            </h2>
            <p className="text-xs text-os-text-secondary-dark mt-0.5">
              {applicationComponents.length} components
            </p>
          </div>
          <div>
            {applicationComponents.map(component => (
              <ComponentRow key={component.id} component={component} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allComponents.length === 0 && (
        <div className="text-center py-12">
          <Box className="w-12 h-12 text-os-text-secondary-dark mx-auto mb-4" />
          <h3 className="text-lg font-medium text-brand-vanilla mb-2">No Components</h3>
          <p className="text-os-text-secondary-dark">
            No components have been registered yet.
          </p>
        </div>
      )}
    </div>
  );
}
