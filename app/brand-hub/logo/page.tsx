'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import JSZip from 'jszip';
import { Sidebar } from '@/components/Sidebar';
import { BrandHubLayout } from '@/components/brand-hub/BrandHubLayout';
import { RefreshCw, Download, Palette, ChevronDown } from 'lucide-react';

type ColorVariant = 'vanilla' | 'glass' | 'charcoal';
type DownloadFormat = 'svg' | 'png';

interface LogoVariant {
  id: string;
  name: string;
  vanillaPath: string;
  glassPath: string;
  charcoalPath?: string;
}

const mainLogos: LogoVariant[] = [
  {
    id: 'brandmark',
    name: 'Brandmark',
    vanillaPath: '/assets/logos/brandmark-vanilla.svg',
    glassPath: '/assets/logos/brandmark-glass.svg',
    charcoalPath: '/assets/logos/brandmark-charcoal.svg',
  },
  {
    id: 'combo',
    name: 'Combo',
    vanillaPath: '/assets/logos/logo_main_combo_vanilla.svg',
    glassPath: '/assets/logos/logo_main_combo_glass.svg',
    charcoalPath: '/assets/logos/logo_main_combo_charcoal.svg',
  },
  {
    id: 'stacked',
    name: 'Stacked',
    vanillaPath: '/assets/logos/stacked-vanilla.svg',
    glassPath: '/assets/logos/stacked-glass.svg',
    charcoalPath: '/assets/logos/stacked-charcoal.svg',
  },
  {
    id: 'horizontal',
    name: 'Horizontal',
    vanillaPath: '/assets/logos/horizontal-vanilla.svg',
    glassPath: '/assets/logos/horizontal-glass.svg',
    charcoalPath: '/assets/logos/horizontal-charcoal.svg',
  },
];

const accessoryLogos: LogoVariant[] = [
  {
    id: 'core',
    name: 'Core',
    vanillaPath: '/assets/logos/core.svg',
    glassPath: '/assets/logos/core-glass.svg',
    charcoalPath: '/assets/logos/core-charcoal.svg',
  },
  {
    id: 'outline',
    name: 'Outline',
    vanillaPath: '/assets/logos/outline.svg',
    glassPath: '/assets/logos/outline-glass.svg',
    charcoalPath: '/assets/logos/outline-charcoal.svg',
  },
  {
    id: 'filled',
    name: 'Filled',
    vanillaPath: '/assets/logos/filled.svg',
    glassPath: '/assets/logos/filled-glass.svg',
    charcoalPath: '/assets/logos/filled-charcoal.svg',
  },
];

const colorOptions: { value: ColorVariant; label: string }[] = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'glass', label: 'Glass' },
  { value: 'charcoal', label: 'Charcoal' },
];

const formatOptions: { value: DownloadFormat; label: string }[] = [
  { value: 'svg', label: 'SVG' },
  { value: 'png', label: 'PNG' },
];

