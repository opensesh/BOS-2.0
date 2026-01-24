'use client';

import React from 'react';
import { X, ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Attachment } from '@/hooks/useAttachments';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  error?: string | null;
  onClearError?: () => void;
  compact?: boolean;
}

export function AttachmentPreview({
  attachments,
  onRemove,
  error,
  onClearError,
  compact = false,
}: AttachmentPreviewProps) {
  if (attachments.length === 0 && !error) return null;

  return (
    <div className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} border-b border-os-border-dark`}>
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2"
          >
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="p-0.5 hover:bg-red-500/20 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment thumbnails */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div
                  className={`
                    relative overflow-hidden rounded-lg border border-os-border-dark bg-os-bg-dark
                    ${compact ? 'w-16 h-16' : 'w-20 h-20'}
                  `}
                >
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-os-text-secondary-dark" />
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => onRemove(attachment.id)}
                  className="
                    absolute -top-1.5 -right-1.5 p-1
                    bg-os-surface-dark border border-os-border-dark rounded-full
                    text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark
                    opacity-0 group-hover:opacity-100 transition-opacity
                    shadow-lg
                  "
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* File name tooltip on hover */}
                <div className="
                  absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity
                ">
                  <p className="text-[10px] text-white truncate text-center">
                    {attachment.file.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface DragOverlayProps {
  isDragging: boolean;
}

export function DragOverlay({ isDragging }: DragOverlayProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            absolute inset-0 z-10
            bg-brand-aperol/10 border-2 border-dashed border-brand-aperol
            rounded-xl flex items-center justify-center
            pointer-events-none
          "
        >
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-brand-aperol mx-auto mb-2" />
            <p className="text-sm text-brand-aperol font-medium">Drop images here</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
