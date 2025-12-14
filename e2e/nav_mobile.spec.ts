import { test, expect } from '@playwright/test';

/**
 * Mobile navbar tests - ensuring mobile-specific navigation behavior
 */
test.describe('Mobile navbar', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // Mobile viewport

  test('does not show Book Now in mobile navbar and has no /book links', async ({ page }) => {
    await page.goto('/');

    // Wait for the navbar to be present
    const navbar = page.locator('nav[data-testid="navbar-primary"]');
    await expect(navbar).toBeVisible({ timeout: 10000 });

    // Assert there is no visible button or link with text 'Book Now'
    // Only check direct navbar children to avoid catching content from page body
    await expect(navbar.getByText('Book Now')).not.toBeVisible();
    await expect(navbar.locator('a[href*="/book"]')).toHaveCount(0);
  });

  test('does not show Book Now or quick /book links on mobile', async ({ page }) => {
    await page.goto('/');

    // Ensure nav exists
    const navbar = page.locator('nav[data-testid="navbar-primary"]');
    await expect(navbar).toBeAttached();

    // There should be no visible Book Now button/text in the navbar
    await expect(navbar.getByText('Book Now')).not.toBeVisible();
    await expect(navbar.locator('a[href^="/book"]')).toHaveCount(0);
  });
});
