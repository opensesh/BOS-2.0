'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageTransition, MotionItem } from '@/lib/motion';

interface BrandHubLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
}

export function BrandHubLayout({
  children,
  title,
  description,
  showBackButton = true
}: BrandHubLayoutProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-os-bg-dark pt-14 lg:pt-0">
      <PageTransition className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
        {/* Back Button */}
        {showBackButton && (
          <MotionItem className="mb-8">
            <Link
              href="/brand-hub"
              className="group inline-flex items-center gap-2 text-os-text-secondary-dark hover:text-brand-aperol transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Brand Hub</span>
            </Link>
          </MotionItem>
        )}

        {/* Page Header */}
        <MotionItem className="flex flex-col gap-2 mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
              {description}
            </p>
          )}
        </MotionItem>

        {/* Content */}
        <MotionItem>
          {children}
        </MotionItem>
      </PageTransition>
    </div>
  );
}
