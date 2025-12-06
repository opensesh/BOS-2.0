"use client";

import { useEffect, useRef, useState, useMemo } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { DotLoader } from "@/components/ui/dot-loader";

// ============================================
// LLM Formula Text Generator
// Creates fun phrases combining real and made-up words
// related to dev, work, brand, and design
// ============================================

const realWords = {
  dev: ['parsing', 'compiling', 'rendering', 'iterating', 'debugging', 'optimizing', 'indexing', 'caching', 'fetching', 'querying'],
  work: ['processing', 'analyzing', 'synthesizing', 'generating', 'crafting', 'building', 'assembling', 'orchestrating', 'calibrating', 'configuring'],
  brand: ['branding', 'positioning', 'messaging', 'identity', 'curating', 'distilling', 'refining', 'shaping', 'aligning', 'expressing'],
  design: ['composing', 'layouting', 'spacing', 'aligning', 'kerning', 'grading', 'balancing', 'harmonizing', 'styling', 'theming'],
};

const madeUpWords = {
  verbs: ['synergizing', 'brandifying', 'pixelating', 'ideafying', 'creativizing', 'designering', 'thoughtmapping', 'visionizing', 'conceptualizing', 'narrativizing'],
  nouns: ['thoughtbits', 'brandwaves', 'designflows', 'ideascapes', 'pixelstreams', 'creativons', 'visionquanta', 'conceptrons', 'narratrons', 'styleatoms'],
  adjectives: ['synergistic', 'brandful', 'designish', 'creativesque', 'narrativic', 'ideational', 'conceptual', 'visionic', 'pixelic', 'thoughtful'],
};

