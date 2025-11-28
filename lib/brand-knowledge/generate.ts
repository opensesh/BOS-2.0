#!/usr/bin/env npx tsx
/**
 * Brand Knowledge Generator
 *
 * Build-time script that generates:
 * 1. brand-docs.ts - Compiled brand documentation
 * 2. asset-manifest.ts - Complete asset index
 *
 * Run with: npx tsx lib/brand-knowledge/generate.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = process.cwd();
const KNOWLEDGE_DIR = path.join(ROOT_DIR, '.claude', 'knowledge');
const ASSETS_DIR = path.join(ROOT_DIR, 'public', 'assets');
const OUTPUT_DIR = path.join(ROOT_DIR, 'lib', 'brand-knowledge');

interface BrandDocument {
  id: string;
  title: string;
  path: string;
  content: string;
  keywords: string[];
}

interface AssetEntry {
  path: string;
  category: string;
  filename: string;
  variant?: string;
  description?: string;
}

// Extract title from markdown content
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : 'Untitled';
}

// Extract keywords from markdown content (headings and key terms)
function extractKeywords(content: string): string[] {
  const keywords: Set<string> = new Set();

  // Extract headings
  const headings = content.match(/^#+\s+(.+)$/gm);
  if (headings) {
    headings.forEach((h) => {
      const text = h.replace(/^#+\s+/, '').toLowerCase();
      keywords.add(text);
    });
  }

  // Add common brand terms if found
  const brandTerms = [
    'logo', 'color', 'typography', 'font', 'voice', 'tone', 'messaging',
    'identity', 'mission', 'vision', 'values', 'personality', 'aperol',
    'vanilla', 'charcoal', 'neue haas', 'offbit', 'photography', 'texture',
    'illustration', 'art direction', 'content', 'writing', 'social media'
  ];

  brandTerms.forEach((term) => {
    if (content.toLowerCase().includes(term)) {
      keywords.add(term);
    }
  });

  return Array.from(keywords);
}

// Generate ID from filename
function generateId(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .replace(/^OS_/, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

// Read and process brand documentation
function processBrandDocs(): BrandDocument[] {
  const docs: BrandDocument[] = [];

  // Process core docs
  const coreDir = path.join(KNOWLEDGE_DIR, 'core');
  if (fs.existsSync(coreDir)) {
    const files = fs.readdirSync(coreDir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(coreDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      docs.push({
        id: generateId(file),
        title: extractTitle(content),
        path: `/.claude/knowledge/core/${file}`,
        content,
        keywords: extractKeywords(content),
      });
    }
  }

  // Process writing styles
  const stylesDir = path.join(KNOWLEDGE_DIR, 'writing-styles');
  if (fs.existsSync(stylesDir)) {
    const files = fs.readdirSync(stylesDir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(stylesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      docs.push({
        id: `writing_${generateId(file)}`,
        title: extractTitle(content),
        path: `/.claude/knowledge/writing-styles/${file}`,
        content,
        keywords: extractKeywords(content),
      });
    }
  }

  return docs;
}

// Parse logo filename to extract variant info
function parseLogoFilename(filename: string): { format: string; color: string } {
  const name = filename.replace('.svg', '').toLowerCase();

  let format = 'default';
  let color = 'default';

  // Detect format
  if (name.includes('brandmark')) format = 'brandmark';
  else if (name.includes('combo-icon')) format = 'combo-icon';
  else if (name.includes('combo-text')) format = 'combo-text';
  else if (name.includes('combo')) format = 'combo';
  else if (name.includes('horizontal')) format = 'horizontal';
  else if (name.includes('stacked')) format = 'stacked';
  else if (name.includes('core')) format = 'core';
  else if (name.includes('filled')) format = 'filled';
  else if (name.includes('outline')) format = 'outline';

  // Detect color
  if (name.includes('vanilla')) color = 'vanilla';
  else if (name.includes('charcoal')) color = 'charcoal';
  else if (name.includes('glass')) color = 'glass';

  return { format, color };
}

// Parse font filename
function parseFontFilename(filename: string): { family: string; weight: string } {
  const name = filename.toLowerCase();

  let family = 'unknown';
  let weight = 'regular';

  if (name.includes('neuehaas') || name.includes('neue-haas') || name.includes('neue haas')) {
    if (name.includes('display')) family = 'neue-haas-grotesk-display';
    else if (name.includes('text')) family = 'neue-haas-grotesk-text';
    else family = 'neue-haas-grotesk';
  } else if (name.includes('offbit')) {
    family = 'offbit';
  }

  // Detect weight
  if (name.includes('bold')) weight = 'bold';
  else if (name.includes('medium')) weight = 'medium';
  else if (name.includes('light')) weight = 'light';
  else if (name.includes('thin')) weight = 'thin';
  else if (name.includes('black')) weight = 'black';

  return { family, weight };
}

// Parse image filename for theme
function parseImageFilename(filename: string): { theme: string; description: string } {
  const parts = filename.replace('.png', '').split('-');
  const theme = parts[0] || 'unknown';
  const description = parts.slice(1).join(' ').replace(/_/g, ' ');

  return { theme, description };
}

// Parse texture filename
function parseTextureFilename(filename: string): { type: string } {
  const name = filename.toLowerCase();

  if (name.includes('ascii')) return { type: 'ascii' };
  if (name.includes('halftone')) return { type: 'halftone' };
  if (name.includes('recycled')) return { type: 'recycled-card' };

  return { type: 'unknown' };
}

// Scan assets directory
function processAssets(): Record<string, AssetEntry[]> {
  const assets: Record<string, AssetEntry[]> = {
    logos: [],
    fonts: [],
    illustrations: [],
    images: [],
    textures: [],
    icons: [],
  };

  // Process logos
  const logosDir = path.join(ASSETS_DIR, 'logos');
  if (fs.existsSync(logosDir)) {
    const files = fs.readdirSync(logosDir).filter((f) => f.endsWith('.svg'));
    for (const file of files) {
      const { format, color } = parseLogoFilename(file);
      assets.logos.push({
        path: `/assets/logos/${file}`,
        category: 'logos',
        filename: file,
        variant: `${format}-${color}`,
        description: `${format} logo in ${color}`,
      });
    }
  }

  // Process fonts
  const fontsDir = path.join(ASSETS_DIR, 'fonts');
  if (fs.existsSync(fontsDir)) {
    const processDir = (dir: string) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          processDir(path.join(dir, item.name));
        } else if (item.name.match(/\.(woff2?|ttf|otf)$/i)) {
          const relativePath = path.relative(ASSETS_DIR, path.join(dir, item.name));
          const { family, weight } = parseFontFilename(item.name);
          assets.fonts.push({
            path: `/assets/${relativePath}`,
            category: 'fonts',
            filename: item.name,
            variant: `${family}-${weight}`,
            description: `${family} ${weight}`,
          });
        }
      }
    };
    processDir(fontsDir);
  }

  // Process illustrations
  const illustrationsDir = path.join(ASSETS_DIR, 'illustrations');
  if (fs.existsSync(illustrationsDir)) {
    const files = fs.readdirSync(illustrationsDir).filter((f) => f.endsWith('.svg'));
    for (const file of files) {
      // Parse the naming pattern: "Name=[Shape Name]  TYPE = [Shape].svg"
      const nameMatch = file.match(/Name=([^.]+)/);
      const typeMatch = file.match(/TYPE\s*=\s*(\w+)/i);
      assets.illustrations.push({
        path: `/assets/illustrations/${file}`,
        category: 'illustrations',
        filename: file,
        variant: typeMatch ? typeMatch[1] : undefined,
        description: nameMatch ? nameMatch[1].trim() : file,
      });
    }
  }

  // Process images
  const imagesDir = path.join(ASSETS_DIR, 'images');
  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir).filter((f) => f.match(/\.(png|jpg|jpeg)$/i));
    for (const file of files) {
      const { theme, description } = parseImageFilename(file);
      assets.images.push({
        path: `/assets/images/${file}`,
        category: 'images',
        filename: file,
        variant: theme,
        description,
      });
    }
  }

  // Process textures
  const texturesDir = path.join(ASSETS_DIR, 'textures');
  if (fs.existsSync(texturesDir)) {
    const files = fs.readdirSync(texturesDir).filter((f) => f.match(/\.(jpg|png)$/i));
    for (const file of files) {
      const { type } = parseTextureFilename(file);
      assets.textures.push({
        path: `/assets/textures/${file}`,
        category: 'textures',
        filename: file,
        variant: type,
        description: `${type} texture`,
      });
    }
  }

  // Process icons
  const iconsDir = path.join(ASSETS_DIR, 'icons');
  if (fs.existsSync(iconsDir)) {
    const files = fs.readdirSync(iconsDir);
    for (const file of files) {
      assets.icons.push({
        path: `/assets/icons/${file}`,
        category: 'icons',
        filename: file,
        description: file.replace(/\.(svg|png)$/, ''),
      });
    }
  }

  return assets;
}

// Generate brand-docs.ts
function generateBrandDocsFile(docs: BrandDocument[]): void {
  const content = `/**
 * Brand Documentation (Auto-generated)
 *
 * DO NOT EDIT - This file is generated by lib/brand-knowledge/generate.ts
 * Run: npm run generate:brand-index
 */

