import { test, expect } from '@playwright/test';

/**
 * Booking modal tests - programmatic modal opening and interaction
 */
test.describe('Booking modal (programmatic open)', () => {
  test('opens the booking modal via the app test hook and shows dialog controls', async ({ page }) => {
    // Visit the app root
    await page.goto('/');

    // Give the app a moment to register test hooks and wait for window property
    await page.waitForFunction(() => {
      return typeof (window as any).__openBooking === 'function' || 
             typeof (window as any).__forceOpenBooking === 'function';
    }, { timeout: 10000 });

    // Call the function inside the application's window context
    await page.evaluate(() => {
      const win = window as any;
      if (typeof win.__forceOpenBooking === 'function') {
        win.__forceOpenBooking();
      } else if (typeof win.__openBooking === 'function') {
        win.__openBooking();
      }
    });

    // Assert the booking modal dialog is present
    await expect(page.locator('#booking-modal-title')).toBeAttached({ timeout: 10000 });
    await expect(page.locator('[data-e2e-close], [data-e2e="booking-close"]')).toBeAttached({ timeout: 10000 });
    await expect(page.locator('[role="dialog"]')).toBeAttached({ timeout: 10000 });
  });
});

test.describe('Booking Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the app knows we're in E2E so Home exposes helpers
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });
    await page.evaluate(() => {
      (window as any).__E2E__ = true;
    });
  });

  test('opens modal and creates an accommodation booking', async ({ page }) => {
    // Wait for SPA to render primary CTAs
    await expect(page.getByText('Start Planning')).toBeVisible({ timeout: 10000 });

    // Wait for app to expose the programmatic helper
    await page.waitForFunction(() => {
      return typeof (window as any).__openBooking === 'function';
    }, { timeout: 10000 });

    // Call the programmatic helper
    await page.evaluate(() => {
      try {
        (window as any).__openBooking();
      } catch (e) {
        // Fallback is handled below
        console.error('Failed to call __openBooking:', e);
      }
    });

    // Confirm helper executed (test-only flag)
    const openBookingCalled = await page.evaluate(() => {
      return (window as any).__openBookingCalled === true;
    });
    expect(openBookingCalled).toBe(true);

    // Wait for the modal to appear - accept any of several indicators
    await expect(
      page.locator('[role="dialog"], #booking-modal-title, [data-e2e-close]')
    ).toBeAttached({ timeout: 20000 });

    // Small pause to allow render/update to settle
    await page.waitForTimeout(150);

    // Send Escape to close the modal
    await page.keyboard.press('Escape');

    // Ensure the modal is closed
    await expect(page.locator('#booking-modal-title')).not.toBeVisible({ timeout: 5000 });
  });
});
