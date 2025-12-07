export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  role: 'user' | 'assistant';
}

export interface SearchState {
  query: string;
  isLoading: boolean;
  messages: ChatMessage[];
}

export interface SpaceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: string;
}

export interface SpaceLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  addedAt: string;
  articleId?: string; // If the link was added from an article
}

export interface SpaceTask {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  completed: boolean;
  createdAt: string;
}

export interface Space {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  isPrivate: boolean;
  lastModified: string; // e.g., "21 hr. ago"
  createdAt: string;
  threadCount?: number;
  files?: SpaceFile[];
  links?: SpaceLink[];
  instructions?: string;
  tasks?: SpaceTask[];
}

export interface SpaceThread {
  id: string;
  spaceId: string;
  title: string;
  lastActivity: string;
  messageCount: number;
}

// ===========================================
// Space Discussion Types (Supabase)
// ===========================================

/**
 * A message within a space discussion
 */
export interface SpaceDiscussionMessage {
  id: string;
  discussionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

/**
 * A discussion thread within a space
 * Stored in Supabase for persistence
 */
export interface SpaceDiscussion {
  id: string;
  spaceId: string;
  spaceSlug: string;
  title: string;
  preview: string; // First ~100 chars of AI response
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Space context for chat - includes files, links, instructions, tasks
 */
export interface SpaceContext {
  spaceId: string;
  spaceSlug: string;
  spaceTitle: string;
  spaceIcon?: string;
  files?: SpaceFile[];
  links?: SpaceLink[];
  instructions?: string;
  tasks?: SpaceTask[];
}

export interface Brand {
  id: string;
  name: string;
  logoPath: string;
  isDefault?: boolean;
}

// Discover section types
export interface Source {
  id: string;
  name: string;
  url: string;
  logo?: string;
}

// ===========================================
// News Topic Categories
// ===========================================

/**
 * Topic categories for news filtering
 * Users can filter by these and manage which ones they see
 */
export type NewsTopicCategory = 
  | 'design-ux'        // Design & UX/UI
  | 'branding'         // Branding & Strategy
  | 'ai-creative'      // AI for Creatives (Midjourney, Runway, Figma AI)
  | 'social-trends'    // Social Media Trends
  | 'general-tech'     // General Tech
  | 'startup-business'; // Startup/Agency Business

export const NEWS_TOPIC_LABELS: Record<NewsTopicCategory, string> = {
  'design-ux': 'Design & UX/UI',
  'branding': 'Branding & Strategy',
  'ai-creative': 'AI for Creatives',
  'social-trends': 'Social Media Trends',
  'general-tech': 'General Tech',
  'startup-business': 'Startup/Agency Business',
};

// ===========================================
// Rich Ideas System Types
// ===========================================

/**
 * Platform-specific execution tips for an idea
 */
export interface PlatformTip {
  platform: 'Instagram Reel' | 'Instagram Carousel' | 'Instagram Story' | 'YouTube Short' | 'YouTube' | 'LinkedIn' | 'LinkedIn Article' | 'Substack' | 'Medium' | 'TikTok';
  tips: string[];
}

/**
 * Visual direction guidance with creativity rating
 */
export interface VisualDirection {
  rating: number;       // 1 (basic/safe) to 10 (radical/experimental)
  description: string;  // Color mood, composition style, aesthetic notes
}

/**
 * Rich idea with full creative brief
 */
export interface RichIdea {
  id: string;
  title: string;
  description: string;
  category: 'short-form' | 'long-form' | 'blog';
  
  // Creative brief fields
  hooks: string[];                    // 2-3 attention-grabbing hook ideas
  platformTips: PlatformTip[];        // Platform-specific execution guidance
  visualDirection: VisualDirection;   // Visual/aesthetic direction with rating
  exampleOutline: string[];           // Section-by-section content outline
  hashtags: string;                   // Copy-paste ready hashtag string
  
  // Metadata
  sources: Array<{ name: string; url: string }>;
  starred: boolean;
  generatedAt?: string;
}

// ===========================================
// Tiered Content System Types
// ===========================================

/**
 * Content tier levels for the discover feed
 * - featured: Full Perplexity research articles (40+ sources)
 * - summary: AI-generated 2-3 paragraph summaries
 * - quick: RSS description + external link
 */
export type ContentTier = 'featured' | 'summary' | 'quick';

export interface NewsCardData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content?: string[];
  sources: Source[];
  publishedAt: string;
  imageUrl?: string;
  category: 'weekly-update' | 'monthly-outlook';
  relatedImages?: string[];
  // Tiered content fields
  tier: ContentTier;
  articlePath?: string;    // For featured: path to full JSON article
  aiSummary?: string;      // For summary: pre-generated AI summary
  sourceUrl?: string;      // For quick: external link to original source
  // Topic categorization for filtering
  topicCategory?: NewsTopicCategory;
  // Total sources count (for featured articles with enriched sources from Perplexity)
  totalSources?: number;
}

/**
 * Idea items are content PROMPTS, not articles to read
 * They display as non-clickable cards with a "Generate Brief" action
 * Rich fields (hooks, platformTips, etc.) are optional for backwards compatibility
 */
export interface IdeaCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  sources: Source[];
  publishedAt?: string;
  imageUrl?: string;
  category: 'short-form' | 'long-form' | 'blog';
  starred?: boolean;
  isPrompt: true; // Always true - idea items are content prompts
  
