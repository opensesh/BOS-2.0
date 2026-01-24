'use client';

import React, { useState, useCallback } from 'react';
import { Download, Copy, Check } from 'lucide-react';

interface MarkdownCodeViewerProps {
  filename: string;
  content: string;
  className?: string;
  maxLines?: number;
}

export function MarkdownCodeViewer({ filename, content, className = '', maxLines = 22 }: MarkdownCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const lines = content.split('\n');
  // Calculate max height based on line height (approx 24px per line)
  const maxHeight = maxLines * 24;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, filename]);

  return (
    <div className={`rounded-xl overflow-hidden bg-brand-charcoal border border-os-border-dark ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-os-surface-dark/50 border-b border-os-border-dark">
        <span className="text-sm font-sans text-os-text-secondary-dark">
          {filename}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-os-border-dark/50 transition-colors group"
            title="Download"
          >
            <Download className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-os-border-dark/50 transition-colors group"
            title={copied ? 'Copied!' : 'Copy'}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div 
        className="overflow-auto custom-scrollbar"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div className="p-4 font-sans text-sm">
          {lines.map((line, index) => (
            <div key={index} className="flex leading-6">
              <span className="w-10 flex-shrink-0 text-right pr-4 text-os-text-secondary-dark/50 select-none">
                {index + 1}
              </span>
              <span className="text-brand-vanilla/90 whitespace-pre-wrap break-words">
                {renderMarkdownLine(line)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple syntax highlighting for markdown
function renderMarkdownLine(line: string): React.ReactNode {
  // Headers
  if (line.startsWith('# ')) {
    return <span className="text-brand-aperol font-bold">{line}</span>;
  }
  if (line.startsWith('## ')) {
    return <span className="text-brand-aperol font-semibold">{line}</span>;
  }
  if (line.startsWith('### ') || line.startsWith('#### ')) {
    return <span className="text-brand-aperol">{line}</span>;
  }
  
  // Code blocks
  if (line.startsWith('```')) {
    return <span className="text-green-400">{line}</span>;
  }
  
  // List items
  if (line.match(/^[-*]\s/)) {
    return <span className="text-brand-vanilla/90">{line}</span>;
  }
  
  // Numbered lists
  if (line.match(/^\d+\.\s/)) {
    return <span className="text-brand-vanilla/90">{line}</span>;
  }
  
  // Table rows
  if (line.includes('|')) {
    return <span className="text-blue-300">{line}</span>;
  }
  
  // Bold text - highlight **text**
  if (line.includes('**')) {
    return <span className="text-brand-vanilla/90">{line}</span>;
  }
  
  // Links
  if (line.includes('[') && line.includes('](')) {
    return <span className="text-cyan-400">{line}</span>;
  }
  
  // Comments/blockquotes
  if (line.startsWith('>')) {
    return <span className="text-os-text-secondary-dark italic">{line}</span>;
  }
  
  // Directory structure
  if (line.includes('├──') || line.includes('└──') || line.includes('│')) {
    return <span className="text-yellow-300">{line}</span>;
  }
  
  return line || ' ';
}

