'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface Attachment {
  id: string;
  file: File;
  preview: string; // Base64 data URL for preview
  type: 'image';
}

interface UseAttachmentsOptions {
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
}

interface UseAttachmentsReturn {
  attachments: Attachment[];
  isDragging: boolean;
  error: string | null;
  addFiles: (files: FileList | File[]) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  clearError: () => void;
  handlePaste: (e: React.ClipboardEvent | ClipboardEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
}

const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function useAttachments(options: UseAttachmentsOptions = {}): UseAttachmentsReturn {
  const {
    maxFiles = DEFAULT_MAX_FILES,
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
    acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  } = options;

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type "${file.type}" is not supported. Please use: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }
    if (file.size > maxSizeBytes) {
      const maxMB = Math.round(maxSizeBytes / 1024 / 1024);
      return `File "${file.name}" is too large. Maximum size is ${maxMB}MB.`;
    }
    return null;
  }, [acceptedTypes, maxSizeBytes]);

  // Convert file to base64 data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Add files
  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const currentCount = attachments.length;
    const availableSlots = maxFiles - currentCount;

    if (availableSlots <= 0) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const filesToAdd = fileArray.slice(0, availableSlots);
    const newAttachments: Attachment[] = [];

    for (const file of filesToAdd) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      try {
        const preview = await fileToDataUrl(file);
        newAttachments.push({
          id: generateId(),
          file,
          preview,
          type: 'image',
        });
      } catch (err) {
        setError(`Failed to process file "${file.name}"`);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
      setError(null);
    }
  }, [attachments.length, maxFiles, validateFile]);

  // Remove attachment
  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  // Clear all attachments
  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle paste event
  const handlePaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      addFiles(imageFiles);
    }
  }, [addFiles]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle drag enter
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;

    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;

    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Filter for image files
      const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        addFiles(imageFiles);
      } else {
        setError('Please drop image files only');
      }
    }
  }, [addFiles]);

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    attachments,
    isDragging,
    error,
    addFiles,
    removeAttachment,
    clearAttachments,
    clearError,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    fileInputRef,
    openFilePicker,
  };
}
