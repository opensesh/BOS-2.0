'use client';

import React, { useState } from 'react';
import { X, Plus, ExternalLink, Trash2, Globe } from 'lucide-react';

interface SourceItem {
  id: string;
  name: string;
  url: string;
  category: 'tech' | 'design' | 'stocks' | 'brand' | 'culture' | 'business';
  enabled: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: 'Tech',
  design: 'Design',
  stocks: 'Stocks',
  brand: 'Brand',
  culture: 'Culture',
  business: 'Business',
};

// Default sources organized by single-name categories
const DEFAULT_SOURCES: SourceItem[] = [
  // Tech
  { id: '1', name: 'TechCrunch', url: 'https://techcrunch.com', category: 'tech', enabled: true },
  { id: '2', name: 'The Verge', url: 'https://theverge.com', category: 'tech', enabled: true },
  { id: '3', name: 'Wired', url: 'https://wired.com', category: 'tech', enabled: true },
  { id: '4', name: 'Ars Technica', url: 'https://arstechnica.com', category: 'tech', enabled: false },
  
  // Design
  { id: '5', name: 'It\'s Nice That', url: 'https://itsnicethat.com', category: 'design', enabled: true },
  { id: '6', name: 'Dezeen', url: 'https://dezeen.com', category: 'design', enabled: true },
  { id: '7', name: 'Design Week', url: 'https://designweek.co.uk', category: 'design', enabled: true },
  { id: '8', name: 'Creative Bloq', url: 'https://creativebloq.com', category: 'design', enabled: false },
  
  // Stocks
  { id: '9', name: 'Bloomberg', url: 'https://bloomberg.com', category: 'stocks', enabled: true },
  { id: '10', name: 'Reuters', url: 'https://reuters.com', category: 'stocks', enabled: true },
  { id: '11', name: 'Yahoo Finance', url: 'https://finance.yahoo.com', category: 'stocks', enabled: false },
  
  // Brand
  { id: '12', name: 'Brand New', url: 'https://underconsideration.com/brandnew', category: 'brand', enabled: true },
  { id: '13', name: 'Logo Design Love', url: 'https://logodesignlove.com', category: 'brand', enabled: true },
  { id: '14', name: 'BP&O', url: 'https://bpando.org', category: 'brand', enabled: false },
  
  // Culture
  { id: '15', name: 'Fast Company', url: 'https://fastcompany.com', category: 'culture', enabled: true },
  { id: '16', name: 'Dazed', url: 'https://dazeddigital.com', category: 'culture', enabled: false },
  
  // Business
  { id: '17', name: 'Harvard Business Review', url: 'https://hbr.org', category: 'business', enabled: true },
  { id: '18', name: 'Inc.', url: 'https://inc.com', category: 'business', enabled: false },
];

