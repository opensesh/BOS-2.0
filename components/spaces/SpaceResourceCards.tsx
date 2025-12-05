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

  // Compact chip card for files, links, articles
  const ChipCard = ({ 
    icon: Icon, 
    label, 
    sublabel,
    href,
    onClick,
    onRemove,
  }: {
    icon: React.ElementType;
    label: string;
    sublabel?: string;
    href?: string;
    onClick?: () => void;
    onRemove?: () => void;
  }) => {
    const content = (
      <>
        <div className="w-7 h-7 rounded-lg bg-os-border-dark/50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-aperol/20 transition-colors">
          <Icon className="w-3.5 h-3.5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-os-text-primary-dark truncate group-hover:text-brand-aperol transition-colors leading-tight">
            {label}
          </p>
          {sublabel && (
            <p className="text-[10px] text-os-text-secondary-dark truncate leading-tight">
              {sublabel}
            </p>
          )}
        </div>
        {onRemove && !isReadOnly && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-os-text-secondary-dark hover:text-red-400 transition-all flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </>
    );

    const className = "group relative flex items-center gap-2 px-2 py-1.5 rounded-lg bg-os-bg-dark/80 border border-os-border-dark/30 hover:border-brand-aperol/30 transition-all";

    if (href) {
      return (
        <a href={href} target={href.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" className={className}>
          {content}
        </a>
      );
    }

    return (
      <div className={className} onClick={onClick}>
        {content}
      </div>
    );
  };

  return (
    <div className="mb-8">
      {/* Container with distinct background */}
      <div className="bg-os-surface-dark/40 rounded-xl border border-os-border-dark/40 p-4 space-y-4">
        {/* Files */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Upload className="w-3 h-3 text-os-text-secondary-dark/70" />
              <p className="text-[10px] text-os-text-secondary-dark/70 font-medium uppercase tracking-wider">Files</p>
              <span className="text-[10px] text-os-text-secondary-dark/50">{files.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {files.map((file) => {
                const IconComponent = getFileIcon(file.type);
                return (
                  <ChipCard
                    key={file.id}
                    icon={IconComponent}
                    label={file.name}
                    sublabel={formatFileSize(file.size)}
                    onRemove={onRemoveFile ? () => onRemoveFile(file.id) : undefined}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Links */}
        {regularLinks.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <LinkIcon className="w-3 h-3 text-os-text-secondary-dark/70" />
              <p className="text-[10px] text-os-text-secondary-dark/70 font-medium uppercase tracking-wider">Links</p>
              <span className="text-[10px] text-os-text-secondary-dark/50">{regularLinks.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {regularLinks.map((link) => (
                <ChipCard
                  key={link.id}
                  icon={LinkIcon}
                  label={link.title || getDomainFromUrl(link.url)}
                  sublabel={getDomainFromUrl(link.url)}
                  href={link.url}
                  onRemove={onRemoveLink ? () => onRemoveLink(link.id) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Articles */}
        {articleLinks.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Newspaper className="w-3 h-3 text-os-text-secondary-dark/70" />
              <p className="text-[10px] text-os-text-secondary-dark/70 font-medium uppercase tracking-wider">Articles</p>
              <span className="text-[10px] text-os-text-secondary-dark/50">{articleLinks.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {articleLinks.map((link) => (
                <ChipCard
                  key={link.id}
                  icon={Newspaper}
                  label={link.title || 'Article'}
                  sublabel="Discover"
                  href={link.url}
                  onRemove={onRemoveLink ? () => onRemoveLink(link.id) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Instructions - stays as larger card since it has text content */}
        {instructions && instructions.trim() && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="w-3 h-3 text-os-text-secondary-dark/70" />
              <p className="text-[10px] text-os-text-secondary-dark/70 font-medium uppercase tracking-wider">Instructions</p>
            </div>
            <div className="group flex items-start gap-2 px-3 py-2 rounded-lg bg-os-bg-dark/80 border border-os-border-dark/30 hover:border-brand-aperol/30 transition-all">
              <div className="w-7 h-7 rounded-lg bg-os-border-dark/50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-aperol/20 transition-colors mt-0.5">
                <FileText className="w-3.5 h-3.5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
              </div>
              <p className="text-xs text-os-text-primary-dark whitespace-pre-wrap line-clamp-3 flex-1">
                {instructions}
              </p>
            </div>
          </div>
        )}

        {/* Tasks - compact list */}
        {tasks.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ListTodo className="w-3 h-3 text-os-text-secondary-dark/70" />
              <p className="text-[10px] text-os-text-secondary-dark/70 font-medium uppercase tracking-wider">Tasks</p>
              <span className="text-[10px] text-os-text-secondary-dark/50">{completedTasks}/{tasks.length}</span>
            </div>
            <div className="space-y-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all ${
                    task.completed
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-os-bg-dark/80 border-os-border-dark/30 hover:border-brand-aperol/30'
                  }`}
                >
                  <button
                    onClick={() => onToggleTask?.(task.id)}
                    disabled={isReadOnly || !onToggleTask}
                    className={`flex-shrink-0 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-os-text-secondary-dark hover:text-brand-aperol transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${
                      task.completed
                        ? 'text-os-text-secondary-dark line-through'
                        : 'text-os-text-primary-dark'
                    }`}>
                      {task.title}
                    </p>
                  </div>
                  {!isReadOnly && onRemoveTask && (
                    <button
                      onClick={() => onRemoveTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-os-text-secondary-dark hover:text-red-400 transition-all"
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
    </div>
  );
}
