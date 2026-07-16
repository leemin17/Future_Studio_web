import { createClient } from '@supabase/supabase-js';
import {
  contactLinks,
  heroDetails,
  heroImages,
  navItems,
  newsData,
  popularSearches,
  productCategoryIds,
  teamMembers,
} from '../shared/fallbackData.ts';
import type { ProductCategory } from '../shared/types.ts';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the migration.');
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const categoryForProduct = (id: number): ProductCategory | null => {
  const category = (Object.keys(productCategoryIds) as ProductCategory[])
    .find((key) => productCategoryIds[key].includes(id));
  return category ?? null;
};

const productRows = newsData.map((product) => ({
  id: product.id,
  date: product.date,
  title: product.title,
  client_information: product.clientInformation,
  describe: product.describe,
  image_url: product.imageUrl,
  partner_logo_url: product.partnerLogoUrl ?? null,
  category: product.category ?? categoryForProduct(product.id),
  video_url: product.videoUrl ?? null,
  model_url: product.modelUrl ?? null,
  image_gallery: product.imageGallery ?? [],
  video_gallery: product.videoGallery ?? [],
  quick_view_layout: product.quickViewLayout ?? [],
  updated_at: new Date().toISOString(),
}));

const contentRows = [
  { key: 'hero_media', value: heroImages },
  { key: 'hero_details', value: heroDetails },
  { key: 'team_members', value: teamMembers },
  { key: 'navigation', value: navItems },
  { key: 'contact_links', value: contactLinks },
  { key: 'popular_searches', value: popularSearches },
].map((row) => ({ ...row, updated_at: new Date().toISOString() }));

const migrate = async () => {
  const { error: productError } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'id' });
  if (productError) throw productError;

  const { error: contentError } = await supabase
    .from('site_content')
    .upsert(contentRows, { onConflict: 'key' });
  if (contentError) throw contentError;

  console.log(`Migrated ${productRows.length} products and ${contentRows.length} site-content groups.`);
};

await migrate();
