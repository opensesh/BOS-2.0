'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Zap, Target, Globe, Search } from 'lucide-react';
import { models, ModelId, ModelConfig } from '@/lib/ai/providers';

interface ModelSelectorProps {
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  disabled?: boolean;
}

const modelIcons: Record<ModelId, React.ComponentType<{ className?: string }>> = {
  auto: Sparkles,
  'claude-sonnet': Target,
  'claude-haiku': Zap,
  sonar: Globe,
  'sonar-pro': Search,
};

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = models[selectedModel];
  const CurrentIcon = modelIcons[selectedModel] || Sparkles;

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

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-os-bg-dark cursor-pointer'}
          ${
            isOpen
              ? 'bg-os-bg-dark text-brand-aperol'
              : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
          }
        `}
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="font-medium">{currentModel.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl overflow-hidden z-50">
          <div className="p-2">
            {Object.values(models).map((model: ModelConfig) => {
              const Icon = modelIcons[model.id] || Sparkles;
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
                    w-full flex items-start gap-3 p-3 rounded-lg text-left
                    transition-colors duration-150
                    ${
                      isSelected
                        ? 'bg-brand-aperol/10 text-brand-aperol'
                        : 'hover:bg-os-bg-dark text-os-text-primary-dark'
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-brand-aperol' : 'text-os-text-secondary-dark'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.name}</span>
                      {model.id === 'auto' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-brand-aperol/20 text-brand-aperol">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-os-text-secondary-dark mt-0.5 truncate">
                      {model.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

