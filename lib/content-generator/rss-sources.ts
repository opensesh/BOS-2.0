/**
 * Curated RSS Sources for OPEN SESSION
 * 
 * Design and creative-focused feeds organized by topic category.
 * These replace the generic tech news feeds with content more relevant
 * to brand designers and creative professionals.
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
    name: 'Design Week',
    url: 'https://www.designweek.co.uk/feed/',
    category: 'design-ux',
    priority: 1,
    keywords: ['design', 'ux', 'ui', 'branding', 'typography'],
  },
  {
    name: 'Creative Bloq',
    url: 'https://www.creativebloq.com/feed',
    category: 'design-ux',
    priority: 1,
    keywords: ['design', 'creative', 'graphic design', 'illustration'],
  },
  {
    name: "It's Nice That",
    url: 'https://www.itsnicethat.com/rss/all',
    category: 'design-ux',
    priority: 1,
    keywords: ['design', 'art', 'illustration', 'photography'],
  },
  {
    name: 'Abduzeedo',
    url: 'https://abduzeedo.com/rss.xml',
    category: 'design-ux',
    priority: 2,
    keywords: ['design', 'inspiration', 'tutorials'],
  },
  {
    name: 'UX Collective',
    url: 'https://uxdesign.cc/feed',
    category: 'design-ux',
    priority: 1,
    keywords: ['ux', 'user experience', 'design thinking', 'product design'],
  },
  {
    name: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com/feed/',
    category: 'design-ux',
    priority: 2,
    keywords: ['web design', 'ux', 'css', 'accessibility'],
  },
  {
    name: 'A List Apart',
    url: 'https://alistapart.com/main/feed/',
    category: 'design-ux',
    priority: 2,
    keywords: ['web design', 'development', 'accessibility'],
  },
];

/**
 * Branding & Strategy focused sources
 */
const BRANDING_SOURCES: RSSSource[] = [
  {
    name: 'Brand New (Under Consideration)',
    url: 'https://www.underconsideration.com/brandnew/feed',
    category: 'branding',
    priority: 1,
    keywords: ['branding', 'logo', 'identity', 'rebrand'],
  },
  {
    name: 'The Dieline',
    url: 'https://thedieline.com/blog?format=rss',
    category: 'branding',
    priority: 1,
    keywords: ['packaging', 'branding', 'design'],
  },
  {
    name: 'Logo Design Love',
    url: 'https://www.logodesignlove.com/feed',
    category: 'branding',
    priority: 2,
    keywords: ['logo', 'identity', 'branding'],
  },
  {
    name: 'BP&O',
    url: 'https://bpando.org/feed/',
    category: 'branding',
    priority: 2,
    keywords: ['branding', 'packaging', 'opinion'],
  },
];

/**
 * AI for Creatives sources
 */
const AI_CREATIVE_SOURCES: RSSSource[] = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss/',
    category: 'ai-creative',
    priority: 1,
    keywords: ['ai', 'gpt', 'dall-e', 'sora', 'chatgpt'],
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news/rss',
    category: 'ai-creative',
    priority: 1,
    keywords: ['ai', 'claude', 'anthropic'],
  },
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
    name: 'The Verge AI',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    category: 'ai-creative',
    priority: 2,
    keywords: ['ai', 'technology'],
  },
  {
    name: 'Ars Technica AI',
    url: 'https://feeds.arstechnica.com/arstechnica/features/',
    category: 'ai-creative',
    priority: 2,
    keywords: ['ai', 'technology', 'science'],
  },
];

/**
 * Social Media Trends sources
 */
const SOCIAL_TRENDS_SOURCES: RSSSource[] = [
  {
    name: 'Social Media Today',
    url: 'https://www.socialmediatoday.com/feed/',
    category: 'social-trends',
    priority: 1,
    keywords: ['social media', 'marketing', 'trends'],
  },
  {
    name: 'Later Blog',
    url: 'https://later.com/blog/feed/',
    category: 'social-trends',
    priority: 1,
    keywords: ['instagram', 'social media', 'marketing'],
  },
  {
    name: 'Buffer Resources',
    url: 'https://buffer.com/resources/feed/',
    category: 'social-trends',
    priority: 2,
    keywords: ['social media', 'marketing', 'content'],
  },
  {
    name: 'Hootsuite Blog',
    url: 'https://blog.hootsuite.com/feed/',
    category: 'social-trends',
    priority: 2,
    keywords: ['social media', 'marketing', 'analytics'],
  },
  {
    name: 'Sprout Social Insights',
    url: 'https://sproutsocial.com/insights/feed/',
    category: 'social-trends',
    priority: 2,
    keywords: ['social media', 'marketing', 'strategy'],
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
];

/**
 * Startup/Agency Business sources
 */
const STARTUP_BUSINESS_SOURCES: RSSSource[] = [
  {
    name: 'a]6z',
    url: 'https://a16z.com/feed/',
    category: 'startup-business',
    priority: 1,
    keywords: ['startup', 'venture capital', 'business'],
  },
  {
    name: 'First Round Review',
    url: 'https://review.firstround.com/feed.xml',
    category: 'startup-business',
    priority: 1,
    keywords: ['startup', 'management', 'growth'],
  },
  {
    name: 'Agency Post (HubSpot)',
    url: 'https://blog.hubspot.com/agency/rss.xml',
    category: 'startup-business',
    priority: 2,
    keywords: ['agency', 'marketing', 'business'],
  },
  {
    name: 'Creative Mornings',
    url: 'https://creativemornings.com/talks/feed',
    category: 'startup-business',
    priority: 2,
    keywords: ['creative', 'talks', 'inspiration'],
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


