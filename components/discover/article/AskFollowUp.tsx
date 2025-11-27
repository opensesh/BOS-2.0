'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Lightbulb, Mic, Paperclip, Send } from 'lucide-react';

interface AskFollowUpProps {
  articleTitle: string;
}

export function AskFollowUp({ articleTitle }: AskFollowUpProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mt-8 pt-8 border-t border-neutral-700/30 dark:border-neutral-700/30">
      <div className={`relative bg-neutral-800 dark:bg-neutral-800 rounded-xl border transition-all ${
        isFocused ? 'border-brand-aperol/50 shadow-lg shadow-brand-aperol/5' : 'border-neutral-700/50 dark:border-neutral-700/50'
      }`}>
        {/* Input */}
        <div className="flex items-center px-4 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask follow-up"
            className="flex-1 bg-transparent text-brand-charcoal dark:text-brand-vanilla placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none text-base"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-700/30 dark:border-neutral-700/30">
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-neutral-700/50 dark:hover:bg-neutral-700/50 transition-colors group">
              <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-brand-aperol" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-700/50 dark:hover:bg-neutral-700/50 transition-colors group">
              <Sparkles className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-brand-aperol" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-700/50 dark:hover:bg-neutral-700/50 transition-colors group">
              <Lightbulb className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-brand-aperol" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-neutral-700/50 dark:hover:bg-neutral-700/50 transition-colors group">
              <Paperclip className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-brand-aperol" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-700/50 dark:hover:bg-neutral-700/50 transition-colors group">
              <Mic className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-brand-aperol" />
            </button>
            <button 
              className={`p-2 rounded-lg transition-colors ${
                query.trim() 
                  ? 'bg-brand-aperol text-white hover:bg-brand-aperol/90' 
                  : 'bg-neutral-600 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
              }`}
              disabled={!query.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

