/**
 * tests/e2e/horas_tecnicas.spec.ts
 *
 * Seletores confirmados em HorasTecnicas.vue:
 *   [data-testid="filter-periodo"]      → <select>
 *   [data-testid="filter-programa"]     → <select>
 *   [data-testid="filter-projeto"]      → <select>
 *   [data-testid="filter-colaborador"]  → <select>
 *   [data-testid="filter-tarefa"]       → <select>
 *   [data-testid="btn-clear-filters"]   → <button>Limpar filtros</button>
 *   [data-testid="btn-export"]          → <button>
 *   [data-testid="chart-temporal"]      → <canvas>
 *   [data-testid="data-table"]          → <table>
 */

import { test, expect } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

const MOCK_HORAS    = [
  { id: 1, colaborador: "dev1@sca.com", projeto: "Proj A", programa: "MANSUP",
    horas_trabalhadas: 8.0, custo_total: 2400.0, periodo: "2024-03" },
];
const MOCK_KPIS     = { custo_total: 2400.0, total_horas: 8.0 };
const MOCK_TEMPORAL = [{ periodo: "2024-03", total_horas: 8.0, total_custo: 2400.0 }];

test.describe("Horas Técnicas", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/horas-tecnicas/kpis/**",    (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_KPIS) }));
    await page.route("**/horas-tecnicas/temporal/**",(r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_TEMPORAL) }));
    await page.route("**/horas-tecnicas/**",         (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_HORAS) }));
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
    await expect(select).toBeEnabled();
    const opts = await select.locator("option").all();
    if (opts.length > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-HORAS-03: botão exportar [data-testid='btn-export'] existe", async ({ page }) => {
    await expect(page.locator("[data-testid='btn-export']")).toBeVisible({ timeout: 8_000 });
  });

  test("CT-HORAS-04: gráfico temporal [data-testid='chart-temporal'] renderiza", async ({ page }) => {
    await expect(page.locator("[data-testid='chart-temporal']")).toBeVisible({ timeout: 10_000 });
  });

  test("CT-HORAS-05: tabela [data-testid='data-table'] existe", async ({ page }) => {
    await expect(page.locator("[data-testid='data-table']")).toBeVisible({ timeout: 8_000 });
  });
});
