/**
 * Rich Ideas Generator for OPEN SESSION
 * 
 * Generates content ideas with full creative briefs including:
 * - 2-3 attention-grabbing hooks
 * - Platform-specific execution tips
 * - Visual direction with creativity rating (1-10)
 * - Section-by-section example outline
 * - Copy-paste ready hashtags
 * 
 * Uses Claude Haiku for cost-effective generation (~$0.01/idea)
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import type { InspirationItem, PlatformTip, VisualDirection } from '@/types';

// ===========================================
// Platform Configuration
// ===========================================

/**
 * Platform mappings by content category
 */
export const PLATFORMS_BY_CATEGORY = {
  'short-form': ['Instagram Reel', 'Instagram Carousel', 'YouTube Short', 'LinkedIn'] as const,
  'long-form': ['YouTube'] as const,
  'blog': ['Substack', 'Medium', 'LinkedIn Article'] as const,
};

/**
 * Best practices baked into prompts by content type
 */
const CONTENT_TYPE_CONTEXT = {
  'short-form': `
SHORT-FORM CONTENT CONTEXT (Instagram focus, recycled to YouTube Shorts & LinkedIn):
- Focus: Artistic abstraction of concepts, creative potential of tools and AI
- Primary Platform: Instagram (Reels, Carousels, Stories)
- Secondary: YouTube Shorts, LinkedIn
- Style: Visual-first storytelling, curiosity-sparking, bite-sized wisdom
- Instagram Reel: 30-90 seconds, vertical 9:16, hook in first 2 seconds
- Instagram Carousel: 5-10 slides, square or 4:5, first slide is hook
- YouTube Short: 60 seconds max, vertical, pattern interrupt opening
- LinkedIn: Professional angle, thought leadership tie-in
`,
  'long-form': `
LONG-FORM CONTENT CONTEXT (YouTube main channel):
- Focus: Deep dives into concepts, tutorials for beginners to experts, thought leadership
- Primary Platform: YouTube
- Structure: Hook (5s) → Context/Problem (1-2min) → Core Value/Solution (3-5min) → Technical Deep Dive (2-3min) → CTA (30s)
- Sweet spot: 6-12 minutes
- Visual: Screen recordings with picture-in-picture, B-roll, chapter markers
- Goal: Help viewers gain an edge, feel they're learning from experts who elevate their work
`,
  'blog': `
BLOG CONTENT CONTEXT (Substack, Medium, LinkedIn):
- Focus: Thought leadership, simplifying complex topics, demystifying creative workflows
- AI is a highlight but not always the focus
- Primary: Substack (real-time experiments, learning-in-public)
- Secondary: Medium (frameworks, industry analysis), LinkedIn Article (professional reach)
- Structure: Problem → Framework → Case Studies → Future Implications → CTA
- Substack: 2-5 min reads, quick experiments, "just tried X, here's what happened"
- Medium: 4-10 min reads, authoritative but accessible, SEO-optimized
- LinkedIn Article: Professional angle, statistics for credibility
`,
};

/**
 * Brand voice context for all ideas
 */
const BRAND_VOICE_CONTEXT = `
OPEN SESSION BRAND VOICE:
- We're interdisciplinary designers democratizing Fortune 500-level design through AI, education, and community
- Voice: Expert but humble, technical but accessible, visionary but realistic
- Personality: Relatable, cool, creative, intelligent
- Use "we" not "I"
- Never: Condescend, overhype, gatekeep knowledge
- Always: Teach, experiment, share openly
- Balance expertise with approachability
- Make readers feel they're gaining an edge
`;

/**
 * Visual direction scale explanation
 */
const VISUAL_DIRECTION_SCALE = `
VISUAL DIRECTION RATING SCALE (1-10):
1-2 (Basic): Clean, minimal, professional. Safe brand colors. Standard layouts.
3-4 (Conservative): Refined typography, subtle gradients. Elegant but expected.
5-6 (Modern): Dynamic compositions, motion graphics. Current design trends.
7-8 (Bold): Experimental typography, unexpected color combinations. Pattern-breaking.
9-10 (Radical): Avant-garde, conceptual art approach. Challenges norms. High risk, high reward.
`;

// ===========================================
// Generation Functions
// ===========================================

interface GeneratedIdea {
  hooks: string[];
  platformTips: PlatformTip[];
  visualDirection: VisualDirection;
  exampleOutline: string[];
  hashtags: string;
}

/**
 * Generate a rich creative brief for an idea
 */
