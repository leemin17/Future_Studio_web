import type { Brand } from '../../../shared/types.ts';
import { requireSupabaseAdmin } from '../lib/supabase.ts';
import type { BrandInput } from '../validation/schemas.ts';

interface BrandRow {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  description: string | null;
  website_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

const brandColumns = 'id, name, slug, logo_url, description, website_url, display_order, is_visible, created_at, updated_at';

const mapBrand = (row: BrandRow): Brand => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  logoUrl: row.logo_url,
  description: row.description ?? undefined,
  websiteUrl: row.website_url ?? undefined,
  displayOrder: row.display_order,
  isVisible: row.is_visible,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const brandToRow = (brand: BrandInput) => ({
  name: brand.name,
  slug: brand.slug,
  logo_url: brand.logoUrl,
  description: brand.description || null,
  website_url: brand.websiteUrl || null,
  display_order: brand.displayOrder,
  is_visible: brand.isVisible,
  updated_at: new Date().toISOString(),
});

export const getBrands = async (includeHidden = false): Promise<Brand[]> => {
  let query = requireSupabaseAdmin()
    .from('brands')
    .select(brandColumns)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });
  if (!includeHidden) query = query.eq('is_visible', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data as BrandRow[]).map(mapBrand);
};

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  const { data, error } = await requireSupabaseAdmin()
    .from('brands')
    .select(brandColumns)
    .eq('slug', slug)
    .eq('is_visible', true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBrand(data as BrandRow) : null;
};

export const createBrand = async (brand: BrandInput): Promise<Brand> => {
  const { data, error } = await requireSupabaseAdmin()
    .from('brands')
    .insert(brandToRow(brand))
    .select(brandColumns)
    .single();
  if (error) throw error;
  return mapBrand(data as BrandRow);
};

export const updateBrand = async (id: number, brand: BrandInput): Promise<Brand> => {
  const { data, error } = await requireSupabaseAdmin()
    .from('brands')
    .update(brandToRow(brand))
    .eq('id', id)
    .select(brandColumns)
    .single();
  if (error) throw error;
  return mapBrand(data as BrandRow);
};

const brandAssetPath = (url: string) => {
  const marker = '/storage/v1/object/public/brand-assets/';
  try {
    const pathname = new URL(url).pathname;
    const index = pathname.indexOf(marker);
    return index < 0 ? null : decodeURIComponent(pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

export const deleteBrand = async (id: number): Promise<void> => {
  const client = requireSupabaseAdmin();
  const { data: current, error: fetchError } = await client
    .from('brands')
    .select('logo_url')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!current) return;

  const { error } = await client.from('brands').delete().eq('id', id);
  if (error) throw error;

  const path = brandAssetPath(String(current.logo_url ?? ''));
  if (path) {
    const { error: storageError } = await client.storage.from('brand-assets').remove([path]);
    if (storageError) console.warn(`Brand ${id} logo cleanup failed:`, storageError.message);
  }
};
