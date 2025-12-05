'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LLM Formula Text Generator
 * Creates fun, creative phrases combining real and made-up words
 * related to dev, work, brand, and design
 */

// Real words grouped by category
const realWords = {
  dev: ['parsing', 'compiling', 'rendering', 'iterating', 'debugging', 'optimizing', 'indexing', 'caching', 'fetching', 'querying'],
  work: ['processing', 'analyzing', 'synthesizing', 'generating', 'crafting', 'building', 'assembling', 'orchestrating', 'calibrating', 'configuring'],
  brand: ['branding', 'positioning', 'messaging', 'identity', 'voice', 'tone', 'essence', 'narrative', 'values', 'strategy'],
  design: ['composing', 'layouting', 'spacing', 'aligning', 'kerning', 'grading', 'balancing', 'harmonizing', 'styling', 'theming'],
};

// Made-up/creative words (neologisms that sound technical but fun)
const madeUpWords = {
  verbs: ['synergizing', 'brandifying', 'pixelating', 'ideafying', 'creativizing', 'designering', 'thoughtmapping', 'visionizing', 'conceptualizing', 'narrativizing'],
  nouns: ['thoughtbits', 'brandwaves', 'designflows', 'ideascapes', 'pixelstreams', 'creativons', 'visionquanta', 'conceptrons', 'narratrons', 'styleatoms'],
  adjectives: ['synergistic', 'brandful', 'designish', 'creativesque', 'narrativic', 'ideational', 'conceptual', 'visionic', 'pixelic', 'thoughtful'],
};

// Templates for generating formulas
const formulaTemplates = [
  (v: string, n: string) => `${v} ${n}...`,
  (v: string, n: string, a: string) => `${a} ${v}...`,
  (v: string, n: string) => `${v} creative ${n}...`,
  (v: string, n: string, a: string) => `${a} ${n} flow...`,
  (v: string, n: string) => `${v} brand ${n}...`,
  (v: string, n: string) => `${v} design ${n}...`,
  (v: string, n: string) => `thinking ${n}...`,
  (v: string, n: string) => `weaving ${n}...`,
  (v: string, n: string) => `${v} insights...`,
  (v: string, n: string) => `crafting ${n}...`,
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLLMFormula(): string {
  // Decide whether to use mostly real or made-up words (60% real, 40% made-up)
  const useReal = Math.random() > 0.4;
  
  let verb: string;
  let noun: string;
  let adjective: string;

  if (useReal) {
    const category = getRandomItem(Object.keys(realWords)) as keyof typeof realWords;
    verb = getRandomItem(realWords[category]);
    noun = getRandomItem(madeUpWords.nouns);
    adjective = getRandomItem(madeUpWords.adjectives);
  } else {
    verb = getRandomItem(madeUpWords.verbs);
    noun = getRandomItem(madeUpWords.nouns);
    adjective = getRandomItem(madeUpWords.adjectives);
  }

  const template = getRandomItem(formulaTemplates);
  return template(verb, noun, adjective);
}

interface DotFlowLoaderProps {
  className?: string;
  showText?: boolean;
  textInterval?: number;
}

export function DotFlowLoader({ 
  className = '', 
  showText = true,
  textInterval = 2500 
}: DotFlowLoaderProps) {
  const [formula, setFormula] = useState(() => generateLLMFormula());

  // Cycle through formulas
  useEffect(() => {
    if (!showText) return;
    
    const interval = setInterval(() => {
      setFormula(generateLLMFormula());
    }, textInterval);

    return () => clearInterval(interval);
  }, [showText, textInterval]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dot Flow Animation */}
      <div className="flex items-center gap-[5px]">
        <span 
          className="w-2 h-2 rounded-full bg-brand-aperol animate-dot-pulse"
          style={{ animationDelay: '0ms' }}
        />
        <span 
          className="w-2 h-2 rounded-full bg-brand-aperol animate-dot-pulse"
          style={{ animationDelay: '200ms' }}
        />
        <span 
          className="w-2 h-2 rounded-full bg-brand-aperol animate-dot-pulse"
          style={{ animationDelay: '400ms' }}
        />
      </div>

      {/* Text Animation */}
      {showText && (
        <AnimatePresence mode="wait">
          <motion.span
            key={formula}
            className="text-sm text-os-text-secondary-dark font-mono lowercase"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {formula}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * Alternative: Smoother wave-like flow animation
 */
export function DotFlowWave({ 
  className = '', 
  showText = true,
  textInterval = 2500 
}: DotFlowLoaderProps) {
  const [formula, setFormula] = useState(() => generateLLMFormula());

  useEffect(() => {
    if (!showText) return;
    
    const interval = setInterval(() => {
      setFormula(generateLLMFormula());
    }, textInterval);

    return () => clearInterval(interval);
  }, [showText, textInterval]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Wave Flow Animation */}
      <div className="flex items-center gap-[4px]">
        <span 
          className="w-1.5 h-1.5 rounded-full bg-brand-aperol animate-dot-wave"
          style={{ animationDelay: '0ms' }}
        />
        <span 
          className="w-1.5 h-1.5 rounded-full bg-brand-aperol animate-dot-wave"
          style={{ animationDelay: '150ms' }}
        />
        <span 
          className="w-1.5 h-1.5 rounded-full bg-brand-aperol animate-dot-wave"
          style={{ animationDelay: '300ms' }}
        />
      </div>

      {/* Text Animation */}
      {showText && (
        <AnimatePresence mode="wait">
          <motion.span
            key={formula}
            className="text-sm text-os-text-secondary-dark font-mono lowercase"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {formula}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * Premium: Pulse expansion effect that mimics thinking/processing
 * Uses CSS animations for guaranteed rendering + Framer Motion for text
 */
export function DotFlowPulse({ 
  className = '', 
  showText = true,
  textInterval = 2500 
}: DotFlowLoaderProps) {
  const [formula, setFormula] = useState(() => generateLLMFormula());

  useEffect(() => {
    if (!showText) return;
    
    const interval = setInterval(() => {
      setFormula(generateLLMFormula());
    }, textInterval);

    return () => clearInterval(interval);
  }, [showText, textInterval]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Pulse Flow Animation - Using CSS for reliable rendering */}
      <div className="flex items-center gap-[5px]">
        <span 
          className="w-2 h-2 rounded-full bg-brand-aperol animate-dot-pulse"
          style={{ animationDelay: '0ms' }}
        />
        <span 
          className="w-2 h-2 rounded-full bg-brand-aperol animate-dot-pulse"
          style={{ animationDelay: '200ms' }}
        />
        <span 
          className="w-2 h-2 rounded-full bg-brand-aperol animate-dot-pulse"
          style={{ animationDelay: '400ms' }}
        />
      </div>

      {/* Text Animation */}
      {showText && (
        <AnimatePresence mode="wait">
          <motion.span
            key={formula}
            className="text-sm text-os-text-secondary-dark font-mono lowercase"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {formula}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}

export default DotFlowLoader;
