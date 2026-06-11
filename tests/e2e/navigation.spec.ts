/**
 * tests/e2e/navigation.spec.ts
 *
 * CORRIGIDO CT-E2E-03: DashboardView.vue chama endpoints além de /api/dashboard/*
 * (budget, costs, etc.). Com backend real, esses requests chegam com token fake → 401
 * → axios interceptor → redirect para /login.
 * Fix: mock abrangente de todos os endpoints + networkidle.
 */

import { test, expect } from "@playwright/test";
import { injectSession, API_BASE, BACKEND_AVAILABLE } from "./e2e_helpers";

async function mockAllEndpoints(page: Parameters<typeof injectSession>[0]) {
  // Dashboard
  await page.route("**/dashboard/kpis/**",          (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ total_consolidated_cost: 0, total_materials_cost: 0, total_hours_cost: 0, total_projects: 0, total_programs: 0 }) }));
  await page.route("**/dashboard/projects/**",       (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/dashboard/summary/**",        (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/dashboard/composition/**",    (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ custo_materiais: 0, custo_horas: 0, custo_total: 0, pct_materiais: 0, pct_horas: 0 }) }));
  await page.route("**/dashboard/top-projects/**",   (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/dashboard/cost-evolution/**", (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  // Materiais
  await page.route("**/compras/**",                  (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/top-materials/**",            (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/cost-by-project/**",          (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/filter-options/**",           (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ periodos: [], programas: [], projetos: [], categorias: [], fornecedores: [] }) }));
  await page.route("**/materials/indicators/**",     (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ custo_total: 0, total_itens: 0, custo_medio: 0 }) }));
  // Budget
  await page.route("**/budget/indicators/**",        (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ data: {}, last_updated_at: null }) }));
  await page.route("**/budget/**",                   (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ data: [], last_updated_at: null }) }));
  // Costs
  await page.route("**/costs/**",                    (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  // Horas
  await page.route("**/horas-tecnicas/kpis/**",      (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ custo_total: 0, total_horas: 0 }) }));
  await page.route("**/horas-tecnicas/temporal/**",  (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/horas-tecnicas/**",           (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  // Consolidated
  await page.route("**/consolidated/**",             (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ data: [], last_updated_at: null }) }));
  // Monitoring
  await page.route("**/monitoring/**",               (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ count: 0, results: [] }) }));
  // Users
  await page.route("**/users/**",                    (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
}

test.describe("Navegação", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await mockAllEndpoints(page);
  });

  test("CT-E2E-01: raiz redireciona para área autenticada (não /login)", async ({ page }) => {
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

  test("CT-E2E-03: Dashboard carrega sem erro", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-04: Horas Técnicas carrega sem erro", async ({ page }) => {
    await page.goto("/horas");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/horas/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-05: Auditoria carrega sem erro", async ({ page }) => {
    await page.goto("/auditoria");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/auditoria/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-06: API health responde 200", async ({ page }) => {
    if (!BACKEND_AVAILABLE && !process.env.PLAYWRIGHT_API_BASE) {
      test.skip(true, "Defina PLAYWRIGHT_BACKEND_AVAILABLE=true para rodar no CI.");
      return;
    }
    const response = await page.request.get(`${API_BASE}/health/`);
    expect(response.status()).toBe(200);
  });
});
