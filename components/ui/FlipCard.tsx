'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlipCardProps {
  isFlipped: boolean;
  front: ReactNode;
  back: ReactNode;
  className?: string;
  flipDuration?: number;
}

/**
 * A reusable 3D flip card component using Framer Motion.
 * 
 * Usage:
 * ```tsx
 * <FlipCard
 *   isFlipped={isEditing}
 *   front={<DisplayContent />}
 *   back={<EditContent onDone={() => setIsEditing(false)} />}
 * />
 * ```
 */
export function FlipCard({
  isFlipped,
  front,
  back,
  className = '',
  flipDuration = 0.6,
}: FlipCardProps) {
  return (
    <div 
      className={`relative ${className}`}
      style={{ perspective: '1000px' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{
              duration: flipDuration / 2,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
            }}
            className="w-full"
          >
            {front}
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{
              duration: flipDuration / 2,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
            }}
            className="w-full"
          >
            {back}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * A simpler flip card variant that maintains both sides in DOM
 * and uses pure CSS transform for smoother performance.
 */
export function FlipCardPersistent({
  isFlipped,
  front,
  back,
  className = '',
  flipDuration = 0.6,
}: FlipCardProps) {
  return (
    <div 
      className={`relative ${className}`}
      style={{ perspective: '1200px' }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: flipDuration,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
        className="w-full"
      >
        {/* Front face */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="w-full"
        >
          {front}
        </div>
        
        {/* Back face */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
          className="w-full"
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}