function Dropdown({ 
  options, 
  value, 
  onChange, 
  icon: Icon,
  hideLabel = false,
}: { 
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  hideLabel?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-os-surface-dark hover:bg-os-surface-dark/80 transition-colors text-[11px] border border-os-border-dark/30 shadow-sm"
        aria-label={hideLabel ? (Icon === Download ? 'Download logo' : 'Select option') : undefined}
      >
        {Icon && <Icon className="w-3 h-3 text-brand-vanilla/70" />}
        {!hideLabel && selectedOption && (
          <span className="text-brand-vanilla font-medium font-display">{selectedOption.label}</span>
        )}
        <ChevronDown className={`w-2.5 h-2.5 text-brand-vanilla/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-24 rounded bg-os-surface-dark border border-os-border-dark shadow-xl z-30 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-2 py-1.5 text-left text-[11px] transition-colors ${
                option.value === value
                  ? 'bg-brand-aperol/20 text-brand-aperol font-medium'
                  : 'text-brand-vanilla hover:bg-os-border-dark/20'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LogoCard({ 
  logo, 
  colorVariant, 
  onColorChange,
}: { 
  logo: LogoVariant; 
  colorVariant: ColorVariant;
  onColorChange: (color: ColorVariant) => void;
}) {
  const getImagePath = () => {
    if (colorVariant === 'charcoal') {
      return logo.charcoalPath || logo.vanillaPath;
    }
    return colorVariant === 'vanilla' ? logo.vanillaPath : logo.glassPath;
  };
  
  const imagePath = getImagePath();
  
  // Determine background based on color variant for better contrast
  // Charcoal logos are dark, so they go on light (vanilla) background
  // Vanilla/glass logos are light, so they go on dark (charcoal) background
  const bgClass = colorVariant === 'charcoal' 
    ? 'bg-brand-vanilla'  // Charcoal logo on vanilla background
    : 'bg-brand-charcoal'; // Vanilla/glass logos on charcoal background
  
  const handleDownload = async (format: DownloadFormat) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      if (format === 'png') {
        // Convert SVG to PNG using canvas
        const img = new window.Image();
        const svgUrl = URL.createObjectURL(blob);
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 2; // 2x resolution for better quality
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((pngBlob) => {
              if (pngBlob) {
                const url = URL.createObjectURL(pngBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${logo.id}-${colorVariant}.png`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }
            }, 'image/png');
          }
          URL.revokeObjectURL(svgUrl);
        };
        img.src = svgUrl;
      } else {
        // Download as SVG
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${logo.id}-${colorVariant}.svg`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Scale customization based on logo ID
  const isWideOrStacked = ['combo', 'stacked', 'horizontal'].includes(logo.id);
  const imageSizeClass = isWideOrStacked 
    ? "max-w-[85%] max-h-[85%]" // Bigger for combo/stacked/horizontal
    : "max-w-[70%] max-h-[70%]"; // Default for others

  return (
    <div 
      className="group relative rounded-xl overflow-hidden border border-os-border-dark transition-all duration-300 hover:border-brand-vanilla bg-os-surface-dark"
      role="article"
      aria-label={`${logo.name} logo - ${colorVariant} variant`}
    >
      {/* Header Row with Logo Name and Controls */}
      <div className="bg-brand-charcoal px-3 py-2 rounded-t-xl border-b border-os-border-dark/30 flex items-center justify-between">
        {/* Logo Name Label */}
        <span className="text-[11px] font-medium text-brand-vanilla font-display">{logo.name}</span>
        
        {/* Controls */}
        <div className="flex gap-1.5 items-center">
          <Dropdown
            options={colorOptions}
            value={colorVariant}
            onChange={(v) => onColorChange(v as ColorVariant)}
            icon={Palette}
            hideLabel={true}
          />
          <Dropdown
            options={formatOptions}
            value=""
            onChange={(v) => handleDownload(v as DownloadFormat)}
            icon={Download}
            hideLabel={true}
          />
        </div>
      </div>
      
      {/* Logo Preview - Square aspect ratio */}
      <div className={`aspect-square ${bgClass} relative flex items-center justify-center p-3`}>
        <Image
          src={imagePath}
          alt={`${logo.name} logo in ${colorVariant} variant`}
          width={100}
          height={100}
          className={`object-contain ${imageSizeClass}`}
        />
      </div>
    </div>
  );
}

export default function LogoPage() {
  const [mainColors, setMainColors] = useState<Record<string, ColorVariant>>({
    brandmark: 'vanilla',
    combo: 'vanilla',
    stacked: 'vanilla',
    horizontal: 'vanilla',
  });

  const [accessoryColors, setAccessoryColors] = useState<Record<string, ColorVariant>>({
    core: 'vanilla',
    outline: 'vanilla',
    filled: 'vanilla',
  });

  const resetAllColors = () => {
    setMainColors({
      brandmark: 'vanilla',
      combo: 'vanilla',
      stacked: 'vanilla',
      horizontal: 'vanilla',
    });
    setAccessoryColors({
      core: 'vanilla',
      outline: 'vanilla',
      filled: 'vanilla',
    });
  };

  const setMainColor = (id: string, color: ColorVariant) => {
    setMainColors(prev => ({
      ...prev,
      [id]: color,
    }));
  };

  const setAccessoryColor = (id: string, color: ColorVariant) => {
    setAccessoryColors(prev => ({
      ...prev,
      [id]: color,
    }));
  };

  // Combine all logos into one array for a unified grid
  const allLogos = [...mainLogos, ...accessoryLogos];
  const allColors = { ...mainColors, ...accessoryColors };
  const setColor = (id: string, color: ColorVariant) => {
    if (mainColors[id] !== undefined) {
      setMainColor(id, color);
    } else {
      setAccessoryColor(id, color);
    }
  };

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <BrandHubLayout
        title="Logo"
        description="Our logo system includes multiple lockups for different contexts. Click any logo to download."
      >
        {/* Header with Reset & Download All */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-os-text-secondary-dark">
              {allLogos.length} logo variants
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  const zip = new JSZip();
                  
                  // Create an array of promises to fetch all images
                  const promises = allLogos.map(async (logo) => {
                    const colorVariant = allColors[logo.id];
                    let imagePath: string;
                    if (colorVariant === 'charcoal') {
                      imagePath = logo.charcoalPath || logo.vanillaPath;
                    } else {
                      imagePath = colorVariant === 'vanilla' ? logo.vanillaPath : logo.glassPath;
                    }
                    
                    try {
                      const response = await fetch(imagePath);
                      const blob = await response.blob();
                      zip.file(`${logo.id}-${colorVariant}.svg`, blob);
                    } catch (error) {
                      console.error(`Failed to download ${logo.name}:`, error);
                    }
                  });

                  // Wait for all fetches to complete
                  await Promise.all(promises);

                  // Generate and download the zip file
                  const content = await zip.generateAsync({ type: "blob" });
                  const url = URL.createObjectURL(content);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = "brand-logos.zip";
                  document.body.appendChild(a);
                  a.click();
                  URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error) {
                  console.error('Failed to create zip file:', error);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-surface-dark border border-os-border-dark hover:border-brand-aperol/50 transition-colors text-xs text-os-text-secondary-dark"
            >
              <Download className="w-3.5 h-3.5" />
              Download All
            </button>
            <button
              onClick={resetAllColors}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-os-surface-dark border border-os-border-dark hover:border-brand-aperol/50 transition-colors text-xs text-os-text-secondary-dark"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>
        </div>

        {/* Main Logos Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-os-text-primary-dark mb-4 font-display">
            Main Logos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {mainLogos.map((logo) => (
              <LogoCard
                key={logo.id}
                logo={logo}
                colorVariant={mainColors[logo.id]}
                onColorChange={(color) => setMainColor(logo.id, color)}
              />
            ))}
          </div>
        </div>

        {/* Accessory Logos Section */}
        <div>
          <h2 className="text-sm font-medium text-os-text-primary-dark mb-4 font-display">
            Accessory Logos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {accessoryLogos.map((logo) => (
              <LogoCard
                key={logo.id}
                logo={logo}
                colorVariant={accessoryColors[logo.id]}
                onColorChange={(color) => setAccessoryColor(logo.id, color)}
              />
            ))}
          </div>
        </div>
      </BrandHubLayout>
    </div>
  );
}
