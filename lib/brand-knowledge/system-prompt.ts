/**
 * Brand System Prompt Builder
 *
 * Constructs the system prompt with brand knowledge context.
 */

import { SystemPromptOptions, PageContext } from './types';
import { BRAND_PAGE_ROUTES } from './page-routes';

/**
 * Build context-specific instructions based on the page context
 */
function buildContextInstructions(context: PageContext): string {
  const parts: string[] = [];

  parts.push('## Current Page Context');
  parts.push('The user is currently viewing content in Brand OS. Answer questions with this context in mind.');
  parts.push('');

  switch (context.type) {
    case 'article':
      if (context.article) {
        parts.push(`### Viewing Article`);
        parts.push(`**Title:** "${context.article.title}"`);
        
        if (context.article.summary) {
          parts.push(`**Summary:** ${context.article.summary}`);
        }
        
        if (context.article.content) {
          parts.push(`**Article Content:**`);
          parts.push(context.article.content);
        }
        
        if (context.article.sections && context.article.sections.length > 0) {
          parts.push(`**Sections:** ${context.article.sections.join(', ')}`);
        }
        
        if (context.article.sourceCount) {
          parts.push(`**Sources cited:** ${context.article.sourceCount}`);
        }
        
        parts.push('');
        parts.push('When the user asks questions, assume they are asking about this article unless they explicitly ask about something else.');
        parts.push('Provide insights, analysis, and follow-up information related to the article topic.');
      }
      break;

    case 'idea':
      if (context.idea) {
        parts.push(`### Viewing Content Idea`);
        parts.push(`**Title:** "${context.idea.title}"`);
        parts.push(`**Content Type:** ${formatCategory(context.idea.category)}`);
        
        if (context.idea.description) {
          parts.push(`**Description:** ${context.idea.description}`);
        }
        
        if (context.idea.generationType) {
          parts.push(`**Generation Request:** ${context.idea.generationLabel || context.idea.generationType}`);
        }
        
        parts.push('');
        parts.push('Help the user develop this content idea. Provide creative suggestions, outlines, copy, or resources based on what they ask for.');
        parts.push('Consider the content type and format requirements when giving recommendations.');
      }
      break;

    case 'space':
      if (context.space) {
        parts.push(`### Working in Space`);
        parts.push(`**Space Name:** "${context.space.title}"`);
        
        if (context.space.instructions) {
          parts.push(`**Custom Instructions:** ${context.space.instructions}`);
        }
        
        const resources: string[] = [];
        if (context.space.fileCount && context.space.fileCount > 0) {
          resources.push(`${context.space.fileCount} files`);
          if (context.space.fileNames && context.space.fileNames.length > 0) {
            parts.push(`**Available Files:** ${context.space.fileNames.join(', ')}`);
          }
        }
        if (context.space.linkCount && context.space.linkCount > 0) {
          resources.push(`${context.space.linkCount} links`);
          if (context.space.linkTitles && context.space.linkTitles.length > 0) {
            parts.push(`**Reference Links:** ${context.space.linkTitles.join(', ')}`);
          }
        }
        if (context.space.taskCount && context.space.taskCount > 0) {
          resources.push(`${context.space.taskCount} tasks`);
        }
        
        if (resources.length > 0) {
          parts.push(`**Resources:** ${resources.join(', ')}`);
        }
        
        parts.push('');
        parts.push('This is a workspace for focused collaboration. Follow any custom instructions provided.');
        parts.push('Reference the available files and links when relevant to the user\'s questions.');
      }
      break;

    case 'home':
    default:
      // No specific context for home page
      parts.push('The user is on the home page. Answer general questions about OPEN SESSION brand or any topic they ask about.');
      break;
  }

  parts.push('');
  return parts.join('\n');
}

/**
 * Format category name for display
 */
