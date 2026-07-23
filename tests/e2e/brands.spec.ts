import { expect, test } from '@playwright/test';
import { mockSupabase, openApp } from './fixtures/products';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test('brand collection filters projects and returns from Quick View', async ({ page }) => {
  await openApp(page, '/#/brands/bitis');

  await expect(page.getByRole('heading', { name: /Biti's.*Future Studio/i })).toBeVisible();
  await expect(page.locator('.brand-project-card')).toHaveCount(2);
  await expect(page.getByText('AUTOMATION ART ONE')).toHaveCount(0);

  await page.locator('.brand-project-card').first().click();
  await expect(page.locator('.quick-view-backdrop')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.quick-view-backdrop')).toHaveCount(0);
  await expect(page).toHaveURL(/\/brands\/bitis$/);
});

test('team collaboration logo links to its collection', async ({ page }) => {
  await openApp(page, '/#/team');

  const brandLink = page.getByRole('button', { name: "View projects created with Biti's" });
  await brandLink.scrollIntoViewIfNeeded();
  await expect(brandLink).toBeVisible();
  await brandLink.click();
  await expect(page).toHaveURL(/\/brands\/bitis$/);
});

test('team collaboration section summarizes projects and leads into the team', async ({ page }) => {
  await openApp(page, '/#/team');

  await expect(page.getByText('Selected partners')).toBeVisible();
  await expect(page.getByText('Collaborative projects')).toBeVisible();
  await expect(page.getByText('02 projects')).toBeVisible();

  const partnerCard = page.locator('.partner-logo-item');
  await expect(partnerCard).toHaveCount(1);
  const partnerCardBox = await partnerCard.first().boundingBox();
  expect(partnerCardBox).not.toBeNull();
  expect(Math.abs(
    (partnerCardBox?.width ?? 0) - (partnerCardBox?.height ?? 0),
  )).toBeLessThanOrEqual(1);

  const teamBridge = page.getByRole('button', {
    name: 'Great work starts with great people Meet the people behind the work',
  });
  await teamBridge.click();
  await expect(page.locator('.team-showcase-info h2')).toBeVisible();
});
