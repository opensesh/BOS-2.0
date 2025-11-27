'use client';

import { ConfirmModal } from '@/components/ui/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  spaceName: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  spaceName,
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Space?"
      message={`Are you sure you want to delete "${spaceName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isLoading}
    />
  );
}

