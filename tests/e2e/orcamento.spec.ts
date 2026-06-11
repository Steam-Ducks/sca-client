/**
 * tests/e2e/orcamento.spec.ts
 * Sem mocks - usa backend PostgreSQL real do CI.
 * Budget com dados vazios retorna {data:[], last_updated_at:null}.
 */
import { test, expect } from "@playwright/test";
import { loginAs } from "./e2e_helpers";

test.describe("Orcamento e Saude Financeira", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await page.goto("/orcamento");
    await page.waitForLoadState("networkidle");
  });

  test("CT-ORC-01: secao metrics-section visivel", async ({ page }) => {
    await expect(page.locator("[data-testid='metrics-section']")).toBeVisible({ timeout: 8_000 });
  });

  test("CT-ORC-02: filtros com data-testid existem", async ({ page }) => {
    await expect(page.locator("[data-testid='filters-section']")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("[data-testid='filter-periodo']")).toBeVisible();
    await expect(page.locator("[data-testid='filter-saude']")).toBeVisible();
  });

  test("CT-ORC-03: selecionar saude gera chip de filtro ativo", async ({ page }) => {
    const saudeSelect = page.locator("[data-testid='filter-saude']");
    await expect(saudeSelect).toBeVisible({ timeout: 8_000 });
    await saudeSelect.selectOption("Saudavel");
    await page.waitForTimeout(400);
    await expect(
      page.locator(".filter-chip, [class*='chip']").first()
    ).toBeVisible({ timeout: 4_000 });
  });

  test("CT-ORC-04: botao exportar existe", async ({ page }) => {
    await expect(
      page.locator("[data-testid='btn-export']")
    ).toBeVisible({ timeout: 8_000 });
  });
});