import { BrandDocument } from './types';

export const BRAND_DOCUMENTS: BrandDocument[] = ${JSON.stringify(docs, null, 2)};

// Quick access by ID
export const BRAND_DOCS_BY_ID: Record<string, BrandDocument> = {
${docs.map((d) => `  '${d.id}': BRAND_DOCUMENTS.find(doc => doc.id === '${d.id}')!,`).join('\n')}
};

// Get document by ID
export function getBrandDocument(id: string): BrandDocument | undefined {
  return BRAND_DOCS_BY_ID[id];
}

// Get all documents
export function getAllBrandDocuments(): BrandDocument[] {
  return BRAND_DOCUMENTS;
}

// Search documents by keyword
export function searchDocuments(keyword: string): BrandDocument[] {
  const lower = keyword.toLowerCase();
  return BRAND_DOCUMENTS.filter(
    doc => doc.keywords.some(k => k.includes(lower)) ||
           doc.title.toLowerCase().includes(lower) ||
           doc.content.toLowerCase().includes(lower)
  );
}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'brand-docs.ts'), content, 'utf-8');
  console.log('Generated: brand-docs.ts');
}

// Generate asset-manifest.ts
function generateAssetManifestFile(assets: Record<string, AssetEntry[]>): void {
  const content = `/**
 * Asset Manifest (Auto-generated)
 *
 * DO NOT EDIT - This file is generated by lib/brand-knowledge/generate.ts
 * Run: npm run generate:brand-index
 */

import { AssetEntry } from './types';

export const ASSET_MANIFEST: {
  logos: AssetEntry[];
  fonts: AssetEntry[];
  illustrations: AssetEntry[];
  images: AssetEntry[];
  textures: AssetEntry[];
  icons: AssetEntry[];
} = ${JSON.stringify(assets, null, 2)};

// Get assets by category
export function getAssetsByCategory(category: keyof typeof ASSET_MANIFEST): AssetEntry[] {
  return ASSET_MANIFEST[category];
}

// Get all logos
export function getLogos(): AssetEntry[] {
  return ASSET_MANIFEST.logos;
}

// Get logos by color
export function getLogosByColor(color: 'vanilla' | 'charcoal' | 'glass'): AssetEntry[] {
  return ASSET_MANIFEST.logos.filter(l => l.variant?.includes(color));
}

// Get fonts
export function getFonts(): AssetEntry[] {
  return ASSET_MANIFEST.fonts;
}

// Get images by theme
export function getImagesByTheme(theme: 'auto' | 'lifestyle' | 'move' | 'escape' | 'work' | 'feel'): AssetEntry[] {
  return ASSET_MANIFEST.images.filter(i => i.variant === theme);
}

// Get all asset paths as a flat list
export function getAllAssetPaths(): string[] {
  return [
    ...ASSET_MANIFEST.logos.map(a => a.path),
    ...ASSET_MANIFEST.fonts.map(a => a.path),
    ...ASSET_MANIFEST.illustrations.map(a => a.path),
    ...ASSET_MANIFEST.images.map(a => a.path),
    ...ASSET_MANIFEST.textures.map(a => a.path),
    ...ASSET_MANIFEST.icons.map(a => a.path),
  ];
}

// Asset counts for summary
export const ASSET_COUNTS = {
  logos: ${assets.logos.length},
  fonts: ${assets.fonts.length},
  illustrations: ${assets.illustrations.length},
  images: ${assets.images.length},
  textures: ${assets.textures.length},
  icons: ${assets.icons.length},
  total: ${Object.values(assets).reduce((sum, arr) => sum + arr.length, 0)},
};
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'asset-manifest.ts'), content, 'utf-8');
  console.log('Generated: asset-manifest.ts');
}

// Main execution
function main() {
  console.log('Generating brand knowledge index...');
  console.log('Root directory:', ROOT_DIR);

  // Process brand documentation
  console.log('\nProcessing brand documentation...');
  const docs = processBrandDocs();
  console.log(`Found ${docs.length} brand documents`);

  // Process assets
  console.log('\nProcessing assets...');
  const assets = processAssets();
  const totalAssets = Object.values(assets).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`Found ${totalAssets} assets:`);
  Object.entries(assets).forEach(([category, items]) => {
    console.log(`  - ${category}: ${items.length}`);
  });

  // Generate output files
  console.log('\nGenerating output files...');
  generateBrandDocsFile(docs);
  generateAssetManifestFile(assets);

  console.log('\nBrand knowledge index generated successfully!');
}

main();
