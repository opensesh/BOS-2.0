'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronDown, 
  Play,
  Circle,
  Orbit,
  Grid3X3,
  Cloud,
  Stars,
  Wind,
  Palette
} from 'lucide-react';
import { useInspoStore, ViewMode } from '@/lib/stores/inspo-store';
import { cn } from '@/lib/utils';

// Preset configuration with icons and labels
const PRESETS: { id: ViewMode; label: string; icon: typeof Circle }[] = [
  { id: 'galaxy', label: 'Galaxy', icon: Orbit },
  { id: 'sphere', label: 'Sphere', icon: Circle },
  { id: 'nebula', label: 'Nebula', icon: Cloud },
  { id: 'starfield', label: 'Starfield', icon: Stars },
  { id: 'vortex', label: 'Vortex', icon: Wind },
  { id: 'grid', label: 'Grid', icon: Grid3X3 },
];

// Accordion section component
function AccordionSection({ 
  title, 
  defaultOpen = false,
  children 
}: { 
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-os-border-dark last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-brand-vanilla hover:bg-os-bg-dark/50 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-os-text-secondary-dark transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Slider component
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-os-text-secondary-dark">{label}</span>
        <span className="text-brand-vanilla font-mono">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-os-border-dark rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-brand-aperol
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-brand-aperol
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}

// Toggle component
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors">
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-10 h-5 rounded-full transition-colors duration-200",
          checked ? "bg-brand-aperol" : "bg-os-border-dark"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200",
            checked && "translate-x-5"
          )}
        />
      </button>
    </label>
  );
}

// Color picker component
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-os-text-secondary-dark">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-os-border-dark bg-transparent
              [&::-webkit-color-swatch-wrapper]:p-0
              [&::-webkit-color-swatch]:rounded-lg
              [&::-webkit-color-swatch]:border-none"
          />
        </div>
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
              onChange(val);
            }
          }}
          className="flex-1 px-3 py-2 text-xs font-mono bg-os-bg-dark border border-os-border-dark rounded-lg text-brand-vanilla focus:outline-none focus:border-brand-aperol/50"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
}

export default function ControlPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Store values
  const isPanelOpen = useInspoStore((state) => state.isPanelOpen);
  const setPanelOpen = useInspoStore((state) => state.setPanelOpen);
  const viewMode = useInspoStore((state) => state.viewMode);
  const setViewMode = useInspoStore((state) => state.setViewMode);
  const isTransitioning = useInspoStore((state) => state.isTransitioning);
  const { particleCount, particleSize, animationSpeed, autoPlay } = useInspoStore(
    (state) => state.particleSettings
  );
  const { innerColor, outerColor } = useInspoStore((state) => state.colorSettings);
  const setParticleCount = useInspoStore((state) => state.setParticleCount);
  const setParticleSize = useInspoStore((state) => state.setParticleSize);
  const setAnimationSpeed = useInspoStore((state) => state.setAnimationSpeed);
  const setAutoPlay = useInspoStore((state) => state.setAutoPlay);
  const setInnerColor = useInspoStore((state) => state.setInnerColor);
  const setOuterColor = useInspoStore((state) => state.setOuterColor);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, setPanelOpen]);

  // Close on outside click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setPanelOpen(false);
    }
  }, [setPanelOpen]);

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop - below mobile header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-14 lg:top-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Drawer Panel - below mobile header on mobile/tablet, full height on desktop */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-14 lg:top-0 right-0 bottom-0 z-50 w-full max-w-[320px] bg-os-surface-dark border-l border-os-border-dark shadow-2xl flex flex-col"
          >
            {/* Header - h-12 on desktop to match Sidebar header */}
            <div className="flex items-center justify-between px-4 h-14 lg:h-12 border-b border-os-border-dark shrink-0">
              <span className="font-display font-semibold text-brand-vanilla lg:text-sm">
                Settings
              </span>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1.5 rounded-lg text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-border-dark transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Presets Section */}
              <AccordionSection title="Presets" defaultOpen>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isActive = viewMode === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setViewMode(preset.id)}
                        disabled={isTransitioning}
                        className={cn(
                          "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all",
                          "border",
                          isActive
                            ? "bg-brand-aperol text-white border-brand-aperol"
                            : "bg-os-bg-dark/50 text-os-text-secondary-dark border-os-border-dark hover:border-brand-aperol/50 hover:text-brand-vanilla",
                          isTransitioning && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </AccordionSection>

              {/* Colors Section */}
              <AccordionSection title="Colors" defaultOpen>
                <div className="space-y-4">
                  <ColorPicker
                    label="Inner Color (Center)"
                    value={innerColor}
                    onChange={setInnerColor}
                  />
                  <ColorPicker
                    label="Outer Color (Edge)"
                    value={outerColor}
                    onChange={setOuterColor}
                  />
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setInnerColor('#FFFAEE');
                        setOuterColor('#FE5102');
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-os-bg-dark border border-os-border-dark rounded-lg text-os-text-secondary-dark hover:text-brand-vanilla hover:border-brand-aperol/50 transition-colors"
                    >
                      Reset to Brand
                    </button>
                  </div>
                </div>
              </AccordionSection>

              {/* Particles Section */}
              <AccordionSection title="Particles">
                <div className="space-y-4">
                  <Slider
                    label="Count"
                    value={particleCount}
                    min={500}
                    max={5000}
                    step={100}
                    onChange={setParticleCount}
                    formatValue={(v) => v.toLocaleString()}
                  />
                  <Slider
                    label="Size"
                    value={particleSize}
                    min={0.05}
                    max={0.3}
                    step={0.01}
                    onChange={setParticleSize}
                    formatValue={(v) => v.toFixed(2)}
                  />
                </div>
              </AccordionSection>

              {/* Animation Section */}
              <AccordionSection title="Animation">
                <div className="space-y-4">
                  <Toggle
                    label="Auto Play"
                    checked={autoPlay}
                    onChange={setAutoPlay}
                  />
                  <Slider
                    label="Speed"
                    value={animationSpeed}
                    min={0.1}
                    max={2}
                    step={0.1}
                    onChange={setAnimationSpeed}
                    formatValue={(v) => `${v.toFixed(1)}x`}
                  />
                </div>
              </AccordionSection>
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-os-border-dark shrink-0">
              <p className="text-[10px] text-os-text-secondary-dark text-center">
                Press <kbd className="px-1.5 py-0.5 rounded bg-os-border-dark text-brand-vanilla font-mono">ESC</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
