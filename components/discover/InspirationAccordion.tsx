'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Video, 
  FileText, 
  Pen, 
  ChevronDown, 
  ChevronUp,
  Star,
  ExternalLink,
  Sparkles,
  Calendar
} from 'lucide-react';
import { InspirationCardData } from '@/types';

interface InspirationAccordionProps {
  shortForm: InspirationCardData[];
  longForm: InspirationCardData[];
  blog: InspirationCardData[];
  lastUpdated?: string;
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
      <div className="flex items-start justify-between gap-4">
        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-brand-vanilla group-hover:text-brand-aperol transition-colors">
            {item.title}
          </h4>
          <p className="mt-1 text-sm text-os-text-secondary-dark leading-relaxed">
            {item.description}
          </p>
          
          {/* Source chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {item.sources.map((source, idx) => (
              <a
                key={source.id || idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-os-border-dark/50 bg-os-surface-dark/30 text-xs text-os-text-secondary-dark hover:text-brand-vanilla hover:border-os-border-dark transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {source.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>

        {/* Right side: Star + Generate button */}
        <div className="flex items-center gap-3 shrink-0">
          {item.starred && (
            <Star className="w-5 h-5 text-brand-aperol fill-brand-aperol" />
          )}
          <button
            onClick={handleGenerateIdeas}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-aperol/10 text-brand-aperol text-sm font-medium hover:bg-brand-aperol/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 border-2 border-brand-aperol/30 border-t-brand-aperol rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Ideas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Accordion section component
function AccordionSection({ title, icon: Icon, items, isOpen, onToggle }: AccordionSectionProps) {
  return (
    <div className="rounded-xl border border-os-border-dark/50 bg-os-surface-dark/20 overflow-hidden">
      {/* Section header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-os-surface-dark/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-brand-vanilla" />
          <span className="text-lg font-semibold text-brand-vanilla">{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-os-surface-dark text-xs text-os-text-secondary-dark">
            {items.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-os-text-secondary-dark" />
        ) : (
          <ChevronDown className="w-5 h-5 text-os-text-secondary-dark" />
        )}
      </button>

      {/* Expandable content */}
      <div 
        className={`
          grid transition-all duration-300 ease-in-out
          ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
        `}
      >
        <div className="overflow-hidden">
          <div className="border-t border-os-border-dark/30">
            {items.length > 0 ? (
              items.map((item) => (
                <InspirationItem key={item.id} item={item} />
              ))
            ) : (
              <div className="px-4 py-8 text-center text-os-text-secondary-dark">
                No items in this category
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InspirationAccordion({ shortForm, longForm, blog, lastUpdated }: InspirationAccordionProps) {
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

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Today at 8:00 AM';
    try {
      const date = new Date(lastUpdated);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return lastUpdated;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-vanilla">
          Inspiration
        </h1>
        <p className="text-os-text-secondary-dark text-lg">
          Daily content ideas generated and filtered by category
        </p>
        
        {/* Last updated + date picker */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-brand-aperol" />
            <span className="text-os-text-secondary-dark">
              Last updated: {formatLastUpdated()}
            </span>
          </div>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-os-border-dark/50 bg-os-surface-dark/30 text-brand-vanilla text-sm hover:bg-os-surface-dark/50 transition-colors">
            <Calendar className="w-4 h-4" />
            Today
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Accordion sections */}
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
    </div>
  );
}

