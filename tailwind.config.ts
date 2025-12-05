import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // BRAND-OS Color System
        brand: {
          charcoal: '#191919',
          vanilla: '#FFFAEE',
          aperol: '#FE5102',
        },
        // OS dark theme palette
        os: {
          'bg-darker': '#0C0C0C',
          'bg-dark': '#141414',
          'surface-dark': '#1C1C1C',
          'border-dark': '#2C2C2C',
          'text-primary-dark': '#E8E8E8',
          'text-secondary-dark': '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['"Neue Haas Grotesk Display Pro"', 'system-ui', 'sans-serif'],
        display: ['"Neue Haas Grotesk Display Pro"', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['Offbit', 'ui-monospace', 'monospace'],
        accent: ['Offbit', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'brand': '12px',
        'brand-lg': '16px',
      },
      boxShadow: {
        'brand': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'brand-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        blob: 'blob 10s infinite',
        cursor: 'cursor .75s step-end infinite',
        'dot-pulse': 'dot-pulse 1.4s ease-in-out infinite',
        'dot-wave': 'dot-wave 0.6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        cursor: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'dot-pulse': {
          '0%, 100%': {
            transform: 'scale(0.8)',
            opacity: '0.4',
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: '1',
          },
        },
        'dot-wave': {
          '0%, 100%': {
            transform: 'translateY(0) scale(1)',
          },
          '50%': {
            transform: 'translateY(-4px) scale(1.1)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
