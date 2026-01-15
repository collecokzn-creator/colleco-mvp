import { test, expect } from '@playwright/test';

test('Transfers page shows OpenStreetMap fallback when Google key missing', async ({ page }) => {
  // Try history route first
  await page.goto('http://localhost:5180/transfers', { waitUntil: 'domcontentloaded' });

  const iframe = page.locator('iframe[title="OpenStreetMap"]');

  // If iframe not visible within short timeout, try hash route
  try {
    await expect(iframe).toBeVisible({ timeout: 3000 });
    return;
  } catch (e) {
    // Try hash-based route
    await page.goto('http://localhost:5180/#/transfers', { waitUntil: 'domcontentloaded' });
    await expect(iframe).toBeVisible({ timeout: 5000 });
  }
});
