'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface AIFilterResponseProps {
  message: string | null;
  isTyping: boolean;
  onDismiss: () => void;
  matchCount?: number;
}

/**
 * AIFilterResponse
 * 
 * Displays AI-generated responses with a delightful typewriter effect.
 * Shows when the user asks a natural language question to filter resources.
 */
export function AIFilterResponse({
  message,
  isTyping,
  onDismiss,
  matchCount,
}: AIFilterResponseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const charIndexRef = useRef(0);
  
  // Typewriter effect
  useEffect(() => {
    if (!message) {
      setDisplayedText('');
      setIsComplete(false);
      charIndexRef.current = 0;
      return;
    }
    
    // Reset when message changes
    setDisplayedText('');
    setIsComplete(false);
    charIndexRef.current = 0;
    
    const typeNextChar = () => {
      if (charIndexRef.current < message.length) {
        setDisplayedText(message.slice(0, charIndexRef.current + 1));
        charIndexRef.current++;
        
        // Variable typing speed for natural feel
        const char = message[charIndexRef.current - 1];
        let delay = 25; // Base speed
        
        if (char === '.' || char === '!' || char === '?') {
          delay = 150; // Pause at sentence end
        } else if (char === ',') {
          delay = 80; // Brief pause at comma
        } else if (char === ' ') {
          delay = 15; // Quick for spaces
        }
        
        setTimeout(typeNextChar, delay);
      } else {
        setIsComplete(true);
      }
    };
    
    // Start typing after a brief delay
    const startTimeout = setTimeout(typeNextChar, 300);
    
    return () => clearTimeout(startTimeout);
  }, [message]);
  
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-r from-brand-aperol/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-sm rounded-lg border border-brand-aperol/20 p-4 relative">
            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className="absolute top-2 right-2 p-1 rounded-full text-os-text-secondary-dark/60 hover:text-os-text-primary-dark hover:bg-os-surface-dark/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            {/* AI Icon */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-aperol to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                {/* Typing text */}
                <p className="text-sm text-os-text-primary-dark leading-relaxed">
                  {displayedText}
                  {/* Blinking cursor while typing */}
                  {!isComplete && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 bg-brand-aperol ml-0.5 align-middle"
                    />
                  )}
                </p>
                
                {/* Match count badge - appears after typing completes */}
                <AnimatePresence>
                  {isComplete && matchCount !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-2"
                    >
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-os-surface-dark/60 rounded-full text-xs text-os-text-secondary-dark">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-aperol animate-pulse" />
                        {matchCount} resource{matchCount !== 1 ? 's' : ''} found
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
