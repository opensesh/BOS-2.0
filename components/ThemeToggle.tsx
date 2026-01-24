'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`
          w-full flex items-center space-x-3 px-3 py-3 rounded-lg
          ${isCollapsed ? 'justify-center' : ''}
        `}
      >
        <div className="w-5 h-5 animate-pulse bg-os-surface-dark rounded" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        w-full flex items-center space-x-3 px-3 py-3 rounded-lg
        text-os-text-secondary-dark
        hover:bg-os-surface-dark hover:text-os-text-primary-dark
        transition-all duration-200
        ${isCollapsed ? 'justify-center' : ''}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      {!isCollapsed && (
        <span className="font-medium">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}

