import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://futurestudiovn.com';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(scriptDirectory, '..');
const outputDirectory = path.join(frontendDirectory, 'dist');
const templatePath = path.join(outputDirectory, 'index.html');

const staticRoutes = [
  {
    path: '/',
    title: 'Future Studio Vietnam | CGI, 3D Animation & Creative Production',
    description: 'Future Studio Vietnam produces TVCs, CGI, 3D animation, mascots and distinctive visual content for brands.',
    heading: 'Future Studio Vietnam',
    intro: 'Creative production studio for TVCs, CGI, 3D animation, mascots and branded visual experiences.',
    schemaType: 'WebPage',
  },
  {
    path: '/all-products',
    title: 'Projects | Future Studio Vietnam',
    description: 'Explore TVC, CGI, 3D animation, art and showreel projects produced by Future Studio Vietnam.',
    heading: 'Future Studio Projects',
    intro: 'A selection of commercial films, CGI, animation and visual production projects.',
    schemaType: 'CollectionPage',
  },
  {
    path: '/tvc',
    title: 'TVC Production | Future Studio Vietnam',
    description: 'Explore television commercials and branded films produced by Future Studio Vietnam.',
    heading: 'TVC Projects',
    intro: 'Commercial films and branded video production by Future Studio Vietnam.',
    schemaType: 'CollectionPage',
    category: 'tvc',
  },
  {
    path: '/cartoon-3d',
    title: '3D Cartoon & Animation | Future Studio Vietnam',
    description: 'Explore 3D cartoon, animation, mascot and CGI projects by Future Studio Vietnam.',
    heading: '3D Cartoon Projects',
    intro: '3D animation, character, mascot and CGI production projects.',
    schemaType: 'CollectionPage',
    category: 'cartoon-3d',
  },
  {
    path: '/art',
    title: 'Art & Visual Projects | Future Studio Vietnam',
    description: 'Explore art direction and visual projects created by Future Studio Vietnam.',
    heading: 'Art Projects',
    intro: 'Art direction, key visual and experimental creative work.',
    schemaType: 'CollectionPage',
    category: 'art',
  },
  {
    path: '/showreel',
    title: 'Showreel | Future Studio Vietnam',
    description: 'Watch selected production and visual work from Future Studio Vietnam.',
    heading: 'Future Studio Showreel',
    intro: 'Selected motion, CGI and production work from Future Studio Vietnam.',
    schemaType: 'CollectionPage',
    category: 'showreel',
  },
  {
    path: '/team',
    title: 'Creative Team | Future Studio Vietnam',
    description: 'Meet the artists, designers and creative production specialists at Future Studio Vietnam.',
    heading: 'Future Studio Team',
    intro: 'The creative team behind our TVC, CGI, animation and visual projects.',
    schemaType: 'AboutPage',
  },
  {
    path: '/contact',
    title: 'Contact | Future Studio Vietnam',
    description: 'Contact Future Studio Vietnam to discuss TVC, CGI, 3D animation, mascot and creative production projects.',
    heading: 'Contact Future Studio',
    intro: 'Email: futurestudio.vn@gmail.com | Phone: +84 971 773 134 | Office: 91 Nghiem Xuan Yem, Da Nang, Vietnam.',
    schemaType: 'ContactPage',
  },
];

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const escapeAttribute = (value = '') => escapeHtml(value).replaceAll('`', '&#096;');

const slugify = (value) => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'project';

const absoluteMediaUrl = (value) => {
  if (!value) return `${SITE_ORIGIN}/images/logo.jpg`;
  try {
    return new URL(value, SITE_ORIGIN).href;
  } catch {
    return `${SITE_ORIGIN}/images/logo.jpg`;
  }
};

const loadProducts = async () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Prerender: Supabase environment variables are missing. Static pages will still be generated.');
    return [];
  }

  try {
    const fields = 'id,date,title,client_information,describe,image_url,partner_logo_url,category,created_at';
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=${fields}&order=created_at.desc`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Prerender: project pages were skipped: ${error instanceof Error ? error.message : error}`);
    return [];
  }
};

