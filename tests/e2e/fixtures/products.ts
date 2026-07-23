import type { Page } from '@playwright/test';

const image = (color: string, label: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="1200" height="675" fill="${color}"/><text x="60" y="340" fill="white" font-family="sans-serif" font-size="72">${label}</text></svg>`)}`;

const tvcOne = image('#1459c7', 'TVC ONE');
const tvcTwo = image('#c3452d', 'TVC TWO');
const artOne = image('#25745e', 'ART ONE');
const brandLogo = image('#f4f3ef', "BITI'S");
const internalBrand = {
  id: 8,
  name: 'Future Studio',
  slug: 'future-studio',
  logoUrl: image('#111111', 'FUTURE STUDIO'),
};

export const brandRows = [{
  id: 7,
  name: "Biti's",
  slug: 'bitis',
  logoUrl: brandLogo,
  description: 'A long-term creative partnership.',
  websiteUrl: 'https://example.com',
  displayOrder: 0,
  isVisible: true,
}];

export const productRows = [
  {
    id: 9001,
    date: '2026.07.19',
    title: 'AUTOMATION TVC ONE',
    describe: 'Automated test product one.',
    image_url: tvcOne,
    brand_id: 7,
    category: 'tvc',
    video_url: null,
    model_url: null,
    image_gallery: [tvcOne],
    video_gallery: [],
    quick_view_layout: [{ type: 'full', items: [{ kind: 'image', url: tvcOne }] }],
    created_at: '2026-07-19T08:00:00.000Z',
    updated_at: '2026-07-19T08:00:00.000Z',
  },
  {
    id: 9002,
    date: '2026.07.18',
    title: 'AUTOMATION TVC TWO',
    describe: 'Automated test product two.',
    image_url: tvcTwo,
    brand_id: 7,
    category: 'tvc',
    video_url: null,
    model_url: null,
    image_gallery: [tvcTwo],
    video_gallery: [],
    quick_view_layout: [{ type: 'full', items: [{ kind: 'image', url: tvcTwo }] }],
    created_at: '2026-07-18T08:00:00.000Z',
    updated_at: '2026-07-18T08:00:00.000Z',
  },
  {
    id: 9003,
    date: '2026.07.17',
    title: 'AUTOMATION ART ONE',
    describe: 'Automated art test product.',
    image_url: artOne,
    brand_id: 8,
    category: 'art',
    video_url: null,
    model_url: null,
    image_gallery: [artOne],
    video_gallery: [],
    quick_view_layout: [{ type: 'full', items: [{ kind: 'image', url: artOne }] }],
    created_at: '2026-07-17T08:00:00.000Z',
    updated_at: '2026-07-17T08:00:00.000Z',
  },
];

const apiProducts = productRows.map((row) => ({
  id: row.id,
  date: row.date,
  title: row.title,
  describe: row.describe,
  imageUrl: row.image_url,
  brandId: row.brand_id,
  brand: row.brand_id === 7
    ? { id: brandRows[0].id, name: brandRows[0].name, slug: brandRows[0].slug, logoUrl: brandRows[0].logoUrl }
    : internalBrand,
  category: row.category,
  videoUrl: row.video_url ?? undefined,
  modelUrl: row.model_url ?? undefined,
  imageGallery: row.image_gallery,
  videoGallery: row.video_gallery,
  quickViewLayout: row.quick_view_layout,
}));

export const mockSupabase = async (page: Page) => {
  await page.route('**/api/products*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(apiProducts),
    });
  });

  await page.route('**/api/content/*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
  });

  await page.route('**/api/members*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  await page.route('**/api/brands*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(brandRows) });
  });
};

export const openApp = async (page: Page, path: string) => {
  await page.goto(path);
  await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 15_000 });
};
