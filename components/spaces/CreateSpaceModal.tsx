'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Sparkles } from 'lucide-react';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description?: string, icon?: string) => { slug: string };
}

// Common emoji icons for spaces
const PRESET_ICONS = [
  '🚀', '💼', '📊', '🎨', '📚', '🔬', '💡', '🎯', 
  '🏆', '🌟', '⚡', '🔥', '🎪', '🌈', '🎭', '🎸'
];

export function CreateSpaceModal({ isOpen, onClose, onCreate }: CreateSpaceModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsCreating(true);

    try {
      // Create the space
      const newSpace = onCreate(title.trim(), description.trim() || undefined, selectedIcon || undefined);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedIcon('');
      
      // Close modal
      onClose();
      
      // Navigate to the new space
      router.push(`/spaces/${newSpace.slug}`);
    } catch (error) {
      console.error('Error creating space:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle('');
      setDescription('');
      setSelectedIcon('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create a Space"
      size="lg"
      showCloseButton={!isCreating}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label
            htmlFor="space-title"
            className="block text-sm font-medium text-brand-vanilla mb-2"
          >
            Title <span className="text-brand-aperol">*</span>
          </label>
          <input
            id="space-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Marketing Research, Design System, Q4 Strategy"
            disabled={isCreating}
            className="
              w-full px-4 py-3 rounded-lg
              bg-os-bg-dark
              border border-os-border-dark
              text-brand-vanilla placeholder:text-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol focus:border-transparent
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            autoFocus
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label
            htmlFor="space-description"
            className="block text-sm font-medium text-brand-vanilla mb-2"
          >
            Description <span className="text-xs text-os-text-secondary-dark">(Optional)</span>
          </label>
          <textarea
            id="space-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this space for? Add context for AI and collaborators..."
            rows={3}
            disabled={isCreating}
            className="
              w-full px-4 py-3 rounded-lg
              bg-os-bg-dark
              border border-os-border-dark
              text-brand-vanilla placeholder:text-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol focus:border-transparent
              transition-all duration-200
              resize-none
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-brand-vanilla mb-3">
            Icon <span className="text-xs text-os-text-secondary-dark">(Optional)</span>
          </label>
          <div className="grid grid-cols-8 gap-2">
            {PRESET_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon === selectedIcon ? '' : icon)}
                disabled={isCreating}
                className={`
                  w-full aspect-square rounded-lg
                  flex items-center justify-center
                  text-2xl
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    selectedIcon === icon
                      ? 'bg-brand-aperol/20 ring-2 ring-brand-aperol'
                      : 'bg-os-border-dark hover:bg-os-surface-dark'
                  }
                `}
                aria-label={`Select ${icon} icon`}
              >
                {icon}
              </button>
            ))}
          </div>
          {selectedIcon && (
            <button
              type="button"
              onClick={() => setSelectedIcon('')}
              disabled={isCreating}
              className="mt-2 text-sm text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-os-border-dark">
          <button
            type="button"
            onClick={handleClose}
            disabled={isCreating}
            className="
              px-5 py-2.5 rounded-lg
              text-sm font-medium
              text-os-text-primary-dark
              bg-os-border-dark
              hover:bg-os-surface-dark
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isCreating}
            className="
              px-5 py-2.5 rounded-lg
              text-sm font-medium
              text-white
              bg-brand-aperol
              hover:bg-brand-aperol/80
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
          >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Space
                </>
              )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

