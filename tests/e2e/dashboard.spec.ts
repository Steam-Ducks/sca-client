/**
 * tests/e2e/dashboard.spec.ts
 * Sem mocks — usa backend PostgreSQL real do CI.
 * Banco vazio → KPIs retornam zeros → página renderiza com zeros.
 */
import { test, expect } from "@playwright/test";
import { loginAs } from "./e2e_helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("CT-DASH-01: página carrega e exibe conteúdo", async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("main, .main, [class*='dashboard']").first()).toBeVisible({ timeout: 8_000 });
  });

  test("CT-DASH-02: filtros existem na página", async ({ page }) => {
    await expect(
      page.locator("select, input[type='date']").first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("CT-DASH-03: tabela ou seção de resumo é visível", async ({ page }) => {
    await expect(
      page.locator("table, tbody, .card, [class*='summary'], [class*='chart']").first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
