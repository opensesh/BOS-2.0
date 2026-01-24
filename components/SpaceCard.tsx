'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, Clock, Lock, Plus, Trash2 } from 'lucide-react';
import { Space } from '@/types';
import { DeleteConfirmModal } from '@/components/spaces/DeleteConfirmModal';

interface SpaceCardProps {
  space?: Space;
  isCreate?: boolean;
  onDelete?: (spaceId: string) => void;
  onCreateClick?: () => void;
}

export function SpaceCard({ space, isCreate = false, onDelete, onCreateClick }: SpaceCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (space && onDelete) {
      onDelete(space.id);
    }
    setShowDeleteModal(false);
  };

  if (isCreate) {
    return (
      <button
        onClick={onCreateClick}
        className="
          group relative
          flex flex-col items-center justify-center
          p-8 rounded-lg
          border-2 border-dashed border-os-border-dark
          bg-os-surface-dark/50
          hover:bg-os-surface-dark hover:border-brand-aperol
          transition-all duration-200
          cursor-pointer
          min-h-[200px]
          w-full
          text-left
        "
      >
        <div className="w-16 h-16 bg-brand-aperol/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-aperol/30 transition-colors">
          <Plus className="w-8 h-8 text-brand-aperol" />
        </div>
        <h3 className="text-lg font-semibold text-brand-vanilla mb-2">
          Create a Space
        </h3>
        <p className="text-sm text-os-text-secondary-dark text-center">
          Set sources and invite others.
        </p>
      </button>
    );
  }

  if (!space) {
    return null;
  }

  return (
    <>
      <Link
        href={`/spaces/${space.slug}`}
        className="
          group relative
          flex flex-col
          p-6 rounded-lg
          border border-os-border-dark
          bg-os-surface-dark/50
          hover:bg-os-surface-dark hover:border-os-border-dark
          transition-all duration-200
          cursor-pointer
          min-h-[200px]
        "
      >
        {/* Delete button - appears on hover */}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="
              absolute top-4 right-4 p-2 rounded-lg
              opacity-0 group-hover:opacity-100
              bg-os-border-dark hover:bg-red-600
              text-os-text-secondary-dark hover:text-white
              transition-all duration-200
              z-10
            "
            aria-label="Delete space"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-os-border-dark rounded-full flex items-center justify-center flex-shrink-0">
            {space.icon ? (
              <span className="text-2xl">{space.icon}</span>
            ) : (
              <LayoutGrid className="w-6 h-6 text-os-text-secondary-dark" />
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-brand-vanilla mb-2 group-hover:text-brand-aperol transition-colors">
          {space.title}
        </h3>
        
        {space.description && (
          <p className="text-sm text-os-text-secondary-dark mb-4 line-clamp-2">
            {space.description}
          </p>
        )}
        
        <div className="mt-auto flex items-center gap-4 text-xs text-os-text-secondary-dark">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{space.lastModified}</span>
          </div>
          {space.isPrivate && (
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </div>
          )}
        </div>
      </Link>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        spaceName={space.title}
      />
    </>
  );
}
