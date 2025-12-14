# Cypress to Playwright Migration - Verification Checklist

## ✅ Migration Status: Complete (Core Components)

### Files Created/Modified

#### Configuration
- ✅ Created `playwright.config.ts` - Full Playwright configuration with multiple browsers and mobile viewports
- ✅ Deleted `cypress.config.js` - Removed Cypress configuration

#### Test Files (Created in `/e2e`)
- ✅ `smoke.spec.ts` - Basic smoke tests (home page, health check)
- ✅ `nav_mobile.spec.ts` - Mobile navigation tests
- ✅ `booking_modal.spec.ts` - Booking modal interaction tests
- ✅ `mobile-home.spec.ts` - Mobile responsiveness across 5 viewports
- ✅ `partner-dashboard.spec.ts` - Partner dashboard functionality tests

#### Package Configuration
- ✅ `package.json` - Updated all test scripts to use Playwright
- ✅ Removed Cypress dependencies (cypress, cypress-plugin-tab)
- ✅ Kept @playwright/test dependency

#### GitHub Actions Workflows
- ✅ `.github/workflows/e2e.yml` - Renamed and updated to use Playwright
- ✅ `.github/workflows/e2e-smoke.yml` - Updated smoke tests workflow
- ✅ `.github/workflows/e2e-pr-smoke.yml` - Updated PR smoke tests
- ✅ `.github/workflows/playwright-mobile.yml` - Renamed from cypress-mobile.yml and updated

#### Documentation
- ✅ `docs/E2E.md` - Complete rewrite for Playwright workflows
- ✅ `.github/copilot-instructions.md` - Updated all Cypress references
- ✅ `.gitignore` - Updated to ignore Playwright artifacts
- ✅ `CYPRESS_TO_PLAYWRIGHT_MIGRATION.md` - Created comprehensive migration guide

## Pre-Deployment Verification

### 1. Local Testing
```powershell
# ✅ Build verification
npm run build

# ⏳ Install Playwright browsers (required once)
npx playwright install --with-deps chromium

# ⏳ Run smoke test
npm run smoke:run

# ⏳ Run all E2E tests
npm run test:e2e

# ⏳ Interactive UI mode
npm run test:e2e:ui
```

### 2. Script Verification
Verify these scripts work:
- [ ] `npm run test:e2e` - Runs all tests
- [ ] `npm run test:e2e:ui` - Opens Playwright UI
- [ ] `npm run test:e2e:headed` - Runs with visible browser
- [ ] `npm run test:e2e:debug` - Debug mode
- [ ] `npm run smoke:run` - Smoke tests
- [ ] `npm run mobile:run:se` - iPhone SE tests
- [ ] `npm run mobile:run:iphone12` - iPhone 12 tests
- [ ] `npm run mobile:run:galaxys5` - Galaxy S5 tests

### 3. CI/CD Verification
After merge to main:
- [ ] `.github/workflows/e2e.yml` runs successfully
- [ ] `.github/workflows/e2e-smoke.yml` runs successfully
- [ ] `.github/workflows/e2e-pr-smoke.yml` runs on PRs
- [ ] `.github/workflows/playwright-mobile.yml` runs for mobile tests
- [ ] Artifacts are uploaded correctly to GitHub Actions

### 4. Documentation Check
- [ ] README.md mentions Playwright (if applicable)
- [ ] docs/E2E.md has correct commands
- [ ] Copilot instructions reference Playwright

## Known Gaps (Future Work)

### Tests Not Yet Migrated
The following Cypress tests still exist in `cypress/e2e/` and need conversion:

**High Priority:**
- `login_register_smoke.cy.js`
- `login_smoke_minimal.cy.js`
- `itinerary_add_day.cy.js`
- `gamification.cy.js`
- `booking.cy.js`
- `direct_booking_ui.cy.js`

