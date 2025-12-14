import { test, expect } from '@playwright/test';

test.describe('Smoke — Production preview', () => {
  test('root page loads and basic layout present', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

    // Basic checks for header, nav, main content and footer — accept multiple navs
    const navCount = await page.locator('nav').count();
    expect(navCount).toBeGreaterThanOrEqual(1);
    const mainCount = await page.locator('main').count();
    expect(mainCount).toBeGreaterThanOrEqual(1);
    const footerCount = await page.locator('footer').count();
    expect(footerCount).toBeGreaterThanOrEqual(1);

    // Verify Accommodation page loads via configured route
    await page.goto('http://127.0.0.1:5173/book/accommodation', { waitUntil: 'networkidle' });
    // The page should render a heading titled 'Accommodation Booking' — wait until visible
    const accommodationHeading = page.locator('h1', { hasText: 'Accommodation Booking' }).first();
    await expect(accommodationHeading).toBeVisible();
  });
});
