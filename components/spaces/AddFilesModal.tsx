'use client';

import { useState, useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Upload, X, File } from 'lucide-react';
import { SpaceFile } from '@/types';

interface AddFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFile: (file: Omit<SpaceFile, 'id' | 'addedAt'>) => void;
  existingFiles?: SpaceFile[];
  onRemoveFile?: (fileId: string) => void;
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Files" size="md">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-colors
          ${isDragging 
            ? 'border-brand-aperol bg-brand-aperol/10' 
            : 'border-os-border-dark hover:border-os-text-secondary-dark'
          }
        `}
      >
        <Upload className="w-10 h-10 text-os-text-secondary-dark mb-3" />
        <p className="text-sm text-os-text-primary-dark mb-1">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-os-text-secondary-dark">
          PDF, DOC, TXT, and more
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Pending files */}
      {pendingFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-os-text-primary-dark mb-2">
            Files to add ({pendingFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pendingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-os-border-dark"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <File className="w-4 h-4 text-os-text-secondary-dark flex-shrink-0" />
                  <span className="text-sm text-os-text-primary-dark truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-os-text-secondary-dark flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  onClick={() => removePendingFile(index)}
                  className="p-1 rounded hover:bg-os-surface-dark text-os-text-secondary-dark hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing files */}
      {existingFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-os-text-primary-dark mb-2">
            Existing files ({existingFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded-lg bg-os-surface-dark"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <File className="w-4 h-4 text-os-text-secondary-dark flex-shrink-0" />
                  <span className="text-sm text-os-text-primary-dark truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-os-text-secondary-dark flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                {onRemoveFile && (
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1 rounded hover:bg-os-border-dark text-os-text-secondary-dark hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-os-border-dark">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={pendingFiles.length === 0}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add {pendingFiles.length > 0 ? `${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''}` : 'files'}
        </button>
      </div>
    </Modal>
  );
}


