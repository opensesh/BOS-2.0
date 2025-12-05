'use client';

import React, { useState, useCallback, useRef } from 'react';
import { PreviewToolbar } from './PreviewToolbar';
import { ComponentDoc } from '@/lib/component-registry';
import { cn } from '@/lib/utils';

interface ComponentPreviewProps {
  component: ComponentDoc | null;
  variant: string;
  props: Record<string, any>;
  onResetProps: () => void;
}

export function ComponentPreview({
  component,
  variant,
  props,
  onResetProps,
}: ComponentPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleReset = useCallback(() => {
    setZoom(1);
    onResetProps();
  }, [onResetProps]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleCopyCode = useCallback(async () => {
    if (!component) return;

    // Generate a simple code snippet
    const propsString = Object.entries(props)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : `${key}={false}`;
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .join('\n  ');

    const codeSnippet = `<${component.name}
  ${propsString}
/>`;

    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [component, props]);

  const handleDownload = useCallback(() => {
    if (!component) return;

    // Generate component code for download
    const propsString = Object.entries(props)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : `${key}={false}`;
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .join('\n  ');

    const codeSnippet = `// ${component.name} Component Usage
// ${component.description}

import { ${component.name} } from '@/components/...';

export default function Example() {
  return (
    <${component.name}
      ${propsString}
    />
  );
}
`;

    const blob = new Blob([codeSnippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name.toLowerCase()}-example.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [component, props]);

  const handleToggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  const handleExpand = useCallback(() => {
    if (previewRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        previewRef.current.requestFullscreen();
      }
    }
  }, []);

  // Get variant display name
  const getVariantDisplayName = () => {
    if (variant === 'docs') return 'Documentation';
    if (variant === 'default') return 'Default';
    const customVariant = component?.variants?.find(v => v.id === variant);
    return customVariant?.name || 'Default';
  };

  if (!component) {
    return (
      <div className="flex-1 flex items-center justify-center bg-os-bg-dark">
        <div className="text-center">
          <h2 className="text-xl font-display font-semibold text-brand-vanilla mb-2">
            Select a Component
          </h2>
          <p className="text-os-text-secondary-dark">
            Choose a component from the sidebar to view its documentation
          </p>
        </div>
      </div>
    );
  }

  const Component = component.component;

  return (
    <div className="flex-1 flex flex-col bg-os-bg-dark overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-os-border-dark">
        <h1 className="text-3xl font-display font-bold text-brand-vanilla mb-2">
          {component.name}
        </h1>
        <p className="text-os-text-secondary-dark max-w-3xl">
          {component.description}
        </p>
      </div>

      {/* Toolbar */}
      <PreviewToolbar
        zoom={zoom}
        showGrid={showGrid}
        onReset={handleReset}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCopyCode={handleCopyCode}
        onDownload={handleDownload}
        onToggleGrid={handleToggleGrid}
        onExpand={handleExpand}
        codeCopied={codeCopied}
      />

      {/* Preview Area */}
      <div 
        ref={previewRef}
        className={cn(
          'flex-1 overflow-auto p-8',
          showGrid && 'bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]'
        )}
      >
        <div 
          className="flex items-center justify-center min-h-full transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {variant === 'docs' ? (
            // Documentation view
            <div className="max-w-2xl w-full">
              <div className="bg-os-surface-dark rounded-xl border border-os-border-dark p-6 mb-6">
                <h3 className="text-lg font-display font-semibold text-brand-vanilla mb-4">
                  Component Preview
                </h3>
                <div className="p-4 bg-os-bg-dark rounded-lg border border-os-border-dark flex items-center justify-center min-h-[200px]">
                  <Component {...props} />
                </div>
              </div>
              
              <div className="bg-os-surface-dark rounded-xl border border-os-border-dark p-6">
                <h3 className="text-lg font-display font-semibold text-brand-vanilla mb-4">
                  Props
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-os-border-dark">
                        <th className="text-left py-2 pr-4 text-os-text-secondary-dark font-medium">Name</th>
                        <th className="text-left py-2 pr-4 text-os-text-secondary-dark font-medium">Description</th>
                        <th className="text-left py-2 pr-4 text-os-text-secondary-dark font-medium">Default</th>
                        <th className="text-left py-2 text-os-text-secondary-dark font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {component.controls.map(control => (
                        <tr key={control.name} className="border-b border-os-border-dark/50">
                          <td className="py-3 pr-4">
                            <code className="text-brand-aperol">
                              {control.name}
                              {control.required && <span className="text-red-400">*</span>}
                            </code>
                          </td>
                          <td className="py-3 pr-4 text-os-text-secondary-dark">
                            {control.description || '-'}
                          </td>
                          <td className="py-3 pr-4 text-os-text-secondary-dark">
                            {control.defaultValue !== undefined 
                              ? String(control.defaultValue) 
                              : '-'}
                          </td>
                          <td className="py-3 text-os-text-secondary-dark">
                            <code className="text-xs bg-os-bg-dark px-2 py-1 rounded">
                              {control.type}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Component preview
            <div className="p-8 bg-os-surface-dark rounded-xl border border-os-border-dark">
              <Component {...props} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
