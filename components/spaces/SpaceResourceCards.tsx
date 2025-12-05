'use client';

import React from 'react';
import {
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileImage,
  FileCode,
  FileArchive,
  File,
  X,
  Scroll,
  Folder,
} from 'lucide-react';
import type { SpaceFile, SpaceLink, SpaceTask } from '@/types';

interface SpaceResourceCardsProps {
  files?: SpaceFile[];
  links?: SpaceLink[];
  instructions?: string;
  tasks?: SpaceTask[];
  onRemoveFile?: (fileId: string) => void;
  onRemoveLink?: (linkId: string) => void;
  onToggleTask?: (taskId: string) => void;
  onRemoveTask?: (taskId: string) => void;
  isReadOnly?: boolean;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return FileImage;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  if (type.includes('zip') || type.includes('archive')) return FileArchive;
  if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return FileCode;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
};

export function SpaceResourceCards({
  files = [],
  links = [],
  instructions,
  tasks = [],
  onRemoveFile,
  onRemoveLink,
  onToggleTask,
  onRemoveTask,
  isReadOnly = false,
}: SpaceResourceCardsProps) {
  const hasContent =
    files.length > 0 || links.length > 0 || (instructions && instructions.trim()) || tasks.length > 0;

  if (!hasContent) return null;

  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <Folder className="w-4 h-4 text-os-text-secondary-dark" />
        <h3 className="text-sm font-medium text-os-text-secondary-dark uppercase tracking-wide">
          Resources
        </h3>
        <div className="flex-1 h-px bg-os-border-dark/50" />
      </div>

      {/* Resource Cards Container */}
      <div className="bg-os-surface-dark/30 rounded-xl border border-os-border-dark/50 p-4 space-y-4">
        {/* Files Section */}
        {files.length > 0 && (
          <div>
            <p className="text-xs text-os-text-secondary-dark mb-3 font-medium">Files</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map((file) => {
                const IconComponent = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="group relative flex items-center gap-3 p-3 rounded-lg bg-os-bg-dark border border-os-border-dark/50 hover:border-os-border-dark transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-os-surface-dark flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-os-text-secondary-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-os-text-primary-dark truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-os-text-secondary-dark">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    {!isReadOnly && onRemoveFile && (
                      <button
                        onClick={() => onRemoveFile(file.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-os-surface-dark text-os-text-secondary-dark hover:text-red-400 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Links Section */}
        {links.length > 0 && (
          <div>
            <p className="text-xs text-os-text-secondary-dark mb-3 font-medium">Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 p-3 rounded-lg bg-os-bg-dark border border-os-border-dark/50 hover:border-brand-aperol/30 transition-all"
                >
                  {/* Favicon or icon */}
                  <div className="w-10 h-10 rounded-lg bg-os-surface-dark flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {getFaviconUrl(link.url) ? (
                      <img
                        src={getFaviconUrl(link.url)}
                        alt=""
                        className="w-5 h-5"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <LinkIcon className={`w-5 h-5 text-os-text-secondary-dark ${getFaviconUrl(link.url) ? 'hidden' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-os-text-primary-dark truncate group-hover:text-brand-aperol transition-colors">
                      {link.title || getDomainFromUrl(link.url)}
                    </p>
                    <p className="text-xs text-os-text-secondary-dark truncate">
                      {getDomainFromUrl(link.url)}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors flex-shrink-0" />
                  {!isReadOnly && onRemoveLink && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveLink(link.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-os-surface-dark text-os-text-secondary-dark hover:text-red-400 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Instructions Section */}
        {instructions && instructions.trim() && (
          <div>
            <p className="text-xs text-os-text-secondary-dark mb-3 font-medium">Custom Instructions</p>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-os-bg-dark border border-os-border-dark/50">
              <div className="w-10 h-10 rounded-lg bg-brand-aperol/10 flex items-center justify-center flex-shrink-0">
                <Scroll className="w-5 h-5 text-brand-aperol" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-os-text-primary-dark whitespace-pre-wrap line-clamp-4">
                  {instructions}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Section */}
        {tasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-os-text-secondary-dark font-medium">Tasks</p>
              <span className="text-xs text-os-text-secondary-dark">
                {completedTasks}/{tasks.length} completed
              </span>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`
                    group relative flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${
                      task.completed
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-os-bg-dark border-os-border-dark/50 hover:border-os-border-dark'
                    }
                  `}
                >
                  <button
                    onClick={() => onToggleTask?.(task.id)}
                    disabled={isReadOnly || !onToggleTask}
                    className={`flex-shrink-0 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        task.completed
                          ? 'text-os-text-secondary-dark line-through'
                          : 'text-os-text-primary-dark'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-os-text-secondary-dark mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  {!isReadOnly && onRemoveTask && (
                    <button
                      onClick={() => onRemoveTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-os-surface-dark text-os-text-secondary-dark hover:text-red-400 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
