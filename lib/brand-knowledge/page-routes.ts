/**
 * Brand Page Routes
 *
 * Maps brand topics to their corresponding app pages for resource cards.
 */

import { BrandPageRoute } from './types';

// Topic to page route mapping
export const BRAND_PAGE_ROUTES: Record<string, BrandPageRoute> = {
  logos: {
    topic: 'logos',
    title: 'Logo System',
    description: 'View all logo variants and usage guidelines',
    href: '/brand-hub/logo',
    icon: 'Hexagon',
    thumbnail: '/assets/logos/brandmark-vanilla.svg',
  },
  colors: {
    topic: 'colors',
    title: 'Color Palette',
    description: 'Explore our brand colors and color system',
    href: '/brand-hub/colors',
    icon: 'Palette',
  },
  fonts: {
    topic: 'fonts',
    title: 'Typography',
    description: 'View our font families and type scale',
    href: '/brand-hub/fonts',
    icon: 'Type',
  },
  typography: {
    topic: 'typography',
    title: 'Typography',
    description: 'View our font families and type scale',
    href: '/brand-hub/fonts',
    icon: 'Type',
  },
  guidelines: {
    topic: 'guidelines',
    title: 'Brand Guidelines',
    description: 'Complete brand usage guidelines',
    href: '/brand-hub/guidelines',
    icon: 'BookOpen',
  },
  'art-direction': {
    topic: 'art-direction',
    title: 'Art Direction',
    description: 'Visual philosophy and creative territories',
    href: '/brand-hub/art-direction',
    icon: 'Camera',
  },
  images: {
    topic: 'images',
    title: 'Art Direction',
    description: 'Photography and visual assets by theme',
    href: '/brand-hub/art-direction',
    icon: 'Image',
  },
  photography: {
    topic: 'photography',
    title: 'Art Direction',
    description: 'Photography style and thematic categories',
    href: '/brand-hub/art-direction',
    icon: 'Camera',
  },
  identity: {
    topic: 'identity',
    title: 'Brand Identity',
    description: 'Mission, vision, values and personality',
    href: '/brain/brand-identity',
    icon: 'Fingerprint',
  },
  voice: {
    topic: 'voice',
    title: 'Writing Styles',
    description: 'Brand voice and tone guidelines',
    href: '/brain/writing-styles',
    icon: 'MessageSquare',
  },
  tone: {
    topic: 'tone',
    title: 'Writing Styles',
    description: 'Tone variations by context and channel',
    href: '/brain/writing-styles',
    icon: 'MessageSquare',
  },
  writing: {
    topic: 'writing',
    title: 'Writing Styles',
    description: 'Platform-specific writing guidelines',
    href: '/brain/writing-styles',
    icon: 'PenTool',
  },
  messaging: {
    topic: 'messaging',
    title: 'Writing Styles',
    description: 'Brand messaging and content pillars',
    href: '/brain/writing-styles',
    icon: 'MessageCircle',
  },
  textures: {
    topic: 'textures',
    title: 'Art Direction',
    description: 'Texture overlays and visual treatments',
    href: '/brand-hub/art-direction',
    icon: 'Layers',
  },
  illustrations: {
    topic: 'illustrations',
    title: 'Art Direction',
    description: 'Abstract illustrations and shapes',
    href: '/brand-hub/art-direction',
    icon: 'Shapes',
  },
};

// Brand source documents with metadata
// href is the page link for clicking the citation inline
// tab is the specific tab/filter to select on that page (if applicable)
export const BRAND_SOURCES: Record<string, { id: string; name: string; title: string; path: string; snippet: string; href: string; tab?: string }> = {
  brand_identity: {
    id: 'brand_identity',
    name: 'Brand Identity',
    title: 'Open Session Brand Identity System',
    path: '/.claude/knowledge/core/OS_brand identity.md',
    snippet: 'Logo, color, typography, and visual guidelines',
    href: '/brain/brand-identity',
  },
  brand_messaging: {
    id: 'brand_messaging',
    name: 'Brand Messaging',
    title: 'Open Session Brand Messaging',
    path: '/.claude/knowledge/core/OS_brand messaging.md',
    snippet: 'Voice, tone, content pillars, and writing guidelines',
    href: '/brain/writing-styles',
  },
  art_direction: {
    id: 'art_direction',
    name: 'Art Direction',
    title: 'Open Session Art Direction Guide',
    path: '/.claude/knowledge/core/OS_art direction.md',
    snippet: 'Creative territories, photography, textures',
    href: '/brand-hub/art-direction',
  },
  writing_short: {
    id: 'writing_short',
    name: 'short-form writing',
    title: 'Short-form Content Guide',
    path: '/.claude/knowledge/writing-styles/short-form.md',
    snippet: 'Instagram, LinkedIn, social media writing',
    href: '/brain/writing-styles',
    tab: 'short-form',
  },
  writing_long: {
    id: 'writing_long',
    name: 'long-form writing',
    title: 'Long-form Content Guide',
    path: '/.claude/knowledge/writing-styles/long-form.md',
    snippet: 'YouTube, video scripts, in-depth content',
    href: '/brain/writing-styles',
    tab: 'long-form',
  },
  writing_blog: {
    id: 'writing_blog',
    name: 'blog writing',
    title: 'Blog Writing Guide',
    path: '/.claude/knowledge/writing-styles/blog.md',
    snippet: 'Medium, Substack, website articles',
    href: '/brain/writing-styles',
    tab: 'blog',
  },
  writing_creative: {
    id: 'writing_creative',
    name: 'creative writing',
    title: 'Creative Writing Guide',
    path: '/.claude/knowledge/writing-styles/creative.md',
    snippet: 'Experimental, artistic, AI creative workflows',
    href: '/brain/writing-styles',
    tab: 'creative',
  },
  writing_strategic: {
    id: 'writing_strategic',
    name: 'strategic writing',
    title: 'Strategic Communication Guide',
    path: '/.claude/knowledge/writing-styles/strategic.md',
    snippet: 'Business communication, proposals, advisory',
    href: '/brain/writing-styles',
    tab: 'strategic',
  },
};

/**
 * Get page route for a topic
 */
export function getPageRoute(topic: string): BrandPageRoute | undefined {
  return BRAND_PAGE_ROUTES[topic.toLowerCase()];
}

/**
 * Get brand source by ID
 */
export function getBrandSource(sourceId: string) {
  return BRAND_SOURCES[sourceId];
}

/**
 * Parse resource markers from AI response content
 * Returns array of resource topics found
 */
export function parseResourceMarkers(content: string): string[] {
  const regex = /\[resource:(\w+(?:-\w+)?)\]/g;
  const topics: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    topics.push(match[1]);
  }

  return topics;
}

/**
 * Parse source citation markers from AI response content
 * Returns array of source IDs found
 */
export function parseSourceMarkers(content: string): string[] {
  const regex = /\[source:(\w+)\]/g;
  const sources: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    sources.push(match[1]);
  }

  return sources;
}

/**
 * Remove all markers from content for display
 */
export function cleanMarkers(content: string): string {
  return content
    .replace(/\[resource:\w+(?:-\w+)?\]/g, '')
    .replace(/\[source:\w+\]/g, '')
    .trim();
}
