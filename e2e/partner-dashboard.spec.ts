import { test, expect } from '@playwright/test';

/**
 * Partner Dashboard & Templates smoke tests
 * Focus: route loads, role selection, template persistence
 */
test.describe('Partner Dashboard & Templates Smoke', () => {
  const partnerRoleKey = 'partnerRole';
  const authRoleKey = 'colleco.sidebar.role';
  const userKey = 'user';

  test.beforeEach(async ({ page }) => {
    // Seed authentication and E2E flags
    await page.goto('/#/partner-dashboard', {
      waitUntil: 'domcontentloaded'
    });

    await page.evaluate(({ authRoleKey, userKey }) => {
      const win = window as any;
      // Enable E2E mode so guarded routes and UserContext fallbacks activate
      win.__E2E__ = true;
      win.__E2E_USER__ = { id: 'PARTNER-SMOKE', name: 'Partner Smoke', role: 'partner' };
      
      // Primary auth / role keys used by guards & sidebar
      localStorage.setItem(authRoleKey, JSON.stringify('partner'));
      localStorage.setItem(userKey, JSON.stringify({ 
        id: 'PARTNER-SMOKE', 
        name: 'Partner Smoke', 
        role: 'partner' 
      }));
      
      // Persistence mode to ensure localStorage read path
      localStorage.setItem('user:persistence', 'local');
    }, { authRoleKey, userKey });

    // Wait for E2E mount flag
    await page.waitForFunction(() => {
      return (window as any).__E2E_MOUNTED__ === true;
    }, { timeout: 8000 }).catch(() => {
      // Timeout is acceptable, continue anyway
    });

    // Log active route component if available
    const routeComponent = await page.evaluate(() => {
      const win = window as any;
      return win.__E2E_ACTIVE_ROUTE_COMPONENT__?.['/partner-dashboard'];
    });
    
    if (routeComponent) {
      console.log(`Resolved: /partner-dashboard -> ${routeComponent}`);
    }
  });

  test('renders hub heading', async ({ page }) => {
    await expect(
      page.locator('[data-testid="partner-hub-title"]')
    ).toContainText('Partner Business Hub', { timeout: 12000 });
  });

  test('selects a category tile and persists partnerRole', async ({ page }) => {
    await page.locator('[data-testid="category-hotels-lodges"]').click({ timeout: 12000 });

    // Verify partnerRole is stored in localStorage
    const storedRole = await page.evaluate((key) => {
      return localStorage.getItem(key);
    }, partnerRoleKey);

    expect(storedRole).not.toBeNull();
  });

  test('shows templates after category selection', async ({ page }) => {
    // Click category
    await page.locator('[data-testid="category-hotels-lodges"]').click({ timeout: 12000 });

    // Wait for template grid
    await expect(page.locator('[data-testid="template-grid"]')).toBeVisible({ timeout: 12000 });
  });

  test('persists selected template and navigates', async ({ page }) => {
    // Select category
    await page.locator('[data-testid="category-hotels-lodges"]').click({ timeout: 12000 });

    // Select a template
    const templateCard = page.locator('[data-testid^="template-card-"]').first();
    await templateCard.click({ timeout: 12000 });

    // Verify navigation occurred or modal opened
    await expect(
      page.locator('[data-testid="template-preview"], [role="dialog"]')
    ).toBeAttached({ timeout: 10000 });
  });
});
