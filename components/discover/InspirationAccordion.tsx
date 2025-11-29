'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  FileText,
  Pen,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { InspirationCardData } from '@/types';

interface InspirationAccordionProps {
  shortForm: InspirationCardData[];
  longForm: InspirationCardData[];
  blog: InspirationCardData[];
}

interface AccordionSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: InspirationCardData[];
  isOpen: boolean;
  onToggle: () => void;
}

// Single item row in the accordion
function InspirationItem({ item }: { item: InspirationCardData }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch OG image from first source
  useEffect(() => {
    if (item.sources.length > 0) {
      const fetchOgImage = async () => {
        try {
          const sourceUrl = item.sources[0].url;
          const response = await fetch(`/api/og-image?url=${encodeURIComponent(sourceUrl)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.image) {
              setOgImage(data.image);
            }
          }
        } catch (error) {
          console.error('Error fetching OG image:', error);
        } finally {
          setImageLoading(false);
        }
      };
      fetchOgImage();
    } else {
      setImageLoading(false);
    }
  }, [item.sources]);

  const handleGenerateIdeas = () => {
    setIsGenerating(true);
    
    // Build the prompt for the AI
    const sourceUrls = item.sources.map(s => `- ${s.name}: ${s.url}`).join('\n');
    const categoryLabel = item.category === 'short-form' ? 'Short Form' : 
                          item.category === 'long-form' ? 'Long Form' : 'Blog';
    
    const prompt = `Create a creative brief for the following content idea:

**Title:** ${item.title}

**Format:** ${categoryLabel}

**Description:** ${item.description}

**Reference Sources:**
${sourceUrls}

Please provide:
1. A refined concept with hook
2. Key talking points (3-5 bullets)
3. Suggested structure/outline
4. Visual/aesthetic recommendations
5. Call-to-action suggestions`;

    // Navigate to home with the prompt
    const encodedPrompt = encodeURIComponent(prompt);
    router.push(`/?q=${encodedPrompt}`);
  };

  return (
    <div className="group px-4 py-4 border-b border-os-border-dark/30 last:border-b-0 hover:bg-os-surface-dark/30 transition-colors">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="relative w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden bg-os-surface-dark shrink-0">
          {imageLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-os-text-secondary-dark/30 border-t-os-text-secondary-dark rounded-full animate-spin" />
            </div>
          ) : ogImage ? (
            <Image
              src={ogImage}
              alt={item.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-os-surface-dark to-os-bg-dark">
              <span className="text-xl">💡</span>
            </div>
          )}
          {/* Star badge overlay */}
          {item.starred && (
            <div className="absolute top-1 right-1 p-0.5 rounded bg-brand-aperol/90">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-brand-vanilla group-hover:text-brand-aperol transition-colors line-clamp-1">
            {item.title}
          </h4>
          <p className="mt-0.5 text-xs text-os-text-secondary-dark leading-relaxed line-clamp-2">
            {item.description}
          </p>
          
          {/* Source chips - inline */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {item.sources.slice(0, 2).map((source, idx) => (
              <a
                key={source.id || idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-os-border-dark/30 bg-os-surface-dark/20 text-[10px] text-os-text-secondary-dark hover:text-brand-vanilla transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {source.name}
              </a>
            ))}
            {item.sources.length > 2 && (
              <span className="text-[10px] text-os-text-secondary-dark">
                +{item.sources.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Generate button - always visible on mobile, hover on desktop */}
        <button
          onClick={handleGenerateIdeas}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-aperol/10 text-brand-aperol text-xs font-medium hover:bg-brand-aperol/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 md:opacity-0 md:group-hover:opacity-100"
        >
          {isGenerating ? (
            <>
              <div className="w-3 h-3 border-2 border-brand-aperol/30 border-t-brand-aperol rounded-full animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Generate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Accordion section component
function AccordionSection({ title, icon: Icon, items, isOpen, onToggle }: AccordionSectionProps) {
  return (
    <motion.div 
      className="rounded-xl border border-os-border-dark/50 bg-os-surface-dark/20 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Section header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-os-surface-dark/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-brand-aperol" />
          <span className="text-base font-semibold text-brand-vanilla">{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-os-surface-dark text-xs text-os-text-secondary-dark">
            {items.length}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-os-text-secondary-dark" />
        </motion.div>
      </button>

      {/* Expandable content with AnimatePresence */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-os-border-dark/30">
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <InspirationItem item={item} />
                  </motion.div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-os-text-secondary-dark">
                  No items in this category
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function InspirationAccordion({ shortForm, longForm, blog }: InspirationAccordionProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['short-form']));

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <AccordionSection
        title="Short-Form"
        icon={Video}
        items={shortForm}
        isOpen={openSections.has('short-form')}
        onToggle={() => toggleSection('short-form')}
      />

      <AccordionSection
        title="Long-Form"
        icon={FileText}
        items={longForm}
        isOpen={openSections.has('long-form')}
        onToggle={() => toggleSection('long-form')}
      />

      <AccordionSection
        title="Blogging"
        icon={Pen}
        items={blog}
        isOpen={openSections.has('blog')}
        onToggle={() => toggleSection('blog')}
      />
    </div>
  );
}

