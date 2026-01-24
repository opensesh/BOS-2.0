'use client';

import React from 'react';
import Link from 'next/link';
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
  ExternalLink,
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
  href,
  icon,
}: BrandResourceCardProps) {
  const IconComponent = ICON_MAP[icon] || Hexagon;

  return (
    <Link
      href={href}
      className="
        group inline-flex items-center gap-1.5
        px-3 py-1.5
        rounded-full
        bg-brand-aperol/10 hover:bg-brand-aperol/20
        border border-brand-aperol/20 hover:border-brand-aperol/40
        transition-colors
      "
    >
      <IconComponent className="w-3.5 h-3.5 text-brand-aperol flex-shrink-0" />
      <span className="text-xs text-brand-aperol font-medium whitespace-nowrap">
        {title}
      </span>
      <ExternalLink className="w-3 h-3 text-brand-aperol/60 group-hover:text-brand-aperol transition-colors flex-shrink-0" />
    </Link>
  );
}

// Container for multiple resource cards - pill-style layout that wraps
export interface BrandResourceCardsProps {
  cards: BrandResourceCardProps[];
}

export function BrandResourceCards({ cards }: BrandResourceCardsProps) {
  if (cards.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-xs text-os-text-secondary-dark uppercase tracking-wider font-medium mb-3">
        Related Resources
      </p>
      <div className="flex flex-wrap gap-2">
        {cards.map((card, idx) => (
          <BrandResourceCard key={`${card.href}-${idx}`} {...card} />
        ))}
      </div>
    </div>
  );
}
