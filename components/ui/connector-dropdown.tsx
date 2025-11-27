'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Globe,
  GraduationCap,
  Users,
  DollarSign,
  Mail,
  Calendar,
  Share2,
} from 'lucide-react';

interface Connector {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
}

interface ConnectorDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: Connector[];
  onToggleConnector: (id: string) => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function ConnectorDropdown({
  isOpen,
  onClose,
  connectors,
  onToggleConnector,
  triggerRef,
}: ConnectorDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  // Keep onClose ref up to date without triggering re-renders
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onCloseRef.current();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, triggerRef]); // Removed onClose from dependencies

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute bottom-full left-0 mb-2 w-80 bg-os-surface-dark rounded-lg border border-os-border-dark shadow-lg z-50 fade-in-up"
    >
      <div className="p-2 max-h-[400px] overflow-y-auto">
        {connectors.map((connector) => {
          const Icon = connector.icon;
          const isBrowseAll = connector.id === 'browse-all';

          return (
            <button
              key={connector.id}
              type="button"
              onClick={() => {
                if (!isBrowseAll) {
                  onToggleConnector(connector.id);
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-os-bg-dark transition-colors group"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-aperol" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium ${
                      connector.enabled
                        ? 'text-brand-aperol'
                        : 'text-os-text-primary-dark'
                    }`}
                  >
                    {connector.title}
                  </div>
                  {connector.description && (
                    <div className="text-xs text-os-text-secondary-dark mt-0.5">
                      {connector.description}
                    </div>
                  )}
                </div>
              </div>
              {!isBrowseAll ? (
                <div className="flex-shrink-0 ml-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleConnector(connector.id);
                    }}
                    className={`
                      relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-aperol focus:ring-offset-2 focus:ring-offset-os-surface-dark
                      ${
                        connector.enabled
                          ? 'bg-brand-aperol'
                          : 'bg-os-border-dark'
                      }
                    `}
                    aria-label={`Toggle ${connector.title}`}
                  >
                    <span
                      className={`
                        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                        ${connector.enabled ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
              ) : (
                <Share2 className="w-4 h-4 text-os-text-secondary-dark flex-shrink-0 ml-3" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

