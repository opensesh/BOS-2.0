'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, BookOpen, PenTool, Check, ArrowRight } from 'lucide-react';

export type BrainSection = 'architecture' | 'guidelines' | 'writing';

interface BrainSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSection?: BrainSection;
}

interface UploadedFile {
  id: string;
  name: string;
  type: 'guidelines' | 'writing';
  status: 'uploading' | 'complete';
}

type SelectedOption = 'guidelines' | 'writing' | null;

export function BrainSettingsModal({ isOpen, onClose, defaultSection }: BrainSettingsModalProps) {
  const [selectedOption, setSelectedOption] = useState<SelectedOption>('guidelines');
  
  // Set default section when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultSection === 'guidelines' || defaultSection === 'writing') {
        setSelectedOption(defaultSection);
      } else {
        setSelectedOption('guidelines');
      }
    }
  }, [isOpen, defaultSection]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent, type: 'guidelines' | 'writing') => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type,
        status: 'complete',
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'guidelines' | 'writing') => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type,
        status: 'complete',
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });
  }, []);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFilesForType = (type: 'guidelines' | 'writing') => {
    return uploadedFiles.filter(f => f.type === type);
  };

  if (!isOpen) return null;

  const options = [
    {
      id: 'guidelines' as const,
      title: 'Brand Guidelines',
      description: 'Upload your brand identity documentation',
      icon: BookOpen,
    },
    {
      id: 'writing' as const,
      title: 'Writing Styles',
      description: 'Upload your voice and tone guidelines',
      icon: PenTool,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-os-bg-dark border border-os-border-dark rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-os-border-dark bg-os-bg-dark z-10">
          <div>
            <h2 className="text-xl font-display font-bold text-brand-vanilla">
              Brain Settings
            </h2>
            <p className="text-sm text-os-text-secondary-dark">
              Configure your brand knowledge base
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors"
          >
            <X className="w-5 h-5 text-os-text-secondary-dark" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Option Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedOption === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`
                    relative p-4 rounded-xl border text-left transition-all cursor-pointer
                    ${isSelected
                      ? 'bg-brand-aperol/10 border-brand-aperol'
                      : 'bg-os-surface-dark/50 border-os-border-dark hover:border-os-text-secondary-dark'
                    }
                  `}
                >
                  {/* Selected Checkmark */}
                  {isSelected && (
                    <span className="absolute top-2 right-2 p-1 bg-brand-aperol rounded-full">
                      <Check className="w-3 h-3 text-brand-charcoal" />
                    </span>
                  )}
                  
                  <div className="p-2 rounded-lg bg-brand-aperol/10 w-fit mb-3">
                    <Icon className="w-5 h-5 text-brand-aperol" />
                  </div>
                  <h3 className="font-display font-medium text-brand-vanilla mb-1">
                    {option.title}
                  </h3>
                  <p className="text-xs text-os-text-secondary-dark">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Upload Section - Shows when Guidelines or Writing Styles selected */}
          {selectedOption && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-aperol" />
                <h3 className="text-lg font-display font-medium text-brand-vanilla">
                  Upload {selectedOption === 'guidelines' ? 'Brand Guidelines' : 'Writing Styles'}
                </h3>
              </div>
              
              <p className="text-sm text-os-text-secondary-dark">
                {selectedOption === 'guidelines' 
                  ? 'We recommend uploading your brand guidelines as a PPTX or PDF file.'
                  : 'Upload your writing style guides as PPTX, PDF, or DOCX files.'
                }
              </p>
              
              {/* Drop Zone */}
              <div
                onDrop={(e) => handleDrop(e, selectedOption)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer p-8
                  ${isDragging 
                    ? 'border-brand-aperol bg-brand-aperol/10' 
                    : 'border-os-border-dark hover:border-os-text-secondary-dark hover:bg-os-surface-dark/30'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedOption === 'guidelines' ? '.pptx,.pdf' : '.pptx,.pdf,.docx'}
                  multiple
                  onChange={(e) => handleFileSelect(e, selectedOption)}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className={`p-3 rounded-full transition-colors ${
                    isDragging ? 'bg-brand-aperol/20' : 'bg-os-surface-dark'
                  }`}>
                    <Upload className={`w-6 h-6 ${
                      isDragging ? 'text-brand-aperol' : 'text-os-text-secondary-dark'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-vanilla">
                      Drop files here or click to upload
                    </p>
                    <p className="text-xs text-os-text-secondary-dark mt-1">
                      {selectedOption === 'guidelines' 
                        ? 'PPTX, PDF up to 50MB'
                        : 'PPTX, PDF, DOCX up to 50MB'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              {getFilesForType(selectedOption).length > 0 && (
                <div className="space-y-2">
                  {getFilesForType(selectedOption).map(file => (
                    <div 
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-os-surface-dark/50 border border-os-border-dark"
                    >
                      <FileText className="w-5 h-5 text-brand-aperol" />
                      <span className="flex-1 text-sm text-brand-vanilla truncate">
                        {file.name}
                      </span>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 rounded hover:bg-os-border-dark/50 transition-colors"
                      >
                        <X className="w-4 h-4 text-os-text-secondary-dark" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-os-border-dark bg-os-bg-dark">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-os-text-secondary-dark hover:text-brand-vanilla transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-brand-vanilla text-brand-charcoal rounded-lg hover:bg-brand-vanilla/90 transition-colors"
          >
            Continue to Interview
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
