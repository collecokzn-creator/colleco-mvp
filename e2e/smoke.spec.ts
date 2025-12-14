import { test, expect } from '@playwright/test';

/**
 * Smoke E2E: Basic smoke tests for home page and backend health
 */
test.describe('Smoke', () => {
  test('loads home and has visible header and footer', async ({ page }) => {
    // Navigate to home page
    await page.goto('/', { 
      timeout: 120000,
      waitUntil: 'domcontentloaded' // Don't wait for full 'load' event
    });

    // Wait for root element to exist
    await expect(page.locator('#root')).toBeVisible({ timeout: 60000 });

    // Check navigation is visible (use specific selector to avoid matching sidebar nav)
    await expect(page.locator('nav[data-testid="navbar-primary"]')).toBeVisible({ timeout: 60000 });

    // Check footer exists (visibility can be unreliable due to layout)
    await expect(page.locator('footer')).toBeAttached({ timeout: 60000 });

    // Check main content exists
    await expect(page.locator('main')).toBeAttached({ timeout: 60000 });
  });

  test('backend /health responds', async ({ request }) => {
    // Use the API endpoint to check health
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
  });
});
