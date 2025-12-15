import { test, expect } from '@playwright/test';

/**
 * Mobile Home responsiveness tests across multiple viewports
 */

const viewports = [
  { name: 'iphone-12', width: 390, height: 844 },
  { name: 'galaxy-s5', width: 360, height: 640 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'pixel-7', width: 412, height: 915 },
  { name: 'iphone-14-pro-max', width: 430, height: 932 },
];

test.describe('Mobile Home responsiveness', () => {
  for (const viewport of viewports) {
    test(`renders without horizontal scroll on ${viewport.name}`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to home page
      await page.goto('/', {
        timeout: 120000,
        waitUntil: 'domcontentloaded'
      });

      // Wait for React to render into #root
      const root = page.locator('#root');
      await expect(root).toBeVisible({ timeout: 60000 });
      
      // Key UI elements are visible
      await expect(page.locator('nav[data-testid="navbar-primary"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('main')).toBeAttached({ timeout: 30000 });

      // No horizontal scrollbars
      const scrollWidth = await page.evaluate(() => {
        return {
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.body.scrollWidth
        };
      });

      expect(scrollWidth.scrollWidth).toBeLessThanOrEqual(scrollWidth.clientWidth);
    });
  }
});