  // Content format (e.g., 'reel', 'carousel', 'video', 'article')
  format?: ContentFormat;
  
  // Content subcategory defines the approach/style
  subcategory?: ContentSubcategory;
  
  // Rich creative brief fields (optional for backwards compatibility)
  hooks?: string[];                    // 2-3 attention-grabbing hook ideas
  platformTips?: PlatformTip[];        // Platform-specific execution guidance
  visualDirection?: VisualDirection;   // Visual/aesthetic direction with rating
  exampleOutline?: string[];           // Section-by-section content outline
  hashtags?: string;                   // Copy-paste ready hashtag string
  
  // Visual design fields (pre-generated during content creation)
  pexelsImageUrl?: string;             // Pexels image URL for card thumbnail
  textureIndex?: number;               // Index 1-13 for sonic line background texture
}

/**
 * Inspiration card data - similar to IdeaCardData but for inspiration content
 * Used for generated content briefs with rich creative direction
 */
export interface InspirationCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  sources: Array<{ id?: string; name: string; url: string }>;
  publishedAt?: string;
  imageUrl?: string;
  category: 'short-form' | 'long-form' | 'blog';
  starred?: boolean;
  
  // Content format and subcategory
  format?: ContentFormat;
  subcategory?: ContentSubcategory;
  
  // Rich creative brief fields
  hooks?: string[];
  platformTips?: Array<{
    platform: string;
    tips: string[];
  }>;
  visualDirection?: {
    rating: number;
    description: string;
  };
  exampleOutline?: string[];
  hashtags?: string;
  
  // Visual design fields
  pexelsImageUrl?: string;
  textureIndex?: number;
}

export interface WeatherData {
  temp: string;
  condition: string;
  location: string;
  high: string;
  low: string;
  forecast: {
    day: string;
    icon: string;
    high: string;
    low: string;
  }[];
}

export interface MarketData {
  name: string;
  symbol: string;
  value: string;
  change: string;
  changePercent: number;
  positive: boolean;
  trend?: number[]; // For mini charts
}

export interface TrendingCompany {
  id: string;
  name: string;
  ticker: string;
  price: string;
  change: string;
  changePercent: number;
  logo?: string;
}

// JSON data structures
export interface NewsUpdateItem {
  title: string;
  description?: string;
  timestamp: string;
  sources: Array<{ name: string; url: string }>;
  // Tiered content fields (optional - assigned during processing if not present)
  tier?: ContentTier;
  articlePath?: string;    // For featured: path to full JSON article
  aiSummary?: string;      // For summary: pre-generated AI summary
  sourceUrl?: string;      // For quick: external link to original source
  // Topic categorization
  topicCategory?: NewsTopicCategory;
  // Total sources count (for featured articles with enriched sources from Perplexity)
  totalSources?: number;
}

export interface NewsData {
  type: 'weekly-update' | 'monthly-outlook';
  date: string;
  updates: NewsUpdateItem[];
}

/**
 * Content format types by category
 * - short-form: Instagram Reels, Carousels, Stories, Quick Images (format-based)
 * - long-form: YouTube videos, tutorials, livestreams (approach-based: instructional, leadership, framework)
 * - blog: Articles, listicles, case studies, guides (style-based: instructional, visionary, explanatory)
 */
export type ShortFormFormat = 'reel' | 'carousel' | 'story' | 'quick-image';
export type LongFormFormat = 'video' | 'tutorial' | 'livestream' | 'documentary';
export type BlogFormat = 'article' | 'listicle' | 'case-study' | 'guide' | 'thread';
export type ContentFormat = ShortFormFormat | LongFormFormat | BlogFormat;

/**
 * Content subcategories define the approach/style for each category
 * These map to formats but add semantic meaning about the content approach
 */
export type ShortFormSubcategory = ShortFormFormat; // For short-form, subcategory = format
export type LongFormSubcategory = 'instructional' | 'leadership' | 'framework' | 'thought-leadership';
export type BlogSubcategory = 'instructional' | 'visionary' | 'explanatory' | 'case-study-deep-dive';
export type ContentSubcategory = ShortFormSubcategory | LongFormSubcategory | BlogSubcategory;

