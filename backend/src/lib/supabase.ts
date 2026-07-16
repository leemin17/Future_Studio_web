import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL?.trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY)?.trim();

export const supabase = url && key
  ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export const requireSupabase = () => {
  if (!supabase) throw new Error('Backend Supabase environment variables are missing.');
  return supabase;
};