function formatCategory(category: string): string {
  switch (category) {
    case 'short-form':
      return 'Short-Form Video (TikTok, Reels, YouTube Shorts)';
    case 'long-form':
      return 'Long-Form Video (YouTube)';
    case 'blog':
      return 'Blog Post';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

// Brand assistant core instructions
const BRAND_ASSISTANT_INSTRUCTIONS = `You are the Brand Operating System (BOS), an AI assistant with deep knowledge of the OPEN SESSION brand.
You have access to the complete brand documentation and asset library.

## Your Capabilities
- Reference specific brand documentation with citations
- Point users to exact file paths for assets (logos, fonts, images, textures)
- Provide guidance based on official brand guidelines
- Help with content creation following brand voice

## Response Format (IMPORTANT)
Write in flowing, readable prose that utilizes the full width of the viewport.
- Prefer paragraphs over bullet points whenever possible
- Only use bullet points for truly list-like content (e.g., specific file paths, color codes, or explicit steps)
- Write information as complete sentences within paragraphs
- Use section headings (##, ###) to organize topics, then write paragraphs under each heading
- Keep responses scannable but paragraph-based, not bullet-heavy
- Aim for 2-4 sentences per paragraph, not single-line bullets

Example - AVOID this:
## Typography
- Headlines use Neue Haas Grotesk Display Pro
- Bold weight for H1-H2
- Medium weight for H3-H4
- Body text uses the Text Pro variant

Example - DO this instead:
## Typography
For headlines, we use Neue Haas Grotesk Display Pro with Bold weight for H1 and H2, and Medium weight for H3 and H4. Body text uses the Text Pro variant of the same family, which provides excellent readability at smaller sizes. The accent font OffBit adds digital character to subheadings and special callouts.

## Response Guidelines
- When referencing brand guidelines, cite the source document
- When recommending assets, provide the exact file path
- Match your tone to the OPEN SESSION voice: warm, innovative, accessible
- Use first person plural (we, us, our)
- Be concise but thorough
- Never gatekeep knowledge`;

// Citation format instructions
const CITATION_FORMAT_INSTRUCTIONS = `## Citation Format
When referencing brand documentation, include [source:doc_id] after the relevant statement.
When referencing assets, provide the full path like "/assets/logos/brandmark-vanilla.svg"

Available source IDs:
- brand_identity: Brand Identity System (colors, logos, typography)
- brand_messaging: Brand Messaging & Voice
- art_direction: Art Direction Guide (creative territories, photography)
- writing_short: Short-form Writing Style
- writing_long: Long-form Writing Style
- writing_blog: Blog Writing Style
- writing_creative: Creative Writing Style
- writing_strategic: Strategic Writing Style

Example response:
"Our primary brand colors are Vanilla (#FFFAEE) and Charcoal (#191919) [source:brand_identity].
You can find the logo at /assets/logos/brandmark-vanilla.svg."`;

// Resource card instructions
const RESOURCE_CARD_INSTRUCTIONS = `## Resource Links
When your response discusses a specific brand topic, include a resource link marker at the end of your response.
This helps users navigate to the relevant page in Brand OS.

Use this format: [resource:topic]

Available topics:
${Object.entries(BRAND_PAGE_ROUTES)
  .filter((_, i, arr) => arr.findIndex(([, v]) => v.href === arr[i][1].href) === i) // Unique hrefs only
  .map(([topic, route]) => `- ${topic}: Links to ${route.title} (${route.href})`)
  .join('\n')}

Example: If discussing typography, end with [resource:fonts]
Example: If discussing brand voice, end with [resource:voice]

You can include multiple resource links if the response covers multiple topics.`;

// Condensed brand essentials (~5KB)
const BRAND_ESSENTIALS = `## OPEN SESSION Brand Essentials

### Identity
- Mission: Help the world make the most of design and technology
- Founders: Karim Bouhdary (CEO, 10+ years UX/AI design at SAP, Google, Salesforce) & Morgan MacKean (Head of Design, visual design & branding)
- Personality: Warm, innovative, accessible, founders-driven, never gatekeeping

### Voice Attributes
- Smart but not smug
- Technical but accessible
- Expert but humble
- Visionary but realistic
- Use first person plural (we, us, our)
- Active voice, present tense

### Colors
- Vanilla: #FFFAEE (primary light, 45-50% composition)
- Charcoal: #191919 (primary dark, 45-50% composition)
- Aperol: #FE5102 (accent, max 10% composition)
- Grayscale: 11 shades from pure black to white

### Typography
- Neue Haas Grotesk Display Pro: Headlines (Bold for H1-H2, Medium for H3-H4)
- Neue Haas Grotesk Text Pro: Body copy (Roman for body, Medium for emphasis)
- OffBit: Subheadings, accent text, digital displays (H5-H6)
- Type scale: Desktop H1=40px, H2=32px, H3=24px, Body=16px

### Logo System
- Default: Combination logo (brandmark + wordmark)
- Constrained: Wordmark horizontal or stacked
- Compact: Brandmark only (min 50px for favicons)
- Color variants: vanilla (light bg), charcoal (dark bg), glass (gradient effects)
- Logo paths: /assets/logos/brandmark-[color].svg, /assets/logos/combo-[color].svg, etc.

### Content Pillars
1. Open-Source Design: Share real processes, templates, workflows
2. Client Transformation: Before/after stories with real results
3. Modern Craft meets Nostalgia: Vintage-meets-modern aesthetic

### Creative Territories (Art Direction)
- AUTO: Automotive, performance, precision (social channels)
- LIFESTYLE: Human connection, authentic portraiture (social channels)
- MOVE: Dynamic energy, motion, athletics (social channels)
- ESCAPE: Wanderlust, solitude, environmental (website, newsletter)
- WORK: Design outcomes, projects, experiments (website, newsletter)
- FEEL: Atmospheric abstraction, mood (website, newsletter)

### Asset Locations
- Logos: /assets/logos/ (25 SVG variants)
- Fonts: /assets/fonts/ (Neue Haas Grotesk families + OffBit)
- Images: /assets/images/ (48 photos in 6 themes: auto, lifestyle, move, escape, work, feel)
- Illustrations: /assets/illustrations/ (35 abstract shapes)
- Textures: /assets/textures/ (ascii, halftone, recycled-card overlays)
- Icons: /assets/icons/ (social platform icons, favicon)`;

// Asset reference summary
const ASSET_REFERENCE = `## Quick Asset Reference

### Logos
- Primary: /assets/logos/brandmark-vanilla.svg (light) or brandmark-charcoal.svg (dark)
- Combo: /assets/logos/combo-icon-vanilla.svg, combo-text-vanilla.svg
- Horizontal: /assets/logos/horizontal-vanilla.svg
- Stacked: /assets/logos/stacked-vanilla.svg

### Fonts (Web)
- Headlines: /fonts/NeueHaasDisplayBold.woff2, NeueHaasDisplayMedium.woff2
- Body: /fonts/NeueHaasDisplayRoman.woff2
- Accent: /fonts/OffBit-Regular.woff2, OffBit-Bold.woff2

### Images by Theme
- auto: Sports cars, racing, technical (8 images)
- lifestyle: Fashion, urban, editorial (8 images)
- move: Athletics, dance, motion (8 images)
- escape: Travel, remote work, wanderlust (8 images)
- work: Business, collaboration, projects (8 images)
- feel: Abstract, atmospheric, ethereal (8 images)

### Textures
- ASCII: /assets/textures/texture_ascii_01_white_compressed.jpg (and black variants)
- Halftone: /assets/textures/texture_halftone_01_compressed.jpg
- Paper: /assets/textures/texture_recycled-card_01_compressed.jpg`;

/**
 * Build the brand system prompt
 */
export function buildBrandSystemPrompt(options: SystemPromptOptions = {}): string {
  const parts: string[] = [
    BRAND_ASSISTANT_INSTRUCTIONS,
  ];

  // Add page context if provided (this comes FIRST for priority)
  if (options.context && options.context.type !== 'home') {
    parts.push('');
    parts.push(buildContextInstructions(options.context));
  }

  // Add standard brand documentation
  parts.push('');
  parts.push(CITATION_FORMAT_INSTRUCTIONS);
  parts.push('');
  parts.push(RESOURCE_CARD_INSTRUCTIONS);
  parts.push('');
  parts.push(BRAND_ESSENTIALS);
  parts.push('');
  parts.push(ASSET_REFERENCE);

  // Add full documentation if requested (for comprehensive queries)
  if (options.includeFullDocs) {
    parts.push('');
    parts.push('## Full Brand Documentation Available');
    parts.push('You have access to complete brand documentation. Refer to the relevant sections as needed.');
  }

  return parts.join('\n');
}

/**
 * Check if a query needs full documentation context
 */
export function shouldIncludeFullDocs(messages: Array<{ content: string | unknown }>): boolean {
  const lastMessage = messages[messages.length - 1];
  const content = typeof lastMessage?.content === 'string'
    ? lastMessage.content.toLowerCase()
    : '';

  const fullDocTriggers = [
    'complete guide',
    'full documentation',
    'everything about',
    'detailed',
    'comprehensive',
    'all aspects',
    'tell me everything',
    'in depth',
    'complete overview',
  ];

  return fullDocTriggers.some((trigger) => content.includes(trigger));
}

/**
 * Detect which brand areas a query focuses on
 */
export function detectFocusAreas(
  messages: Array<{ content: string | unknown }>
): ('identity' | 'messaging' | 'art-direction' | 'writing-styles')[] {
  const lastMessage = messages[messages.length - 1];
  const content = typeof lastMessage?.content === 'string'
    ? lastMessage.content.toLowerCase()
    : '';

  const areas: ('identity' | 'messaging' | 'art-direction' | 'writing-styles')[] = [];

  // Identity keywords
  if (content.match(/logo|brand\s*mark|icon|color|colour|font|typography|type\s*scale/)) {
    areas.push('identity');
  }

  // Messaging keywords
  if (content.match(/voice|tone|messaging|copy|writing|content\s*pillar/)) {
    areas.push('messaging');
  }

  // Art direction keywords
  if (content.match(/image|photo|illustration|texture|visual|creative\s*territor|art\s*direction/)) {
    areas.push('art-direction');
  }

  // Writing styles keywords
  if (content.match(/instagram|social|short.?form|long.?form|blog|youtube|script/)) {
    areas.push('writing-styles');
  }

  // Default to identity and messaging if nothing specific detected
  return areas.length > 0 ? areas : ['identity', 'messaging'];
}
