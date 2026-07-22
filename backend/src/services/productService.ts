import type { NewsItem, ProductCategory } from '../../../shared/types.ts';
import { requireSupabaseAdmin } from '../lib/supabase.ts';
import type { ProductInput } from '../validation/schemas.ts';

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

export const mapProduct = (row: ProductRow): NewsItem => ({
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
  let query = requireSupabaseAdmin().from('products').select('*').order('created_at', { ascending: false });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
};

export const getProduct = async (id: number): Promise<NewsItem | null> => {
  const { data, error } = await requireSupabaseAdmin().from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as ProductRow) : null;
};

const productToRow = (product: ProductInput) => ({
  date: product.date,
  title: product.title,
  client_information: product.clientInformation,
  describe: product.describe,
  image_url: product.imageUrl,
  partner_logo_url: product.partnerLogoUrl || null,
  category: product.category ?? null,
  video_url: product.videoUrl || null,
  model_url: product.modelUrl || null,
  image_gallery: product.imageGallery ?? [],
  video_gallery: product.videoGallery ?? [],
  quick_view_layout: product.quickViewLayout ?? [],
  updated_at: new Date().toISOString(),
});

export const createProduct = async (product: ProductInput): Promise<NewsItem> => {
  const { data, error } = await requireSupabaseAdmin()
    .from('products')
    .insert(productToRow(product))
    .select('*')
    .single();
  if (error) throw error;
  return mapProduct(data as ProductRow);
};

export const updateProduct = async (id: number, product: ProductInput): Promise<NewsItem> => {
  const { data, error } = await requireSupabaseAdmin()
    .from('products')
    .update(productToRow(product))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapProduct(data as ProductRow);
};

const storagePaths = (row: ProductRow) => {
  const marker = '/storage/v1/object/public/product-media/';
  const urls = [
    row.image_url,
    row.partner_logo_url,
    ...(row.image_gallery ?? []),
    ...(row.video_gallery ?? []),
    ...(row.quick_view_layout ?? []).flatMap((block) => block.items.map((item) => item.url)),
  ].filter((value): value is string => Boolean(value));

  return [...new Set(urls.flatMap((value) => {
    try {
      const pathname = new URL(value).pathname;
      const index = pathname.indexOf(marker);
      return index < 0 ? [] : [decodeURIComponent(pathname.slice(index + marker.length))];
    } catch {
      return [];
    }
  }))];
};

export const deleteProduct = async (id: number): Promise<void> => {
  const client = requireSupabaseAdmin();
  const { data: current, error: fetchError } = await client.from('products').select('*').eq('id', id).maybeSingle();
  if (fetchError) throw fetchError;
  if (!current) return;

  const { error } = await client.from('products').delete().eq('id', id);
  if (error) throw error;

  const paths = storagePaths(current as ProductRow);
  if (paths.length) {
    const { error: storageError } = await client.storage.from('product-media').remove(paths);
    if (storageError) console.warn(`Product ${id} media cleanup failed:`, storageError.message);
  }
};
