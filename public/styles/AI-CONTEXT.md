# BRAND-OS AI Context

> This file provides context for AI code generation tools (Claude, GPT, Cursor, Copilot, etc.) to generate on-brand code for Open Session projects.

## Brand Identity

**Open Session** is a creative technology brand. The visual identity balances warmth with sophistication, using a restrained palette with strategic accent usage.

### Personality
- **Friendly** — Warm, approachable, never condescending
- **Creative** — Experimental, curious, innovative
- **Visionary** — Forward-thinking but realistic

### Voice
- Use first person plural (we, us, our)
- Active voice, present tense
- Balance expertise with accessibility
- Never gatekeep knowledge

---

## Color System

### Primary Colors

```
Charcoal: #191919  — Primary text, dark mode backgrounds
Vanilla:  #FFFAEE  — Primary backgrounds, light mode surfaces
Aperol:   #FE5102  — Accent ONLY (strict 10% maximum)
```

### Color Rules (CRITICAL)

1. **Light Mode**: Vanilla (#FFFAEE) background, Charcoal (#191919) text
2. **Dark Mode**: Charcoal (#191919) background, Vanilla (#FFFAEE) text
3. **Aperol Usage**:
   - MAX 10% of any composition
   - USE FOR: CTAs, focus rings, highlights, active states, small accents
   - NEVER USE FOR: Large backgrounds, body text, primary UI surfaces
   - Works on both light and dark backgrounds

### Dark Theme Extended Palette

```
Background darker: #0C0C0C
Background dark:   #141414
Surface dark:      #1C1C1C
Border dark:       #2C2C2C
Text primary:      #E8E8E8
Text secondary:    #9CA3AF
```

### Tailwind Usage

```jsx
// Light mode
<div className="bg-brand-vanilla text-brand-charcoal">

// Dark mode
<div className="bg-brand-charcoal text-brand-vanilla">
<div className="bg-os-bg-dark text-os-text-primary-dark">

// Accent (sparingly!)
<button className="bg-brand-aperol text-white">
<span className="text-brand-aperol">
```

### CSS Variable Usage

```css
color: var(--brand-charcoal);
background: var(--brand-vanilla);
border-color: var(--brand-aperol);
```

---

## Typography

### Font Stack

```
Display/Headings: "Neue Haas Grotesk Display Pro"
Body Text:        "Neue Haas Grotesk Display Pro"
Accent/Code:      "Offbit"
```

### Hierarchy Rules

| Level | Font | Weight | Notes |
|-------|------|--------|-------|
| H1 | Display Pro | Bold (700) | Primary headlines |
| H2 | Display Pro | Bold (700) | Section headers |
| H3 | Display Pro | Medium (500) | Subsections |
| H4 | Display Pro | Medium (500) | Minor headers |
| H5 | Offbit | Regular (400) | Max 2 per viewport |
| H6 | Offbit | Regular (400) | Max 2 per viewport |
| Body | Display Pro | Regular (400) | Main content |

### Important
- Minimum 2 size steps between hierarchy levels
- Offbit (mono/accent) should be used sparingly — max 2 instances per viewport
- Never use Offbit for body copy

### Tailwind Classes

```jsx
<h1 className="font-display font-bold">Headline</h1>
<h5 className="font-mono">Accent Subhead</h5>
<p className="font-sans">Body text</p>
```

---

## Spacing & Layout

### Border Radius

```
Standard: 12px (rounded-brand or var(--radius-brand))
Large:    16px (rounded-brand-lg or var(--radius-brand-lg))
```

### Shadows

```css
/* Standard */
box-shadow: var(--shadow-brand);      /* 0 2px 8px rgba(0,0,0,0.1) */

/* Large/elevated */
box-shadow: var(--shadow-brand-lg);   /* 0 4px 16px rgba(0,0,0,0.15) */

/* Neuromorphic (dark mode special effect) */
box-shadow: var(--shadow-neuro);
```

---

## Accessibility Requirements

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Focus States**: 2px solid Aperol outline, 2px offset
3. **Contrast**: Vanilla/Charcoal pairing exceeds WCAG AAA
4. **Aperol on Light**: Use cautiously, better on dark backgrounds

```jsx
// Focus style (automatic via brand.css)
*:focus-visible {
  outline: 2px solid var(--brand-aperol);
  outline-offset: 2px;
}
```

---

## Component Patterns

### Buttons

```jsx
// Primary CTA (uses accent sparingly)
<button className="bg-brand-aperol text-white px-6 py-3 rounded-brand font-medium hover:opacity-90">
  Get Started
</button>

// Secondary
<button className="bg-os-surface-dark text-brand-vanilla border border-os-border-dark px-6 py-3 rounded-brand">
  Learn More
</button>

// Ghost
<button className="text-brand-vanilla hover:text-brand-aperol px-4 py-2">
  Cancel
</button>
```

### Cards

```jsx
<div className="bg-os-surface-dark border border-os-border-dark rounded-brand-lg p-6">
  <h3 className="font-display font-medium text-brand-vanilla">Title</h3>
  <p className="text-os-text-secondary-dark">Description</p>
</div>
```

### Inputs

```jsx
<input 
  className="bg-os-bg-dark border border-os-border-dark rounded-brand px-4 py-3 text-brand-vanilla placeholder:text-os-text-secondary-dark focus:border-brand-aperol"
  placeholder="Enter text..."
/>
```

---

## Do's and Don'ts

### DO
- Use Charcoal/Vanilla as primary color pair
- Apply Aperol only for small accents and CTAs
- Use Display Pro for most text
- Maintain high contrast ratios
- Use 12px or 16px border radius
- Apply neuromorphic shadows on dark backgrounds

### DON'T
- Use Aperol as a background color
- Use Aperol for body text
- Mix multiple accent colors
- Use Offbit for body copy or more than 2 headings per screen
- Create low-contrast text combinations
- Use sharp corners (always use brand radius)

---

## File References

When generating code, reference these files:

```
tokens.json          — Structured design tokens (colors, typography, spacing)
tailwind.config.ts   — Tailwind configuration
brand.css            — CSS custom properties and base styles
fonts/               — Font files (woff2)
```

---

## Quick Reference

```
Background (light): #FFFAEE (vanilla)
Background (dark):  #191919 (charcoal) or #141414 (os-bg-dark)
Text (light bg):    #191919 (charcoal)
Text (dark bg):     #FFFAEE (vanilla) or #E8E8E8 (os-text-primary-dark)
Accent:             #FE5102 (aperol) — 10% MAX
Border radius:      12px / 16px
Display font:       Neue Haas Grotesk Display Pro
Accent font:        Offbit
Min touch target:   44px
```




