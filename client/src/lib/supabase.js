import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

/**
 * Public Supabase client — uses the anon key.
 * Respects Row-Level Security policies.
 * Safe to use in browser code.
 */
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    autoRefreshToken:  true,
    persistSession:    true,
    detectSessionInUrl: true,
  },
});
