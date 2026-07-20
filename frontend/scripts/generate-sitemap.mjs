import { writeFile } from 'node:fs/promises';

const origin = 'https://futurestudiovn.com';
const publicRoutes = ['/', '/all-products', '/tvc', '/cartoon-3d', '/art', '/showreel', '/team', '/contact'];

const slugify = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';

const loadProducts = async () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=id,title&order=created_at.desc`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
    if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Sitemap generated without project URLs: ${error instanceof Error ? error.message : error}`);
    return [];
  }
};

const products = await loadProducts();
const urls = [...publicRoutes, ...products.map((product) => `/projects/${slugify(product.title)}-${product.id}`)];
const today = new Date().toISOString().slice(0, 10);
const entries = urls.map((path, index) => ['  <url>', `    <loc>${origin}${path}</loc>`, `    <lastmod>${today}</lastmod>`, `    <changefreq>${path.startsWith('/projects/') ? 'monthly' : 'weekly'}</changefreq>`, `    <priority>${index === 0 ? '1.0' : path.startsWith('/projects/') ? '0.7' : '0.8'}</priority>`, '  </url>'].join('\n')).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap, 'utf8');
console.log(`Generated sitemap with ${urls.length} URL(s).`);
