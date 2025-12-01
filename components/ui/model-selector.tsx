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
          flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-os-bg-dark cursor-pointer'}
          ${
            isOpen
              ? 'bg-os-bg-dark text-os-text-primary-dark'
              : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
          }
        `}
      >
        <span className="font-medium">{currentModel.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-52 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl overflow-hidden z-50">
          <div className="py-1.5">
            {/* Auto option */}
            <button
              type="button"
              onClick={() => {
                onModelChange(autoModel.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-4 py-2.5 text-left
                transition-colors duration-150 hover:bg-os-bg-dark
                ${selectedModel === 'auto' ? 'text-brand-aperol' : 'text-os-text-primary-dark'}
              `}
            >
              <span className="font-medium">{autoModel.name}</span>
              {selectedModel === 'auto' && <Check className="w-4 h-4 text-brand-aperol" />}
            </button>

            {/* Divider */}
            <div className="mx-3 my-1.5 border-t border-os-border-dark" />

            {/* Other models */}
            {otherModels.map((model: ModelConfig) => {
              const isSelected = model.id === selectedModel;

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5 text-left
                    transition-colors duration-150 hover:bg-os-bg-dark
                    ${isSelected ? 'text-brand-aperol' : 'text-os-text-primary-dark'}
                  `}
                >
                  <span className="font-medium">{model.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-brand-aperol" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
