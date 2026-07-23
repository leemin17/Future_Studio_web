import type { Brand } from '@shared/types';
import { apiRequest } from './apiClient';

export type BrandInput = Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>;

export const fetchBrands = () => apiRequest<Brand[]>('/brands');

export const fetchAdminBrands = () =>
  apiRequest<Brand[]>('/brands/admin/all', { authenticated: true });

export const createDatabaseBrand = (brand: BrandInput) =>
  apiRequest<Brand>('/brands', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(brand),
  });

export const updateDatabaseBrand = (id: number, brand: BrandInput) =>
  apiRequest<Brand>(`/brands/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(brand),
  });

export const deleteDatabaseBrand = (id: number) =>
  apiRequest<void>(`/brands/${id}`, {
    method: 'DELETE',
    authenticated: true,
  });
