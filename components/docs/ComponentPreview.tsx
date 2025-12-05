'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Copy, 
  Download, 
  Grid3X3, 
  Maximize2,
  Check
} from 'lucide-react';
import { ComponentDoc } from '@/lib/component-registry';
import { ControlInput } from './ControlInputs';
import { cn } from '@/lib/utils';

interface ComponentPreviewProps {
  component: ComponentDoc | null;
  selectedVariant: string;
  onVariantChange: (variantId: string) => void;
}

export function ComponentPreview({
  component,
  selectedVariant,
  onVariantChange,
}: ComponentPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'props' | 'controls'>('props');
  const [componentProps, setComponentProps] = useState<Record<string, any>>({});
  const previewRef = useRef<HTMLDivElement>(null);

  // Initialize/update props when component or variant changes
  React.useEffect(() => {
    if (component) {
      const variant = component.variants?.find(v => v.id === selectedVariant);
      const variantProps = variant?.props || {};
      setComponentProps({
        ...component.defaultProps,
        ...variantProps,
      });
    }
  }, [component, selectedVariant]);

  const handlePropChange = useCallback((name: string, value: any) => {
    setComponentProps(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    if (component) {
      const variant = component.variants?.find(v => v.id === selectedVariant);
      const variantProps = variant?.props || {};
      setComponentProps({
        ...component.defaultProps,
        ...variantProps,
      });
    }
  }, [component, selectedVariant]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleCopyCode = useCallback(async () => {
    if (!component) return;

    const propsString = Object.entries(componentProps)
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
  }, [component, componentProps]);

  const handleDownload = useCallback(() => {
    if (!component) return;

    const propsString = Object.entries(componentProps)
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
  }, [component, componentProps]);

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

  if (!component) {
    return (
      <div className="flex items-center justify-center h-64 bg-os-surface-dark rounded-xl border border-os-border-dark">
        <p className="text-os-text-secondary-dark">Select a component to preview</p>
      </div>
    );
  }

  const Component = component.component;
  const buttonClass = cn(
    'p-2 rounded-lg transition-colors',
    'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  );
  const activeButtonClass = cn(buttonClass, 'bg-os-surface-dark text-brand-aperol');

  // Get all variants including default
  const allVariants = [
    { id: 'default', name: 'Default' },
    ...(component.variants || []),
  ];

  return (
    <div className="space-y-6">
      {/* Preview Container */}
      <div className="bg-os-surface-dark rounded-xl border border-os-border-dark overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-os-border-dark bg-os-bg-darker">
          <button onClick={handleReset} className={buttonClass} title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-os-border-dark mx-1" />
          <button onClick={handleZoomIn} disabled={zoom >= 2} className={buttonClass} title="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} disabled={zoom <= 0.25} className={buttonClass} title="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-os-text-secondary-dark min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <div className="w-px h-5 bg-os-border-dark mx-1" />
          <button onClick={handleCopyCode} className={codeCopied ? activeButtonClass : buttonClass} title="Copy code">
            {codeCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={handleDownload} className={buttonClass} title="Download">
            <Download className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-os-border-dark mx-1" />
          <button onClick={handleToggleGrid} className={showGrid ? activeButtonClass : buttonClass} title="Toggle grid">
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={handleExpand} className={buttonClass} title="Fullscreen">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Area */}
        <div 
          ref={previewRef}
          className={cn(
            'min-h-[300px] p-8 flex items-center justify-center',
            showGrid && 'bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]'
          )}
        >
          <div 
            className="transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <Component {...componentProps} />
          </div>
        </div>

        {/* Variant Selector */}
        {allVariants.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-3 border-t border-os-border-dark bg-os-bg-darker">
            <span className="text-xs text-os-text-secondary-dark uppercase tracking-wider font-medium">Variant:</span>
            <div className="flex gap-1.5 flex-wrap">
              {allVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => onVariantChange(variant.id)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full border transition-colors',
                    selectedVariant === variant.id
                      ? 'bg-brand-aperol text-white border-brand-aperol'
                      : 'bg-os-bg-dark border-os-border-dark text-os-text-secondary-dark hover:text-brand-vanilla hover:border-os-border-dark/80'
                  )}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Props / Controls Tabs */}
      <div className="bg-os-surface-dark rounded-xl border border-os-border-dark overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-os-border-dark">
          <button
            onClick={() => setActiveTab('props')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'props'
                ? 'text-brand-aperol'
                : 'text-os-text-secondary-dark hover:text-brand-vanilla'
            )}
          >
            Props
            {activeTab === 'props' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-aperol" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'controls'
                ? 'text-brand-aperol'
                : 'text-os-text-secondary-dark hover:text-brand-vanilla'
            )}
          >
            Controls
            {activeTab === 'controls' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-aperol" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'props' ? (
            // Props Table
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
              {component.controls.length === 0 && (
                <p className="text-os-text-secondary-dark text-center py-4">
                  No props defined for this component
                </p>
              )}
            </div>
          ) : (
            // Controls (editable)
            <div className="space-y-4 max-w-md">
              {component.controls.length > 0 ? (
                component.controls.map((control) => (
                  <ControlInput
                    key={control.name}
                    control={control}
                    value={componentProps[control.name]}
                    onChange={(value) => handlePropChange(control.name, value)}
                  />
                ))
              ) : (
                <p className="text-os-text-secondary-dark text-center py-4">
                  No controls available for this component
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
