import { test, expect } from '@playwright/test'

test('call lifecycle smoke — scaffold (fill selectors as-needed)', async ({ page }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173'
  await page.goto(base)

  await expect(page).toHaveTitle(/./)
  await expect(page.locator('body')).toBeVisible()

  // Basic localStorage sanity check
  await page.evaluate(() => localStorage.setItem('colleco.testSmoke', '1'))
  const val = await page.evaluate(() => localStorage.getItem('colleco.testSmoke'))
  expect(val).toBe('1')
})
