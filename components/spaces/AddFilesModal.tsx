'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Upload, X, File, FileText, Image, FileCode } from 'lucide-react';
import { SpaceFile } from '@/types';

interface AddFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFile: (file: Omit<SpaceFile, 'id' | 'addedAt'>) => void;
  existingFiles?: SpaceFile[];
  onRemoveFile?: (fileId: string) => void;
}

// Helper to get file icon based on type
function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  if (type.includes('code') || type.includes('javascript') || type.includes('typescript')) return FileCode;
  return File;
}

export function AddFilesModal({
  isOpen,
  onClose,
  onAddFile,
  existingFiles = [],
  onRemoveFile,
}: AddFilesModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<Omit<SpaceFile, 'id' | 'addedAt'>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Focus drop zone when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dropZoneRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if we're leaving the drop zone (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
    // Reset input so same file can be selected again
    if (e.target) e.target.value = '';
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    pendingFiles.forEach((file) => {
      onAddFile(file);
    });
    setPendingFiles([]);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleClose = () => {
    setPendingFiles([]);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Files" size="md">
      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        tabIndex={0}
        role="button"
        aria-label="Drop files here or click to browse"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className={`
          border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-brand-aperol/50
          ${isDragging 
            ? 'border-brand-aperol bg-brand-aperol/10 scale-[1.02]' 
            : 'border-os-border-dark hover:border-os-text-secondary-dark hover:bg-os-surface-dark/50'
          }
        `}
      >
        <Upload className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-brand-aperol' : 'text-os-text-secondary-dark'}`} />
        <p className="text-sm text-os-text-primary-dark mb-1 text-center">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-os-text-secondary-dark text-center">
          PDF, DOC, TXT, images, and more
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Pending files */}
      {pendingFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-os-text-primary-dark mb-2">
            Files to add ({pendingFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {pendingFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-os-border-dark/80 border border-brand-aperol/30"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileIcon className="w-4 h-4 text-brand-aperol flex-shrink-0" />
                    <span className="text-sm text-os-text-primary-dark truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-os-text-secondary-dark flex-shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="p-1.5 rounded-lg hover:bg-os-surface-dark text-os-text-secondary-dark hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Existing files */}
      {existingFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-os-text-primary-dark mb-2">
            Existing files ({existingFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {existingFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-os-surface-dark hover:bg-os-surface-dark/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileIcon className="w-4 h-4 text-os-text-secondary-dark flex-shrink-0" />
                    <span className="text-sm text-os-text-primary-dark truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-os-text-secondary-dark flex-shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  {onRemoveFile && (
                    <button
                      type="button"
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1.5 rounded-lg hover:bg-os-border-dark text-os-text-secondary-dark hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {existingFiles.length === 0 && pendingFiles.length === 0 && (
        <div className="mt-4 p-4 rounded-xl bg-os-surface-dark/50 text-center">
          <p className="text-sm text-os-text-secondary-dark">
            Upload files to provide context for conversations in this space.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-os-border-dark">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-aperol/50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={pendingFiles.length === 0}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-aperol/50"
        >
          Add {pendingFiles.length > 0 ? `${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''}` : 'files'}
        </button>
      </div>
    </Modal>
  );
}