export async function generateRichIdea(
  title: string,
  description: string,
  category: 'short-form' | 'long-form' | 'blog',
  sources: Array<{ name: string; url: string }>
): Promise<GeneratedIdea> {
  const platforms = PLATFORMS_BY_CATEGORY[category];
  const contentContext = CONTENT_TYPE_CONTEXT[category];
  
  const sourceList = sources
    .map(s => `- ${s.name}: ${s.url}`)
    .join('\n');

  const prompt = `${BRAND_VOICE_CONTEXT}

${contentContext}

${VISUAL_DIRECTION_SCALE}

---

Generate a complete creative brief for this content idea:

TITLE: ${title}
DESCRIPTION: ${description}
CATEGORY: ${category}
SOURCES:
${sourceList}

Provide your response in this EXACT JSON format:
{
  "hooks": [
    "First attention-grabbing hook (5-10 words max)",
    "Second alternative hook",
    "Third alternative hook"
  ],
  "platformTips": [
${platforms.map(p => `    {
      "platform": "${p}",
      "tips": [
        "Specific tip for ${p}",
        "Another tip for ${p}",
        "Third tip for ${p}"
      ]
    }`).join(',\n')}
  ],
  "visualDirection": {
    "rating": 7,
    "description": "Describe the visual approach: color mood, composition style, typography treatment, motion/animation notes, aesthetic references"
  },
  "exampleOutline": [
    "Section 1: Hook/Opening",
    "Section 2: Context/Problem",
    "Section 3: Core content",
    "Section 4: Key insight",
    "Section 5: CTA"
  ],
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 #hashtag7 #hashtag8 #hashtag9 #hashtag10"
}

IMPORTANT:
- Hooks must be punchy, curiosity-sparking, and under 10 words
- Platform tips must be specific and actionable for that exact platform
- Visual direction rating should match the topic's potential (design topics can be bolder)
- Outline should match the content type structure
- Include 10-15 relevant hashtags for discoverability
- Output ONLY valid JSON, no markdown or explanation`;

  try {
    const result = await generateText({
      model: anthropic('claude-3-5-haiku-20241022'),
      prompt,
      maxTokens: 1500,
      temperature: 0.8, // Higher creativity for ideas
    });

    // Parse the JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as GeneratedIdea;
    
    // Validate required fields
    if (!parsed.hooks || !parsed.platformTips || !parsed.visualDirection || !parsed.exampleOutline || !parsed.hashtags) {
      throw new Error('Missing required fields in generated idea');
    }

    return parsed;
  } catch (error) {
    console.error('Error generating rich idea:', error);
    // Return a fallback structure
    return generateFallbackIdea(title, description, category);
  }
}

/**
 * Generate a fallback idea if AI generation fails
 */
function generateFallbackIdea(
  title: string,
  description: string,
  category: 'short-form' | 'long-form' | 'blog'
): GeneratedIdea {
  const platforms = PLATFORMS_BY_CATEGORY[category];
  
  return {
    hooks: [
      `This changes everything about ${title.split(' ').slice(0, 3).join(' ')}...`,
      `What nobody tells you about ${title.split(' ').slice(0, 3).join(' ')}`,
      `We tested this so you don't have to`,
    ],
    platformTips: platforms.map(platform => ({
      platform,
      tips: [
        `Optimize for ${platform}'s algorithm by posting at peak hours`,
        `Use native features specific to ${platform}`,
        `Engage with comments in the first hour`,
      ],
    })),
    visualDirection: {
      rating: 5,
      description: 'Modern, clean aesthetic with brand colors. Professional but approachable. Consider subtle motion graphics to add visual interest.',
    },
    exampleOutline: category === 'short-form'
      ? [
          'Hook: Pattern interrupt opening',
          'Problem: Quick pain point',
          'Solution: Key insight in 15 seconds',
          'Demo: Show it working',
          'CTA: Follow for more',
        ]
      : category === 'long-form'
      ? [
          'Hook: Visual + compelling statement (5s)',
          'Context: Why this matters (1-2 min)',
          'Core Value: Main teaching (3-5 min)',
          'Deep Dive: Technical details (2-3 min)',
          'Conclusion: Next steps + CTA (30s)',
        ]
      : [
          'Introduction: Hook + problem statement',
          'Context: Why this matters now',
          'Framework: Your unique approach',
          'Examples: Real applications',
          'Conclusion: Key takeaways + CTA',
        ],
    hashtags: '#design #creativecoding #AIdesign #designsystems #UXdesign #branding #creativetechnology #opensession #designtips #workflow',
  };
}

/**
 * Generate multiple ideas with rich briefs from news topics
 */
