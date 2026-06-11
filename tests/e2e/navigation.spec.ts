/**
 * tests/e2e/navigation.spec.ts
 * Sem mocks — usa backend PostgreSQL real do CI.
 * Banco vazio → endpoints retornam [] ou {} → páginas renderizam normalmente.
 */
import { test, expect } from "@playwright/test";
import { loginAs, API_BASE } from "./e2e_helpers";

test.describe("Navegação", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
  });

  test("CT-E2E-01: raiz redireciona para área autenticada", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/(?!login)/, { timeout: 5_000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("CT-E2E-02: página de materiais exibe filtros de período e programa", async ({ page }) => {
    await page.goto("/materiais");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='select-periodo']")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("[data-testid='select-programa']")).toBeVisible();
  });

  test("CT-E2E-03: Dashboard carrega", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-04: Horas Técnicas carrega", async ({ page }) => {
    await page.goto("/horas");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/horas/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-05: Auditoria carrega", async ({ page }) => {
    await page.goto("/auditoria");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/auditoria/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-06: API health responde 200", async ({ page }) => {
    const response = await page.request.get(`${API_BASE}/health/`);
    expect(response.status()).toBe(200);
  });
});
