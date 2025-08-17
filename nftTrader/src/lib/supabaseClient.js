import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = typeof supabaseUrl === 'string' && /^https?:\/\//i.test(supabaseUrl);

export const supabase = (isValidHttpUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function ensureSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  }
  if (!isValidHttpUrl) {
    throw new Error('Invalid VITE_SUPABASE_URL. Use the Project URL from Supabase (https://<ref>.supabase.co), not the Postgres connection string.');
  }
}
