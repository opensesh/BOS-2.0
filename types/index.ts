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
}

export interface SpaceTask {
  id: string;
  title: string;
  description?: string;
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
}

export interface InspirationCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  sources: Source[];
  publishedAt?: string;
  imageUrl?: string;
  category: 'short-form' | 'long-form' | 'blog';
  starred?: boolean;
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
}

export interface NewsData {
  type: 'weekly-update' | 'monthly-outlook';
  date: string;
  updates: NewsUpdateItem[];
}

export interface InspirationItem {
  title: string;
  description: string;
  starred?: boolean;
  sources: Array<{ name: string; url: string }>;
}

export interface InspirationData {
  type: 'short-form' | 'long-form' | 'blog';
  date: string;
  ideas: InspirationItem[];
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

// Article Enrichment Types
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
