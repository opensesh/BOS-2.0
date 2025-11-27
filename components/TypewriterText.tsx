'use client';

import { useEffect, useState, useRef } from 'react';

const PHRASES = ['experiment', 'build', 'create', 'design', 'innovate'];
const TYPING_SPEED = 80;
const DELETING_SPEED = 40;
const PAUSE_DURATION = 2000;

export function TypewriterText() {
  const [text, setText] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDeletingRef = useRef(false);
  const loopNumRef = useRef(0);
  const charIndexRef = useRef(0);

  useEffect(() => {
    const type = () => {
      const i = loopNumRef.current % PHRASES.length;
      const fullText = PHRASES[i];
      const isDeleting = isDeletingRef.current;
      const charIndex = charIndexRef.current;

      if (!isDeleting && charIndex < fullText.length) {
        // Typing
        setText(fullText.substring(0, charIndex + 1));
        charIndexRef.current = charIndex + 1;
        timeoutRef.current = setTimeout(type, TYPING_SPEED);
      } else if (!isDeleting && charIndex === fullText.length) {
        // Finished typing - pause then delete
        pauseTimeoutRef.current = setTimeout(() => {
          isDeletingRef.current = true;
          timeoutRef.current = setTimeout(type, DELETING_SPEED);
        }, PAUSE_DURATION);
      } else if (isDeleting && charIndex > 0) {
        // Deleting
        setText(fullText.substring(0, charIndex - 1));
        charIndexRef.current = charIndex - 1;
        timeoutRef.current = setTimeout(type, DELETING_SPEED);
      } else {
        // Finished deleting - move to next phrase
        isDeletingRef.current = false;
        charIndexRef.current = 0;
        loopNumRef.current = (loopNumRef.current + 1) % PHRASES.length;
        timeoutRef.current = setTimeout(type, TYPING_SPEED);
      }
    };

    // Start typing
    timeoutRef.current = setTimeout(type, TYPING_SPEED);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []); // Run once on mount

  return (
    <div className="text-base md:text-lg text-os-text-secondary-dark font-mono mt-2">
      <span>Made to help you </span>
      <div className="inline whitespace-pre-wrap tracking-tight text-brand-aperol font-accent">
        <span>{text}</span>
        <span className="ml-1 animate-cursor">_</span>
      </div>
    </div>
  );
}
