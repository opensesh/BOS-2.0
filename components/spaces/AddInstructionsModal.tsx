'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';

interface AddInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (instructions: string) => void;
  existingInstructions?: string;
}

export function AddInstructionsModal({
  isOpen,
  onClose,
  onSave,
  existingInstructions = '',
}: AddInstructionsModalProps) {
  const [instructions, setInstructions] = useState(existingInstructions);

  // Sync with existing instructions when modal opens
  useEffect(() => {
    if (isOpen) {
      setInstructions(existingInstructions);
    }
  }, [isOpen, existingInstructions]);

  const handleSave = () => {
    onSave(instructions.trim());
    onClose();
  };

  const handleClose = () => {
    setInstructions(existingInstructions);
    onClose();
  };

  const hasChanges = instructions.trim() !== existingInstructions.trim();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Instructions" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-os-text-secondary-dark">
          Add custom instructions for the AI when working in this space. These instructions will be applied to all conversations.
        </p>

        <div>
          <label className="block text-sm font-medium text-os-text-primary-dark mb-1.5">
            Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Example: Always respond in a formal tone. Focus on technical accuracy. Include code examples when explaining concepts..."
            rows={8}
            className="
              w-full px-3 py-2 rounded-lg resize-none
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
          />
          <p className="mt-1.5 text-xs text-os-text-secondary-dark">
            {instructions.length} characters
          </p>
        </div>

        {/* Tips */}
        <div className="p-3 rounded-lg bg-os-surface-dark">
          <h4 className="text-xs font-medium text-os-text-primary-dark mb-2">
            Tips for effective instructions:
          </h4>
          <ul className="space-y-1 text-xs text-os-text-secondary-dark">
            <li>• Be specific about the tone and style you want</li>
            <li>• Mention any domain-specific knowledge to focus on</li>
            <li>• Include formatting preferences (bullet points, headers, etc.)</li>
            <li>• Specify any topics or areas to avoid</li>
          </ul>
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
          onClick={handleSave}
          disabled={!hasChanges}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Instructions
        </button>
      </div>
    </Modal>
  );
}


