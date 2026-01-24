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
  const [position, setPosition] = useState<{ right?: number; left?: number; maxWidth?: number }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentModel = models[selectedModel];
  
  // Display name with version for the button
  const displayName = currentModel.version 
    ? `${currentModel.name} ${currentModel.version}` 
    : currentModel.name;

  // Calculate position to align with container edge on mobile/tablet
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const calculatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;

      const buttonRect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const isMobileOrTablet = viewportWidth < 1024; // lg breakpoint - includes tablets

      if (isMobileOrTablet) {
        // Find the form container to align with its right edge
        const formContainer = button.closest('form');
        if (formContainer) {
          const containerRect = formContainer.getBoundingClientRect();
          
          // Calculate using button position directly
          const rightOffset = buttonRect.right - containerRect.right;
          
          // Max width should not exceed the form width, but also cap at a reasonable size
          const dropdownMaxWidth = Math.min(containerRect.width, 280);
          
          setPosition({ 
            right: rightOffset, 
            left: undefined,
            maxWidth: dropdownMaxWidth
          });
        } else {
          // Fallback: align with viewport minus padding
          const containerPadding = 16;
          setPosition({ 
            right: 0, 
            left: undefined,
            maxWidth: Math.min(viewportWidth - (containerPadding * 2), 280)
          });
        }
      } else {
        // Desktop: align to left of trigger with fixed width
        setPosition({ left: 0, right: undefined, maxWidth: 256 }); // 64 * 4 = 256px (w-64)
      }
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [isOpen]);

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
        ref={buttonRef}
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
        <div 
          className="absolute bottom-full mb-2 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl overflow-hidden z-50 lg:w-64"
          style={{
            right: position.right !== undefined ? position.right : undefined,
            left: position.left !== undefined ? position.left : undefined,
            width: position.maxWidth !== undefined ? position.maxWidth : undefined,
          }}
        >
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
