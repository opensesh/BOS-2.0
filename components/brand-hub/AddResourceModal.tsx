'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { BrandResource } from '@/types';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (resource: Omit<BrandResource, 'id' | 'createdAt'>) => void;
  editResource?: BrandResource;
  onUpdateResource?: (id: string, updates: Partial<BrandResource>) => void;
}


export function AddResourceModal({
  isOpen,
  onClose,
  onAddResource,
  editResource,
  onUpdateResource,
}: AddResourceModalProps) {
  const isEditMode = !!editResource;
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  // Pre-populate form when editing
  useEffect(() => {
    if (editResource && isOpen) {
      setName(editResource.name);
      setUrl(editResource.url);
    } else if (!editResource && isOpen) {
      // Reset form when opening in add mode
      setName('');
      setUrl('');
      setError('');
    }
  }, [editResource, isOpen]);

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    const urlToAdd = url.startsWith('http') ? url : `https://${url}`;

    if (!validateUrl(urlToAdd)) {
      setError('Please enter a valid URL');
      return;
    }

    if (isEditMode && editResource && onUpdateResource) {
      // Update existing resource
      onUpdateResource(editResource.id, {
        name: name.trim(),
        url: urlToAdd,
      });
    } else {
      // Add new resource
      onAddResource({
        name: name.trim(),
        url: urlToAdd,
        icon: 'custom',
      });
    }

    // Reset form and close
    setName('');
    setUrl('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    if (!isEditMode) {
      setName('');
      setUrl('');
    }
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? "Edit Resource" : "Add Resource"} size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-os-text-primary-dark mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g., Brand Assets Drive"
            className="
              w-full px-3 py-2 rounded-lg
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
        </div>

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
              w-full px-3 py-2 rounded-lg
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-os-border-dark">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/80 transition-colors"
        >
          {isEditMode ? 'Save Changes' : 'Add Resource'}
        </button>
      </div>

    </Modal>
  );
}

// Icon preview component
export function ResourceIconPreview({
  type,
  lucideIconName,
  customIconUrl,
  size = 'md',
}: {
  type: BrandResource['icon'];
  lucideIconName?: string;
  customIconUrl?: string;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  // Handle Lucide icons
  if (type === 'lucide' && lucideIconName) {
    const LucideIcons = require('lucide-react');
    const IconComponent = LucideIcons[lucideIconName];
    if (IconComponent) {
      return <IconComponent className={sizeClasses} />;
    }
  }

  // Handle custom uploaded icons
  if (type === 'custom' && customIconUrl) {
    return (
      <img 
        src={customIconUrl} 
        alt="Custom icon" 
        className={sizeClasses}
      />
    );
  }

  switch (type) {
    case 'google-drive':
      return (
        <svg
          className={sizeClasses}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.71 3L2.16 12.71L4.93 17.71H9.46L15 8H7.71V3Z"
            fill="#4285F4"
          />
          <path
            d="M16.29 3H9L14.55 12.71L12 17.71L19.29 17.71L21.84 12.71L16.29 3Z"
            fill="#FBBC04"
          />
          <path
            d="M2.16 12.71L4.93 17.71H19.29L21.84 12.71H2.16Z"
            fill="#34A853"
          />
        </svg>
      );
    case 'figma':
      return (
        <svg
          className={sizeClasses}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 24C10.208 24 12 22.208 12 20V16H8C5.792 16 4 17.792 4 20C4 22.208 5.792 24 8 24Z"
            fill="#0ACF83"
          />
          <path
            d="M4 12C4 9.792 5.792 8 8 8H12V16H8C5.792 16 4 14.208 4 12Z"
            fill="#A259FF"
          />
          <path
            d="M4 4C4 1.792 5.792 0 8 0H12V8H8C5.792 8 4 6.208 4 4Z"
            fill="#F24E1E"
          />
          <path
            d="M12 0H16C18.208 0 20 1.792 20 4C20 6.208 18.208 8 16 8H12V0Z"
            fill="#FF7262"
          />
          <path
            d="M20 12C20 14.208 18.208 16 16 16C13.792 16 12 14.208 12 12C12 9.792 13.792 8 16 8C18.208 8 20 9.792 20 12Z"
            fill="#1ABCFE"
          />
        </svg>
      );
    case 'notion':
      return (
        <svg
          className={sizeClasses}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.967c-.42-.326-.98-.7-2.055-.606L3.01 2.72c-.467.046-.56.28-.374.466l1.823 1.022zm.793 3.08v13.906c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.382c0-.606-.233-.933-.746-.886l-15.177.887c-.56.046-.747.326-.747.886zm14.337.746c.093.42 0 .84-.42.887l-.7.14v10.265c-.607.327-1.167.514-1.633.514-.747 0-.934-.234-1.494-.934l-4.573-7.187v6.952l1.447.327s0 .84-1.167.84l-3.22.187c-.093-.187 0-.653.327-.746l.84-.233V9.855L7.379 9.67c-.093-.42.14-1.026.793-1.073l3.454-.233 4.76 7.28V9.202l-1.214-.14c-.093-.514.28-.887.747-.933l3.223-.187zm-16.35-5.16L16.92.813c1.26-.093 1.586-.033 2.38.467l3.267 2.333c.606.42.793.56.793 1.027v15.933c0 1.026-.373 1.633-1.68 1.727l-15.458.933c-.98.047-1.447-.093-1.96-.747l-3.127-4.06c-.56-.747-.793-1.306-.793-1.96V4.154c0-.84.374-1.54 1.54-1.68z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className={sizeClasses}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
  }
}

