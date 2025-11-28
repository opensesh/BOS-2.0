/**
 * Brand System Prompt Builder
 *
 * Constructs the system prompt with brand knowledge context.
 */

import { SystemPromptOptions } from './types';
import { BRAND_PAGE_ROUTES } from './page-routes';

// Brand assistant core instructions
const BRAND_ASSISTANT_INSTRUCTIONS = `You are the Brand Operating System (BOS), an AI assistant with deep knowledge of the OPEN SESSION brand.
You have access to the complete brand documentation and asset library.

## Your Capabilities
- Reference specific brand documentation with citations
- Point users to exact file paths for assets (logos, fonts, images, textures)
- Provide guidance based on official brand guidelines
- Help with content creation following brand voice

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
    '',
    CITATION_FORMAT_INSTRUCTIONS,
    '',
    RESOURCE_CARD_INSTRUCTIONS,
    '',
    BRAND_ESSENTIALS,
    '',
    ASSET_REFERENCE,
  ];

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