/**
 * Rich idea item with full creative brief for JSON storage
 */
export interface IdeaItem {
  title: string;
  description: string;
  starred?: boolean;
  sources: Array<{ id?: string; name: string; url: string }>;
  
  // Content format (e.g., 'reel', 'carousel', 'video', 'article')
  format?: ContentFormat;
  
  // Content subcategory defines the approach/style (e.g., 'instructional', 'visionary')
  // For short-form, this matches format. For long-form/blog, it defines the content approach.
  subcategory?: ContentSubcategory;
  
  // Rich creative brief fields (optional for backwards compatibility)
  hooks?: string[];
  platformTips?: Array<{
    platform: string;
    tips: string[];
  }>;
  visualDirection?: {
    rating: number;
    description: string;
  };
  exampleOutline?: string[];
  hashtags?: string;
  
  // Visual design fields (pre-generated during content creation)
  pexelsImageUrl?: string;             // Pexels image URL for card thumbnail
  textureIndex?: number;               // Index 1-13 for sonic line background texture
}

// Type alias for backwards compatibility with ideas-generator.ts
export type InspirationItem = IdeaItem;

export interface IdeaData {
  type: 'short-form' | 'long-form' | 'blog';
  date: string;
  ideas: IdeaItem[];
}

// Brand Hub Resources
export interface BrandResource {
  id: string;
  name: string;
  url: string;
  icon: 'google-drive' | 'figma' | 'notion' | 'custom' | 'lucide';
  lucideIconName?: string;
  customIconUrl?: string;
  createdAt: string;
}

// Article Enrichment Types (legacy - for backwards compatibility)
export interface ParagraphSource {
  id: string;
  name: string;
  url: string;
  title?: string;
  favicon?: string;
}

export interface ArticleParagraph {
  content: string;
  sources: ParagraphSource[];
}

export interface ArticleSection {
  id: string;
  title?: string;
  paragraphs: ArticleParagraph[];
  imageUrl?: string;
}

export interface EnrichedArticleData {
  sections: ArticleSection[];
  relatedQueries: string[];
  allSources: ParagraphSource[];
}

// ===========================================
// NEW: Pre-Generated Discover Article Types
// ===========================================

/**
 * A single citation chip shown at the end of a paragraph
 * Displays primary source + additional count (e.g., "techcrunch +2")
 */
export interface CitationChip {
  primarySource: {
    id: string;
    name: string;
    url: string;
    favicon: string;
    title?: string;
  };
  additionalCount: number;
  additionalSources: Array<{
    id: string;
    name: string;
    url: string;
    favicon: string;
    title?: string;
  }>;
}

/**
 * A paragraph with its unique citation chips (2-5 per paragraph)
 * Each paragraph's sources should be unique across the article
 */
export interface DiscoverParagraph {
  id: string;
  content: string;
  citations: CitationChip[];
}

/**
 * A section within a discover article
 * - First section has no title (intro paragraphs)
 * - Subsequent sections have h3 sub-headings (dynamically generated based on topic)
 */
export interface DiscoverSection {
  id: string;
  title?: string; // Only for sub-sections (displayed as smaller h3)
  paragraphs: DiscoverParagraph[];
}

/**
 * Source card for the horizontal scroll display
 */
export interface SourceCard {
  id: string;
  name: string;
  url: string;
  favicon: string;
  title: string;
  imageUrl?: string;
}

/**
 * Complete pre-generated discover article
 * Loaded directly from JSON - no API calls needed
 */
export interface DiscoverArticle {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  generatedAt: string;
  totalSources: number;
  
  // Content structure: 6+ paragraphs with dynamic sub-headings
  sections: DiscoverSection[];
  
  // Top 5-6 sources for horizontal source cards
  sourceCards: SourceCard[];
  
  // All 40+ sources used in the article
  allSources: Array<{
    id: string;
    name: string;
    url: string;
    favicon: string;
    title?: string;
  }>;
  
  // Hero image (from sources or generated)
  heroImage?: {
    url: string;
    attribution?: string;
  };
  
  // Sub-heading titles for sidebar navigation
  sidebarSections: string[];
  
  // Related article suggestions
  relatedArticles?: Array<{
    slug: string;
    title: string;
  }>;
}

/**
 * Manifest of all available discover articles
 * Used for listing and navigation
 */
export interface DiscoverArticleManifest {
  generatedAt: string;
  articles: Array<{
    slug: string;
    title: string;
    publishedAt: string;
    totalSources: number;
    heroImageUrl?: string;
    sidebarSections: string[];
  }>;
}
