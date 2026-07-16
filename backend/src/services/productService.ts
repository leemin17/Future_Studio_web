import type { NewsItem, ProductCategory } from '../../../shared/types.ts';
import { requireSupabase } from '../lib/supabase.ts';

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

const mapProduct = (row: ProductRow): NewsItem => ({
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
  imageGallery: row.image_gallery ?? [],
  videoGallery: row.video_gallery ?? [],
  quickViewLayout: row.quick_view_layout ?? [],
});

export const getProducts = async (category?: ProductCategory): Promise<NewsItem[]> => {
  let query = requireSupabase().from('products').select('*').order('created_at', { ascending: false });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
};

export const getProduct = async (id: number): Promise<NewsItem | null> => {
  const { data, error } = await requireSupabase().from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as ProductRow) : null;
};
