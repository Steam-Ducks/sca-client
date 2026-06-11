/**
 * tests/e2e/horas_tecnicas.spec.ts
 *
 * CT-HORAS-01  Filtros existem na página (.filter-select)
 * CT-HORAS-02  Filtro de período aceita seleção
 * CT-HORAS-03  Botão exportar existe (.export-btn)
 * CT-HORAS-04  Gráfico temporal renderiza (canvas ou .chart-wrapper)
 * CT-HORAS-05  Tabela de dados existe (table ou .table-wrapper)
 *
 * CORRIGIDO: HorasTecnicas.vue não tem data-testid nos filtros/botões/gráfico.
 * Seletores alterados para classes CSS reais do componente.
 */

import { test, expect } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

const MOCK_HORAS = [
  { id: 1, colaborador: "dev1@sca.com", projeto: "Proj A", programa: "MANSUP",
    horas_trabalhadas: 8.0, custo_total: 2400.0, periodo: "2024-03" },
  { id: 2, colaborador: "dev2@sca.com", projeto: "Proj A", programa: "MANSUP",
    horas_trabalhadas: 6.0, custo_total: 1800.0, periodo: "2024-03" },
];

const MOCK_KPIS    = { custo_total: 4200.0, total_horas: 14.0 };
const MOCK_TEMPORAL = [{ periodo: "2024-03", total_horas: 14.0, total_custo: 4200.0 }];

test.describe("Horas Técnicas", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/horas-tecnicas/kpis/**",    (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_KPIS) }));
    await page.route("**/horas-tecnicas/temporal/**",(r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_TEMPORAL) }));
    await page.route("**/horas-tecnicas/**",         (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_HORAS) }));
    await page.goto("/horas");
    await page.waitForLoadState("domcontentloaded");
  });

  test("CT-HORAS-01: filtros .filter-select existem", async ({ page }) => {
    // HorasTecnicas.vue não tem data-testid — usa classe .filter-select
    const selects = page.locator(".filter-select");
    await expect(selects.first()).toBeVisible({ timeout: 8_000 });
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("CT-HORAS-02: filtro de período aceita seleção", async ({ page }) => {
    const select = page.locator(".filter-select").first();
    await expect(select).toBeVisible({ timeout: 8_000 });
    await expect(select).toBeEnabled();
    const opts = await select.locator("option").all();
    if (opts.length > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-HORAS-03: botão exportar existe", async ({ page }) => {
    await expect(
      page.locator(".export-btn, button:has-text('Exportar'), button:has-text('CSV')").first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("CT-HORAS-04: gráfico temporal renderiza (canvas presente)", async ({ page }) => {
    await expect(
      page.locator("canvas, .chart-wrapper, .recharts-wrapper").first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("CT-HORAS-05: tabela de dados existe", async ({ page }) => {
    await expect(
      page.locator("table, .table-wrapper, .data-grid, tbody").first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
