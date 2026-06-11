/**
 * tests/e2e/orcamento.spec.ts
 *
 * CT-ORC-01  Seção de métricas visível
 * CT-ORC-02  Filtros com data-testid existem
 * CT-ORC-03  Filtro de saúde gera chip ativo
 * CT-ORC-04  Botão exportar existe
 *
 * Usa injectSession() + mock API — funciona dentro do Docker.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./e2e_helpers";

const MOCK_BUDGET = {
  data: [
    { id: 1, projeto: "Proj A", programa: "MANSUP", budget: 100_000, custo_real: 80_000,
      saude: "Saudável", saude_financeira: "Saudável", desvio_percent: 10, projecao_estouro: 0 },
    { id: 2, projeto: "Proj B", programa: "INFRA", budget: 50_000, custo_real: 70_000,
      saude: "Crítico", saude_financeira: "Crítico", desvio_percent: -40, projecao_estouro: 20_000 },
  ],
  last_updated_at: "2024-06-01T12:00:00Z",
};

test.describe("Orçamento e Saúde Financeira", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");

  test("CT-ORC-01: seção [data-testid='metrics-section'] visível", async ({ page }) => {
    await expect(page.locator("[data-testid='metrics-section']")).toBeVisible({ timeout: 8_000 });
  });

  test("CT-ORC-02: filtros com data-testid existem", async ({ page }) => {
    await expect(page.locator("[data-testid='filters-section']")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("[data-testid='filter-periodo']")).toBeVisible();
    await expect(page.locator("[data-testid='filter-saude']")).toBeVisible();
  });

  test("CT-ORC-03: selecionar saúde gera chip de filtro ativo", async ({ page }) => {
    const saudeSelect = page.locator("[data-testid='filter-saude']");
    await expect(saudeSelect).toBeVisible({ timeout: 8_000 });
    await saudeSelect.selectOption("Saudável");
    await page.waitForTimeout(400);
    await expect(
      page.locator(".filter-chip, [class*='chip']").first()
    ).toBeVisible({ timeout: 4_000 });
  });

  test("CT-ORC-04: botão exportar existe", async ({ page }) => {
    await expect(
      page.locator("[data-testid='btn-export']")
    ).toBeVisible({ timeout: 8_000 });
  });
});
