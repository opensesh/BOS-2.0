'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Link as LinkIcon, X, ExternalLink } from 'lucide-react';
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

    // Reset form
    setUrl('');
    setTitle('');
    setDescription('');
    setError('');
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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-os-text-primary-dark mb-1.5">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            placeholder="https://example.com"
            className="
              w-full px-3 py-2 rounded-xl
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-os-text-primary-dark mb-1.5">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link title"
            className="
              w-full px-3 py-2 rounded-xl
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-os-text-primary-dark mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the link"
            rows={2}
            className="
              w-full px-3 py-2 rounded-xl resize-none
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
        </div>

        <button
          onClick={handleAddLink}
          className="w-full px-4 py-2 rounded-xl text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/80 transition-colors"
        >
          Add Link
        </button>
      </div>

      {/* Existing links */}
      {existingLinks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-os-border-dark">
          <h4 className="text-sm font-medium text-os-text-primary-dark mb-3">
            Saved links ({existingLinks.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {existingLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-start justify-between p-3 rounded-lg bg-os-surface-dark"
              >
                <div className="flex items-start gap-2 min-w-0 flex-1">
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
                        className="text-xs text-brand-aperol hover:underline flex items-center gap-1 truncate"
                      >
                        {link.url}
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
                    onClick={() => onRemoveLink(link.id)}
                    className="p-1 rounded hover:bg-os-border-dark text-os-text-secondary-dark hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Close button */}
      <div className="flex justify-end mt-6 pt-4 border-t border-os-border-dark">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}


