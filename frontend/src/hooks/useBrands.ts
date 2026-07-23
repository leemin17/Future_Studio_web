import { useQuery } from '@tanstack/react-query';
import { fetchAdminBrands, fetchBrands } from '../services/brands';

export const brandsQueryKey = ['brands'] as const;

export const useBrands = () => useQuery({
  queryKey: brandsQueryKey,
  queryFn: fetchBrands,
  staleTime: 5 * 60 * 1000,
});

export const useAdminBrands = (enabled: boolean) => useQuery({
  queryKey: [...brandsQueryKey, 'admin'],
  queryFn: fetchAdminBrands,
  enabled,
  staleTime: 5 * 60 * 1000,
});
