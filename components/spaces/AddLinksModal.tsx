'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Link as LinkIcon, X, ExternalLink, Plus } from 'lucide-react';
import { SpaceLink } from '@/types';

interface AddLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (link: Omit<SpaceLink, 'id' | 'addedAt'>) => void;
  existingLinks?: SpaceLink[];
  onRemoveLink?: (linkId: string) => void;
}

export function AddLinksModal({
  isOpen,
  onClose,
  onAddLink,
  existingLinks = [],
  onRemoveLink,
}: AddLinksModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus URL input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        urlInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddLink = () => {
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    const urlToAdd = url.startsWith('http') ? url : `https://${url}`;
    
    if (!validateUrl(urlToAdd)) {
      setError('Please enter a valid URL');
      return;
    }

    onAddLink({
      url: urlToAdd,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });

    // Reset form and refocus for adding more
    setUrl('');
    setTitle('');
    setDescription('');
    setError('');
    urlInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && url.trim()) {
      e.preventDefault();
      handleAddLink();
    }
  };

  const handleClose = () => {
    setUrl('');
    setTitle('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Links" size="md">
      {/* Add new link form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleAddLink();
        }}
        className="space-y-4"
      >
        <div>
          <label 
            htmlFor="link-url"
            className="block text-sm font-medium text-os-text-primary-dark mb-1.5"
          >
            URL <span className="text-red-500">*</span>
          </label>
          <input
            ref={urlInputRef}
            id="link-url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            autoComplete="url"
            className={`
              w-full px-3 py-2.5 rounded-xl
              bg-os-border-dark border
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
              ${error ? 'border-red-500' : 'border-os-border-dark'}
            `}
          />
          {error && (
            <p className="mt-1.5 text-sm text-red-500" role="alert">{error}</p>
          )}
        </div>

        <div>
          <label 
            htmlFor="link-title"
            className="block text-sm font-medium text-os-text-primary-dark mb-1.5"
          >
            Title <span className="text-os-text-secondary-dark font-normal">(optional)</span>
          </label>
          <input
            id="link-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link title"
            autoComplete="off"
            className="
              w-full px-3 py-2.5 rounded-xl
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
        </div>

        <div>
          <label 
            htmlFor="link-description"
            className="block text-sm font-medium text-os-text-primary-dark mb-1.5"
          >
            Description <span className="text-os-text-secondary-dark font-normal">(optional)</span>
          </label>
          <textarea
            id="link-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the link"
            rows={2}
            className="
              w-full px-3 py-2.5 rounded-xl resize-none
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
        </div>

        <button
          type="submit"
          disabled={!url.trim()}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </form>

      {/* Existing links */}
      {existingLinks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-os-border-dark">
          <h4 className="text-sm font-medium text-os-text-primary-dark mb-3">
            Saved links ({existingLinks.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {existingLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-start justify-between p-3 rounded-xl bg-os-surface-dark hover:bg-os-surface-dark/80 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <LinkIcon className="w-4 h-4 text-os-text-secondary-dark mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-os-text-primary-dark truncate">
                      {link.title || link.url}
                    </p>
                    {link.title && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-aperol hover:underline inline-flex items-center gap-1 truncate max-w-full"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    )}
                    {link.description && (
                      <p className="text-xs text-os-text-secondary-dark mt-1 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
                {onRemoveLink && (
                  <button
                    type="button"
                    onClick={() => onRemoveLink(link.id)}
                    className="p-1.5 rounded-lg hover:bg-os-border-dark text-os-text-secondary-dark hover:text-red-500 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    aria-label={`Remove link "${link.title || link.url}"`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {existingLinks.length === 0 && (
        <div className="mt-4 p-4 rounded-xl bg-os-surface-dark/50 text-center">
          <p className="text-sm text-os-text-secondary-dark">
            Add links to reference websites and resources in this space.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end mt-6 pt-4 border-t border-os-border-dark">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-aperol/50"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}


