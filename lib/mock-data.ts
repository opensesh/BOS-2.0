
export const WEATHER_DATA = {
  temp: '72°',
  condition: 'Sunny',
  location: 'San Francisco, CA',
  high: '76°',
  low: '58°',
  forecast: [
    { day: 'Mon', icon: 'sun', high: '76°', low: '58°' },
    { day: 'Tue', icon: 'cloud-sun', high: '74°', low: '59°' },
    { day: 'Wed', icon: 'cloud', high: '70°', low: '57°' },
    { day: 'Thu', icon: 'rain', high: '68°', low: '55°' },
    { day: 'Fri', icon: 'sun', high: '71°', low: '56°' },
  ]
};

export const MARKET_DATA = [
  { name: 'S&P 500', value: '4,783.45', change: '+0.45%', positive: true },
  { name: 'NASDAQ', value: '15,055.65', change: '+0.75%', positive: true },
  { name: 'DOW J', value: '37,695.73', change: '-0.12%', positive: false },
  { name: 'BTC', value: '$64,230.00', change: '+1.25%', positive: true },
];

export const TRENDING_TOPICS = [
  { id: '1', name: 'Generative UI Patterns' },
  { id: '2', name: 'Web3 Design Systems' },
  { id: '3', name: 'Sustainable UX' },
  { id: '4', name: 'Neo-Brutalism 2.0' },
  { id: '5', name: 'AI-First Interactions' },
];

export interface Source {
  id: string;
  name: string;
  logo?: string;
  url: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary: string; // Brief summary for card
  content: string[]; // Paragraphs for detailed view
  sources: Source[];
  publishedAt: string; // e.g., "2 hours ago"
  imageUrl?: string;
  category: 'News' | 'Inspiration' | 'Topic';
  relatedImages?: string[];
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    slug: 'meta-buried-research',
    title: 'Meta buried research showing Instagram, Facebook harm mental health',
    summary: 'Court filings allege Meta terminated a 2020 study after finding users reported less depression and anxiety when they stopped using its platforms.',
    content: [
      "Court filings allege that Meta terminated a critical 2020 study after discovering that users reported significantly less depression and anxiety when they ceased using the company's platforms. The internal research, which was intended to understand the mental health impacts of Instagram and Facebook, reportedly showed a direct correlation between platform usage and negative psychological outcomes.",
      "The documents, revealed during ongoing litigation, suggest that Meta executives were aware of these findings but chose to bury the research rather than address the core issues. This decision has sparked renewed criticism from lawmakers and mental health advocates who argue that the tech giant has consistently prioritized engagement metrics over user well-being.",
      "In response to the allegations, a Meta spokesperson stated that the company has made significant investments in safety and well-being tools. However, critics point to this suppressed study as further evidence that self-regulation in the tech industry is insufficient."
    ],
    sources: [
      { id: 's1', name: 'The Verge', url: '#' },
      { id: 's2', name: 'WSJ', url: '#' },
      { id: 's3', name: 'TechCrunch', url: '#' },
    ],
    publishedAt: '15 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
    category: 'News',
    relatedImages: [
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=500&auto=format&fit=crop'
    ]
  },
  {
    id: '2',
    slug: 'rep-hunt-defies-gop',
    title: 'Rep. Hunt defies GOP, stays in Texas Senate race',
    summary: 'Republican Representative Wesley Hunt has rejected intensifying pressure from party leaders to exit the Texas Senate primary, setting up a potential runoff.',
    content: [
      "Republican Representative Wesley Hunt has steadfastly rejected intensifying pressure from party leaders to exit the Texas Senate primary, setting up a potential runoff that could drain tens of millions of dollars from GOP coffers and complicate the party's 2026 strategy. Hunt announced his commitment to remain in the three-way race against incumbent Senator John Cornyn and Texas Attorney General Ken Paxton, despite senior Republicans labeling him a 'spoiler.'",
      "\"If Senate leadership is unhappy with my candidacy, I say: Good, because Senate leadership does not dictate Texas leadership,\" Hunt told CNN, emphasizing that he is the only candidate capable of winning without incurring \"hundreds of millions of dollars\" in expenses. The 44-year-old combat veteran and two-term congressman dismissed warnings from Cornyn that his candidacy could mark \"the end of his political career,\" responding: \"I have survived combat. I conducted 55 combat missions in Baghdad.\""
    ],
    sources: [
      { id: 's4', name: 'CNN', url: '#' },
      { id: 's5', name: 'Fox News', url: '#' },
      { id: 's6', name: 'Politico', url: '#' },
    ],
    publishedAt: '3 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    category: 'News',
     relatedImages: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555848960-8c3b446f8a77?q=80&w=500&auto=format&fit=crop'
    ]
  },
   {
    id: '3',
    slug: 'chatgpt-group-chats',
    title: 'ChatGPT launches group chats for design teams',
    summary: '30-second demo of using ChatGPT\'s new group chat feature for collaborative design feedback and iteration.',
    content: [
       "OpenAI has rolled out a new 'Group Chat' feature for ChatGPT, specifically targeting collaborative workflows in design and engineering teams. This update allows multiple users to interact with the AI simultaneously, sharing context and iterating on ideas in real-time.",
       "Early adopters in the design community report that this feature significantly speeds up the feedback loop. Instead of copy-pasting AI responses into Slack or Teams, designers can now invite the AI directly into their brainstorming sessions, asking it to generate copy variations or suggest layout adjustments based on group consensus."
    ],
    sources: [
      { id: 's7', name: 'TechCrunch AI', url: '#' },
      { id: 's8', name: 'The Verge', url: '#' },
    ],
    publishedAt: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
    category: 'Inspiration',
    relatedImages: []
  },
  {
    id: '4',
    slug: 'ai-wearables-creatives',
    title: 'Carousel: AI wearables for creatives',
    summary: '4-slide visual guide to hottest AI wearables and how designers can use them in workflows.',
    content: [
        "A new wave of AI-powered wearables is hitting the market, and they aren't just for fitness tracking. Devices like the Humane Pin and the Rabbit R1 are being repurposed by creative professionals to capture inspiration on the go.",
        "This visual guide explores how designers are using voice-to-note features, visual capture, and augmented reality overlays to integrate these tools into their daily creative workflows."
    ],
    sources: [
       { id: 's9', name: 'Wired', url: '#' },
       { id: 's10', name: 'Fast Company', url: '#' }
    ],
    publishedAt: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69056955?q=80&w=1000&auto=format&fit=crop',
    category: 'Inspiration',
    relatedImages: []
  },
  {
    id: '5',
    slug: 'future-of-ux-writing',
    title: 'The Future of UX Writing in the Age of LLMs',
    summary: 'How Large Language Models are reshaping the role of UX writers and content designers.',
    content: [
        "As Large Language Models (LLMs) become more sophisticated, the role of UX writers is evolving from drafting microcopy to designing conversation flows and prompt engineering.",
        "This shift requires a new set of skills, including a deep understanding of AI capabilities and limitations, as well as the ability to curate and refine AI-generated content."
    ],
    sources: [
       { id: 's11', name: 'UX Collective', url: '#' },
       { id: 's12', name: 'Nielsen Norman Group', url: '#' }
    ],
    publishedAt: '5 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1000&auto=format&fit=crop',
    category: 'Topic',
    relatedImages: []
  }
];

