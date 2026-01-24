'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { BrandHubLayout } from '@/components/brand-hub/BrandHubLayout';
import { 
  Download, 
  Copy, 
  Check, 
  Palette, 
  Type, 
  Square, 
  Sparkles,
  FileJson,
  FileCode,
  FileText,
  FolderOpen
} from 'lucide-react';

// Color tokens data
const brandColors = [
  { name: 'Charcoal', variable: '--brand-charcoal', tailwind: 'brand-charcoal', value: '#191919', description: 'Primary text, dark backgrounds' },
  { name: 'Vanilla', variable: '--brand-vanilla', tailwind: 'brand-vanilla', value: '#FFFAEE', description: 'Primary backgrounds, light surfaces' },
  { name: 'Aperol', variable: '--brand-aperol', tailwind: 'brand-aperol', value: '#FE5102', description: 'Accent (max 10% usage)' },
];

const osColors = [
  { name: 'BG Darker', variable: '--os-bg-darker', tailwind: 'os-bg-darker', value: '#0C0C0C', description: 'Deepest background' },
  { name: 'BG Dark', variable: '--os-bg-dark', tailwind: 'os-bg-dark', value: '#141414', description: 'Primary dark background' },
  { name: 'Surface Dark', variable: '--os-surface-dark', tailwind: 'os-surface-dark', value: '#1C1C1C', description: 'Elevated surfaces' },
  { name: 'Border Dark', variable: '--os-border-dark', tailwind: 'os-border-dark', value: '#2C2C2C', description: 'Borders and dividers' },
  { name: 'Text Primary', variable: '--os-text-primary-dark', tailwind: 'os-text-primary-dark', value: '#E8E8E8', description: 'Primary text on dark' },
  { name: 'Text Secondary', variable: '--os-text-secondary-dark', tailwind: 'os-text-secondary-dark', value: '#9CA3AF', description: 'Muted text on dark' },
];

// Typography tokens
const typographyTokens = [
  { name: 'Display', variable: '--font-display', tailwind: 'font-display', value: 'Neue Haas Grotesk Display Pro', usage: 'Headings H1-H4' },
  { name: 'Sans', variable: '--font-sans', tailwind: 'font-sans', value: 'Neue Haas Grotesk Display Pro', usage: 'Body text' },
  { name: 'Mono/Accent', variable: '--font-mono', tailwind: 'font-mono', value: 'Offbit', usage: 'H5-H6 (max 2/viewport)' },
];

// Radius tokens
const radiusTokens = [
  { name: 'Brand', variable: '--radius-brand', tailwind: 'rounded-brand', value: '12px' },
  { name: 'Brand Large', variable: '--radius-brand-lg', tailwind: 'rounded-brand-lg', value: '16px' },
];

// Shadow tokens
const shadowTokens = [
  { name: 'Brand', variable: '--shadow-brand', tailwind: 'shadow-brand', value: '0 2px 8px rgba(0,0,0,0.1)' },
  { name: 'Brand Large', variable: '--shadow-brand-lg', tailwind: 'shadow-brand-lg', value: '0 4px 16px rgba(0,0,0,0.15)' },
];

