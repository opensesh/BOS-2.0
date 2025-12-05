'use client';

import React from 'react';
import { ComponentDoc } from '@/lib/component-registry';
import { ControlInput } from './ControlInputs';

interface ComponentControlsProps {
  component: ComponentDoc | null;
  props: Record<string, any>;
  onPropChange: (name: string, value: any) => void;
}

export function ComponentControls({
  component,
  props,
  onPropChange,
}: ComponentControlsProps) {
  if (!component) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-os-text-secondary-dark text-center">
          Select a component to see its controls
        </p>
      </div>
    );
  }

  if (component.controls.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-os-text-secondary-dark text-center">
          No controls available for this component
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {/* Controls Header */}
      <div className="px-4 py-3 border-b border-os-border-dark">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wider">
            Name
          </span>
          <span className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wider">
            Controls
          </span>
        </div>
      </div>

      {/* Control Inputs */}
      <div className="p-4 space-y-6">
        {component.controls.map((control) => (
          <ControlInput
            key={control.name}
            control={control}
            value={props[control.name]}
            onChange={(value) => onPropChange(control.name, value)}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-os-border-dark mt-auto">
        <p className="text-[10px] text-os-text-secondary-dark text-center">
          Changes apply instantly to the preview
        </p>
      </div>
    </div>
  );
}