interface SourcesSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SourcesSettings({ isOpen, onClose }: SourcesSettingsProps) {
  const [sources, setSources] = useState<SourceItem[]>(DEFAULT_SOURCES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', url: '', category: 'tech' as const });

  if (!isOpen) return null;

  const toggleSource = (id: string) => {
    setSources(sources.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const removeSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const addSource = () => {
    if (newSource.name && newSource.url) {
      setSources([
        ...sources,
        {
          id: `custom-${Date.now()}`,
          name: newSource.name,
          url: newSource.url.startsWith('http') ? newSource.url : `https://${newSource.url}`,
          category: newSource.category,
          enabled: true,
        }
      ]);
      setNewSource({ name: '', url: '', category: 'tech' });
      setShowAddForm(false);
    }
  };

  const enabledCount = sources.filter(s => s.enabled).length;
  
  // Get unique categories that have sources
  const categories = Array.from(new Set(sources.map(s => s.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-os-bg-dark border border-os-border-dark rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-os-border-dark">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-aperol/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-brand-aperol" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-brand-vanilla">
                News Sources
              </h2>
              <p className="text-sm text-os-text-secondary-dark">
                {enabledCount} sources active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-os-surface-dark transition-colors"
          >
            <X className="w-5 h-5 text-os-text-secondary-dark" />
          </button>
        </div>

        {/* Description */}
        <div className="px-6 py-4 bg-os-surface-dark/30 border-b border-os-border-dark/50">
          <p className="text-sm text-os-text-secondary-dark leading-relaxed">
            <span className="text-brand-vanilla font-medium">Sources power your Discover feed.</span>{' '}
            We aggregate content from these publications to keep you informed about industry trends, 
            design inspiration, and news relevant to your brand. Enable sources you trust to curate 
            your awareness channels and stay ahead of the curve.
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          {/* Render each category */}
          {categories.map(category => {
            const categorySources = sources.filter(s => s.category === category);
            if (categorySources.length === 0) return null;
            
            return (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-os-text-secondary-dark mb-3">
                  {CATEGORY_LABELS[category] || category}
                </h3>
                <div className="space-y-2">
                  {categorySources.map(source => (
                    <SourceRow 
                      key={source.id} 
                      source={source}
                      onToggle={() => toggleSource(source.id)}
                      onRemove={() => removeSource(source.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Add New Source */}
          {showAddForm ? (
            <div className="p-4 bg-os-surface-dark rounded-xl border border-os-border-dark mt-6">
              <h4 className="text-sm font-medium text-brand-vanilla mb-3">Add Custom Source</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Source name (e.g., Design Milk)"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  className="w-full px-3 py-2 bg-os-bg-dark border border-os-border-dark rounded-lg text-sm text-brand-vanilla placeholder-os-text-secondary-dark focus:outline-none focus:border-brand-aperol"
                />
                <input
                  type="text"
                  placeholder="Website URL (e.g., designmilk.com)"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  className="w-full px-3 py-2 bg-os-bg-dark border border-os-border-dark rounded-lg text-sm text-brand-vanilla placeholder-os-text-secondary-dark focus:outline-none focus:border-brand-aperol"
                />
                <select
                  value={newSource.category}
                  onChange={(e) => setNewSource({ ...newSource, category: e.target.value as SourceItem['category'] })}
                  className="w-full px-3 py-2 bg-os-bg-dark border border-os-border-dark rounded-lg text-sm text-brand-vanilla focus:outline-none focus:border-brand-aperol"
                >
                  <option value="tech">Tech</option>
                  <option value="design">Design</option>
                  <option value="stocks">Stocks</option>
                  <option value="brand">Brand</option>
                  <option value="culture">Culture</option>
                  <option value="business">Business</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 text-sm text-os-text-secondary-dark hover:text-brand-vanilla transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addSource}
                    disabled={!newSource.name || !newSource.url}
                    className="flex-1 px-4 py-2 bg-brand-aperol text-white text-sm font-medium rounded-lg hover:bg-brand-aperol/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Source
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-os-border-dark rounded-xl text-sm text-os-text-secondary-dark hover:text-brand-vanilla hover:border-brand-aperol/50 transition-colors mt-6"
            >
              <Plus className="w-4 h-4" />
              Add Custom Source
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-os-border-dark bg-os-surface-dark/30">
          <p className="text-xs text-os-text-secondary-dark">
            Changes are saved automatically
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-vanilla text-brand-charcoal text-sm font-medium rounded-lg hover:bg-brand-vanilla/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceRow({ 
  source, 
  onToggle, 
  onRemove 
}: { 
  source: SourceItem; 
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
      source.enabled ? 'bg-os-surface-dark' : 'bg-os-surface-dark/30'
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`w-10 h-6 rounded-full p-1 transition-colors ${
            source.enabled ? 'bg-brand-aperol' : 'bg-os-border-dark'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
            source.enabled ? 'translate-x-4' : 'translate-x-0'
          }`} />
        </button>
        <div>
          <p className={`text-sm font-medium transition-colors ${
            source.enabled ? 'text-brand-vanilla' : 'text-os-text-secondary-dark'
          }`}>
            {source.name}
          </p>
          <p className="text-xs text-os-text-secondary-dark">
            {source.url.replace('https://', '')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-os-bg-dark transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-os-text-secondary-dark" />
        </a>
        {source.id.startsWith('custom-') && (
          <button
            onClick={onRemove}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}
