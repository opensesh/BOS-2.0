'use client';

import React, { useState } from 'react';
import { ControlDefinition, ControlType } from '@/lib/component-registry';
import { cn } from '@/lib/utils';

interface ControlInputProps {
  control: ControlDefinition;
  value: any;
  onChange: (value: any) => void;
}

// Text Input
function TextInput({ control, value, onChange }: ControlInputProps) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={control.defaultValue?.toString() || ''}
      className="w-full px-3 py-2 text-sm bg-os-bg-dark border border-os-border-dark rounded-lg text-brand-vanilla placeholder:text-os-text-secondary-dark focus:outline-none focus:border-brand-aperol/50 transition-colors"
    />
  );
}

// Number Input
function NumberInput({ control, value, onChange }: ControlInputProps) {
  return (
    <input
      type="number"
      value={value ?? control.defaultValue ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      min={control.min}
      max={control.max}
      step={control.step}
      className="w-full px-3 py-2 text-sm bg-os-bg-dark border border-os-border-dark rounded-lg text-brand-vanilla placeholder:text-os-text-secondary-dark focus:outline-none focus:border-brand-aperol/50 transition-colors"
    />
  );
}

// Boolean Toggle
function BooleanInput({ control, value, onChange }: ControlInputProps) {
  const currentValue = value ?? control.defaultValue ?? false;
  
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onChange(false)}
        className={cn(
          'px-3 py-1.5 text-sm rounded-lg border transition-colors',
          !currentValue
            ? 'bg-os-surface-dark border-brand-aperol text-brand-aperol'
            : 'bg-os-bg-dark border-os-border-dark text-os-text-secondary-dark hover:text-brand-vanilla'
        )}
      >
        False
      </button>
      <button
        onClick={() => onChange(true)}
        className={cn(
          'px-3 py-1.5 text-sm rounded-lg border transition-colors',
          currentValue
            ? 'bg-os-surface-dark border-brand-aperol text-brand-aperol'
            : 'bg-os-bg-dark border-os-border-dark text-os-text-secondary-dark hover:text-brand-vanilla'
        )}
      >
        True
      </button>
    </div>
  );
}

// Color Picker
function ColorInput({ control, value, onChange }: ControlInputProps) {
  const currentValue = value ?? control.defaultValue ?? '#000000';
  const [inputValue, setInputValue] = useState(currentValue);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Only update if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={currentValue}
          onChange={handleColorChange}
          className="w-8 h-8 rounded cursor-pointer border border-os-border-dark"
        />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleTextChange}
        placeholder="#000000"
        className="flex-1 px-3 py-2 text-sm bg-os-bg-dark border border-os-border-dark rounded-lg text-brand-vanilla placeholder:text-os-text-secondary-dark focus:outline-none focus:border-brand-aperol/50 transition-colors font-mono"
      />
    </div>
  );
}

// Range/Slider Input
function RangeInput({ control, value, onChange }: ControlInputProps) {
  const min = control.min ?? 0;
  const max = control.max ?? 100;
  const step = control.step ?? 1;
  const currentValue = value ?? control.defaultValue ?? min;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-os-text-secondary-dark w-8">{min}</span>
      <input
        type="range"
        value={currentValue}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1 h-1 bg-os-border-dark rounded-full appearance-none cursor-pointer accent-brand-aperol"
      />
      <span className="text-xs text-os-text-secondary-dark w-8 text-right">{max}</span>
    </div>
  );
}

// Select/Radio Input
function SelectInput({ control, value, onChange }: ControlInputProps) {
  const currentValue = value ?? control.defaultValue;
  const options = control.options || [];

  return (
    <div className="flex flex-col gap-1.5">
      {options.map((option) => (
        <label
          key={String(option.value)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
            currentValue === option.value
              ? 'bg-os-surface-dark border-brand-aperol'
              : 'bg-os-bg-dark border-os-border-dark hover:border-os-border-dark/80'
          )}
        >
          <div
            className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
              currentValue === option.value
                ? 'border-brand-aperol'
                : 'border-os-border-dark'
            )}
          >
            {currentValue === option.value && (
              <div className="w-2 h-2 rounded-full bg-brand-aperol" />
            )}
          </div>
          <span
            className={cn(
              'text-sm',
              currentValue === option.value
                ? 'text-brand-aperol'
                : 'text-os-text-secondary-dark'
            )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

// Main Control Input Component
export function ControlInput({ control, value, onChange }: ControlInputProps) {
  const renderInput = () => {
    switch (control.type) {
      case 'text':
        return <TextInput control={control} value={value} onChange={onChange} />;
      case 'number':
        return <NumberInput control={control} value={value} onChange={onChange} />;
      case 'boolean':
        return <BooleanInput control={control} value={value} onChange={onChange} />;
      case 'color':
        return <ColorInput control={control} value={value} onChange={onChange} />;
      case 'range':
        return <RangeInput control={control} value={value} onChange={onChange} />;
      case 'select':
        return <SelectInput control={control} value={value} onChange={onChange} />;
      default:
        return <TextInput control={control} value={value} onChange={onChange} />;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm text-os-text-secondary-dark">
          {control.name}
          {control.required && <span className="text-brand-aperol">*</span>}
        </span>
        {control.description && (
          <span className="block text-xs text-os-text-secondary-dark/60 mt-0.5">
            {control.description}
          </span>
        )}
      </label>
      {renderInput()}
    </div>
  );
}


