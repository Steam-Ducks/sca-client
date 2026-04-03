import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('CT01: should navigate to materials page (home)', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Gestão de Materiais')
  })

  test('CT02: should navigate to home view', async ({ page }) => {
    await page.click('text=HomeView')
    await expect(page.locator('h2')).toContainText('Home')
  })

  test('CT03: should navigate to dashboard', async ({ page }) => {
    await page.click('text=Dashboard')
    await expect(page.locator('h2')).toContainText('Dashboard')
  })

  test('CT04: should navigate to about page', async ({ page }) => {
    await page.click('text=Sobre')
    await expect(page.locator('h2')).toContainText('Sobre')
  })

  test('CT05: should navigate back to materials', async ({ page }) => {
    await page.click('text=Dashboard')
    await page.click('text=Materiais (principal)')
    await expect(page.locator('h1')).toContainText('Gestão de Materiais')
  })

})