import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL?.trim();
const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export const supabaseAuth = url && anonKey
  ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export const supabaseAdmin = url && serviceRoleKey
  ? createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export const requireSupabaseAuth = () => {
  if (!supabaseAuth) throw new Error('Backend SUPABASE_URL or SUPABASE_ANON_KEY is missing.');
  return supabaseAuth;
};

export const requireSupabaseAdmin = () => {
  if (!supabaseAdmin) throw new Error('Backend SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
  return supabaseAdmin;
};

// Kept as a compatibility alias for read services while they move to the API layer.
export const requireSupabase = requireSupabaseAdmin;
