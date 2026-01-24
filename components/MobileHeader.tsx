'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMobileMenu } from '@/lib/mobile-menu-context';
import { BrandSelector } from './BrandSelector';

interface MobileHeaderProps {
  onBrandClick?: () => void;
}

export function MobileHeader({ onBrandClick }: MobileHeaderProps) {
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileMenu();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-os-bg-darker/95 backdrop-blur-sm border-b border-os-border-dark">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Brand Selector */}
        <div className="flex items-center">
          <BrandSelector size={28} href="/" onClick={onBrandClick} />
        </div>

        {/* Right: Hamburger menu with Framer Motion animation */}
        <motion.button
          onClick={toggleMobileMenu}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          animate={isHovered && !isMobileMenuOpen ? { rotate: [0, -3, 3, -3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="p-2"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 relative flex items-center justify-center">
            {/* Top bar */}
            <motion.span
              className="absolute w-5 h-0.5 bg-os-text-primary-dark rounded-full"
              animate={{
                rotate: isMobileMenuOpen ? 45 : 0,
                y: isMobileMenuOpen ? 0 : -6,
              }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            />
            {/* Middle bar */}
            <motion.span
              className="absolute w-5 h-0.5 bg-os-text-primary-dark rounded-full"
              animate={{
                opacity: isMobileMenuOpen ? 0 : 1,
                scaleX: isMobileMenuOpen ? 0 : 1,
              }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            />
            {/* Bottom bar */}
            <motion.span
              className="absolute w-5 h-0.5 bg-os-text-primary-dark rounded-full"
              animate={{
                rotate: isMobileMenuOpen ? -45 : 0,
                y: isMobileMenuOpen ? 0 : 6,
              }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            />
          </div>
        </motion.button>
      </div>
    </header>
  );
}
