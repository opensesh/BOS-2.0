'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ExternalLink, Trash2, Globe, Check, Loader2 } from 'lucide-react';

interface SourceItem {
  id: string;
  name: string;
  url: string;
  category: 'tech' | 'design' | 'stocks' | 'brand' | 'culture' | 'business';
  enabled: boolean;
  isCustom?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: 'Tech',
  design: 'Design',
  stocks: 'Stocks',
  brand: 'Brand',
  culture: 'Culture',
  business: 'Business',
};

// Storage key for custom sources
const CUSTOM_SOURCES_KEY = 'bos-custom-news-sources';

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

// Load custom sources from localStorage
function loadCustomSources(): SourceItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CUSTOM_SOURCES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Save custom sources to localStorage
function saveCustomSources(sources: SourceItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_SOURCES_KEY, JSON.stringify(sources));
  } catch (error) {
    console.error('Failed to save custom sources:', error);
  }
}

export function NewsSettingsContent() {
  const [sources, setSources] = useState<SourceItem[]>(DEFAULT_SOURCES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState<{ name: string; url: string; category: SourceItem['category'] }>({ name: '', url: '', category: 'tech' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load custom sources on mount
  useEffect(() => {
    const customSources = loadCustomSources();
    if (customSources.length > 0) {
      setSources([...DEFAULT_SOURCES, ...customSources]);
    }
  }, []);

  const toggleSource = (id: string) => {
    setSources(sources.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const removeSource = useCallback((id: string) => {
    const sourceToRemove = sources.find(s => s.id === id);
    if (sourceToRemove?.isCustom) {
      const updatedSources = sources.filter(s => s.id !== id);
      setSources(updatedSources);
      // Save updated custom sources to localStorage
      const customSources = updatedSources.filter(s => s.isCustom);
      saveCustomSources(customSources);
    }
  }, [sources]);

  const addSource = useCallback(async () => {
    if (!newSource.name || !newSource.url) return;
    
    setIsSaving(true);
    
    // Simulate brief delay for UX
    await new Promise(r => setTimeout(r, 300));
    
    const newItem: SourceItem = {
      id: `custom-${Date.now()}`,
      name: newSource.name,
      url: newSource.url.startsWith('http') ? newSource.url : `https://${newSource.url}`,
      category: newSource.category,
      enabled: true,
      isCustom: true,
    };
    
    const updatedSources = [...sources, newItem];
    setSources(updatedSources);
    
    // Save custom sources to localStorage
    const customSources = updatedSources.filter(s => s.isCustom);
    saveCustomSources(customSources);
    
    setNewSource({ name: '', url: '', category: 'tech' });
    setIsSaving(false);
    setSaveSuccess(true);
    
    // Reset success state after animation
    setTimeout(() => {
      setSaveSuccess(false);
      setShowAddForm(false);
    }, 1000);
  }, [newSource, sources]);

  const enabledCount = sources.filter(s => s.enabled).length;
  const customCount = sources.filter(s => s.isCustom).length;
  
  // Get unique categories that have sources
  const categories = Array.from(new Set(sources.map(s => s.category)));

  return (
    <div className="p-6">
      {/* Add Source - At the TOP */}
      {showAddForm ? (
        <div className="p-4 bg-os-bg-dark rounded-xl border border-os-border-dark mb-6">
          <h4 className="text-sm font-medium text-brand-vanilla mb-3">Add Custom Source</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Source name (e.g., Design Milk)"
              value={newSource.name}
              onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              className="w-full px-3 py-2 bg-os-surface-dark border border-os-border-dark rounded-lg text-sm text-brand-vanilla placeholder-os-text-secondary-dark focus:outline-none focus:border-brand-aperol"
              autoFocus
            />
            <input
              type="text"
              placeholder="RSS feed or website URL"
              value={newSource.url}
              onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
              className="w-full px-3 py-2 bg-os-surface-dark border border-os-border-dark rounded-lg text-sm text-brand-vanilla placeholder-os-text-secondary-dark focus:outline-none focus:border-brand-aperol"
            />
            <select
              value={newSource.category}
              onChange={(e) => setNewSource({ ...newSource, category: e.target.value as SourceItem['category'] })}
              className="w-full px-3 py-2 bg-os-surface-dark border border-os-border-dark rounded-lg text-sm text-brand-vanilla focus:outline-none focus:border-brand-aperol"
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
                className="flex-1 px-4 py-2 text-sm text-os-text-secondary-dark hover:text-brand-vanilla transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addSource}
                disabled={!newSource.name || !newSource.url || isSaving}
                className="flex-1 px-4 py-2 bg-brand-aperol text-white text-sm font-medium rounded-lg hover:bg-brand-aperol/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  'Add Source'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-os-border-dark rounded-xl text-sm text-os-text-secondary-dark hover:text-brand-vanilla hover:border-brand-aperol/50 transition-colors mb-6"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      )}

      {/* Header info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-brand-aperol/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-brand-aperol" />
        </div>
        <div>
          <p className="text-sm font-medium text-brand-vanilla">News Sources</p>
          <p className="text-xs text-os-text-secondary-dark">
            {enabledCount} active{customCount > 0 && ` · ${customCount} custom`}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-os-text-secondary-dark leading-relaxed mb-6 pb-4 border-b border-os-border-dark">
        Sources power your Discover feed. Enable sources you trust to curate your awareness channels.
      </p>

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
      source.enabled ? 'bg-os-bg-dark' : 'bg-os-bg-dark/30'
    } ${source.isCustom ? 'ring-1 ring-brand-aperol/20' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
            source.enabled ? 'bg-brand-aperol' : 'bg-os-border-dark'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
            source.enabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium transition-colors ${
              source.enabled ? 'text-brand-vanilla' : 'text-os-text-secondary-dark'
            }`}>
              {source.name}
            </p>
            {source.isCustom && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-brand-aperol/20 text-brand-aperol rounded">
                Custom
              </span>
            )}
          </div>
          <p className="text-xs text-os-text-secondary-dark truncate max-w-[180px]">
            {source.url.replace('https://', '').replace('http://', '')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-os-surface-dark transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-os-text-secondary-dark" />
        </a>
        {source.isCustom && (
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Remove custom source"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}