const formulaTemplates = [
  (v: string, n: string) => `${v} ${n}`,
  (v: string, n: string, a: string) => `${a} ${v}`,
  (v: string, n: string) => `${v} creative ${n}`,
  (v: string, n: string) => `thinking ${n}`,
  (v: string, n: string) => `weaving ${n}`,
  (v: string, n: string) => `${v} insights`,
  (v: string, n: string) => `crafting ${n}`,
  (v: string, n: string) => `${v} brand ${n}`,
  (v: string, n: string) => `${v} design ${n}`,
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLLMFormula(): string {
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

// ============================================
// Animation Frames for the 7x7 Dot Grid
// ============================================

// Thinking/processing animation - ripple from center
const thinking = [
  [24],
  [17, 23, 25, 31],
  [10, 16, 18, 24, 30, 32, 38],
  [3, 9, 11, 15, 17, 19, 23, 25, 29, 31, 33, 37, 39, 45],
  [2, 4, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 44, 46],
  [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47],
  [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48],
  [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47],
  [2, 4, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 44, 46],
  [3, 9, 11, 15, 17, 19, 23, 25, 29, 31, 33, 37, 39, 45],
  [10, 16, 18, 24, 30, 32, 38],
  [17, 23, 25, 31],
  [24],
];

// Spiral inward animation
const spiral = [
  [0, 1, 2, 3, 4, 5, 6],
  [0, 1, 2, 3, 4, 5, 6, 13],
  [0, 1, 2, 3, 4, 5, 6, 13, 20],
  [0, 1, 2, 3, 4, 5, 6, 13, 20, 27],
  [0, 1, 2, 3, 4, 5, 6, 13, 20, 27, 34],
  [0, 1, 2, 3, 4, 5, 6, 13, 20, 27, 34, 41],
  [0, 1, 2, 3, 4, 5, 6, 13, 20, 27, 34, 41, 48],
  [1, 2, 3, 4, 5, 6, 13, 20, 27, 34, 41, 48, 47],
  [2, 3, 4, 5, 6, 13, 20, 27, 34, 41, 48, 47, 46],
  [3, 4, 5, 6, 13, 20, 27, 34, 41, 48, 47, 46, 45],
  [4, 5, 6, 13, 20, 27, 34, 41, 48, 47, 46, 45, 44],
  [5, 6, 13, 20, 27, 34, 41, 48, 47, 46, 45, 44, 43],
  [6, 13, 20, 27, 34, 41, 48, 47, 46, 45, 44, 43, 42],
  [13, 20, 27, 34, 41, 48, 47, 46, 45, 44, 43, 42, 35],
  [20, 27, 34, 48, 47, 46, 45, 44, 43, 42, 35, 28],
  [27, 34, 47, 46, 45, 44, 43, 42, 35, 28, 21],
  [34, 46, 45, 44, 43, 42, 35, 28, 21, 14],
  [45, 44, 43, 42, 35, 28, 21, 14, 7],
  [44, 43, 42, 35, 28, 21, 14, 7, 8],
  [43, 42, 35, 28, 21, 14, 7, 8, 9],
  [42, 35, 28, 21, 7, 8, 9, 10],
  [35, 28, 8, 9, 10, 11],
  [28, 9, 10, 11, 12],
  [10, 11, 12, 19],
  [11, 12, 19, 26],
  [12, 19, 26, 33],
  [19, 26, 33, 32],
  [26, 33, 32, 31],
  [33, 32, 31, 30],
  [32, 31, 30, 23],
  [31, 30, 23, 16],
  [30, 23, 16, 17],
  [23, 16, 17, 18],
  [16, 17, 18, 25],
  [17, 18, 25, 24],
  [18, 25, 24],
  [25, 24],
  [24],
];

// Wave animation
const wave = [
  [0, 7, 14, 21, 28, 35, 42],
  [1, 8, 15, 22, 29, 36, 43],
  [2, 9, 16, 23, 30, 37, 44],
  [3, 10, 17, 24, 31, 38, 45],
  [4, 11, 18, 25, 32, 39, 46],
  [5, 12, 19, 26, 33, 40, 47],
  [6, 13, 20, 27, 34, 41, 48],
  [5, 12, 19, 26, 33, 40, 47],
  [4, 11, 18, 25, 32, 39, 46],
  [3, 10, 17, 24, 31, 38, 45],
  [2, 9, 16, 23, 30, 37, 44],
  [1, 8, 15, 22, 29, 36, 43],
  [0, 7, 14, 21, 28, 35, 42],
];

// Pulse/breathe animation
const pulse = [
  [],
  [24],
  [17, 23, 25, 31, 24],
  [10, 16, 18, 24, 30, 32, 17, 23, 25, 31],
  [3, 9, 11, 17, 23, 25, 31, 37, 39, 10, 16, 18, 24, 30, 32],
  [10, 16, 18, 24, 30, 32, 17, 23, 25, 31],
  [17, 23, 25, 31, 24],
  [24],
  [],
];

// Brain/neural animation
const neural = [
  [3, 10, 17, 24, 31, 38, 45],
  [3, 10, 17, 24, 31, 38, 45, 4, 11, 25, 39],
  [3, 10, 17, 24, 31, 38, 45, 4, 11, 25, 39, 18, 32],
  [3, 10, 17, 24, 31, 38, 45, 4, 11, 25, 39, 18, 32, 5, 19, 33],
  [3, 10, 17, 24, 31, 38, 45, 4, 11, 25, 39, 18, 32, 5, 19, 33, 12, 26, 40],
  [3, 10, 17, 24, 31, 38, 45, 18, 32, 5, 19, 33, 12, 26, 40],
  [3, 10, 17, 24, 31, 38, 45, 5, 19, 33, 12, 26, 40],
  [3, 10, 17, 24, 31, 38, 45, 12, 26, 40],
  [3, 10, 17, 24, 31, 38, 45],
  [3, 10, 17, 24, 31, 38, 45, 2, 9, 23, 37],
  [3, 10, 17, 24, 31, 38, 45, 2, 9, 23, 37, 16, 30],
  [3, 10, 17, 24, 31, 38, 45, 2, 9, 23, 37, 16, 30, 1, 15, 29],
  [3, 10, 17, 24, 31, 38, 45, 2, 9, 23, 37, 16, 30, 1, 15, 29, 8, 22, 36],
  [3, 10, 17, 24, 31, 38, 45, 16, 30, 1, 15, 29, 8, 22, 36],
  [3, 10, 17, 24, 31, 38, 45, 1, 15, 29, 8, 22, 36],
  [3, 10, 17, 24, 31, 38, 45, 8, 22, 36],
  [3, 10, 17, 24, 31, 38, 45],
];

// All animation presets
const animationPresets = [
  { frames: thinking, duration: 120, repeatCount: 1 },
  { frames: wave, duration: 80, repeatCount: 2 },
  { frames: pulse, duration: 150, repeatCount: 2 },
  { frames: neural, duration: 100, repeatCount: 1 },
  { frames: spiral, duration: 50, repeatCount: 1 },
];

// ============================================
// DotFlow Component Types
// ============================================

export type DotFlowItem = {
  title: string;
  frames: number[][];
  duration?: number;
  repeatCount?: number;
};

export type DotFlowProps = {
  items?: DotFlowItem[];
  className?: string;
  dotColor?: string;
};

// ============================================
// ThinkingDotFlow - For LLM streaming state
// Uses random LLM formulas with random animations
// ============================================

export const ThinkingDotFlow = ({ className }: { className?: string }) => {
  // Generate random items with LLM formulas
  const items = useMemo(() => {
    return animationPresets.map((preset) => ({
      title: generateLLMFormula(),
      frames: preset.frames,
      duration: preset.duration,
      repeatCount: preset.repeatCount,
    }));
  }, []);

  return (
    <DotFlow 
      items={items} 
      className={className}
      dotColor="bg-brand-aperol/20 [&.active]:bg-brand-aperol"
    />
  );
};

// ============================================
// Main DotFlow Component
// ============================================

export const DotFlow = ({ items, className, dotColor }: DotFlowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  // Default items if none provided
  const flowItems = items || [
    { title: "Processing...", frames: thinking, duration: 120, repeatCount: 1 },
  ];

  const { contextSafe } = useGSAP();

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const newWidth = textRef.current.offsetWidth + 1;

    gsap.to(containerRef.current, {
      width: newWidth,
      duration: 0.5,
      ease: "power2.out",
    });
  }, [textIndex]);

  const next = contextSafe(() => {
    const el = containerRef.current;
    if (!el) return;
    gsap.to(el, {
      y: 20,
      opacity: 0,
      filter: "blur(8px)",
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        setTextIndex((prev) => (prev + 1) % flowItems.length);
        gsap.fromTo(
          el,
          { y: -20, opacity: 0, filter: "blur(4px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power2.out",
          },
        );
      },
    });

    setIndex((prev) => (prev + 1) % flowItems.length);
  });

  const defaultDotColor = "bg-white/15 [&.active]:bg-white";

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <DotLoader
        frames={flowItems[index].frames}
        onComplete={next}
        repeatCount={flowItems[index].repeatCount ?? 1}
        duration={flowItems[index].duration ?? 150}
        dotClassName={dotColor || defaultDotColor}
      />
      <div ref={containerRef} className="relative overflow-hidden">
        <div 
          ref={textRef} 
          className="inline-block text-xs font-mono whitespace-nowrap text-os-text-secondary-dark lowercase"
        >
          {flowItems[textIndex].title}...
        </div>
      </div>
    </div>
  );
};

export default DotFlow;


