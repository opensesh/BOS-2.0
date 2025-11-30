'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Easing curves
export const easings = {
  easeOut: [0.4, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  spring: { type: 'spring', stiffness: 400, damping: 30 } as const,
};

// Container variant for staggered children
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Faster stagger for lists with many items
export const staggerContainerFast: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

// Fade in from below
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 12 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
    },
  },
};

// Subtle fade in (no movement)
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.easeOut,
    },
  },
};

// Scale up with fade
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easings.easeOut,
    },
  },
};

// Slide from left (for navigation drawers)
export const slideFromLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -16 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -8,
    transition: {
      duration: 0.15,
    },
  },
};

// Slide from right (for mobile drawer)
export const slideFromRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: '100%' 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: 0.25,
      ease: easings.easeIn,
    },
  },
};

// Overlay fade
export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

// Page transition wrapper component
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual animated item component
interface MotionItemProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}

export function MotionItem({ 
  children, 
  className,
  variants = fadeInUp 
}: MotionItemProps) {
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

// Hover scale wrapper for interactive elements
interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  tapScale?: number;
}

export function HoverScale({ 
  children, 
  className,
  scale = 1.02,
  tapScale = 0.98,
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

