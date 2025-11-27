'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Pin, PinOff, Trash2 } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/spaces/DeleteConfirmModal';

interface SpaceHeaderProps {
  title: string;
  icon?: string;
  spaceId?: string;
  onDelete?: (spaceId: string) => void;
}

export function SpaceHeader({ title, icon, spaceId, onDelete }: SpaceHeaderProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  const handleConfirmDelete = () => {
    if (spaceId && onDelete) {
      onDelete(spaceId);
      router.push('/spaces');
    }
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {icon ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            <LayoutGrid className="w-6 h-6 text-brand-vanilla" />
          )}
          <h1 className="text-2xl font-semibold text-brand-vanilla">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className="
              p-2 rounded-lg
              text-os-text-secondary-dark
              hover:bg-os-surface-dark hover:text-brand-vanilla
              transition-colors
            "
            aria-label={isPinned ? 'Unpin space' : 'Pin space'}
          >
            {isPinned ? (
              <Pin className="w-5 h-5 text-brand-aperol" />
            ) : (
              <PinOff className="w-5 h-5" />
            )}
          </button>
          {onDelete && spaceId && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="
                p-2 rounded-lg
                text-os-text-secondary-dark
                hover:bg-red-600 hover:text-white
                transition-colors
              "
              aria-label="Delete space"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        spaceName={title}
      />
    </>
  );
}
