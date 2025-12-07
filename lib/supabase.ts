import { createClient } from './supabase/client';

/**
 * Supabase client for browser/client-side usage
 * 
 * Uses environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export const supabase = createClient();
