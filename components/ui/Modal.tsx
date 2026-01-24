'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  /** If true, automatically focuses the first focusable element inside the modal */
  autoFocusFirst?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  autoFocusFirst = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Track if we've already focused on initial open
  const hasFocusedRef = useRef(false);

  // Reset focus tracking when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasFocusedRef.current = false;
    }
  }, [isOpen]);

  // Escape key handling - separate from focus to avoid re-running focus logic
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // Focus and body scroll management - only run once when modal opens
  useEffect(() => {
    if (isOpen && !hasFocusedRef.current) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      hasFocusedRef.current = true;

      // Focus handling - find first input/textarea in the body, not header buttons
      if (autoFocusFirst && modalRef.current) {
        // Prioritize inputs and textareas in the modal body over header buttons
        const inputSelectors = [
          'input:not([disabled]):not([type="hidden"])',
          'textarea:not([disabled])',
          'select:not([disabled])',
        ].join(', ');

        // Small delay to let the modal render completely
        requestAnimationFrame(() => {
          // First try to find an input/textarea/select (skip buttons in header)
          const firstInput = modalRef.current?.querySelector<HTMLElement>(inputSelectors);
          if (firstInput) {
            firstInput.focus();
          } else {
            // Fall back to modal container if no inputs found
            modalRef.current?.focus();
          }
        });
      } else {
        modalRef.current?.focus();
      }
    }

    // Cleanup when modal closes
    return () => {
      if (!isOpen) {
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      }
    };
  }, [isOpen, autoFocusFirst]);

  // Handle click outside to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking the backdrop directly, not its children
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-xl',
          'bg-os-surface-dark border border-os-border-dark',
          'shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          'max-h-[90vh] overflow-hidden flex flex-col',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-os-border-dark flex-shrink-0">
          <h2
            id="modal-title"
            className="text-lg font-display font-semibold text-brand-vanilla"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-border-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-aperol/50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body - scrollable */}
        <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
}

// Confirmation modal variant
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmModalProps) {
  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    default: 'bg-brand-aperol hover:bg-brand-aperol/80 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-os-text-secondary-dark mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50',
            variantClasses[variant]
          )}
        >
          {isLoading ? 'Loading...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}


