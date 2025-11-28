'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Pin, PinOff, Trash2, Pencil } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/spaces/DeleteConfirmModal';

interface SpaceHeaderProps {
  title: string;
  icon?: string;
  spaceId?: string;
  onDelete?: (spaceId: string) => void;
  onRename?: (newTitle: string) => void;
}

export function SpaceHeader({ title, icon, spaceId, onDelete, onRename }: SpaceHeaderProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleConfirmDelete = () => {
    if (spaceId && onDelete) {
      onDelete(spaceId);
      router.push('/spaces');
    }
    setShowDeleteModal(false);
  };

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== title && onRename) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 flex-1">
          {icon ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            <LayoutGrid className="w-6 h-6 text-brand-vanilla" />
          )}
          
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="
                text-2xl font-semibold text-brand-vanilla bg-transparent
                border-b border-brand-aperol outline-none
                w-full max-w-md px-1
              "
            />
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl font-semibold text-brand-vanilla">
                {title}
              </h1>
              {onRename && (
                <button
                  onClick={() => {
                    setEditTitle(title);
                    setIsEditing(true);
                  }}
                  className="
                    opacity-0 group-hover:opacity-100 focus:opacity-100
                    p-1 rounded-md
                    text-os-text-secondary-dark hover:text-brand-vanilla
                    transition-all
                  "
                  aria-label="Edit title"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
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
