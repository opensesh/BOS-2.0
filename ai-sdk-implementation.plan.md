# AI SDK Integration Plan (with Supabase)

## Overview

Implement Vercel AI SDK with Claude as default model, model selection UI with "Auto" routing based on query complexity, and Supabase for chat persistence.

---

## Phase 1: Dependencies and Environment Setup

### Install Packages

```bash
npm install ai @ai-sdk/react @ai-sdk/anthropic @ai-sdk/perplexity zod @supabase/supabase-js @supabase/ssr
```

### Environment Variables (`.env.local`)

```bash
# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...

# Supabase (from Supabase dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Safe API Key Setup:** Add keys in Vercel Dashboard → Project Settings → Environment Variables. Never commit `.env.local` to git.

---

## Phase 2: Supabase Database Schema

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Chats table (conversation sessions)
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_chats_user_id ON chats(user_id);

-- Row Level Security (RLS)
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in own chats" ON messages
  FOR SELECT USING (
    chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in own chats" ON messages
  FOR INSERT WITH CHECK (
    chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid())
  );

-- Anonymous access policy (for users not logged in)
-- Remove these if you want to require authentication
CREATE POLICY "Allow anonymous chat creation" ON chats
  FOR ALL USING (user_id IS NULL);

CREATE POLICY "Allow anonymous message access" ON messages
  FOR ALL USING (
    chat_id IN (SELECT id FROM chats WHERE user_id IS NULL)
  );
```

---

## Phase 3: Supabase Client Utilities

### Create `lib/supabase/client.ts` (Browser client)

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Create `lib/supabase/server.ts` (Server client)

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  );
}
```

---

## Phase 4: Provider Registry and Model Configuration

### Create `lib/ai/providers.ts`

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { perplexity } from '@ai-sdk/perplexity';

export type ModelId = 'auto' | 'claude-sonnet' | 'claude-haiku' | 'sonar' | 'sonar-pro';

export interface ModelConfig {
  id: ModelId;
  name: string;
  description: string;
  provider: 'anthropic' | 'perplexity' | 'auto';
  tier: 'fast' | 'balanced' | 'capable' | 'search' | 'smart';
  icon: string;
}

export const models: Record<ModelId, ModelConfig> = {
  auto: {
    id: 'auto',
    name: 'Auto',
    description: 'Automatically selects the best model based on your query',
    provider: 'auto',
    tier: 'smart',
    icon: '✨',
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    name: 'Claude Sonnet',
    description: 'Balanced performance for most tasks',
    provider: 'anthropic',
    tier: 'balanced',
    icon: '🎯',
  },
  'claude-haiku': {
    id: 'claude-haiku',
    name: 'Claude Haiku',
    description: 'Fast responses for simple queries',
    provider: 'anthropic',
    tier: 'fast',
    icon: '⚡',
  },
  sonar: {
    id: 'sonar',
    name: 'Perplexity Sonar',
    description: 'Web search for current information',
    provider: 'perplexity',
    tier: 'search',
    icon: '🌐',
  },
  'sonar-pro': {
    id: 'sonar-pro',
    name: 'Perplexity Sonar Pro',
    description: 'Advanced web search with more sources',
    provider: 'perplexity',
    tier: 'capable',
    icon: '🔍',
  },
};

export function getModelInstance(modelId: ModelId) {
  switch (modelId) {
    case 'claude-sonnet':
      return anthropic('claude-sonnet-4-20250514');
    case 'claude-haiku':
      return anthropic('claude-3-5-haiku-20241022');
    case 'sonar':
      return perplexity('sonar');
    case 'sonar-pro':
      return perplexity('sonar-pro');
    default:
      return anthropic('claude-sonnet-4-20250514');
  }
}
```

---

## Phase 5: Auto Model Selection Logic

### Create `lib/ai/auto-router.ts`

```typescript
import { ModelId } from './providers';

interface Message {
  role: string;
  content: string;
}

// Keywords that suggest different model needs
const RESEARCH_KEYWORDS = [
  'research', 'analyze', 'compare', 'explain in depth', 'comprehensive',
  'detailed analysis', 'investigate', 'evaluate', 'assess', 'examine'
];

const CURRENT_EVENTS_KEYWORDS = [
  'latest', 'current', 'news', 'today', 'recent', 'now', 'this week',
  'this month', '2024', '2025', 'happening', 'update'
];

const SIMPLE_QUERY_PATTERNS = [
  /^(what|who|when|where|how|why) is/i,
  /^define /i,
  /^translate /i,
  /^convert /i,
];

export function autoSelectModel(messages: Message[]): ModelId {
  // Get the last user message for analysis
  const lastUserMessage = [...messages]
    .reverse()
    .find(m => m.role === 'user');

  if (!lastUserMessage) {
    return 'claude-sonnet'; // Default
  }

  const query = lastUserMessage.content.toLowerCase();
  const queryLength = lastUserMessage.content.length;

  // Check for current events/web search needs
  if (CURRENT_EVENTS_KEYWORDS.some(keyword => query.includes(keyword))) {
    return 'sonar';
  }

  // Check for research/complex analysis needs
  if (RESEARCH_KEYWORDS.some(keyword => query.includes(keyword))) {
    return 'claude-sonnet';
  }

  // Check for simple queries
  const isSimpleQuery = SIMPLE_QUERY_PATTERNS.some(pattern => pattern.test(query));
  
  if (isSimpleQuery || queryLength < 50) {
    return 'claude-haiku';
  }

  // Medium complexity - use balanced model
  if (queryLength < 200) {
    return 'claude-sonnet';
  }

  // Long/complex queries - use capable model
  return 'claude-sonnet';
}

export function getAutoRouterExplanation(modelId: ModelId, query: string): string {
  const q = query.toLowerCase();
  
  if (CURRENT_EVENTS_KEYWORDS.some(k => q.includes(k))) {
    return 'Using web search for current information';
  }
  if (RESEARCH_KEYWORDS.some(k => q.includes(k))) {
    return 'Using advanced model for in-depth analysis';
  }
  if (query.length < 50) {
    return 'Using fast model for quick response';
  }
  return 'Using balanced model for this query';
}
```

