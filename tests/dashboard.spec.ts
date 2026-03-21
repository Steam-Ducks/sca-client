import { test, expect } from '@playwright/test'

test.describe('Dashboard - Time Period Filter', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('CT01: should update period when selecting dates', async ({ page }) => {
    await page.fill('input[name="startDate"]', '2026-01-01')
    await page.fill('input[name="endDate"]', '2026-01-31')

    await expect(page.locator('input[name="startDate"]')).toHaveValue('2026-01-01')
    await expect(page.locator('input[name="endDate"]')).toHaveValue('2026-01-31')
  })

  test('CT02: should apply filter and show active filter', async ({ page }) => {
    await page.fill('input[name="startDate"]', '2026-01-01')
    await page.fill('input[name="endDate"]', '2026-01-31')

    await page.click('[data-test="apply-filter"]')

    await expect(page.locator('.active-filter')).toBeVisible()
  })

  test('CT03: should clear the filter', async ({ page }) => {
    await page.fill('input[name="startDate"]', '2026-01-01')
    await page.fill('input[name="endDate"]', '2026-01-31')

    await page.click('[data-test="clear-filter"]')

    await expect(page.locator('input[name="startDate"]')).toHaveValue('')
    await expect(page.locator('input[name="endDate"]')).toHaveValue('')
  })

  test('CT04: should display active filter text', async ({ page }) => {
    await page.fill('input[name="startDate"]', '2026-01-01')
    await page.fill('input[name="endDate"]', '2026-01-31')

    await page.click('[data-test="apply-filter"]')

    await expect(page.locator('.active-filter')).toContainText('2026-01-01')
    await expect(page.locator('.active-filter')).toContainText('2026-01-31')
  })

})