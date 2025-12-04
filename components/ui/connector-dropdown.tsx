'use client';

import { useRef, useEffect, useState } from 'react';

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
  const [position, setPosition] = useState<{ 
    right?: number; 
    left?: number; 
    maxWidth?: number;
    bottom?: number;
    useFixed?: boolean;
  }>({});

  // Keep onClose ref up to date without triggering re-renders
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Calculate position to align with container edge on mobile/tablet
  useEffect(() => {
    if (!isOpen || !triggerRef?.current) return;

    const calculatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const isMobileOrTablet = viewportWidth < 1024; // lg breakpoint - includes tablets

      if (isMobileOrTablet) {
        // Find the form container to align with its right edge
        const formContainer = trigger.closest('form');
        if (formContainer) {
          const containerRect = formContainer.getBoundingClientRect();
          
          // Use fixed positioning for precise alignment on mobile/tablet
          // Position from viewport right edge to align with form's right edge
          const rightFromViewport = viewportWidth - containerRect.right;
          
          // Position from viewport bottom, above the trigger
          const bottomFromViewport = viewportWidth > 0 ? window.innerHeight - triggerRect.top + 8 : undefined;
          
          // Max width should not exceed the form width, but also cap at a reasonable size
          const dropdownMaxWidth = Math.min(containerRect.width, 320);
          
          setPosition({ 
            right: rightFromViewport, 
            left: undefined,
            maxWidth: dropdownMaxWidth,
            bottom: bottomFromViewport,
            useFixed: true
          });
        } else {
          // Fallback: align with viewport minus padding
          const containerPadding = 16;
          setPosition({ 
            right: containerPadding, 
            left: undefined,
            maxWidth: Math.min(viewportWidth - (containerPadding * 2), 320),
            useFixed: true
          });
        }
      } else {
        // Desktop: use absolute positioning, align to left of trigger
        setPosition({ left: 0, right: undefined, maxWidth: 288, useFixed: false }); // 72 * 4 = 288px (w-72)
      }
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [isOpen, triggerRef]);

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
      className={`${position.useFixed ? 'fixed' : 'absolute bottom-full mb-2'} bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl z-50 lg:w-72`}
      style={{
        right: position.right !== undefined ? position.right : undefined,
        left: position.left !== undefined ? position.left : undefined,
        width: position.maxWidth !== undefined ? position.maxWidth : undefined,
        bottom: position.useFixed && position.bottom !== undefined ? position.bottom : undefined,
      }}
    >
      <div className="p-2">
        {connectors.map((connector) => {
          const Icon = connector.icon;

          return (
            <div
              key={connector.id}
              onClick={() => onToggleConnector(connector.id)}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-os-bg-dark transition-colors group cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleConnector(connector.id);
                }
              }}
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
                <div
                  className={`
                    relative w-9 h-5 rounded-full transition-colors
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
