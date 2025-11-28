'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { BrainResource } from '@/hooks/useBrainResources';

interface AddBrainResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (resource: Omit<BrainResource, 'id' | 'createdAt'>) => void;
  editResource?: BrainResource;
  onUpdateResource?: (id: string, updates: Partial<BrainResource>) => void;
}


export function AddBrainResourceModal({
  isOpen,
  onClose,
  onAddResource,
  editResource,
  onUpdateResource,
}: AddBrainResourceModalProps) {
  const isEditMode = !!editResource;
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  // Pre-populate form when editing
  useEffect(() => {
    if (editResource) {
      setName(editResource.name);
      setUrl(editResource.url);
    }
  }, [editResource]);

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
      onUpdateResource(editResource.id, {
        name: name.trim(),
        url: urlToAdd,
      });
    } else {
      onAddResource({
        name: name.trim(),
        url: urlToAdd,
        icon: 'custom',
      });
    }

    setName('');
    setUrl('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setUrl('');
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
            placeholder="e.g., Custom Skills"
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
            placeholder="https://docs.anthropic.com/..."
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
export function BrainResourceIcon({
  type,
  size = 'md',
}: {
  type: BrainResource['icon'];
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  switch (type) {
    case 'skills':
      return <Zap className={sizeClasses} />;
    case 'projects':
      return <FolderOpen className={sizeClasses} />;
    case 'claude-md':
      return <FileCode className={sizeClasses} />;
    case 'commands':
      return <Terminal className={sizeClasses} />;
    case 'writing-styles':
      return <PenTool className={sizeClasses} />;
    default:
      return <Link className={sizeClasses} />;
  }
}