const replaceMeta = (html, selector, value) => {
  const escaped = escapeAttribute(value);
  const pattern = selector.startsWith('property:')
    ? new RegExp(`<meta\\s+property=["']${selector.slice(9)}["'][^>]*>`, 'i')
    : new RegExp(`<meta\\s+name=["']${selector}["'][^>]*>`, 'i');
  const attribute = selector.startsWith('property:') ? 'property' : 'name';
  const name = selector.startsWith('property:') ? selector.slice(9) : selector;
  const tag = `<meta ${attribute}="${name}" content="${escaped}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `  ${tag}\n</head>`);
};

const applyDocumentMetadata = (template, page) => {
  const canonicalUrl = new URL(page.path, SITE_ORIGIN).href;
  const imageUrl = absoluteMediaUrl(page.image);
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  html = replaceMeta(html, 'description', page.description);
  html = replaceMeta(html, 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  html = replaceMeta(html, 'property:og:type', page.schemaType === 'CreativeWork' ? 'article' : 'website');
  html = replaceMeta(html, 'property:og:title', page.title);
  html = replaceMeta(html, 'property:og:description', page.description);
  html = replaceMeta(html, 'property:og:url', canonicalUrl);
  html = replaceMeta(html, 'property:og:image', imageUrl);
  html = replaceMeta(html, 'twitter:title', page.title);
  html = replaceMeta(html, 'twitter:description', page.description);
  html = replaceMeta(html, 'twitter:image', imageUrl);

  const canonicalTag = `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`;
  html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html)
    ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonicalTag)
    : html.replace('</head>', `  ${canonicalTag}\n</head>`);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': page.schemaType,
    name: page.heading,
    headline: page.heading,
    description: page.description,
    url: canonicalUrl,
    image: imageUrl,
    inLanguage: 'vi-VN',
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    ...(page.date ? { datePublished: page.date } : {}),
    ...(page.client ? { contributor: { '@type': 'Organization', name: page.client } } : {}),
  };
  html = html.replace('</head>', `  <script id="route-prerender-data" type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<', '\\u003c')}</script>\n</head>`);
  return html;
};

const productCards = (products) => products.map((product) => {
  const projectPath = `/projects/${slugify(product.title)}-${product.id}`;
  const imageUrl = absoluteMediaUrl(product.image_url);
  return `<article><a href="${escapeAttribute(projectPath)}"><img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(product.title)}" width="640" height="400" loading="lazy" /><h2>${escapeHtml(product.title)}</h2></a><p>${escapeHtml(product.describe || product.client_information || '')}</p></article>`;
}).join('');

const createFallbackMarkup = (page, products = []) => `
    <main id="seo-prerender" style="min-height:100vh;background:#0d0e10;color:#fff;padding:8vh 6vw;font-family:Arial,sans-serif">
      <header><a href="/" style="color:inherit;text-decoration:none;font-weight:800">Future Studio</a></header>
      <section style="max-width:1200px;margin:12vh auto 0">
        <h1 style="font-size:clamp(36px,7vw,96px);line-height:.95;margin:0 0 24px">${escapeHtml(page.heading)}</h1>
        <p style="max-width:760px;color:#b9bdc3;line-height:1.65">${escapeHtml(page.intro)}</p>
        ${products.length ? `<div aria-label="Projects">${productCards(products)}</div>` : ''}
      </section>
    </main>`;

const writePrerenderedPage = async (template, page, products = []) => {
  let html = applyDocumentMetadata(template, page);
  const fallback = createFallbackMarkup(page, products);
  html = html.replace(/<div\s+id=["']root["']>\s*<\/div>/i, `<div id="root">${fallback}</div>`);
  const relativePath = page.path === '/' ? 'index.html' : path.join(page.path.slice(1), 'index.html');
  const outputPath = path.join(outputDirectory, relativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
};

const template = await readFile(templatePath, 'utf8');
const products = await loadProducts();

for (const route of staticRoutes) {
  const routeProducts = route.path === '/all-products'
    ? products
    : route.category
      ? products.filter((product) => product.category === route.category)
      : [];
  await writePrerenderedPage(template, route, routeProducts);
}

for (const product of products) {
  const projectPath = `/projects/${slugify(product.title)}-${product.id}`;
  await writePrerenderedPage(template, {
    path: projectPath,
    title: `${product.title} | Future Studio Vietnam`,
    description: product.describe || `${product.title}, a creative production project by Future Studio Vietnam.`,
    heading: product.title,
    intro: product.describe || product.client_information || 'Creative production project by Future Studio Vietnam.',
    image: product.image_url,
    date: product.date,
    client: product.client_information,
    schemaType: 'CreativeWork',
  });
}

console.log(`Prerendered ${staticRoutes.length + products.length} page(s), including ${products.length} project page(s).`);
