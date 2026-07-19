import { expect, test } from '@playwright/test';
import { mockSupabase, openApp } from './fixtures/products';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test('products remain scrollable on a mobile viewport', async ({ page }) => {
  await openApp(page, '/#/all-products');
  await expect(page.locator('.news-card')).toHaveCount(3);

  const canScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight);
  expect(canScroll).toBe(true);

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('Quick View fits and can close on mobile', async ({ page }) => {
  await openApp(page, '/#/all-products');
  await page.locator('.news-card').first().locator('.interaction-overlay').tap();

  const modal = page.locator('.quick-view-modal');
  await expect(modal).toBeVisible();
  const box = await modal.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.width).toBeLessThanOrEqual((await page.viewportSize())!.width);

  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
});
