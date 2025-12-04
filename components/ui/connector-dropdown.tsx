'use client';

import { useRef, useEffect } from 'react';

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
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-full right-0 sm:right-auto sm:left-0 mb-2 w-72 max-w-[calc(100vw-2rem)] bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl z-50"
    >
      <div className="p-2">
        {connectors.map((connector) => {
          const Icon = connector.icon;

          return (
            <button
              key={connector.id}
              type="button"
              onClick={() => onToggleConnector(connector.id)}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-os-bg-dark transition-colors group"
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-os-text-secondary-dark" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className={`text-sm font-medium text-os-text-primary-dark`}>
                  {connector.title}
                </div>
                {connector.description && (
                  <div className="text-xs text-os-text-secondary-dark mt-0.5">
                    {connector.description}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 mt-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleConnector(connector.id);
                  }}
                  className={`
                    relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-aperol focus:ring-offset-2 focus:ring-offset-os-surface-dark
                    ${connector.enabled ? 'bg-brand-aperol' : 'bg-os-border-dark'}
                  `}
                  aria-label={`Toggle ${connector.title}`}
                >
                  <span
                    className={`
                      absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm
                      ${connector.enabled ? 'translate-x-4' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
