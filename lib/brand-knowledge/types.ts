/**
 * Brand Knowledge Module Types
 *
 * Type definitions for the brand documentation and asset indexing system.
 */

// Brand document from markdown files
export interface BrandDocument {
  id: string;
  title: string;
  path: string;
  content: string;
  keywords: string[];
}

// Asset entry from public/assets folder
export interface AssetEntry {
  path: string;
  category: 'logos' | 'fonts' | 'illustrations' | 'images' | 'textures' | 'icons';
  filename: string;
  variant?: string;
  description?: string;
}

// Logo-specific asset with variant info
export interface LogoAsset extends AssetEntry {
  category: 'logos';
  format: 'brandmark' | 'combo' | 'horizontal' | 'stacked' | 'core' | 'filled' | 'outline';
  color: 'vanilla' | 'charcoal' | 'glass' | 'default';
}

// Font-specific asset
export interface FontAsset extends AssetEntry {
  category: 'fonts';
  family: 'neue-haas-grotesk-display' | 'neue-haas-grotesk-text' | 'offbit';
  weight: string;
}

// Image-specific asset with thematic category
export interface ImageAsset extends AssetEntry {
  category: 'images';
  theme: 'auto' | 'lifestyle' | 'move' | 'escape' | 'work' | 'feel';
}

// Texture-specific asset
export interface TextureAsset extends AssetEntry {
  category: 'textures';
  type: 'ascii' | 'halftone' | 'recycled-card';
}

// Complete asset manifest
export interface AssetManifest {
  logos: LogoAsset[];
  fonts: FontAsset[];
  illustrations: AssetEntry[];
  images: ImageAsset[];
  textures: TextureAsset[];
  icons: AssetEntry[];
}

// Brand source for citations
export interface BrandSource {
  id: string;
  name: string;
  type: 'brand-doc' | 'asset';
  title: string;
  path: string;
  snippet?: string;
  thumbnail?: string;
}

// Page route mapping for resource cards
export interface BrandPageRoute {
  topic: string;
  title: string;
  description: string;
  href: string;
  icon: string; // Icon name from lucide-react
  thumbnail?: string;
}

// System prompt options
export interface SystemPromptOptions {
  includeFullDocs?: boolean;
  focusAreas?: ('identity' | 'messaging' | 'art-direction' | 'writing-styles')[];
}

// Parsed resource card from AI response
export interface ResourceCardData {
  topic: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  thumbnail?: string;
}
