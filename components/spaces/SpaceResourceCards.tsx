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
  Upload,
  Newspaper,
  ListTodo,
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

// Check if a link is an article (internal discover link)
const isArticleLink = (link: SpaceLink): boolean => {
  return link.url.startsWith('/discover/') || !!link.articleId;
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
  
  // Separate article links from regular links
  const articleLinks = links.filter(isArticleLink);
  const regularLinks = links.filter(link => !isArticleLink(link));

  // Common card styles
  const cardBase = "group relative flex items-center gap-3 p-3 rounded-xl border transition-all";
  const cardDefault = "bg-os-bg-dark/50 border-os-border-dark/30 hover:border-brand-aperol/30 hover:bg-os-bg-dark";
  const iconContainerBase = "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors";

  return (
    <div className="mb-8">
      {/* Resource Cards Container */}
      <div className="space-y-4">
        {/* Files Section */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-3.5 h-3.5 text-os-text-secondary-dark" />
              <p className="text-xs text-os-text-secondary-dark font-medium uppercase tracking-wide">Files</p>
              <span className="text-xs text-os-text-secondary-dark/60">{files.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((file) => {
                const IconComponent = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className={`${cardBase} ${cardDefault}`}
                  >
                    <div className={`${iconContainerBase} bg-os-surface-dark group-hover:bg-brand-aperol/10`}>
                      <IconComponent className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-os-text-primary-dark truncate group-hover:text-brand-aperol transition-colors">
                        {file.name}
                      </p>
                      <p className="text-xs text-os-text-secondary-dark">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    {!isReadOnly && onRemoveFile && (
                      <button
                        onClick={() => onRemoveFile(file.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-os-text-secondary-dark hover:text-red-400 transition-all"
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

        {/* Regular Links Section */}
        {regularLinks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="w-3.5 h-3.5 text-os-text-secondary-dark" />
              <p className="text-xs text-os-text-secondary-dark font-medium uppercase tracking-wide">Links</p>
              <span className="text-xs text-os-text-secondary-dark/60">{regularLinks.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {regularLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cardBase} ${cardDefault}`}
                >
                  <div className={`${iconContainerBase} bg-os-surface-dark group-hover:bg-brand-aperol/10`}>
                    <LinkIcon className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
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
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-os-text-secondary-dark hover:text-red-400 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Articles Section (internal discover links) */}
        {articleLinks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="w-3.5 h-3.5 text-os-text-secondary-dark" />
              <p className="text-xs text-os-text-secondary-dark font-medium uppercase tracking-wide">Articles</p>
              <span className="text-xs text-os-text-secondary-dark/60">{articleLinks.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {articleLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  className={`${cardBase} ${cardDefault}`}
                >
                  <div className={`${iconContainerBase} bg-os-surface-dark group-hover:bg-brand-aperol/10`}>
                    <Newspaper className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-os-text-primary-dark truncate group-hover:text-brand-aperol transition-colors">
                      {link.title || 'Article'}
                    </p>
                    {link.description && (
                      <p className="text-xs text-os-text-secondary-dark truncate">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors flex-shrink-0" />
                  {!isReadOnly && onRemoveLink && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveLink(link.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-os-text-secondary-dark hover:text-red-400 transition-all"
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
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-3.5 h-3.5 text-os-text-secondary-dark" />
              <p className="text-xs text-os-text-secondary-dark font-medium uppercase tracking-wide">Custom Instructions</p>
            </div>
            <div className={`${cardBase} ${cardDefault} items-start`}>
              <div className={`${iconContainerBase} bg-os-surface-dark group-hover:bg-brand-aperol/10`}>
                <FileText className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
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
            <div className="flex items-center gap-2 mb-3">
              <ListTodo className="w-3.5 h-3.5 text-os-text-secondary-dark" />
              <p className="text-xs text-os-text-secondary-dark font-medium uppercase tracking-wide">Tasks</p>
              <span className="text-xs text-os-text-secondary-dark/60">
                {completedTasks}/{tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`${cardBase} ${
                    task.completed
                      ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                      : cardDefault
                  }`}
                >
                  <div className={`${iconContainerBase} ${
                    task.completed 
                      ? 'bg-green-500/10' 
                      : 'bg-os-surface-dark group-hover:bg-brand-aperol/10'
                  }`}>
                    <button
                      onClick={() => onToggleTask?.(task.id)}
                      disabled={isReadOnly || !onToggleTask}
                      className={`${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        task.completed
                          ? 'text-os-text-secondary-dark line-through'
                          : 'text-os-text-primary-dark group-hover:text-brand-aperol transition-colors'
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
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-os-text-secondary-dark hover:text-red-400 transition-all"
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
