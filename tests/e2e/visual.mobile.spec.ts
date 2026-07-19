import { expect, test } from '@playwright/test';
import { mockSupabase, openApp } from './fixtures/products';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test('mobile All Products matches the approved design', async ({ page }) => {
  await openApp(page, '/#/all-products');
  await expect(page.locator('.news-card')).toHaveCount(3);
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveScreenshot('all-products-mobile.png', {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });
});

test('mobile Quick View matches the approved design', async ({ page }) => {
  await openApp(page, '/#/all-products');
  await page.locator('.news-card').first().locator('.interaction-overlay').tap();
  const modal = page.locator('.quick-view-modal');
  await expect(modal).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  await expect(modal).toHaveScreenshot('quick-view-mobile.png', {
    animations: 'disabled',
    caret: 'hide',
  });
});
