'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Lock, Link2, Check, X } from 'lucide-react';

type ShareVisibility = 'private' | 'anyone';

interface ShareModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  threadUrl?: string;
}

export function ShareButton({ threadUrl = '' }: { threadUrl?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={modalRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-aperol text-white rounded-lg hover:bg-brand-aperol/90 transition-colors text-sm font-medium"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <ShareModalContent
          threadUrl={threadUrl}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

function ShareModalContent({
  threadUrl,
  onClose,
}: {
  threadUrl: string;
  onClose: () => void;
}) {
  const [visibility, setVisibility] = useState<ShareVisibility>('anyone');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = threadUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-os-border-dark">
        <h3 className="text-sm font-semibold text-os-text-primary-dark">
          Share this Thread
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-os-bg-dark transition-colors"
        >
          <X className="w-4 h-4 text-os-text-secondary-dark" />
        </button>
      </div>

      {/* Visibility options */}
      <div className="p-2">
        <button
          onClick={() => setVisibility('private')}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
            ${
              visibility === 'private'
                ? 'bg-os-bg-dark'
                : 'hover:bg-os-bg-dark/50'
            }
          `}
        >
          <Lock className="w-4 h-4 text-os-text-secondary-dark" />
          <div className="text-left">
            <p className="text-sm font-medium text-os-text-primary-dark">
              Private
            </p>
            <p className="text-xs text-os-text-secondary-dark">
              Only the author can view
            </p>
          </div>
          {visibility === 'private' && (
            <Check className="w-4 h-4 text-brand-aperol ml-auto" />
          )}
        </button>

        <button
          onClick={() => setVisibility('anyone')}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
            ${
              visibility === 'anyone'
                ? 'bg-os-bg-dark'
                : 'hover:bg-os-bg-dark/50'
            }
          `}
        >
          <Share2 className="w-4 h-4 text-brand-aperol" />
          <div className="text-left">
            <p className="text-sm font-medium text-brand-aperol">
              Anyone with the link
            </p>
            <p className="text-xs text-os-text-secondary-dark">
              Anyone with the link
            </p>
          </div>
          {visibility === 'anyone' && (
            <Check className="w-4 h-4 text-brand-aperol ml-auto" />
          )}
        </button>
      </div>

      {/* Copy confirmation */}
      {copied && (
        <div className="px-4 py-2 flex items-center gap-2 text-brand-aperol text-sm">
          <Check className="w-4 h-4" />
          <span>Link copied. Paste to share</span>
        </div>
      )}

      {/* Share section */}
      <div className="px-4 pb-4 pt-2">
        <p className="text-xs font-semibold text-os-text-secondary-dark uppercase tracking-wider mb-2">
          Share
        </p>
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-os-bg-dark hover:bg-os-bg-dark/80 rounded-lg transition-colors text-sm font-medium text-os-text-primary-dark"
        >
          <Link2 className="w-4 h-4" />
          <span>Copy Link</span>
        </button>
      </div>
    </div>
  );
}

export function ShareModal({ isOpen, onClose, threadUrl }: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative">
        <ShareModalContent
          threadUrl={threadUrl || ''}
          onClose={onClose || (() => {})}
        />
      </div>
    </div>
  );
}

