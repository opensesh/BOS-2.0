'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { BrandHubLayout } from '@/components/brand-hub/BrandHubLayout';
import { RefreshCw, Download, ChevronDown, Monitor, Globe } from 'lucide-react';

type FontFormat = 'desktop' | 'web';

interface TypographyStyle {
  name: string;
  value: string;
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  lineHeight: string;
}

interface TypographySection {
  id: string;
  label: string;
  styles: TypographyStyle[];
  defaultText: string;
  fontClass: string;
  fontPath: string;
}

const typographySections: TypographySection[] = [
  {
    id: 'display',
    label: 'Display',
    fontClass: 'font-display',
    fontPath: 'neue-haas-grotesk display',
    defaultText: 'Brand OS™',
    styles: [
      { name: 'Display 1', value: 'display-1', fontSize: '72px', fontWeight: '700', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.1' },
      { name: 'Display 2', value: 'display-2', fontSize: '56px', fontWeight: '700', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.1' },
      { name: 'Display 3', value: 'display-3', fontSize: '48px', fontWeight: '700', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.1' },
    ],
  },
  {
    id: 'heading',
    label: 'Heading',
    fontClass: 'font-display',
    fontPath: 'neue-haas-grotesk display',
    defaultText: 'We aspire to be creative problem solvers',
    styles: [
      { name: 'Heading 1', value: 'heading-1', fontSize: '40px', fontWeight: '700', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.2' },
      { name: 'Heading 2', value: 'heading-2', fontSize: '32px', fontWeight: '700', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.2' },
      { name: 'Heading 3', value: 'heading-3', fontSize: '24px', fontWeight: '600', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.3' },
      { name: 'Heading 4', value: 'heading-4', fontSize: '20px', fontWeight: '600', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.3' },
    ],
  },
  {
    id: 'accent',
    label: 'Accent',
    fontClass: 'font-mono',
    fontPath: 'offbit',
    defaultText: 'Born to Create, Made to Make',
    styles: [
      { name: 'Heading 5', value: 'heading-5', fontSize: '18px', fontWeight: '700', fontFamily: 'OffBit', lineHeight: '1.4' },
      { name: 'Heading 6', value: 'heading-6', fontSize: '14px', fontWeight: '700', fontFamily: 'OffBit', lineHeight: '1.4' },
    ],
  },
  {
    id: 'text',
    label: 'Text',
    fontClass: 'font-sans',
    fontPath: 'neue-haas-grotesk text',
    defaultText: 'Figma serves as the core design system that integrates essential brand elements. It\'s filled with a rich base of variables for global and semantic tokens that can be translated into multiple styling options.',
    styles: [
      { name: 'Body 1', value: 'body-1', fontSize: '18px', fontWeight: '400', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.6' },
      { name: 'Body 2', value: 'body-2', fontSize: '16px', fontWeight: '400', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.6' },
      { name: 'Body 3', value: 'body-3', fontSize: '14px', fontWeight: '400', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.5' },
      { name: 'Caption', value: 'caption', fontSize: '12px', fontWeight: '400', fontFamily: 'Neue Haas Grotesk Display Pro', lineHeight: '1.5' },
    ],
  },
];

function TypographyCard({ 
  section, 
  onRegisterReset 
}: { 
  section: TypographySection;
  onRegisterReset?: (resetFn: () => void) => void;
}) {
  const [selectedStyle, setSelectedStyle] = useState(section.styles[0]);
  const [text, setText] = useState(section.defaultText);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FontFormat>('desktop');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to hug content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text, selectedStyle]);

  const resetText = () => {
    setText(section.defaultText);
    setSelectedStyle(section.styles[0]);
  };

  // Register reset function with parent (only run once on mount)
  useEffect(() => {
    onRegisterReset?.(resetText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadAll = () => {
    // Create download info for the entire font family
    const formatLabel = selectedFormat === 'desktop' ? 'Desktop (TTF/OTF)' : 'Web (WOFF2)';
    const fontInfo = `
Font Family: ${section.styles[0].fontFamily}
Section: ${section.label}
Format: ${formatLabel}
Path: /assets/fonts/${section.fontPath}/${selectedFormat === 'desktop' ? 'Desktop' : 'Web'}

Included Styles:
${section.styles.map(s => `- ${s.name} (${s.fontWeight})`).join('\n')}

Note: In production, this would download a ZIP file containing all ${selectedFormat} font files for the ${section.label} family.
    `.trim();

    const blob = new Blob([fontInfo], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${section.id}-fonts-${selectedFormat}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="rounded-brand-lg border border-os-border-dark bg-os-surface-dark/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 sm:px-10 py-6 sm:py-8 border-b border-os-border-dark">
        {/* Left side - Section Label & Reset */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <span className="text-base sm:text-lg font-display font-medium text-brand-vanilla">
            {section.label}
          </span>
          <button
            onClick={resetText}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-os-bg-dark border border-os-border-dark hover:border-brand-aperol/50 transition-colors text-xs sm:text-sm text-os-text-secondary-dark"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Right side - Style Selector, Format Toggle, Download */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Style Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-os-bg-dark border border-os-border-dark hover:border-brand-aperol/50 transition-colors text-xs sm:text-sm text-os-text-secondary-dark"
            >
              {selectedStyle.name}
              <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-36 sm:w-40 rounded-xl bg-os-surface-dark border border-os-border-dark shadow-xl z-10 overflow-hidden">
                {section.styles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => {
                      setSelectedStyle(style);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm transition-colors ${
                      style.value === selectedStyle.value
                        ? 'bg-brand-aperol/20 text-brand-aperol'
                        : 'text-os-text-secondary-dark hover:bg-os-border-dark/50'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Format Toggle - Desktop/Web */}
          <div className="flex items-center rounded-full bg-os-bg-dark border border-os-border-dark p-0.5 sm:p-1">
            <button
              onClick={() => setSelectedFormat('desktop')}
              className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-colors ${
                selectedFormat === 'desktop'
                  ? 'bg-brand-aperol text-brand-vanilla'
                  : 'text-os-text-secondary-dark hover:text-brand-vanilla'
              }`}
              title="Desktop fonts (TTF/OTF)"
            >
              <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden lg:inline">Desktop</span>
            </button>
            <button
              onClick={() => setSelectedFormat('web')}
              className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-colors ${
                selectedFormat === 'web'
                  ? 'bg-brand-aperol text-brand-vanilla'
                  : 'text-os-text-secondary-dark hover:text-brand-vanilla'
              }`}
              title="Web fonts (WOFF2)"
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden lg:inline">Web</span>
            </button>
          </div>

          {/* Download All Button */}
          <button
            onClick={handleDownloadAll}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-os-bg-dark border border-os-border-dark hover:border-brand-aperol hover:bg-brand-aperol/10 transition-colors text-os-text-secondary-dark hover:text-brand-aperol"
            title={`Download all ${section.label} fonts (${selectedFormat === 'desktop' ? 'TTF/OTF' : 'WOFF2'})`}
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Text Preview */}
      <div className="p-4">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`
            w-full bg-os-bg-dark/50 border border-os-border-dark 
            outline-none resize-none rounded-brand-lg
            text-brand-vanilla ${section.fontClass}
            placeholder:text-os-text-secondary-dark
            px-4 py-4 overflow-hidden
          `}
          style={{
            fontSize: selectedStyle.fontSize,
            fontWeight: selectedStyle.fontWeight,
            lineHeight: selectedStyle.lineHeight,
          }}
          placeholder="Type to preview..."
        />
      </div>

      {/* Style Info */}
      <div className="px-10 pb-8">
        <div className="flex flex-wrap gap-4 text-xs text-os-text-secondary-dark font-mono">
          <span>Family: {selectedStyle.fontFamily}</span>
          <span>Size: {selectedStyle.fontSize}</span>
          <span>Weight: {selectedStyle.fontWeight}</span>
          <span>Line Height: {selectedStyle.lineHeight}</span>
        </div>
      </div>
    </div>
  );
}

export default function FontsPage() {
  const [cardRefs, setCardRefs] = useState<Record<string, (() => void) | null>>({});

  const resetAllSections = () => {
    Object.values(cardRefs).forEach((reset) => reset?.());
  };

  const handleDownloadAll = () => {
    // Create comprehensive font download info
    const fontInfo = `
BRAND OS™ Typography System
============================

This package contains all font families used in the Brand OS design system.

FONT FAMILIES INCLUDED:
-----------------------

1. NEUE HAAS GROTESK DISPLAY PRO
   Location: /assets/fonts/neue-haas-grotesk display/
   Formats: Desktop (TTF), Web (WOFF2)
   Weights: 75 Bold, 65 Medium
   Usage: Display text, headings (H1-H4)

2. NEUE HAAS GROTESK TEXT PRO
   Location: /assets/fonts/neue-haas-grotesk text/
   Formats: Desktop (OTF), Web (WOFF2)
   Weights: 55 Roman, 65 Medium
   Usage: Body copy, paragraphs, captions

3. OFFBIT
   Location: /assets/fonts/offbit/
   Formats: Desktop (TTF), Web (WOFF2)
   Weights: 101 Bold, Regular
   Usage: Accent text, subheadings (H5-H6), code

USAGE NOTES:
------------
- Display fonts are for large text (40px+)
- Text fonts are for body copy (12-18px)
- OffBit should be used sparingly (max 2 instances per viewport)
- Minimum 2 size steps between hierarchy levels

Note: In production, this would download a ZIP file containing all font files.
    `.trim();

    const blob = new Blob([fontInfo], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand-os-typography-system.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <BrandHubLayout
        title="Typography"
        description="Our type system uses Neue Haas Grotesk for display and body text, paired with OffBit for accent and monospace needs."
      >
        {/* Header with Reset All & Download All */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-os-text-secondary-dark">
              {typographySections.length} font families
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-surface-dark border border-os-border-dark hover:border-brand-aperol/50 transition-colors text-xs text-os-text-secondary-dark"
            >
              <Download className="w-3.5 h-3.5" />
              Download All
            </button>
            <button
              onClick={resetAllSections}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-surface-dark border border-os-border-dark hover:border-brand-aperol/50 transition-colors text-xs text-os-text-secondary-dark"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {typographySections.map((section) => (
            <TypographyCard
              key={section.id}
              section={section}
              onRegisterReset={(resetFn) => {
                setCardRefs((prev) => ({ ...prev, [section.id]: resetFn }));
              }}
            />
          ))}
        </div>
      </BrandHubLayout>
    </div>
  );
}
