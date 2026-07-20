import type { NewsItem } from '@shared/types';

export const slugifyProjectTitle = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';

export const getProjectPath = (product: Pick<NewsItem, 'id' | 'title'>): string =>
  `/projects/${slugifyProjectTitle(product.title)}-${product.id}`;

export const getProjectIdFromSlug = (slug: string): number | null => {
  const id = Number(slug.match(/-(\d+)$/)?.[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
