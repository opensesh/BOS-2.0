'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { BrandHubLayout } from '@/components/brand-hub/BrandHubLayout';
import { Copy, Check } from 'lucide-react';

interface ColorData {
  name: string;
  hex: string;
  rgb: string;
  label?: 'Primary' | 'Secondary';
}

const brandColors: ColorData[] = [
  { name: 'Charcoal', hex: '#191919', rgb: 'rgb(25, 25, 25)', label: 'Primary' },
  { name: 'Vanilla', hex: '#FFFAEE', rgb: 'rgb(255, 250, 238)', label: 'Primary' },
  { name: 'Aperol', hex: '#FE5102', rgb: 'rgb(254, 81, 2)', label: 'Secondary' },
];

const monoColors: ColorData[] = [
  { name: 'Black', hex: '#000000', rgb: 'rgb(0, 0, 0)' },
  { name: 'Black-90', hex: '#1E1E1E', rgb: 'rgb(30, 30, 30)' },
  { name: 'Black-80', hex: '#383838', rgb: 'rgb(56, 56, 56)' },
  { name: 'Black-70', hex: '#4A4A4A', rgb: 'rgb(74, 74, 74)' },
  { name: 'Black-60', hex: '#595959', rgb: 'rgb(89, 89, 89)' },
  { name: 'Black-50', hex: '#787878', rgb: 'rgb(120, 120, 120)' },
  { name: 'Black-40', hex: '#A3A3A3', rgb: 'rgb(163, 163, 163)' },
  { name: 'Black-30', hex: '#C7C7C7', rgb: 'rgb(199, 199, 199)' },
  { name: 'Black-20', hex: '#DDDEE2', rgb: 'rgb(221, 222, 226)' },
  { name: 'Black-10', hex: '#F0F0F0', rgb: 'rgb(240, 240, 240)' },
  { name: 'White', hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)' },
];

function CopyButton({ text, label, isLight }: { text: string; label: string; isLight?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const iconColor = isLight 
    ? 'text-brand-charcoal/60 group-hover:text-brand-charcoal' 
    : 'text-brand-vanilla/60 group-hover:text-brand-vanilla';
  const hoverBg = isLight 
    ? 'hover:bg-brand-charcoal/10' 
    : 'hover:bg-brand-vanilla/10';

  return (
    <button
      onClick={handleCopy}
      className={`p-1 rounded-md ${hoverBg} transition-colors group flex-shrink-0`}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <Copy className={`w-3 h-3 ${iconColor}`} />
      )}
    </button>
  );
}

function BrandColorCard({ color }: { color: ColorData }) {
  const isLight = color.name === 'Vanilla' || color.hex === '#FFFAEE';
  const textColor = isLight ? 'text-brand-charcoal' : 'text-brand-vanilla';
  const borderColor = isLight ? 'border-os-border-dark' : 'border-transparent';

  return (
    <div 
      className={`rounded-2xl overflow-hidden border ${borderColor} w-full`}
      style={{ backgroundColor: color.hex }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 ${textColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-display font-medium">{color.name}</span>
          <CopyButton text={color.name} label="color name" isLight={isLight} />
        </div>
        {color.label && (
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            isLight 
              ? 'bg-brand-charcoal/10 text-brand-charcoal' 
              : 'bg-brand-vanilla/10 text-brand-vanilla'
          }`}>
            {color.label}
          </span>
        )}
      </div>

      {/* Color Values */}
      <div className={`px-5 pb-5 pt-16 space-y-2 ${textColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono opacity-80">{color.hex}</span>
          <CopyButton text={color.hex} label={color.hex} isLight={isLight} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono opacity-80">{color.rgb}</span>
          <CopyButton text={color.rgb} label={color.rgb} isLight={isLight} />
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate relative luminance for WCAG contrast
function getLuminance(hex: string): number {
  const rgb = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.slice(1).map((x) => {
    const val = parseInt(x, 16) / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Helper function to calculate contrast ratio
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function MonoColorCard({ color }: { color: ColorData }) {
  // Calculate contrast ratios for both text color options
  const charcoalContrast = getContrastRatio(color.hex, '#191919');
  const vanillaContrast = getContrastRatio(color.hex, '#FFFAEE');
  
  // Choose the text color with better contrast
  const isLight = charcoalContrast > vanillaContrast;
  const textColor = isLight ? 'text-brand-charcoal' : 'text-brand-vanilla';
  const borderColor = isLight ? 'border-os-border-dark/50' : 'border-transparent';
  
  // Use the better contrast ratio for accessibility check
  const contrastRatio = Math.max(charcoalContrast, vanillaContrast);
  const meetsAA = contrastRatio >= 4.5;
  const meetsAALarge = contrastRatio >= 3;

  return (
    <div 
      className={`rounded-xl overflow-hidden border ${borderColor} min-h-[140px] flex flex-col w-full`}
      style={{ backgroundColor: color.hex }}
    >
      {/* Header */}
      <div className={`flex items-center gap-1.5 px-3 py-2.5 ${textColor}`}>
        <span className={`text-xs font-display font-medium truncate flex-1 ${!meetsAA && !meetsAALarge ? 'opacity-60' : ''}`}>
          {color.name}
        </span>
        <CopyButton text={color.name} label="color name" isLight={isLight} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Color Values */}
      <div className={`px-3 pb-2.5 space-y-1 ${textColor}`}>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-mono truncate flex-1 ${!meetsAA && !meetsAALarge ? 'opacity-50' : 'opacity-80'}`}>
            {color.hex}
          </span>
          <CopyButton text={color.hex} label={color.hex} isLight={isLight} />
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-mono truncate flex-1 ${!meetsAA && !meetsAALarge ? 'opacity-50' : 'opacity-80'}`}>
            {color.rgb}
          </span>
          <CopyButton text={color.rgb} label={color.rgb} isLight={isLight} />
        </div>
      </div>
    </div>
  );
}

export default function ColorsPage() {
  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <BrandHubLayout
        title="Color"
        description="Our color palette balances warmth with professionalism. Vanilla and Charcoal form our primary pair, while Aperol adds energy as an accent."
      >
        {/* Brand Colors Section */}
        <section className="mb-12">
          <h2 className="text-xl font-display font-bold text-brand-vanilla mb-6">Brand</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {brandColors.map((color) => (
              <BrandColorCard key={color.name} color={color} />
            ))}
          </div>
        </section>

        {/* Mono Colors Section */}
        <section>
          <h2 className="text-xl font-display font-bold text-brand-vanilla mb-6">Mono</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
            {monoColors.map((color) => (
              <MonoColorCard key={color.name} color={color} />
            ))}
          </div>
        </section>
      </BrandHubLayout>
    </div>
  );
}

