'use client';

import React from 'react';
import Link from 'next/link';
import { X, Globe, ExternalLink, Hexagon, ArrowRight } from 'lucide-react';
import { SourceInfo } from './AnswerView';
import { BrandResourceCardProps } from './BrandResourceCard';

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: SourceInfo[];
  resourceCards?: BrandResourceCardProps[];
}

export function SourcesDrawer({ isOpen, onClose, sources, resourceCards = [] }: SourcesDrawerProps) {
  if (!isOpen) return null;

  const totalCount = sources.length + resourceCards.length;
  const hasExternalSources = sources.length > 0;
  const hasBrandResources = resourceCards.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[400px] max-w-[90vw] bg-os-bg-darker border-l border-os-border-dark z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-os-border-dark">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-os-text-secondary-dark" />
            <h2 className="text-[15px] font-semibold text-os-text-primary-dark">
              {totalCount} {totalCount === 1 ? 'source' : 'sources'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-surface-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto">
          {/* Brand Resources Section */}
          {hasBrandResources && (
            <div className="border-b border-os-border-dark/50">
              <div className="px-5 py-3 bg-brand-aperol/5">
                <div className="flex items-center gap-2">
                  <Hexagon className="w-4 h-4 text-brand-aperol" />
                  <span className="text-xs font-semibold text-brand-aperol uppercase tracking-wider">
                    Brand Resources
                  </span>
                </div>
              </div>
              <div className="divide-y divide-os-border-dark/50">
                {resourceCards.map((card, idx) => (
                  <Link
                    key={`brand-${idx}`}
                    href={card.href}
                    onClick={onClose}
                    className="block px-5 py-4 hover:bg-os-surface-dark/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-6 h-6 rounded-full bg-brand-aperol/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Hexagon className="w-3.5 h-3.5 text-brand-aperol" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-medium text-os-text-primary-dark group-hover:text-brand-aperol transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-[13px] text-os-text-secondary-dark mt-0.5">
                          {card.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="w-4 h-4 text-brand-aperol opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* External Sources Section */}
          {hasExternalSources && (
            <div>
              {hasBrandResources && (
                <div className="px-5 py-3 bg-os-surface-dark/30">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-os-text-secondary-dark" />
                    <span className="text-xs font-semibold text-os-text-secondary-dark uppercase tracking-wider">
                      Web Sources
                    </span>
                  </div>
                </div>
              )}
              <div className="divide-y divide-os-border-dark/50">
                {sources.map((source, idx) => (
                  <a
                    key={source.id || idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-5 py-4 hover:bg-os-surface-dark/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Favicon */}
                      <div className="w-6 h-6 rounded-full bg-os-surface-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                        {source.favicon ? (
                          <img
                            src={source.favicon}
                            alt=""
                            className="w-4 h-4 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-os-text-secondary-dark" />
                        )}
                        <Globe className="w-3.5 h-3.5 text-os-text-secondary-dark hidden" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Source name */}
                        <p className="text-xs text-os-text-secondary-dark mb-0.5">
                          {source.name}
                        </p>

                        {/* Title */}
                        <h3 className="text-[14px] font-medium text-os-text-primary-dark group-hover:text-brand-vanilla transition-colors line-clamp-2">
                          {source.title || source.name}
                        </h3>

                        {/* Snippet */}
                        {source.snippet && (
                          <p className="text-[13px] text-os-text-secondary-dark mt-1 line-clamp-2">
                            {source.snippet}
                          </p>
                        )}
                      </div>

                      {/* External link icon */}
                      <ExternalLink className="w-4 h-4 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

