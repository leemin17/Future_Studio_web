import { useEffect, useState } from 'react';
import type { NewsItem } from '@shared/types';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchDatabaseProducts } from '../services/products';

export const useSupabaseProducts = (): NewsItem[] => {
  const [products, setProducts] = useState<NewsItem[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void fetchDatabaseProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return products;
};
