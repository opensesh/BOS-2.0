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
    <div className="space-y-4 mb-6">
      {/* Files */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => {
            const IconComponent = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-os-surface-dark/50 border border-os-border-dark/50 hover:border-os-border-dark transition-colors"
              >
                <IconComponent className="w-4 h-4 text-os-text-secondary-dark" />
                <span className="text-sm text-os-text-primary-dark max-w-[120px] truncate">
                  {file.name}
                </span>
                <span className="text-xs text-os-text-secondary-dark">
                  {formatFileSize(file.size)}
                </span>
                {!isReadOnly && onRemoveFile && (
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-red-400 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-os-surface-dark/50 border border-os-border-dark/50 hover:border-brand-aperol/30 transition-colors"
            >
              <LinkIcon className="w-4 h-4 text-os-text-secondary-dark" />
              <span className="text-sm text-os-text-primary-dark max-w-[150px] truncate">
                {link.title || getDomainFromUrl(link.url)}
              </span>
              <ExternalLink className="w-3 h-3 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
              {!isReadOnly && onRemoveLink && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveLink(link.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-red-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </a>
          ))}
        </div>
      )}

      {/* Instructions */}
      {instructions && instructions.trim() && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-os-surface-dark/50 border border-os-border-dark/50">
          <Scroll className="w-4 h-4 text-brand-aperol mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-os-text-secondary-dark mb-1">Custom Instructions</p>
            <p className="text-sm text-os-text-primary-dark line-clamp-2">{instructions}</p>
          </div>
        </div>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-os-text-secondary-dark">
            Tasks ({completedTasks}/{tasks.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`
                  group flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
                  ${
                    task.completed
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-os-surface-dark/50 border-os-border-dark/50 hover:border-os-border-dark'
                  }
                `}
              >
                <button
                  onClick={() => onToggleTask?.(task.id)}
                  disabled={isReadOnly || !onToggleTask}
                  className={`flex-shrink-0 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-os-text-secondary-dark" />
                  )}
                </button>
                <span
                  className={`text-sm max-w-[150px] truncate ${
                    task.completed
                      ? 'text-os-text-secondary-dark line-through'
                      : 'text-os-text-primary-dark'
                  }`}
                >
                  {task.title}
                </span>
                {!isReadOnly && onRemoveTask && (
                  <button
                    onClick={() => onRemoveTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-os-bg-darker text-os-text-secondary-dark hover:text-red-400 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
