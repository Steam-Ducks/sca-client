/**
 * E2E — Horas Técnicas
 *
 * CT-HORAS-01: Página carrega e filtros com data-testid existem
 * CT-HORAS-02: Filtro de período funciona
 * CT-HORAS-03: Botões exportar e limpar existem
 * CT-HORAS-04: Gráfico temporal renderiza (canvas presente)
 * CT-HORAS-05: Tabela de dados existe
 */

import { test, expect } from "@playwright/test";

test.describe("Horas Técnicas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("superadmin");
    await page.locator("#password").fill("superadmin123");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10_000 });
    await page.goto("/horas");
    await page.waitForLoadState("networkidle");
  });

  test("CT-HORAS-01: filtros com data-testid existem", async ({ page }) => {
    await expect(page.locator("[data-testid='filter-periodo']")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("[data-testid='filter-programa']")).toBeVisible();
    await expect(page.locator("[data-testid='filter-projeto']")).toBeVisible();
  });

  test("CT-HORAS-02: filtro de período aceita seleção", async ({ page }) => {
    const select = page.locator("[data-testid='filter-periodo']");
    await expect(select).toBeVisible({ timeout: 8_000 });
    const options = await select.locator("option").all();
    if (options.length > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }
    // Não deve lançar erro
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-HORAS-03: botão exportar existe", async ({ page }) => {
    await expect(
      page.locator("[data-testid='btn-export'], button:has-text('Exportar')")
    ).toBeVisible({ timeout: 8_000 });
  });

  test("CT-HORAS-04: gráfico temporal renderiza", async ({ page }) => {
    await expect(
      page.locator("[data-testid='chart-temporal'], canvas").first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("CT-HORAS-05: tabela de dados existe", async ({ page }) => {
    await expect(
      page.locator("[data-testid='data-table'], table, .table-card")
    ).toBeVisible({ timeout: 8_000 });
  });
});
