'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Hexagon,
  Palette,
  Type,
  BookOpen,
  Camera,
  Fingerprint,
  MessageSquare,
  PenTool,
  MessageCircle,
  Layers,
  Shapes,
  Image as ImageIcon,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

// Map icon names to components
const ICON_MAP: Record<string, LucideIcon> = {
  Hexagon,
  Palette,
  Type,
  BookOpen,
  Camera,
  Fingerprint,
  MessageSquare,
  PenTool,
  MessageCircle,
  Layers,
  Shapes,
  Image: ImageIcon,
};

export interface BrandResourceCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  thumbnail?: string;
}

export function BrandResourceCard({
  title,
  description,
  href,
  icon,
  thumbnail,
}: BrandResourceCardProps) {
  const IconComponent = ICON_MAP[icon] || Hexagon;

  return (
    <Link
      href={href}
      className="
        group relative
        flex items-center gap-4
        p-4 rounded-lg
        border border-os-border-dark
        bg-os-surface-dark/50
        hover:bg-os-surface-dark hover:border-brand-aperol
        transition-all duration-200
        cursor-pointer
      "
    >
      {/* Thumbnail or Icon */}
      <div className="flex-shrink-0">
        {thumbnail ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-os-border-dark flex items-center justify-center">
            <Image
              src={thumbnail}
              alt={title}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-brand-aperol/10 rounded-lg flex items-center justify-center group-hover:bg-brand-aperol/20 transition-colors">
            <IconComponent className="w-6 h-6 text-brand-aperol" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-brand-vanilla group-hover:text-brand-aperol transition-colors">
          {title}
        </h4>
        <p className="text-xs text-os-text-secondary-dark mt-0.5 line-clamp-1">
          {description}
        </p>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4 text-brand-aperol" />
      </div>
    </Link>
  );
}

// Container for multiple resource cards
export interface BrandResourceCardsProps {
  cards: BrandResourceCardProps[];
}

export function BrandResourceCards({ cards }: BrandResourceCardsProps) {
  if (cards.length === 0) return null;

  return (
    <div className="mt-6 space-y-2">
      <p className="text-xs text-os-text-secondary-dark uppercase tracking-wider font-medium mb-3">
        Related Resources
      </p>
      <div className="grid gap-2">
        {cards.map((card, idx) => (
          <BrandResourceCard key={`${card.href}-${idx}`} {...card} />
        ))}
      </div>
    </div>
  );
}
