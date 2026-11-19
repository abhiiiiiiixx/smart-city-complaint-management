import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default to live project credentials so Netlify, mobile devices, and local builds all connect seamlessly
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://rfflalqpjuoypwgaaxqp.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_SP5F8RIrtT06V4BYhokwEA_deJhdJYO';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim() !== '' &&
    supabaseUrl.startsWith('https://') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim() !== '' &&
    supabaseAnonKey.length > 20
  );
};

// Create live Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