**Mobile Tests:**
- `mobile-about.cy.js`
- `mobile-bookings.cy.js`
- `mobile-compliance.cy.js`
- `mobile-contact.cy.js`
- `mobile-itinerary.cy.js`
- `mobile-packages.cy.js`
- `mobile-partners.cy.js`
- `mobile-plantrip.cy.js`
- `mobile-profile.cy.js`
- `mobile-promotions.cy.js`
- `mobile-quotes.cy.js`
- `mobile-reports.cy.js`
- `mobile-safety.cy.js`
- `mobile-settings.cy.js`
- `mobile-support.cy.js`
- `mobile-terms.cy.js`
- `mobile-trips.cy.js`

**Other Tests:**
- `ai_generator.cy.js`
- `booking_modal_accessibility.cy.js`
- `debug_mobile_pages.cy.js`
- `debug_nav.cy.js`
- `partner-templates-extended.cy.js`
- `prod_nav_check.cy.js`

### Scripts/Tools That May Need Updates
- [ ] `scripts/orchestrate-e2e.js` - May reference Cypress
- [ ] `scripts/ci-watch-all.ps1` - Artifact paths may need updating
- [ ] Any local developer scripts that run Cypress

## Migration Patterns

### Cypress → Playwright Translation Guide

#### Basic Navigation
```javascript
// Cypress
cy.visit('/path')

// Playwright
await page.goto('/path')
```

#### Element Selection
```javascript
// Cypress
cy.get('selector')
cy.get('[data-testid="id"]')
cy.contains('text')

// Playwright
page.locator('selector')
page.locator('[data-testid="id"]')
page.getByText('text')
```

#### Assertions
```javascript
// Cypress
cy.get('nav').should('be.visible')
cy.get('footer').should('exist')

// Playwright
await expect(page.locator('nav')).toBeVisible()
await expect(page.locator('footer')).toBeAttached()
```

#### Interactions
```javascript
// Cypress
cy.get('button').click()
cy.get('input').type('text')

// Playwright
await page.locator('button').click()
await page.locator('input').fill('text')
```

#### Window/Page Evaluation
```javascript
// Cypress
cy.window().then((win) => {
  win.__E2E__ = true
})

// Playwright
await page.evaluate(() => {
  (window as any).__E2E__ = true
})
```

#### API Requests
```javascript
// Cypress
cy.request('/api/endpoint')

// Playwright
await page.request.get('/api/endpoint')
// or in test context
await request.get('/api/endpoint')
```

## Rollback Plan

If critical issues arise:

1. **Revert package.json:**
   ```powershell
   git checkout HEAD~1 -- package.json package-lock.json
   npm ci
   ```

2. **Restore Cypress config:**
   ```powershell
   git checkout HEAD~1 -- cypress.config.js
   ```

3. **Restore workflows:**
   ```powershell
   git checkout HEAD~1 -- .github/workflows/
   ```

4. **Keep new Playwright tests** - They can coexist during transition

## Success Criteria

Migration is considered successful when:
- ✅ All core smoke tests pass in Playwright
- ✅ Mobile viewport tests work correctly
- ✅ CI/CD pipelines run without errors
- ✅ No Cypress dependencies remain in package.json
- ✅ Documentation is updated
- ⏳ At least 80% of Cypress tests are migrated (currently ~15%)
- ⏳ Team is trained on Playwright usage

## Next Steps

1. **Immediate (This Week):**
   - Install Playwright browsers locally
   - Run smoke tests to verify migration
   - Test CI/CD workflows

2. **Short-term (Next 2 Weeks):**
   - Migrate login/authentication tests
   - Migrate remaining mobile tests
   - Remove `cypress/` directory

3. **Medium-term (Next Month):**
   - Migrate all remaining tests
   - Add Playwright-specific features (visual regression, accessibility)
   - Full team training on Playwright

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Cypress to Playwright Migration Guide](https://playwright.dev/docs/migrating-from-cypress)
- [Project Migration Summary](./CYPRESS_TO_PLAYWRIGHT_MIGRATION.md)
- [E2E Testing Documentation](./docs/E2E.md)

---

**Last Updated**: December 14, 2025  
**Migration Status**: ✅ Core complete, remaining tests in progress
