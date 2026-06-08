/**
 * E2E — Orçamento e Saúde Financeira
 *
 * CT-ORC-01: Seção de métricas está visível
 * CT-ORC-02: Filtros com data-testid existem
 * CT-ORC-03: Filtro de saúde gera chip ativo
 * CT-ORC-04: Botão exportar existe
 */

import { test, expect } from "@playwright/test";

test.describe("Orçamento e Saúde Financeira", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("superadmin");
    await page.locator("#password").fill("superadmin123");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10_000 });
    await page.goto("/orcamento");
    await page.waitForLoadState("networkidle");
  });

  test("CT-ORC-01: seção de métricas visível", async ({ page }) => {
    await expect(
      page.locator("[data-testid='metrics-section'], .metrics, .metric-card").first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("CT-ORC-02: filtros com data-testid existem", async ({ page }) => {
    await expect(page.locator("[data-testid='filters-section']")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("[data-testid='filter-periodo']")).toBeVisible();
    await expect(page.locator("[data-testid='filter-saude']")).toBeVisible();
  });

  test("CT-ORC-03: selecionar saúde gera chip de filtro", async ({ page }) => {
    const saudeSelect = page.locator("[data-testid='filter-saude']");
    await expect(saudeSelect).toBeVisible({ timeout: 8_000 });
    await saudeSelect.selectOption("Saudável");
    await page.waitForTimeout(400);
    await expect(
      page.locator(".filter-chip, .active-filters span, .chip-remove").first()
    ).toBeVisible({ timeout: 4_000 });
  });

  test("CT-ORC-04: botão exportar existe", async ({ page }) => {
    await expect(
      page.locator(".export-btn, button:has-text('Exportar')").first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
