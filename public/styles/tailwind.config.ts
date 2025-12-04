/**
 * BRAND-OS Tailwind Configuration
 * 
 * This is a standalone Tailwind config that can be dropped into any project.
 * It includes all brand colors, typography, and design tokens.
 * 
 * Usage:
 * 1. Copy this file to your project's root directory
 * 2. Install Tailwind CSS if not already installed
 * 3. Import or merge with your existing config
 * 
 * For font support, also copy the /fonts folder and include brand.css
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ============================================
        // BRAND-OS Primary Brand Colors
        // ============================================
        brand: {
          // Near-black - Primary text, dark mode background
          charcoal: '#191919',
          // Warm off-white - Primary background, light mode surface
          vanilla: '#FFFAEE',
          // Vibrant orange accent - USE SPARINGLY (max 10% of composition)
          // Best for: CTAs, highlights, interactive elements, active states
          // Avoid: Large backgrounds, body text
          aperol: '#FE5102',
        },
        
        // ============================================
        // OS Dark Theme Palette
        // ============================================
        os: {
          'bg-darker': '#0C0C0C',      // Deepest background level
          'bg-dark': '#141414',         // Primary dark background
          'surface-dark': '#1C1C1C',    // Elevated surface
          'border-dark': '#2C2C2C',     // Borders and dividers
          'text-primary-dark': '#E8E8E8',    // Primary text
          'text-secondary-dark': '#9CA3AF',  // Secondary/muted text
        },
      },
      
      // ============================================
      // Typography
      // ============================================
      fontFamily: {
        // Primary display font - Use for headings (H1-H4)
        sans: ['"Neue Haas Grotesk Display Pro"', 'system-ui', 'sans-serif'],
        display: ['"Neue Haas Grotesk Display Pro"', 'system-ui', 'sans-serif'],
        
        // Serif fallback
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        
        // Accent font - Use for H5-H6 subheadings (max 2 per viewport)
        mono: ['Offbit', 'ui-monospace', 'monospace'],
        accent: ['Offbit', 'ui-monospace', 'monospace'],
      },
      
      // ============================================
      // Border Radius
      // ============================================
      borderRadius: {
        'brand': '12px',      // Standard brand radius
        'brand-lg': '16px',   // Large brand radius
      },
      
      // ============================================
      // Shadows
      // ============================================
      boxShadow: {
        'brand': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'brand-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
      
      // ============================================
      // Animations
      // ============================================
      animation: {
        blob: 'blob 10s infinite',
        cursor: 'cursor .75s step-end infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out forwards',
        'slide-in-right': 'slideInRight 0.2s ease-out forwards',
        'slide-out-right': 'slideOutRight 0.2s ease-in forwards',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        cursor: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

