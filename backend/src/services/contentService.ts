import { requireSupabase } from '../lib/supabase.ts';

export const getSiteContent = async <T>(key: string): Promise<T | null> => {
  const { data, error } = await requireSupabase()
    .from('site_content')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return (data?.value as T | undefined) ?? null;
};
