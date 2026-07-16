import type { NewsItem, ProductCategory } from '@shared/types';
import { supabase } from '../lib/supabase';

interface ProductRow {
  id: number;
  date: string;
  title: string;
  client_information: string;
  describe: string;
  image_url: string;
  partner_logo_url: string | null;
  category: ProductCategory | null;
  video_url: string | null;
  model_url: string | null;
  image_gallery: string[] | null;
  video_gallery: string[] | null;
  quick_view_layout: NewsItem['quickViewLayout'] | null;
}

export type NewProductInput = Omit<NewsItem, 'id'>;

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

const productError = (message: string) => {
  if (message.includes('partner_logo_url')) {
    return new Error('Supabase is missing products.partner_logo_url. Run the latest supabase/schema.sql, then try again.');
  }
  return new Error(message || 'Supabase could not save this product.');
};

const rowToProduct = (row: ProductRow): NewsItem => ({
  id: row.id,
  date: row.date,
  title: row.title,
  clientInformation: row.client_information,
  describe: row.describe,
  imageUrl: row.image_url,
  partnerLogoUrl: row.partner_logo_url ?? undefined,
  category: row.category ?? undefined,
  videoUrl: row.video_url ?? undefined,
  modelUrl: row.model_url ?? undefined,
  imageGallery: row.image_gallery ?? undefined,
  videoGallery: row.video_gallery ?? undefined,
  quickViewLayout: row.quick_view_layout ?? undefined,
});

export const fetchDatabaseProducts = async (): Promise<NewsItem[]> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw productError(error.message);
  return ((data ?? []) as ProductRow[]).map(rowToProduct);
};

export const createDatabaseProduct = async (product: NewProductInput): Promise<NewsItem> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('products')
    .insert({
      date: product.date,
      title: product.title,
      client_information: product.clientInformation,
      describe: product.describe,
      image_url: product.imageUrl,
      partner_logo_url: product.partnerLogoUrl ?? null,
      category: product.category ?? null,
      video_url: product.videoUrl ?? null,
      model_url: product.modelUrl ?? null,
      image_gallery: product.imageGallery ?? [],
      video_gallery: product.videoGallery ?? [],
      quick_view_layout: product.quickViewLayout ?? [],
    })
    .select('*')
    .single();

  if (error) throw productError(error.message);
  return rowToProduct(data as ProductRow);
};
