import { anthropic } from '@ai-sdk/anthropic';
import { perplexity } from '@ai-sdk/perplexity';

export type ModelId = 'auto' | 'claude-sonnet' | 'claude-haiku' | 'sonar' | 'sonar-pro';

export interface ModelConfig {
  id: ModelId;
  name: string;
  version?: string;
  description: string;
  provider: 'anthropic' | 'perplexity' | 'auto';
  tier: 'fast' | 'balanced' | 'capable' | 'search' | 'smart';
}

export const models: Record<ModelId, ModelConfig> = {
  auto: {
    id: 'auto',
    name: 'Auto',
    description: 'Automatically selects the best model',
    provider: 'auto',
    tier: 'smart',
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    name: 'Sonnet',
    version: '4',
    description: 'Smartest for everyday tasks',
    provider: 'anthropic',
    tier: 'balanced',
  },
  'claude-haiku': {
    id: 'claude-haiku',
    name: 'Haiku',
    version: '3.5',
    description: 'Fastest for quick answers',
    provider: 'anthropic',
    tier: 'fast',
  },
  sonar: {
    id: 'sonar',
    name: 'Sonar',
    description: 'Web search for current info',
    provider: 'perplexity',
    tier: 'search',
  },
  'sonar-pro': {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    description: 'Advanced search with more sources',
    provider: 'perplexity',
    tier: 'capable',
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
      // Default to Claude Sonnet for 'auto' or unknown models
      return anthropic('claude-sonnet-4-20250514');
  }
}

// Get all available model options for the selector
export function getModelOptions(): ModelConfig[] {
  return Object.values(models);
}