---

## Phase 6: Update API Route

### Refactor `app/api/chat/route.ts`

```typescript
import { streamText } from 'ai';
import { ModelId, getModelInstance } from '@/lib/ai/providers';
import { autoSelectModel } from '@/lib/ai/auto-router';

export const maxDuration = 30; // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  try {
    const { messages, model = 'auto' } = await req.json();

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Select model (auto-route if needed)
    const selectedModel: ModelId = model === 'auto' 
      ? autoSelectModel(messages) 
      : model;

    // Get the model instance
    const modelInstance = getModelInstance(selectedModel);

    // Stream the response
    const result = streamText({
      model: modelInstance,
      messages,
      // System prompt for brand context
      system: `You are the Brand Operating System (BOS), an AI assistant designed to help with brand strategy, creative direction, and business operations. You are friendly, creative, and visionary. Use first person plural (we, us, our) and maintain an active, present-tense voice.`,
    });

    // Return streaming response with model info in headers
    return result.toDataStreamResponse({
      headers: {
        'X-Model-Used': selectedModel,
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

---

## Phase 7: Model Selector UI Component

### Create `components/ui/model-selector.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Zap, Target, Globe, Search } from 'lucide-react';
import { models, ModelId, ModelConfig } from '@/lib/ai/providers';

interface ModelSelectorProps {
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  disabled?: boolean;
}

const modelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  auto: Sparkles,
  'claude-sonnet': Target,
  'claude-haiku': Zap,
  sonar: Globe,
  'sonar-pro': Search,
};

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = models[selectedModel];
  const CurrentIcon = modelIcons[selectedModel] || Sparkles;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
          transition-all duration-200
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-os-bg-dark cursor-pointer'
          }
          ${isOpen 
            ? 'bg-os-bg-dark text-brand-aperol' 
            : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
          }
        `}
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="font-medium">{currentModel.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-os-surface-dark rounded-xl border border-os-border-dark shadow-xl overflow-hidden z-50">
          <div className="p-2">
            {Object.values(models).map((model) => {
              const Icon = modelIcons[model.id] || Sparkles;
              const isSelected = model.id === selectedModel;
              
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-start gap-3 p-3 rounded-lg text-left
                    transition-colors duration-150
                    ${isSelected 
                      ? 'bg-brand-aperol/10 text-brand-aperol' 
                      : 'hover:bg-os-bg-dark text-os-text-primary-dark'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-brand-aperol' : 'text-os-text-secondary-dark'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.name}</span>
                      {model.id === 'auto' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-brand-aperol/20 text-brand-aperol">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-os-text-secondary-dark mt-0.5 truncate">
                      {model.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 8: Update ChatInterface Component

### Key changes to `components/ChatInterface.tsx`:

1. Import and use `useChat` hook from `@ai-sdk/react`
2. Add `ModelSelector` component
3. Pass selected model to API via `body` option
4. Keep existing UI features (connectors, voice, keyboard shortcuts)

```typescript
// Key additions:
import { useChat } from '@ai-sdk/react';
import { ModelSelector } from './ui/model-selector';
import { ModelId } from '@/lib/ai/providers';

// Inside component:
const [selectedModel, setSelectedModel] = useState<ModelId>('auto');

const { messages, input, setInput, handleSubmit, isLoading, error } = useChat({
  api: '/api/chat',
  body: { model: selectedModel },
});

// Add ModelSelector to toolbar (near SearchResearchToggle)
```

---

## File Changes Summary

| File | Action |
|------|--------|
| `package.json` | Add AI SDK + Supabase dependencies |
| `.env.local` | Add API keys (local only, not committed) |
| `.env.example` | New - template for environment variables |
| `lib/supabase/client.ts` | New - browser Supabase client |
| `lib/supabase/server.ts` | New - server Supabase client |
| `lib/ai/providers.ts` | New - model registry and instances |
| `lib/ai/auto-router.ts` | New - auto model selection logic |
| `app/api/chat/route.ts` | Refactor to use AI SDK streamText |
| `components/ui/model-selector.tsx` | New - model picker dropdown |
| `components/ChatInterface.tsx` | Integrate useChat hook + model selector |

---

## Supabase Setup Checklist

1. [ ] Create Supabase project at [supabase.com](https://supabase.com)
2. [ ] Run the SQL schema in Supabase SQL Editor
3. [ ] Copy API keys from Settings → API to Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

---

## Testing Plan

1. Start dev server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Test model selector dropdown
4. Test auto model selection with different query types:
   - Simple: "What is a brand?" → Should use Haiku
   - Research: "Analyze competitor brand strategies" → Should use Sonnet
   - Current: "What's the latest news about AI?" → Should use Sonar
5. Verify streaming responses work correctly

