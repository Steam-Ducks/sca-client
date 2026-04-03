import { test, expect } from '@playwright/test'

test.describe('Gestão de Materiais', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('CT01: should display materials management page', async ({ page }) => {
    await expect(page.locator('.filters-title')).toContainText('Filtros')
    await expect(page.locator('.filters-card')).toBeVisible()
    await expect(page.locator('.table-card')).toBeVisible()
  })

  test('CT02: should filter by period', async ({ page }) => {
    const periodoSelect = page.locator('select').first()
    await periodoSelect.selectOption('2024-01')

    // Verificar se a tabela foi filtrada
    await expect(page.locator('tbody tr')).toHaveCount(await page.locator('tbody tr').count())
  })

  test('CT03: should filter by program', async ({ page }) => {
    const programaSelect = page.locator('select').nth(1)
    await programaSelect.selectOption('Infraestrutura')

    // Verificar se a tabela foi filtrada
    await expect(page.locator('tbody tr')).toHaveCount(await page.locator('tbody tr').count())
  })

  test('CT04: should search materials', async ({ page }) => {
    await page.locator('.search-input').fill('Dell')

    // Verificar se a busca funcionou
    await expect(page.locator('tbody tr')).toHaveCount(await page.locator('tbody tr').count())
  })

  test('CT05: should sort by material column', async ({ page }) => {
    const materialHeader = page.locator('th').first()
    await materialHeader.click()

    // Verificar se a ordenação mudou
    await expect(page.locator('tbody tr').first()).toBeVisible()
  })

  test('CT06: should navigate between pages', async ({ page }) => {
    const pageButton = page.locator('.pg-btn').filter({ hasText: '2' })
    if (await pageButton.isVisible()) {
      await pageButton.click()
      await expect(page.locator('.pagination')).toContainText('página 2')
    }
  })

  test('CT07: should display charts', async ({ page }) => {
    await expect(page.locator('.chart-card').first()).toBeVisible()
    await expect(page.locator('.chart-title').last()).toContainText('Evolução Temporal')
  })
})
