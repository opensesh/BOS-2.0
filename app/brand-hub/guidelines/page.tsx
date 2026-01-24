'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { BrandHubLayout } from '@/components/brand-hub/BrandHubLayout';
import { ArrowUpRight, ExternalLink, Figma, Upload, FileText, Presentation, X, CheckCircle2, AlertCircle } from 'lucide-react';

const FIGMA_EMBED_URL = 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2Ft6ibLjzJFXY6HzU0bIahxw%2FBRAND-OS%3Fpage-id%3D19939%253A21956%26node-id%3D20255-18337%26viewport%3D465%252C-92%252C0.05%26t%3DFjx1co9Q53DPCGLw-1%26scaling%3Dscale-down%26content-scaling%3Dfixed%26starting-point-node-id%3D20255%253A18337';

const FIGMA_SOURCE_URL = 'https://www.figma.com/proto/t6ibLjzJFXY6HzU0bIahxw/BRAND-OS?page-id=19939%3A21956&node-id=20255-18337&viewport=465%2C-92%2C0.05&t=Fjx1co9Q53DPCGLw-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=20255%3A18337';

interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'pptx' | 'ppt';
  size: number;
  status: 'uploading' | 'complete' | 'error';
  progress: number;
}

export default function GuidelinesPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileType = (fileName: string): 'pdf' | 'pptx' | 'ppt' | null => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'pptx') return 'pptx';
    if (ext === 'ppt') return 'ppt';
    return null;
  };

  const simulateUpload = (file: UploadedFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, progress: 100, status: 'complete' } : f)
        );
      } else {
        setUploadedFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, progress } : f)
        );
      }
    }, 200);
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const fileType = getFileType(file.name);
      if (!fileType) return;

      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: fileType,
        size: file.size,
        status: 'uploading',
        progress: 0,
      };

      setUploadedFiles(prev => [...prev, newFile]);
      simulateUpload(newFile);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const FileIcon = ({ type }: { type: 'pdf' | 'pptx' | 'ppt' }) => {
    if (type === 'pdf') {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    return <Presentation className="w-5 h-5 text-orange-400" />;
  };

  // Upload Section Component to avoid duplication
  const UploadSection = ({ className = '' }: { className?: string }) => (
    <div className={`pt-6 space-y-4 ${className}`}>
      <h3 className="text-lg font-display font-medium text-brand-vanilla">
        Upload Brand Guidelines
      </h3>
      <p className="text-sm text-os-text-secondary-dark">
        Add PDFs or PowerPoints to expand your brand knowledge base.
      </p>
      
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer p-6 ${
          isDragging 
            ? 'border-brand-aperol bg-brand-aperol/10' 
            : 'border-os-border-dark hover:border-os-text-secondary-dark hover:bg-os-surface-dark/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.ppt,.pptx"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
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
              PDF, PPT, PPTX up to 50MB
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map(file => (
            <div 
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-os-surface-dark/50 border border-os-border-dark"
            >
              <FileIcon type={file.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-vanilla truncate">
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-os-text-secondary-dark">
                    {formatFileSize(file.size)}
                  </span>
                  {file.status === 'uploading' && (
                    <div className="flex-1 h-1 bg-os-border-dark rounded-full overflow-hidden max-w-[100px]">
                      <div 
                        className="h-full bg-brand-aperol transition-all duration-200 rounded-full"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              {file.status === 'complete' && (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              )}
              {file.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="p-1 rounded hover:bg-os-border-dark/50 transition-colors"
              >
                <X className="w-4 h-4 text-os-text-secondary-dark" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <BrandHubLayout
        title="Guidelines"
        description="Welcome to Open Session. Here you can find all of our brand guidelines. Covering everything from messaging to art direction and even AI guidance."
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Info */}
          <div className="lg:w-1/3 space-y-6">
            <a
              href={FIGMA_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-vanilla text-brand-charcoal font-medium hover:bg-brand-vanilla/90 transition-colors group"
            >
              Source
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <div className="pt-4 space-y-4">
              <h3 className="text-lg font-display font-medium text-brand-vanilla">
                What&apos;s Inside
              </h3>
              <ul className="space-y-3 text-os-text-secondary-dark">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-aperol mt-2 shrink-0" />
                  <span>Brand Identity & Visual Language</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-aperol mt-2 shrink-0" />
                  <span>Messaging Framework & Voice</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-aperol mt-2 shrink-0" />
                  <span>Art Direction Guidelines</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-aperol mt-2 shrink-0" />
                  <span>AI & Claude Integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-aperol mt-2 shrink-0" />
                  <span>Design System Documentation</span>
                </li>
              </ul>
            </div>

            {/* Upload Section - Desktop only (hidden on mobile/tablet, shown on lg+) */}
            <UploadSection className="hidden lg:block" />
          </div>

          {/* Right Column - Figma Embed */}
          <div className="lg:w-2/3">
            <div className="relative rounded-2xl overflow-hidden bg-brand-charcoal border border-os-border-dark">
              {/* Figma Embed Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-os-border-dark bg-os-surface-dark/50">
                <div className="flex items-center gap-3">
                  <Figma className="w-5 h-5 text-os-text-secondary-dark" />
                  <span className="text-sm text-os-text-secondary-dark">OS Design System</span>
                </div>
                <a
                  href={FIGMA_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-os-border-dark/50 transition-colors"
                  title="Open in Figma"
                >
                  <ExternalLink className="w-4 h-4 text-os-text-secondary-dark" />
                </a>
              </div>

              {/* Figma Iframe */}
              <div className="relative aspect-[4/3] w-full">
                <iframe
                  src={FIGMA_EMBED_URL}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  title="Brand Guidelines - Figma Prototype"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-os-border-dark bg-os-surface-dark/50">
                <span className="text-xs text-os-text-secondary-dark">
                  Interactive prototype - click to navigate
                </span>
                <span className="text-xs text-os-text-secondary-dark">
                  Edited recently
                </span>
              </div>
            </div>

            {/* Upload Section - Mobile/Tablet only (shown on mobile/tablet, hidden on lg+) */}
            <UploadSection className="lg:hidden mt-8" />
          </div>
        </div>
      </BrandHubLayout>
    </div>
  );
}
