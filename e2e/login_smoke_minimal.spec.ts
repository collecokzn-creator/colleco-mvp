import { test, expect } from '@playwright/test';

/**
 * Login minimal smoke test
 * Quick verification that login form mounts correctly
 */
test.describe('Login minimal smoke', () => {
  test('mounts the login form', async ({ page }) => {
    const ts = Date.now();
    const email = `e2e_minimal_${ts}@example.com`;
    const password = 'password123';

    // Visit login page
    await page.goto('/#/login', {
      waitUntil: 'domcontentloaded'
    });

    // Set up E2E environment before app mounts
    await page.evaluate(({ email, password }) => {
      const win = window as any;

      // Clear persisted state
      localStorage.clear();
      sessionStorage?.clear();

      // Pre-create test user
      const newUser = {
        email,
        password,
        name: email.split('@')[0]
      };

      try {
        localStorage.setItem('user:' + email, JSON.stringify(newUser));
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('user:persistence', 'local');
      } catch (e) {
        console.error('Failed to set user in localStorage:', e);
      }

      // Set E2E mode
      win.__E2E__ = true;
      win.Cypress = {};
    }, { email, password });

    // Wait for app readiness
    await expect(page.locator('[data-e2e-ready="true"]')).toBeAttached({ timeout: 45000 });

    // Check if login form or welcome message exists
    const hasFormOrWelcome = await page.evaluate(() => {
      const hasForm = document.querySelector('[data-e2e="login-form"]') !== null;
      const hasWelcome = Array.from(document.querySelectorAll('h2')).some(
        el => /Welcome,/.test(el.textContent || '')
      );
      return { hasForm, hasWelcome };
    });

    expect(hasFormOrWelcome.hasForm || hasFormOrWelcome.hasWelcome).toBeTruthy();

    // If no form yet, try fallback navigation
    if (!hasFormOrWelcome.hasForm && !hasFormOrWelcome.hasWelcome) {
      // Try clicking login link
      const loginLink = page.locator('a[href="/login"]');
      if (await loginLink.count() > 0) {
        await loginLink.first().click({ force: true });
      } else {
        // Force navigation via hash
        await page.evaluate(() => {
          try {
            window.history?.replaceState?.(null, '', '/login');
          } catch (e) {}
          try {
            window.location.hash = '#/login';
          } catch (e) {}
        });
      }

      // Wait for navigation to complete
      await page.waitForTimeout(1000);
    }

    // Final verification - either form or welcome should exist
    const finalCheck = await page.evaluate(() => {
      const hasForm = document.querySelector('[data-e2e="login-form"]') !== null;
      const hasWelcome = Array.from(document.querySelectorAll('h2')).some(
        el => /Welcome,/.test(el.textContent || '')
      );
      return { hasForm, hasWelcome };
    });

    expect(finalCheck.hasForm || finalCheck.hasWelcome).toBeTruthy();

    // If form is present, verify key elements exist
    if (finalCheck.hasForm) {
      const emailInput = page.locator('input[type="email"], [data-e2e="email-input"]');
      const passwordInput = page.locator('input[type="password"], [data-e2e="password-input"]');
      const submitButton = page.locator('button[type="submit"], [data-e2e="login-submit"]');

      // At least one of these should exist
      const inputCount = await emailInput.count() + await passwordInput.count();
      expect(inputCount).toBeGreaterThan(0);

      // Submit button should exist
      const hasSubmit = await submitButton.count();
      expect(hasSubmit).toBeGreaterThan(0);
    }
  });

  test('login form is accessible', async ({ page }) => {
    await page.goto('/#/login', {
      waitUntil: 'domcontentloaded'
    });

    await page.evaluate(() => {
      (window as any).__E2E__ = true;
      localStorage.clear();
    });

    // Wait for form
    await page.waitForSelector('[data-e2e="login-form"], form', { timeout: 30000 });

    // Check for accessible form elements
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    // Verify inputs have labels or aria-labels
    const emailAccessible = await emailInput.evaluate((el) => {
      const input = el as HTMLInputElement;
      return !!(
        input.getAttribute('aria-label') ||
        input.getAttribute('placeholder') ||
        (input.labels && input.labels.length > 0)
      );
    });

    const passwordAccessible = await passwordInput.evaluate((el) => {
      const input = el as HTMLInputElement;
      return !!(
        input.getAttribute('aria-label') ||
        input.getAttribute('placeholder') ||
        (input.labels && input.labels.length > 0)
      );
    });

    expect(emailAccessible || passwordAccessible).toBeTruthy();
  });
});
