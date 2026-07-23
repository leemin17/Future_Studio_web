import type { NewsItem } from '@shared/types';
import { apiRequest } from './apiClient';

export type NewProductInput = Omit<NewsItem, 'id' | 'brand'>;

export const fetchDatabaseProducts = () => apiRequest<NewsItem[]>('/products');

export const createDatabaseProduct = (product: NewProductInput) =>
  apiRequest<NewsItem>('/products', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(product),
  });

export const updateDatabaseProduct = (id: number, product: NewProductInput) =>
  apiRequest<NewsItem>(`/products/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(product),
  });

export const deleteDatabaseProduct = (id: number) =>
  apiRequest<void>(`/products/${id}`, {
    method: 'DELETE',
    authenticated: true,
  });
