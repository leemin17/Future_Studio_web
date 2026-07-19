import { expect, test } from '@playwright/test';
import { mockSupabase, openApp } from './fixtures/products';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test('desktop All Products matches the approved design', async ({ page }) => {
  await openApp(page, '/#/all-products');
  await expect(page.locator('.news-card')).toHaveCount(3);
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveScreenshot('all-products-desktop.png', {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });
});

test('desktop Quick View matches the approved design', async ({ page }) => {
  await openApp(page, '/#/all-products');
  await page.locator('.news-card').first().locator('.interaction-overlay').click();
  const modal = page.locator('.quick-view-modal');
  await expect(modal).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  await expect(modal).toHaveScreenshot('quick-view-desktop.png', {
    animations: 'disabled',
    caret: 'hide',
  });
});