export async function generateIdeasBatch(
  newsTopics: Array<{
    title: string;
    description: string;
    sources: Array<{ name: string; url: string }>;
  }>,
  category: 'short-form' | 'long-form' | 'blog',
  options: {
    maxIdeas?: number;
    delayMs?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<InspirationItem[]> {
  const { maxIdeas = 5, delayMs = 500, onProgress } = options;
  const ideas: InspirationItem[] = [];

  const topicsToProcess = newsTopics.slice(0, maxIdeas);

  for (let i = 0; i < topicsToProcess.length; i++) {
    const topic = topicsToProcess[i];
    
    try {
      console.log(`Generating ${category} idea ${i + 1}/${topicsToProcess.length}: "${topic.title.slice(0, 40)}..."`);
      
      const richIdea = await generateRichIdea(
        topic.title,
        topic.description,
        category,
        topic.sources
      );

      ideas.push({
        title: topic.title,
        description: topic.description,
        starred: i === 0, // Star the first idea
        sources: topic.sources,
        hooks: richIdea.hooks,
        platformTips: richIdea.platformTips,
        visualDirection: richIdea.visualDirection,
        exampleOutline: richIdea.exampleOutline,
        hashtags: richIdea.hashtags,
      });

      onProgress?.(i + 1, topicsToProcess.length);

      // Rate limiting
      if (i < topicsToProcess.length - 1 && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Failed to generate idea for "${topic.title}":`, error);
    }
  }

  return ideas;
}

/**
 * Transform a news topic into an idea title/description for each category
 */
export async function transformTopicToIdeas(
  newsTopic: {
    title: string;
    description: string;
    sources: Array<{ name: string; url: string }>;
  }
): Promise<{
  shortForm: { title: string; description: string };
  longForm: { title: string; description: string };
  blog: { title: string; description: string };
}> {
  const prompt = `${BRAND_VOICE_CONTEXT}

Given this news topic, create three different content angles - one for each format:

NEWS TOPIC: ${newsTopic.title}
DESCRIPTION: ${newsTopic.description}

Transform this into creative content ideas. Output ONLY valid JSON:

{
  "shortForm": {
    "title": "Short-form title (Instagram focus, artistic abstraction angle)",
    "description": "2 sentence description for carousel/reel concept"
  },
  "longForm": {
    "title": "Long-form title (YouTube deep dive or tutorial angle)",
    "description": "2 sentence description for video concept"
  },
  "blog": {
    "title": "Blog title (thought leadership, simplifying complexity angle)",
    "description": "2 sentence description for article concept"
  }
}

Make each angle unique and optimized for its platform. Be creative and specific.`;

  try {
    const result = await generateText({
      model: anthropic('claude-3-5-haiku-20241022'),
      prompt,
      maxTokens: 500,
      temperature: 0.7,
    });

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    // Fallback transformations
    return {
      shortForm: {
        title: `Carousel: ${newsTopic.title.split(' ').slice(0, 5).join(' ')} explained`,
        description: `Visual breakdown of ${newsTopic.title.toLowerCase()} for designers.`,
      },
      longForm: {
        title: `Deep Dive: ${newsTopic.title}`,
        description: `Complete walkthrough of ${newsTopic.title.toLowerCase()} with practical examples.`,
      },
      blog: {
        title: `What ${newsTopic.title} Means for Designers`,
        description: `Breaking down ${newsTopic.title.toLowerCase()} and why it matters for creative professionals.`,
      },
    };
  }
}

/**
 * Estimate cost for idea generation
 */
export function estimateIdeaCost(ideaCount: number): {
  estimatedCostUsd: number;
  breakdown: string;
} {
  // Average tokens per idea generation
  const avgPromptTokens = 800;
  const avgCompletionTokens = 600;
  
  // Claude Haiku pricing (per million tokens)
  const inputCostPerMillion = 0.25;
  const outputCostPerMillion = 1.25;
  
  const totalPromptTokens = ideaCount * avgPromptTokens;
  const totalCompletionTokens = ideaCount * avgCompletionTokens;
  
  const inputCost = (totalPromptTokens / 1_000_000) * inputCostPerMillion;
  const outputCost = (totalCompletionTokens / 1_000_000) * outputCostPerMillion;
  const totalCost = inputCost + outputCost;
  
  return {
    estimatedCostUsd: Math.round(totalCost * 100) / 100,
    breakdown: `${ideaCount} ideas × ~${avgPromptTokens + avgCompletionTokens} tokens = ~$${totalCost.toFixed(4)}`,
  };
}

