import type { Page } from '@playwright/test';

const image = (color: string, label: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="1200" height="675" fill="${color}"/><text x="60" y="340" fill="white" font-family="sans-serif" font-size="72">${label}</text></svg>`)}`;

const tvcOne = image('#1459c7', 'TVC ONE');
const tvcTwo = image('#c3452d', 'TVC TWO');
const artOne = image('#25745e', 'ART ONE');

export const productRows = [
  {
    id: 9001,
    date: '2026.07.19',
    title: 'AUTOMATION TVC ONE',
    client_information: 'FUTURE CLIENT',
    describe: 'Automated test product one.',
    image_url: tvcOne,
    partner_logo_url: null,
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
    client_information: 'FUTURE CLIENT',
    describe: 'Automated test product two.',
    image_url: tvcTwo,
    partner_logo_url: null,
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
    client_information: 'FUTURE CLIENT',
    describe: 'Automated art test product.',
    image_url: artOne,
    partner_logo_url: null,
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

export const mockSupabase = async (page: Page) => {
  await page.route('**/rest/v1/products*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Content-Range': `0-${productRows.length - 1}/${productRows.length}` },
      body: JSON.stringify(productRows),
    });
  });

  await page.route('**/rest/v1/site_content*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
};

export const openApp = async (page: Page, path: string) => {
  await page.goto(path);
  await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 15_000 });
};
