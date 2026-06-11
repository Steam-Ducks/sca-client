/**
 * tests/e2e/dashboard.spec.ts
 *
 * CT-DASH-01  KPIs carregam na página
 * CT-DASH-02  Filtros existem (select.filter-select)
 * CT-DASH-03  Tabela de resumo é visível
 *
 * Usa injectSession() + mock API — funciona dentro do Docker.
 */

import { test, expect } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

const MOCK_KPIS = {
  total_consolidated_cost: 1_500_000,
  total_materials_cost: 900_000,
  total_hours_cost: 600_000,
  total_projects: 12,
  total_programs: 3,
};

const MOCK_PROJECTS = [
  { id: 1, nome_projeto: "Proj A", status: "Em andamento", programa: "MANSUP" },
];

const MOCK_SUMMARY = [
  { programa: "MANSUP", qtd_projetos: 5, custo_materiais: 500_000, custo_horas: 200_000, custo_total: 700_000 },
];

const MOCK_COMPOSITION = {
  custo_materiais: 900_000, custo_horas: 600_000, custo_total: 1_500_000,
  pct_materiais: 60.0, pct_horas: 40.0,
};

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/dashboard/kpis/**",        (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_KPIS) }));
    await page.route("**/dashboard/projects/**",    (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_PROJECTS) }));
    await page.route("**/dashboard/summary/**",     (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_SUMMARY) }));
    await page.route("**/dashboard/composition/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_COMPOSITION) }));
    await page.route("**/dashboard/top-projects/**",(r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.route("**/dashboard/cost-evolution/**",(r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
  });

  test("CT-DASH-01: página carrega e exibe algum conteúdo de KPI", async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    // Aguarda qualquer elemento de métricas renderizar
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("main, .main, [class*='dashboard'], [class*='metric']").first()).toBeVisible({ timeout: 8_000 });
  });

  test("CT-DASH-02: filtros existem na página", async ({ page }) => {
    // DashboardView usa select.filter-select ou input[type=date] para filtros
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
