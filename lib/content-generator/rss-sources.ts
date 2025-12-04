/**
 * Curated RSS Sources for OPEN SESSION
 * 
 * Design and creative-focused feeds organized by topic category.
 * These replace the generic tech news feeds with content more relevant
 * to brand designers and creative professionals.
 * 
 * Updated: December 2025
 */

import { NewsTopicCategory } from '@/types';

export interface RSSSource {
  name: string;
  url: string;
  category: NewsTopicCategory;
  priority: number; // 1 = highest priority, 3 = lowest
  keywords?: string[]; // Optional keywords for additional filtering
}

/**
 * Design & UX/UI focused sources
 */
const DESIGN_UX_SOURCES: RSSSource[] = [
  {
    name: 'Figma Blog',
    url: 'https://figma.com/blog/feed/atom.xml',
    category: 'design-ux',
    priority: 1,
    keywords: ['figma', 'design', 'product design', 'collaboration'],
  },
  {
    name: 'Freethink',
    url: 'https://www.freethink.com/feed/all',
    category: 'design-ux',
    priority: 1,
    keywords: ['innovation', 'technology', 'future', 'design'],
  },
  {
    name: 'Design Better',
    url: 'https://designbetterpodcast.com/feed',
    category: 'design-ux',
    priority: 1,
    keywords: ['design', 'podcast', 'product design', 'teams'],
  },
  {
    name: 'AI Patterns (Tommy Geoco)',
    url: 'https://aipatterns.substack.com/feed',
    category: 'design-ux',
    priority: 1,
    keywords: ['ai', 'design patterns', 'ux', 'ai design'],
  },
  {
    name: 'Love + Money',
    url: 'https://loveandmoney.substack.com/feed',
    category: 'design-ux',
    priority: 1,
    keywords: ['ai', 'creative', 'business', 'design'],
  },
];

/**
 * Branding & Strategy focused sources
 */
const BRANDING_SOURCES: RSSSource[] = [
  {
    name: 'Logo Design Love',
    url: 'https://www.logodesignlove.com/feed',
    category: 'branding',
    priority: 1,
    keywords: ['logo', 'identity', 'branding'],
  },
  {
    name: 'BP&O',
    url: 'https://bpando.org/feed/',
    category: 'branding',
    priority: 1,
    keywords: ['branding', 'packaging', 'opinion'],
  },
  {
    name: 'Identity Designed',
    url: 'https://identitydesigned.com/feed/',
    category: 'branding',
    priority: 1,
    keywords: ['branding', 'identity', 'logo', 'visual identity'],
  },
];

/**
 * AI for Creatives sources
 */
const AI_CREATIVE_SOURCES: RSSSource[] = [
  {
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    category: 'ai-creative',
    priority: 1,
    keywords: ['ai', 'google', 'gemini', 'bard'],
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'ai-creative',
    priority: 1,
    keywords: ['ai', 'machine learning', 'startups'],
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/features/',
    category: 'ai-creative',
    priority: 1,
    keywords: ['ai', 'technology', 'science'],
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    category: 'ai-creative',
    priority: 1,
    keywords: ['ai', 'enterprise', 'machine learning'],
  },
  {
    name: 'MIT Technology Review AI',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    category: 'ai-creative',
    priority: 2,
    keywords: ['ai', 'research', 'technology'],
  },
  {
    name: 'Awwwards',
    url: 'https://www.awwwards.com/blog/feed',
    category: 'ai-creative',
    priority: 1,
    keywords: ['web design', 'awards', 'creative', 'inspiration'],
  },
  {
    name: 'Dribbble',
    url: 'https://dribbble.com/stories.rss',
    category: 'ai-creative',
    priority: 1,
    keywords: ['design', 'creative', 'portfolio', 'inspiration'],
  },
];

/**
 * Social Media Trends sources
 */
const SOCIAL_TRENDS_SOURCES: RSSSource[] = [
  {
    name: 'Oren Meets World',
    url: 'https://www.productworld.xyz/feed',
    category: 'social-trends',
    priority: 1,
    keywords: ['product', 'strategy', 'social', 'trends'],
  },
  {
    name: 'Gary Vaynerchuk',
    url: 'https://www.garyvaynerchuk.com/feed',
    category: 'social-trends',
    priority: 1,
    keywords: ['social media', 'marketing', 'entrepreneurship', 'content'],
  },
];

/**
 * General Tech sources (kept for broader context)
 */
const GENERAL_TECH_SOURCES: RSSSource[] = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'general-tech',
    priority: 2,
    keywords: ['technology', 'startups', 'innovation'],
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'general-tech',
    priority: 2,
    keywords: ['technology', 'gadgets', 'culture'],
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'general-tech',
    priority: 3,
    keywords: ['technology', 'science', 'culture'],
  },
  {
    name: 'Naval Ravikant',
    url: 'https://nav.al/podcast/feed',
    category: 'general-tech',
    priority: 1,
    keywords: ['startup', 'philosophy', 'wealth', 'entrepreneurship'],
  },
  {
    name: 'Peter Yang (Creator Economy)',
    url: 'https://creatoreconomy.so/feed',
    category: 'general-tech',
    priority: 1,
    keywords: ['creator', 'economy', 'product', 'growth'],
  },
  {
    name: 'Sequoia Capital',
    url: 'https://medium.com/feed/sequoia-capital',
    category: 'general-tech',
    priority: 1,
    keywords: ['venture', 'startup', 'investing', 'growth'],
  },
  {
    name: 'a16z',
    url: 'https://a16z.com/news-content/feed',
    category: 'general-tech',
    priority: 1,
    keywords: ['venture', 'crypto', 'ai', 'startup'],
  },
  {
    name: 'SemiAnalysis',
    url: 'https://semianalysis.substack.com/feed',
    category: 'general-tech',
    priority: 1,
    keywords: ['semiconductors', 'ai', 'chips', 'hardware'],
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    category: 'general-tech',
    priority: 2,
    keywords: ['tech', 'startup', 'programming', 'news'],
  },
];

