'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { models, ModelId, ModelConfig } from '@/lib/ai/providers';

interface ModelSelectorProps {
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = models[selectedModel];
  
  // Display name with version for the button
  const displayName = currentModel.version 
    ? `${currentModel.name} ${currentModel.version}` 
    : currentModel.name;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Separate Auto from other models
  const autoModel = models.auto;
  const otherModels = Object.values(models).filter((m) => m.id !== 'auto');

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-1 px-2 py-1 rounded-md text-xs
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-os-bg-dark cursor-pointer'}
          ${
            isOpen
              ? 'bg-os-bg-dark text-os-text-primary-dark'
              : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
          }
        `}
      >
        <span className="font-medium">{displayName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl overflow-hidden z-50">
          <div className="py-2">
            {/* Auto option */}
            <button
              type="button"
              onClick={() => {
                onModelChange(autoModel.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-4 py-2 text-left
                transition-colors duration-150 hover:bg-os-bg-dark
              `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${selectedModel === 'auto' ? 'text-os-text-primary-dark' : 'text-os-text-primary-dark'}`}>
                    {autoModel.name}
                  </span>
                </div>
                <p className="text-xs text-os-text-secondary-dark mt-0.5">
                  {autoModel.description}
                </p>
              </div>
              {selectedModel === 'auto' && (
                <Check className="w-4 h-4 text-blue-400 ml-2 flex-shrink-0" />
              )}
            </button>

            {/* Divider */}
            <div className="mx-3 my-1.5 border-t border-os-border-dark" />

            {/* Other models */}
            {otherModels.map((model: ModelConfig) => {
              const isSelected = model.id === selectedModel;
              const nameWithVersion = model.version 
                ? `${model.name} ${model.version}` 
                : model.name;

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-2 text-left
                    transition-colors duration-150 hover:bg-os-bg-dark
                  `}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-os-text-primary-dark">
                        {nameWithVersion}
                      </span>
                    </div>
                    <p className="text-xs text-os-text-secondary-dark mt-0.5">
                      {model.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-400 ml-2 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
