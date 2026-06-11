/**
 * tests/e2e/horas_tecnicas.spec.ts
 * Sem mocks — usa backend PostgreSQL real do CI.
 */
import { test, expect } from "@playwright/test";
import { loginAs } from "./e2e_helpers";

test.describe("Horas Tecnicas", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await page.goto("/horas");
    await page.waitForLoadState("networkidle");
  });

  test("CT-HORAS-01: filtros com data-testid existem", async ({ page }) => {
    await expect(page.locator("[data-testid='filter-periodo']")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("[data-testid='filter-programa']")).toBeVisible();
    await expect(page.locator("[data-testid='filter-projeto']")).toBeVisible();
  });

  test("CT-HORAS-02: filtro de periodo aceita selecao", async ({ page }) => {
    const select = page.locator("[data-testid='filter-periodo']");
    await expect(select).toBeVisible({ timeout: 8_000 });
    await expect(select).toBeEnabled();
    const opts = await select.locator("option").all();
    if (opts.length > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-HORAS-03: botao exportar existe", async ({ page }) => {
    await expect(page.locator("[data-testid='btn-export']")).toBeVisible({ timeout: 8_000 });
  });

  test("CT-HORAS-04: grafico temporal renderiza", async ({ page }) => {
    await expect(page.locator("[data-testid='chart-temporal']")).toBeVisible({ timeout: 10_000 });
  });

  test("CT-HORAS-05: tabela de dados existe", async ({ page }) => {
    await expect(page.locator("[data-testid='data-table']")).toBeVisible({ timeout: 8_000 });
  });
});
