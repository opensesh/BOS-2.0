'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Orbit, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { suggestionsContainer, suggestionItem } from '@/lib/motion';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';

type Mode = 'search' | 'research';

interface SearchResearchToggleProps {
  onQueryClick?: (query: string, submit?: boolean) => void;
  onModeChange?: (showSuggestions: boolean, mode: Mode) => void;
  showSuggestions?: boolean;
  inputValue?: string; // Current input value for real-time suggestions
}

// Fallback suggestions used when API is unavailable
const FALLBACK_SEARCH_SUGGESTIONS = [
  'Where can I find the fonts for my brand?',
  'What colors should I use for my brand?',
  'Show me brand logo guidelines',
  'What is my brand voice and tone?',
  'Where are the brand asset files?',
];

const FALLBACK_RESEARCH_SUGGESTIONS = [
  'Comprehensive analysis of brand identity systems and their impact on market positioning',
  'Deep dive into brand consistency across digital and physical touchpoints',
  'Research best practices for brand asset management and version control workflows',
  'Analyze competitor brand strategies and differentiation opportunities in our market',
  'Strategic framework for brand evolution and rebranding decision-making processes',
];

export function SearchResearchToggle({ 
  onQueryClick, 
  onModeChange, 
  showSuggestions: externalShowSuggestions,
  inputValue = '',
}: SearchResearchToggleProps) {
  const [activeMode, setActiveMode] = useState<Mode>('search');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const showSuggestionsState = externalShowSuggestions !== undefined ? externalShowSuggestions : showSuggestions;
  const [hoveredButton, setHoveredButton] = useState<Mode | null>(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Don't show tooltip when suggestions are visible
  const shouldShowTooltip = hoveredButton && !showSuggestionsState;

  // Use fallback suggestions (actual fetching happens in SearchResearchSuggestions component)
  const searchSuggestions = FALLBACK_SEARCH_SUGGESTIONS;
  const researchSuggestions = FALLBACK_RESEARCH_SUGGESTIONS;

  const handleModeClick = (mode: Mode) => {
    if (activeMode === mode) {
      const newShowSuggestions = !showSuggestions;
      setShowSuggestions(newShowSuggestions);
      if (onModeChange) {
        onModeChange(newShowSuggestions, mode);
      }
    } else {
      setActiveMode(mode);
      setShowSuggestions(true);
      if (onModeChange) {
        onModeChange(true, mode);
      }
    }
  };

  const handleQueryClick = (query: string, submit = true) => {
    if (onQueryClick) {
      // Pass submit=true to indicate this should be submitted immediately
      onQueryClick(query, submit);
    }
    setShowSuggestions(false);
    if (onModeChange) {
      onModeChange(false, activeMode);
    }
  };

  // Store onModeChange in ref to avoid dependency issues
  const onModeChangeRef = useRef(onModeChange);
  useEffect(() => {
    onModeChangeRef.current = onModeChange;
  }, [onModeChange]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-toggle-button]')) {
          setShowSuggestions(false);
          if (onModeChangeRef.current) {
            onModeChangeRef.current(false, activeMode);
          }
        }
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions, activeMode]);

  const currentSuggestions =
    activeMode === 'search' ? searchSuggestions : researchSuggestions;
  const CurrentIcon = activeMode === 'search' ? Search : Orbit;

  // Calculate arrow position for tooltip
  const getArrowPosition = () => {
    if (hoveredButton === 'search') {
      return 'left-[12px]';
    } else {
      return 'left-[44px]';
    }
  };

  const handleButtonMouseEnter = (mode: Mode) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredButton(mode);
    setIsTooltipHovered(false);
  };

  const handleButtonMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isTooltipHovered) {
        setHoveredButton(null);
      }
      hoverTimeoutRef.current = null;
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsTooltipHovered(true);
  };

  const handleTooltipMouseLeave = () => {
    setIsTooltipHovered(false);
    setHoveredButton(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="inline-block">
      {/* Toggle Buttons with iOS-style slider */}
      <div className="relative inline-block">
        <div className="relative inline-flex items-center bg-os-bg-dark rounded-lg p-1">
          {/* Sliding pill indicator */}
          <div
            className="absolute top-1 h-[calc(100%-8px)] w-[32px] bg-brand-aperol rounded-md transition-all duration-300 ease-out"
            style={{
              left: activeMode === 'search' ? '4px' : '36px',
            }}
          />

          <div className="relative group/search">
            <button
              data-toggle-button
              type="button"
              onClick={() => handleModeClick('search')}
              onMouseEnter={() => handleButtonMouseEnter('search')}
              onMouseLeave={handleButtonMouseLeave}
              className={`
                relative z-10 flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-300
                ${
                  activeMode === 'search'
                    ? 'text-white'
                    : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
                }
              `}
              aria-label="Search mode"
            >
              <Search className="w-4 h-4" />
            </button>
            {/* Simple tooltip when suggestions are showing */}
            {showSuggestionsState && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-os-text-primary-dark bg-os-surface-dark border border-os-border-dark rounded-md opacity-0 group-hover/search:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-50">
                Search
              </span>
            )}
          </div>

          <div className="relative group/research">
            <button
              data-toggle-button
              type="button"
              onClick={() => handleModeClick('research')}
              onMouseEnter={() => handleButtonMouseEnter('research')}
              onMouseLeave={handleButtonMouseLeave}
              className={`
                relative z-10 flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-300
                ${
                  activeMode === 'research'
                    ? 'text-white'
                    : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
                }
              `}
              aria-label="Research mode"
            >
              <Orbit className="w-4 h-4" />
            </button>
            {/* Simple tooltip when suggestions are showing */}
            {showSuggestionsState && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-os-text-primary-dark bg-os-surface-dark border border-os-border-dark rounded-md opacity-0 group-hover/research:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-50">
                Research
              </span>
            )}
          </div>
        </div>

        {/* Hover Tooltip - Only show when suggestions are NOT visible */}
        {shouldShowTooltip && (
          <div
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            className="absolute top-full left-0 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-os-border-dark shadow-2xl p-4 z-[10001]"
            style={{
              backgroundColor: '#1a1a1a',
            }}
          >
            {/* Arrow pointer with solid background */}
            <div
              className={`absolute -top-[9px] w-4 h-4 border-l border-t border-os-border-dark transform rotate-45 transition-all duration-200 ${getArrowPosition()}`}
              style={{ 
                backgroundColor: '#1a1a1a',
              }}
            />
            
            <div className="relative">
              <h3 className="font-semibold text-os-text-primary-dark mb-1">
                {hoveredButton === 'search' ? 'Search' : 'Research'}
              </h3>
              <p className="text-sm text-os-text-secondary-dark mb-3">
                {hoveredButton === 'search'
                  ? 'Fast answers to everyday questions'
                  : 'Deep research on any topic'}
              </p>
              <div className="border-t border-os-border-dark pt-3">
                <p className="text-xs text-brand-aperol mb-2">
                  Extended access for subscribers
                </p>
                <p className="text-xs text-os-text-secondary-dark mb-2">
                  {hoveredButton === 'search'
                    ? 'Advanced search with 10x the sources; powered by top models'
                    : 'In-depth reports with more sources, charts, and advanced reasoning'}
                </p>
                <p className="text-xs text-os-text-secondary-dark mb-3">
                  3 queries remaining today
                </p>
                <button className="w-full bg-brand-aperol hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// Export suggestions as separate component to render outside toolbar
export function SearchResearchSuggestions({
  mode,
  onQueryClick,
  inputValue = '',
}: {
  mode: 'search' | 'research';
  onQueryClick?: (query: string, submit?: boolean) => void;
  inputValue?: string;
}) {
  const CurrentIcon = mode === 'search' ? Search : Orbit;
  
  // Use the search suggestions hook for real-time autocomplete
  const { 
    suggestions: liveSuggestions, 
    isLoading,
    fetchSuggestions,
  } = useSearchSuggestions({ mode, debounceMs: 150 });

  // Fetch suggestions when input changes
  useEffect(() => {
    fetchSuggestions(inputValue);
  }, [inputValue, fetchSuggestions]);

  // Use live suggestions if available, otherwise fallback
  const fallbackSuggestions = mode === 'search' 
    ? FALLBACK_SEARCH_SUGGESTIONS 
    : FALLBACK_RESEARCH_SUGGESTIONS;
  
  const suggestions = liveSuggestions.length > 0 ? liveSuggestions : fallbackSuggestions;

  // Highlight matching text in suggestion
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query || query.length < 2) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="text-brand-aperol font-medium">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  }, []);

  return (
    <motion.div
      className="w-full mt-3"
      variants={suggestionsContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-4 h-4 text-os-text-secondary-dark animate-spin" />
        </div>
      )}
      
      {/* Suggestions List */}
      <AnimatePresence mode="wait">
        <div className="space-y-1">
          {suggestions.slice(0, 6).map((suggestion, index) => (
            <motion.button
              key={`${suggestion}-${index}`}
              variants={suggestionItem}
              type="button"
              onClick={() => onQueryClick?.(suggestion, true)}
              whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left p-2 rounded-lg transition-colors group"
            >
              <div className="flex items-start space-x-2">
                <CurrentIcon className="w-4 h-4 text-os-text-secondary-dark group-hover:text-brand-aperol mt-0.5 flex-shrink-0" />
                <span className="text-sm text-os-text-primary-dark group-hover:text-brand-aperol">
                  {highlightMatch(suggestion, inputValue)}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}
