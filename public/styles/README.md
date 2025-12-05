# BRAND-OS Design System

A portable design system package containing all brand tokens, styles, and configuration for Open Session.

## Quick Start

### Option 1: Tailwind CSS Project

1. Copy this entire `/styles` folder to your project
2. Merge or replace your `tailwind.config.ts`:

```ts
// tailwind.config.ts
import brandConfig from './styles/tailwind.config';
export default brandConfig;
```

3. Import the CSS in your main stylesheet:

```css
/* globals.css or main.css */
@import './styles/brand.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Option 2: Plain CSS Project

1. Copy the `/styles` folder to your project
2. Link the CSS file:

```html
<link rel="stylesheet" href="styles/brand.css">
```

3. Use CSS custom properties in your styles:

```css
.my-button {
  background-color: var(--brand-aperol);
  color: var(--brand-vanilla);
  border-radius: var(--radius-brand);
}
```

### Option 3: Import Tokens Only (JSON)

Use `tokens.json` for design tools, style dictionaries, or custom build pipelines:

```js
import tokens from './styles/tokens.json';

const primaryColor = tokens.colors.brand.charcoal.value; // '#191919'
```

## Files Included

| File | Description |
|------|-------------|
| `tokens.json` | Machine-readable design tokens (colors, typography, spacing, etc.) |
| `tailwind.config.ts` | Standalone Tailwind configuration with all brand tokens |
| `brand.css` | CSS custom properties, font declarations, and base styles |
| `fonts/` | Self-contained font files (woff2 format) |
| `AI-CONTEXT.md` | Context file for AI code generation tools |

## Color System

### Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Charcoal** | `#191919` | Primary text, dark backgrounds |
| **Vanilla** | `#FFFAEE` | Primary backgrounds, light surfaces |
| **Aperol** | `#FE5102` | Accent only (max 10% of composition) |

### Usage Rules

- **Light Mode**: Vanilla background, Charcoal text
- **Dark Mode**: Charcoal background, Vanilla text
- **Aperol**: CTAs, highlights, focus states — never as primary background or body text

### CSS Variables

```css
var(--brand-charcoal)
var(--brand-vanilla)
var(--brand-aperol)
```

### Tailwind Classes

```html
<div class="bg-brand-vanilla text-brand-charcoal">Light mode</div>
<div class="bg-brand-charcoal text-brand-vanilla">Dark mode</div>
<button class="bg-brand-aperol text-white">CTA Button</button>
```

## Typography

### Font Families

| Font | Usage | Tailwind Class |
|------|-------|----------------|
| **Neue Haas Grotesk Display Pro** | Headings (H1-H4), body text | `font-display`, `font-sans` |
| **Offbit** | Accent subheadings (H5-H6) | `font-mono`, `font-accent` |

### Hierarchy Rules

- H1-H2: Display Pro Bold
- H3-H4: Display Pro Medium
- H5-H6: Offbit (max 2 per viewport)
- Body: Display Pro Roman
- Minimum 2 size steps between hierarchy levels

### CSS Variables

```css
var(--font-display)
var(--font-sans)
var(--font-mono)
var(--font-accent)
```

## Spacing & Layout

Uses Tailwind's default spacing scale. Key brand-specific values:

| Token | Value | Usage |
|-------|-------|-------|
| `border-radius-brand` | 12px | Standard rounded corners |
| `border-radius-brand-lg` | 16px | Larger components |
| `min-touch-target` | 44px | Accessibility minimum |

## Shadows

```css
var(--shadow-brand)      /* 0 2px 8px rgba(0,0,0,0.1) */
var(--shadow-brand-lg)   /* 0 4px 16px rgba(0,0,0,0.15) */
var(--shadow-neuro)      /* Neuromorphic effect */
```

## Accessibility

- WCAG AA minimum compliance
- Vanilla/Charcoal pairing exceeds AAA contrast
- All interactive elements: minimum 44x44px touch target
- Focus rings: 2px solid Aperol with 2px offset

## Font Licensing

The included fonts are proprietary. Ensure you have appropriate licenses for:
- **Neue Haas Grotesk Display Pro** by Lineto
- **Offbit** by Typotheque

## AI Integration

See `AI-CONTEXT.md` for detailed guidance when using AI code generation tools. Key points:

- Always use CSS variables or Tailwind classes for colors
- Aperol accent: max 10% of any composition
- Prefer dark mode aesthetic with charcoal backgrounds
- Use Display Pro for all headings, Offbit sparingly

---

**Version:** 1.0.0  
**Brand:** Open Session / BRAND-OS


