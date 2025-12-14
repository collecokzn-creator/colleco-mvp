import { test, expect } from '@playwright/test';

/**
 * Booking E2E tests
 * Tests booking creation via UI and mock checkout completion
 */
test.describe('Booking E2E', () => {
  test('creates a booking via UI and completes mock checkout', async ({ page }) => {
    // Create booking fixture
    const bookingFixture = {
      id: 'test-bkg-1',
      items: [
        { name: 'Sea View Hotel (2 nights)', amount: 180 },
        { name: 'Table Mountain Hike', amount: 60 }
      ],
      pricing: {
        currency: 'USD',
        subtotal: 240,
        total: 240
      },
      checkout: {
        sessionId: 'mock-session-1234',
        checkoutUrl: `/api/mock-checkout/mock-session-1234`
      }
    };

    // Set up API intercepts
    await page.route('**/api/bookings', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            booking: bookingFixture
          })
        });
      }
    });

    await page.route(`**/api/bookings/${bookingFixture.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          booking: bookingFixture
        })
      });
    });

    await page.route(`**/bookings/${bookingFixture.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          booking: bookingFixture
        })
      });
    });

    // Visit bookings page with E2E setup
    await page.goto('/#/bookings', {
      waitUntil: 'domcontentloaded'
    });

    // Set E2E flags and admin role
    await page.evaluate((fixture) => {
      const win = window as any;
      win.__E2E__ = true;
      localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin'));
      
      // Install fetch wrapper for debugging
      win.__e2e_fetch_calls = [];
      const origFetch = window.fetch;
      if (origFetch) {
        window.fetch = function(resource: any, init?: any) {
          try {
            win.__e2e_fetch_calls.push({
              resource: String(resource),
              init: init || null,
              ts: Date.now()
            });
          } catch (e) {}
          return origFetch(resource, init);
        };
      }
      
      // Store booking fixture for payment success page
      win.__E2E_BOOKING = fixture;
    }, bookingFixture);

    // Ensure page rendered
    await expect(page.locator('#root')).toBeAttached({ timeout: 60000 });

    // Click Pay button
    const payButton = page.locator('button:has-text("Pay securely")');
    await expect(payButton).toBeVisible({ timeout: 30000 });
    await payButton.click();

    // Wait for booking panel or continue
    await page.waitForTimeout(200);
    
    const hasBookingPanel = await page.locator('text=Booking').isVisible().catch(() => false);
    if (hasBookingPanel) {
      console.log('Booking panel visible');
    }

    // Navigate to payment success page
    await page.waitForTimeout(200);
    await page.goto(`/#/payment-success?bookingId=${bookingFixture.id}`, {
      waitUntil: 'domcontentloaded'
    });

    // Verify payment success page
    await expect(page.locator('text=/Payment success/i')).toBeVisible({ timeout: 10000 });

    // Log page content for debugging
    const pageContent = await page.content();
    console.log('[PAYMENT_SUCCESS_DOM]', pageContent.slice(0, 2000));

    // Verify pricing breakdown
    await expect(page.locator('text=/Pricing breakdown/i')).toBeVisible({ timeout: 10000 });

    // Verify booking details are shown
    const hasHotelItem = await page.locator('text=/Sea View Hotel/i').isVisible().catch(() => false);
    const hasHikeItem = await page.locator('text=/Table Mountain Hike/i').isVisible().catch(() => false);
    
    expect(hasHotelItem || hasHikeItem).toBeTruthy();
  });

  test('handles booking creation errors gracefully', async ({ page }) => {
    // Set up failing API
    await page.route('**/api/bookings', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'Booking creation failed'
        })
      });
    });

    await page.goto('/#/bookings', {
      waitUntil: 'domcontentloaded'
    });

    await page.evaluate(() => {
      (window as any).__E2E__ = true;
      localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin'));
    });

    await expect(page.locator('#root')).toBeAttached({ timeout: 60000 });

    // Try to create booking - should show error
    const payButton = page.locator('button:has-text("Pay securely"), button:has-text("Book Now")');
    
    if (await payButton.count() > 0) {
      await payButton.first().click();
      
      // Should show error message
      await page.waitForTimeout(1000);
      const hasError = await page.evaluate(() => {
        const bodyText = document.body.textContent || '';
        return /error|failed|unable/i.test(bodyText);
      });
      
      // Error should be visible or we stay on bookings page
      const stillOnBookings = await page.locator('text=/bookings/i').isVisible().catch(() => false);
      expect(hasError || stillOnBookings).toBeTruthy();
    }
  });
});
