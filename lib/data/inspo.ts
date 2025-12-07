import { supabase } from '../supabase';

/**
 * TypeScript type for inspiration resources
 * Matches "Inspiration Design Resources" table in Supabase
 * Column names are PascalCase as defined in the database
 */
export interface InspoResource {
  ID: number;
  Name: string;
  URL: string;
  Description: string | null;
  Category: string | null;
  Section: string | null;
  Pricing: string | null;
  Featured: boolean | null;
  OpenSource: boolean | null;
  Tags: string[] | null;
  Count: string | null;
  Tier: number | null;
}

// Normalized type for component use
export interface NormalizedResource {
  id: number;
  name: string;
  url: string;
  description: string | null;
  category: string | null;
  section: string | null;
  pricing: string | null;
  featured: boolean;
  opensource: boolean;
  tags: string[] | null;
  count: string | null;
  tier: number | null;
}

// Helper to normalize resource data to consistent lowercase keys
export function normalizeResource(resource: InspoResource): NormalizedResource {
  return {
    id: resource.ID ?? 0,
    name: resource.Name ?? '',
    url: resource.URL ?? '',
    description: resource.Description ?? null,
    category: resource.Category ?? null,
    section: resource.Section ?? null,
    pricing: resource.Pricing ?? null,
    featured: resource.Featured ?? false,
    opensource: resource.OpenSource ?? false,
    tags: resource.Tags ?? null,
    count: resource.Count ?? null,
    tier: resource.Tier ?? null,
  };
}

/**
 * Fetches all inspiration resources from Supabase
 * Table: "Inspiration Design Resources"
 * 
 * @returns Object containing data array and error (if any)
 */
export async function getInspoResources() {
  const { data, error } = await supabase
    .from('Inspiration Design Resources')
    .select('*');

  if (error) {
    console.error('[getInspoResources] Supabase error:', error.message);
  }

  return { data: data as InspoResource[] | null, error };
}
