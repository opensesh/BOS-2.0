'use client';

import React, { ReactNode, useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';

interface FlipCardProps {
  isFlipped: boolean;
  front: ReactNode;
  back: ReactNode;
  className?: string;
  flipDuration?: number;
}

/**
 * A reusable fade-transition card component using Framer Motion.
 * Maintains consistent container size during transitions for smooth UX.
 * The container smoothly animates to match the active content's height.
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
  flipDuration = 0.3,
}: FlipCardProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  // Measure height of active content
  useLayoutEffect(() => {
    const activeRef = isFlipped ? backRef.current : frontRef.current;
    if (activeRef) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(activeRef);
      // Initial measurement
      setHeight(activeRef.offsetHeight);
      return () => resizeObserver.disconnect();
    }
  }, [isFlipped]);

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      animate={{ height }}
      transition={{
        height: {
          duration: flipDuration,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
    >
      {/* Front face */}
      <motion.div
        ref={frontRef}
        initial={false}
        animate={{
          opacity: isFlipped ? 0 : 1,
          scale: isFlipped ? 0.97 : 1,
          filter: isFlipped ? 'blur(6px)' : 'blur(0px)',
        }}
        transition={{
          duration: flipDuration,
          ease: [0.4, 0, 0.2, 1],
          opacity: { duration: flipDuration * 0.6 },
          filter: { duration: flipDuration * 0.4 },
        }}
        className="w-full"
        style={{
          position: isFlipped ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          pointerEvents: isFlipped ? 'none' : 'auto',
        }}
      >
        {front}
      </motion.div>

      {/* Back face */}
      <motion.div
        ref={backRef}
        initial={false}
        animate={{
          opacity: isFlipped ? 1 : 0,
          scale: isFlipped ? 1 : 0.97,
          filter: isFlipped ? 'blur(0px)' : 'blur(6px)',
        }}
        transition={{
          duration: flipDuration,
          ease: [0.4, 0, 0.2, 1],
          opacity: { duration: flipDuration * 0.6, delay: isFlipped ? flipDuration * 0.15 : 0 },
          filter: { duration: flipDuration * 0.4, delay: isFlipped ? flipDuration * 0.15 : 0 },
        }}
        className="w-full"
        style={{
          position: isFlipped ? 'relative' : 'absolute',
          top: 0,
          left: 0,
          right: 0,
          pointerEvents: isFlipped ? 'auto' : 'none',
        }}
      >
        {back}
      </motion.div>
    </motion.div>
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