/**
 * Startup/Agency Business sources
 */
const STARTUP_BUSINESS_SOURCES: RSSSource[] = [
  {
    name: 'a16z',
    url: 'https://a16z.com/news-content/feed',
    category: 'startup-business',
    priority: 1,
    keywords: ['venture', 'crypto', 'ai', 'startup'],
  },
  {
    name: 'Derek Thompson',
    url: 'https://derekthompson.substack.com/feed',
    category: 'startup-business',
    priority: 1,
    keywords: ['culture', 'economics', 'media', 'trends'],
  },
  {
    name: "Lenny's Newsletter",
    url: 'https://lennysnewsletter.com/feed',
    category: 'startup-business',
    priority: 1,
    keywords: ['product', 'growth', 'startup', 'advice'],
  },
  {
    name: 'Marcus on AI (Gary Marcus)',
    url: 'https://garymarcus.substack.com/feed',
    category: 'startup-business',
    priority: 1,
    keywords: ['ai', 'criticism', 'technology', 'analysis'],
  },
  {
    name: 'Naval Ravikant',
    url: 'https://nav.al/podcast/feed',
    category: 'startup-business',
    priority: 1,
    keywords: ['startup', 'philosophy', 'wealth', 'entrepreneurship'],
  },
  {
    name: 'Peter Yang (Creator Economy)',
    url: 'https://creatoreconomy.so/feed',
    category: 'startup-business',
    priority: 1,
    keywords: ['creator', 'economy', 'product', 'growth'],
  },
  {
    name: 'Sequoia Capital',
    url: 'https://medium.com/feed/sequoia-capital',
    category: 'startup-business',
    priority: 1,
    keywords: ['venture', 'startup', 'investing', 'growth'],
  },
];

/**
 * All RSS sources combined
 */
export const ALL_RSS_SOURCES: RSSSource[] = [
  ...DESIGN_UX_SOURCES,
  ...BRANDING_SOURCES,
  ...AI_CREATIVE_SOURCES,
  ...SOCIAL_TRENDS_SOURCES,
  ...GENERAL_TECH_SOURCES,
  ...STARTUP_BUSINESS_SOURCES,
];

/**
 * Get sources by category
 */
export function getSourcesByCategory(category: NewsTopicCategory): RSSSource[] {
  return ALL_RSS_SOURCES.filter(source => source.category === category);
}

/**
 * Get high-priority sources (priority 1)
 */
export function getHighPrioritySources(): RSSSource[] {
  return ALL_RSS_SOURCES.filter(source => source.priority === 1);
}

/**
 * Get sources for daily fetch (prioritized list)
 */
export function getSourcesForDailyFetch(): RSSSource[] {
  // Return all priority 1 sources and some priority 2 sources
  return ALL_RSS_SOURCES
    .filter(source => source.priority <= 2)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Keywords for each topic category (used for classification)
 */
export const CATEGORY_KEYWORDS: Record<NewsTopicCategory, string[]> = {
  'design-ux': [
    'design', 'ux', 'ui', 'user experience', 'interface', 'typography',
    'figma', 'sketch', 'adobe', 'prototype', 'wireframe', 'usability',
    'accessibility', 'responsive', 'mobile design', 'web design',
    'design system', 'component', 'atomic design', 'design token',
  ],
  'branding': [
    'brand', 'branding', 'logo', 'identity', 'rebrand', 'visual identity',
    'brand strategy', 'brand guidelines', 'packaging', 'trademark',
    'brand voice', 'positioning', 'brand architecture', 'naming',
  ],
  'ai-creative': [
    'ai', 'artificial intelligence', 'machine learning', 'generative',
    'chatgpt', 'gpt', 'claude', 'gemini', 'midjourney', 'dall-e', 'stable diffusion',
    'runway', 'sora', 'ai art', 'ai design', 'ai tool', 'prompt',
    'text-to-image', 'text-to-video', 'llm', 'large language model',
    'figma ai', 'adobe firefly', 'creative ai',
  ],
  'social-trends': [
    'instagram', 'tiktok', 'linkedin', 'youtube', 'twitter', 'x',
    'social media', 'influencer', 'viral', 'algorithm', 'engagement',
    'content creator', 'shorts', 'reels', 'stories', 'carousel',
    'hashtag', 'trending', 'social strategy', 'platform update',
  ],
  'general-tech': [
    'technology', 'tech', 'startup', 'innovation', 'digital',
    'software', 'hardware', 'app', 'platform', 'saas', 'cloud',
    'developer', 'engineering', 'product', 'launch',
  ],
  'startup-business': [
    'startup', 'entrepreneur', 'agency', 'freelance', 'business',
    'funding', 'venture', 'growth', 'scale', 'revenue', 'client',
    'proposal', 'pricing', 'retainer', 'contract', 'portfolio',
    'pitch', 'investor', 'bootstrap', 'solopreneur',
  ],
};

export default ALL_RSS_SOURCES;
