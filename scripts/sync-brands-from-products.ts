import { loadEnvFile } from 'node:process';
import { createClient } from '@supabase/supabase-js';

try {
  loadEnvFile('backend/.env');
} catch {
  // CI and production provide environment variables directly.
}

const url = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const brandSeeds = [
  {
    name: "Biti's",
    slug: 'bitis',
    logoUrl: 'https://yt3.ggpht.com/g6Ssn-zE3lHQonVrNH8XwSkItSwI1XuwGzfJmHQXGR_93PDjQQIMeW0lV7cmG4lD6D8e5FDyEA=s68-c-k-c0x00ffffff-no-rj',
    clients: ["BITI'S", 'BITIS', "Biti's Kids"],
    displayOrder: 1,
  },
  {
    name: 'VNPay',
    slug: 'vnpay',
    logoUrl: 'https://vsjyekxwjcrajvpfgcad.supabase.co/storage/v1/object/public/product-media/vn-pay-project-partner-logo/1784451022409-d11eba0c-ad57-4818-869b-a3e43d0bd529-logo-primary.svg',
    clients: ['VN PAY'],
    displayOrder: 2,
  },
  {
    name: 'Seeson',
    slug: 'seeson',
    logoUrl: 'https://vsjyekxwjcrajvpfgcad.supabase.co/storage/v1/object/public/product-media/the-office-partner-logo/1784264116434-0dff7a57-ab27-43cc-a33b-8678383878d4-snapedit-1784264090782.jpeg',
    clients: ['SEESON'],
    displayOrder: 3,
  },
  {
    name: 'Ngọc Diệp',
    slug: 'ngoc-diep',
    logoUrl: 'https://vsjyekxwjcrajvpfgcad.supabase.co/storage/v1/object/public/product-media/phim-doanh-nghiep-ky-niem-30-nam-tap-oan-ngoc-diep-partner-logo/1784261332959-98c13560-8fa5-4c14-aaeb-14c6f29f549a-channels4-profile.jpg',
    clients: ['NGOC DIEP'],
    displayOrder: 4,
  },
] as const;

const main = async () => {
  let linkedProducts = 0;

  for (const seed of brandSeeds) {
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .upsert({
        name: seed.name,
        slug: seed.slug,
        logo_url: seed.logoUrl,
        description: `Selected work created by Future Studio with ${seed.name}.`,
        display_order: seed.displayOrder,
        is_visible: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (brandError) throw brandError;

    const { data: products, error: productError } = await supabase
      .from('products')
      .update({ brand_id: brand.id })
      .in('client_information', [...seed.clients])
      .select('id');

    if (productError) throw productError;
    linkedProducts += products?.length ?? 0;
  }

  console.log(`Synchronized ${brandSeeds.length} brands and linked ${linkedProducts} products.`);
};

void main().catch((error: unknown) => {
  if (error && typeof error === 'object') {
    const details = error as { code?: string; message?: string; details?: string; hint?: string };
    console.error({
      code: details.code,
      message: details.message,
      details: details.details,
      hint: details.hint,
    });
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
