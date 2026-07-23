import { expect, test } from '@playwright/test';
import { mockSupabase, openApp } from './fixtures/products';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test('all products renders products returned by Express API', async ({ page }) => {
  await openApp(page, '/#/all-products');

  await expect(page.locator('.news-card')).toHaveCount(3);
  await expect(page.getByText("AUTOMATION TVC ONE - Biti's")).toBeVisible();
  await expect(page.getByText('AUTOMATION ART ONE - Future Studio')).toBeVisible();
});

test('category route only renders matching products', async ({ page }) => {
  await openApp(page, '/#/tvc');

  await expect(page.locator('.news-card')).toHaveCount(2);
  await expect(page.getByText("AUTOMATION TVC ONE - Biti's")).toBeVisible();
  await expect(page.getByText('AUTOMATION ART ONE - Future Studio')).toHaveCount(0);
});

test('product opens and closes Quick View', async ({ page }) => {
  await openApp(page, '/#/all-products');
  const card = page.locator('.news-card').filter({ hasText: 'AUTOMATION TVC ONE' });

  await card.locator('.interaction-overlay').click();
  await expect(page.locator('.quick-view-backdrop')).toBeVisible();
  await expect(page.locator('.quick-view-header-title')).toHaveText('AUTOMATION TVC ONE');

  await page.keyboard.press('Escape');
  await expect(page.locator('.quick-view-backdrop')).toHaveCount(0);
});

test('anonymous visitor cannot see project management controls', async ({ page }) => {
  await openApp(page, '/#/all-products');
  await expect(page.locator('.news-card')).toHaveCount(3);

  await expect(page.locator('.product-end-cta')).toHaveCount(0);
  await expect(page.locator('.product-card-admin-actions')).toHaveCount(0);
});

test('public navigation opens products, team, and contact pages', async ({ page }) => {
  await openApp(page, '/#/all-products');
  await expect(page.locator('.news-card')).toHaveCount(3);

  await page.goto('/#/team');
  await expect(page.locator('.teampage-wrapper')).toBeVisible();

  await page.goto('/#/contact');
  await expect(page.locator('.contact-page')).toBeVisible();
});
