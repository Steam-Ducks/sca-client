/**
 * tests/e2e/navigation.spec.ts
 *
 * CT-E2E-01  Raiz redireciona para área autenticada
 * CT-E2E-02  Materiais exibe filtros [data-testid='select-periodo']
 * CT-E2E-03  Dashboard carrega
 * CT-E2E-04  Horas Técnicas carrega
 * CT-E2E-05  Auditoria carrega
 * CT-E2E-06  API health responde 200  [SKIP em Docker sem PLAYWRIGHT_API_BASE]
 *
 * Usa injectSession() — funciona dentro do Docker sem backend real.
 * CT-E2E-06 usa chamada direta ao backend; requer PLAYWRIGHT_API_BASE=http://backend:8000/api
 * ou backend em localhost:8000.
 */

import { test, expect } from "@playwright/test";
import { injectSession, API_BASE, BACKEND_AVAILABLE } from "./e2e_helpers";

const MOCK_MATERIAIS: unknown[] = [];
const MOCK_FILTER_OPTIONS = { periodos: [], programas: [], projetos: [], categorias: [], fornecedores: [] };
const MOCK_DASHBOARD = { total_consolidated_cost: 0, total_materials_cost: 0, total_hours_cost: 0, total_projects: 0, total_programs: 0 };

test.describe("Navegação", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    // Mock APIs para não depender de dados reais
    await page.route("**/compras/**",        (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_MATERIAIS) }));
    await page.route("**/top-materials/**",  (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.route("**/cost-by-project/**",(r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.route("**/filter-options/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_FILTER_OPTIONS) }));
    await page.route("**/dashboard/kpis/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_DASHBOARD) }));
    await page.route("**/dashboard/**",      (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.route("**/horas-tecnicas/**", (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.route("**/monitoring/**",     (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ count: 0, results: [] }) }));
  });

  test("CT-E2E-01: raiz redireciona para área autenticada (não /login)", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/(?!login)/, { timeout: 5_000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("CT-E2E-02: página de materiais exibe filtros de período e programa", async ({ page }) => {
    await page.goto("/materiais");
    await page.waitForLoadState("domcontentloaded");
    // Seletores reais: data-testid='select-periodo' e 'select-programa'
    await expect(page.locator("[data-testid='select-periodo']")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("[data-testid='select-programa']")).toBeVisible();
  });

  test("CT-E2E-03: Dashboard carrega sem erro", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-04: Horas Técnicas carrega sem erro", async ({ page }) => {
    await page.goto("/horas");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/horas/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-05: Auditoria carrega sem erro", async ({ page }) => {
    await page.goto("/auditoria");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/auditoria/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-06: API health responde 200", async ({ page }) => {
    // Requer backend acessível. No Docker: defina PLAYWRIGHT_API_BASE=http://backend:8000/api
    if (!BACKEND_AVAILABLE && !process.env.PLAYWRIGHT_API_BASE) {
      test.skip(true, "Defina PLAYWRIGHT_API_BASE=http://backend:8000/api para rodar no Docker.");
      return;
    }
    const response = await page.request.get(`${API_BASE}/health/`);
    expect(response.status()).toBe(200);
  });
});
