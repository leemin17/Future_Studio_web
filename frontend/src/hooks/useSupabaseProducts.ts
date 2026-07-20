import { useQuery } from '@tanstack/react-query';
import type { NewsItem } from '@shared/types';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchDatabaseProducts } from '../services/products';

export const productsQueryKey = ['products'] as const;

export const useSupabaseProducts = (): NewsItem[] => {
  const { data } = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchDatabaseProducts,
    enabled: isSupabaseConfigured,
  });

  return data ?? [];
};