// File list for the styles folder
const styleFiles = [
  { name: 'tokens.json', icon: FileJson, description: 'Machine-readable design tokens' },
  { name: 'tailwind.config.ts', icon: FileCode, description: 'Standalone Tailwind config' },
  { name: 'brand.css', icon: FileCode, description: 'CSS variables and base styles' },
  { name: 'fonts/', icon: FolderOpen, description: '5 font files (woff2)' },
  { name: 'README.md', icon: FileText, description: 'Usage documentation' },
  { name: 'AI-CONTEXT.md', icon: FileText, description: 'AI tool context' },
];

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-os-border-dark/50 transition-colors group"
      title={`Copy ${label || text}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-os-text-secondary-dark group-hover:text-brand-vanilla" />
      )}
    </button>
  );
}

function ColorSwatch({ color }: { color: typeof brandColors[0] }) {
  const isLight = color.value === '#FFFAEE' || color.value === '#E8E8E8';
  
  return (
    <div className="group flex items-center gap-4 p-3 rounded-xl bg-os-surface-dark/50 border border-os-border-dark hover:border-os-text-secondary-dark/30 transition-colors">
      <div 
        className="w-12 h-12 rounded-lg border border-os-border-dark flex-shrink-0"
        style={{ backgroundColor: color.value }}
      >
        {isLight && <div className="w-full h-full rounded-lg border border-black/10" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-brand-vanilla">{color.name}</span>
          <code className="text-xs text-os-text-secondary-dark bg-os-bg-dark px-1.5 py-0.5 rounded">
            {color.value}
          </code>
        </div>
        <p className="text-xs text-os-text-secondary-dark mt-0.5 truncate">{color.description}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={color.value} label="hex" />
        <CopyButton text={`var(${color.variable})`} label="CSS var" />
        <CopyButton text={color.tailwind} label="Tailwind" />
      </div>
    </div>
  );
}

function TypographySample({ token }: { token: typeof typographyTokens[0] }) {
  const fontClass = token.tailwind === 'font-mono' ? 'font-mono' : 'font-display';
  
  return (
    <div className="group p-4 rounded-xl bg-os-surface-dark/50 border border-os-border-dark hover:border-os-text-secondary-dark/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-medium text-brand-vanilla">{token.name}</span>
          <p className="text-xs text-os-text-secondary-dark mt-0.5">{token.usage}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={`var(${token.variable})`} label="CSS var" />
          <CopyButton text={token.tailwind} label="Tailwind" />
        </div>
      </div>
      <p className={`${fontClass} text-2xl text-brand-vanilla`}>
        {token.value}
      </p>
    </div>
  );
}

function TokenRow({ name, variable, tailwind, value }: { name: string; variable: string; tailwind: string; value: string }) {
  return (
    <div className="group flex items-center justify-between py-2 px-3 rounded-lg hover:bg-os-surface-dark/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-sm text-brand-vanilla">{name}</span>
        <code className="text-xs text-os-text-secondary-dark bg-os-bg-dark px-1.5 py-0.5 rounded">{value}</code>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={`var(${variable})`} label="CSS var" />
        <CopyButton text={tailwind} label="Tailwind" />
      </div>
    </div>
  );
}

export default function DesignTokensPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      // Create a list of files to fetch
      const files = [
        { path: '/styles/tokens.json', name: 'tokens.json' },
        { path: '/styles/tailwind.config.ts', name: 'tailwind.config.ts' },
        { path: '/styles/brand.css', name: 'brand.css' },
        { path: '/styles/README.md', name: 'README.md' },
        { path: '/styles/AI-CONTEXT.md', name: 'AI-CONTEXT.md' },
        { path: '/styles/fonts/NeueHaasDisplayBold.woff2', name: 'fonts/NeueHaasDisplayBold.woff2' },
        { path: '/styles/fonts/NeueHaasDisplayMedium.woff2', name: 'fonts/NeueHaasDisplayMedium.woff2' },
        { path: '/styles/fonts/NeueHaasDisplayRoman.woff2', name: 'fonts/NeueHaasDisplayRoman.woff2' },
        { path: '/styles/fonts/OffBit-Bold.woff2', name: 'fonts/OffBit-Bold.woff2' },
        { path: '/styles/fonts/OffBit-Regular.woff2', name: 'fonts/OffBit-Regular.woff2' },
      ];

      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Fetch and add each file
      for (const file of files) {
        try {
          const response = await fetch(file.path);
          if (response.ok) {
            const content = file.path.endsWith('.woff2') 
              ? await response.arrayBuffer()
              : await response.text();
            zip.file(file.name, content);
          }
        } catch (err) {
          console.warn(`Failed to fetch ${file.path}:`, err);
        }
      }

      // Generate and download zip
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'brand-os-styles.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open the styles folder in a new tab
      window.open('/styles/', '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <BrandHubLayout
        title="Tokens"
        description="Portable design system package with all brand tokens, styles, and configuration. Download for use in any project or with AI tools."
      >
        <div className="space-y-10">
          {/* Download Section */}
          <section className="p-6 rounded-2xl bg-gradient-to-br from-os-surface-dark to-os-bg-dark border border-os-border-dark">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-display font-semibold text-brand-vanilla mb-2">
                  Download Styles Package
                </h2>
                <p className="text-sm text-os-text-secondary-dark max-w-lg">
                  Get the complete portable styles folder with Tailwind config, CSS variables, 
                  design tokens, fonts, and AI context documentation.
                </p>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-aperol text-white font-medium hover:bg-brand-aperol/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Preparing...' : 'Download ZIP'}
              </button>
            </div>
            
            {/* File List */}
            <div className="mt-6 pt-6 border-t border-os-border-dark">
              <h3 className="text-sm font-medium text-os-text-secondary-dark mb-3">Package Contents</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {styleFiles.map((file) => {
                  const Icon = file.icon;
                  return (
                    <div key={file.name} className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4 text-os-text-secondary-dark" />
                      <span className="text-brand-vanilla">{file.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Colors Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-brand-aperol" />
              <h2 className="text-xl font-display font-semibold text-brand-vanilla">Colors</h2>
            </div>
            
            <div className="space-y-6">
              {/* Brand Colors */}
              <div>
                <h3 className="text-sm font-medium text-os-text-secondary-dark mb-3">Brand Colors</h3>
                <div className="space-y-2">
                  {brandColors.map((color) => (
                    <ColorSwatch key={color.name} color={color} />
                  ))}
                </div>
              </div>
              
              {/* OS Palette */}
              <div>
                <h3 className="text-sm font-medium text-os-text-secondary-dark mb-3">OS Dark Theme Palette</h3>
                <div className="space-y-2">
                  {osColors.map((color) => (
                    <ColorSwatch key={color.name} color={color} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-brand-aperol" />
              <h2 className="text-xl font-display font-semibold text-brand-vanilla">Typography</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {typographyTokens.map((token) => (
                <TypographySample key={token.name} token={token} />
              ))}
            </div>
          </section>

          {/* Radius & Shadows Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Border Radius */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Square className="w-5 h-5 text-brand-aperol" />
                <h2 className="text-xl font-display font-semibold text-brand-vanilla">Border Radius</h2>
              </div>
              <div className="p-4 rounded-xl bg-os-surface-dark/50 border border-os-border-dark space-y-1">
                {radiusTokens.map((token) => (
                  <TokenRow key={token.name} {...token} />
                ))}
              </div>
            </div>

            {/* Shadows */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-aperol" />
                <h2 className="text-xl font-display font-semibold text-brand-vanilla">Shadows</h2>
              </div>
              <div className="p-4 rounded-xl bg-os-surface-dark/50 border border-os-border-dark space-y-1">
                {shadowTokens.map((token) => (
                  <TokenRow key={token.name} {...token} />
                ))}
              </div>
            </div>
          </section>

          {/* Usage Tips */}
          <section className="p-6 rounded-2xl bg-os-surface-dark/30 border border-os-border-dark">
            <h2 className="text-lg font-display font-semibold text-brand-vanilla mb-4">
              Quick Usage Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-medium text-brand-vanilla mb-2">CSS Variables</h3>
                <pre className="p-3 rounded-lg bg-os-bg-dark text-os-text-secondary-dark overflow-x-auto">
{`color: var(--brand-charcoal);
background: var(--brand-vanilla);
border-radius: var(--radius-brand);`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium text-brand-vanilla mb-2">Tailwind Classes</h3>
                <pre className="p-3 rounded-lg bg-os-bg-dark text-os-text-secondary-dark overflow-x-auto">
{`<div class="bg-brand-vanilla text-brand-charcoal">
<button class="bg-brand-aperol rounded-brand">
<p class="font-display text-os-text-primary-dark">`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </BrandHubLayout>
    </div>
  );
}