import { Space, SpaceThread } from '@/types';

export const SPACES: Space[] = [
  {
    id: '1',
    slug: 'sop',
    title: 'SOP',
    description: 'Standard Operating Procedures and workflows',
    isPrivate: true,
    lastModified: '21 hr. ago',
    createdAt: '2024-01-15',
    threadCount: 3,
  },
  {
    id: '2',
    slug: 'new-space',
    title: 'New Space',
    description: 'A new workspace for collaboration',
    isPrivate: true,
    lastModified: '21 hr. ago',
    createdAt: '2024-01-16',
    threadCount: 1,
  },
];

export const EXAMPLE_SPACES: Space[] = [
  {
    id: 'ex1',
    slug: 'os-support',
    title: 'BOS Support',
    description: 'Support documentation and resources',
    icon: '🧠',
    isPrivate: false,
    lastModified: '2 days ago',
    createdAt: '2024-01-10',
    threadCount: 12,
  },
  {
    id: 'ex2',
    slug: 'what-would-buffet-say',
    title: 'What would Buffet say?',
    description: 'Investment insights and analysis',
    icon: '💰',
    isPrivate: false,
    lastModified: '5 days ago',
    createdAt: '2024-01-05',
    threadCount: 8,
  },
  {
    id: 'ex3',
    slug: 'llm-research',
    title: 'LLM Research',
    description: 'Research and findings on Large Language Models',
    icon: '👩‍💻',
    isPrivate: false,
    lastModified: '1 week ago',
    createdAt: '2024-01-01',
    threadCount: 15,
  },
];

export const SPACE_THREADS: Record<string, SpaceThread[]> = {
  'sop': [
    {
      id: 't1',
      spaceId: 'sop',
      title: 'Onboarding Process',
      lastActivity: '2 hours ago',
      messageCount: 12,
    },
    {
      id: 't2',
      spaceId: 'sop',
      title: 'Code Review Guidelines',
      lastActivity: '1 day ago',
      messageCount: 8,
    },
    {
      id: 't3',
      spaceId: 'sop',
      title: 'Deployment Checklist',
      lastActivity: '3 days ago',
      messageCount: 5,
    },
  ],
  'new-space': [
    {
      id: 't4',
      spaceId: 'new-space',
      title: 'Initial Discussion',
      lastActivity: '21 hours ago',
      messageCount: 3,
    },
  ],
};
