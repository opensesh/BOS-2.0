import { supabase } from '../supabase';

/**
 * TypeScript type for inspiration resources
 * Matches the inspo_resources table structure
 */
export interface InspoResource {
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
  count: number | null;
  tier: string | null;
  created_at: string;
}

/**
 * Fetches all inspiration resources from Supabase
 * 
 * @returns Object containing data array and error (if any)
 * 
 * @example
 * ```ts
 * const { data, error } = await getInspoResources();
 * if (error) {
 *   console.error('Error fetching resources:', error);
 *   return;
 * }
 * console.log('Resources:', data);
 * ```
 */
export async function getInspoResources() {
  const { data, error } = await supabase
    .from('inspo_resources')
    .select('*')
    .order('id', { ascending: true });

  return { data, error };
}
