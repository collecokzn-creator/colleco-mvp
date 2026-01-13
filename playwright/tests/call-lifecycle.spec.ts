import { test, expect } from '@playwright/test'

// Smoke test scaffold for call lifecycle. Marked skipped until selectors are confirmed.
test('call lifecycle smoke — scaffold (fill selectors as-needed)', async ({ page }) => {
  // Base URL used by the project's Playwright config is typically set in playwright.config.ts
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173'
  await page.goto(base)

  // Basic sanity checks — page loads and has content
  await expect(page).toHaveTitle(/./)
  await expect(page.locator('body')).toBeVisible()

  // TODO: Replace the example selectors below with real selectors from the app.
  // Example steps to implement later:
  // 1. Click the control that opens the call modal: await page.click('[data-testid="start-call"]')
  // 2. Wait for the call modal to appear: await expect(page.locator('[data-testid="call-modal"]')).toBeVisible()
  // 3. Toggle video off and assert avatar fallback appears
  // 4. Enter fullscreen and assert toolbar remains visible
  // 5. End call and assert the modal closes and `colleco.activeCall` is cleared from localStorage

  // Minimal localStorage / storage-event sanity check (no app-specific selectors required):
  await page.evaluate(() => {
    localStorage.setItem('colleco.testSmoke', '1')
  })
  const val = await page.evaluate(() => localStorage.getItem('colleco.testSmoke'))
  expect(val).toBe('1')
})
