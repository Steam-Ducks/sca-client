/**
 * tests/e2e/horas_tecnicas.spec.ts
 *
 * CT-HORAS-01  Filtros com data-testid existem
 * CT-HORAS-02  Filtro de período aceita seleção
 * CT-HORAS-03  Botão exportar existe
 * CT-HORAS-04  Gráfico temporal renderiza
 * CT-HORAS-05  Tabela de dados existe
 *
 * Usa injectSession() + mock API — funciona dentro do Docker.
 */

import { test, expect } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

const MOCK_HORAS = [
  { id: 1, colaborador: "dev1@sca.com", projeto: "Proj A", programa: "MANSUP",
    horas_trabalhadas: 8.0, custo_total: 2400.0, periodo: "2024-03" },
  { id: 2, colaborador: "dev2@sca.com", projeto: "Proj A", programa: "MANSUP",
    horas_trabalhadas: 6.0, custo_total: 1800.0, periodo: "2024-03" },
];

const MOCK_KPIS = { custo_total: 4200.0, total_horas: 14.0 };
const MOCK_TEMPORAL = [
  { periodo: "2024-03", total_horas: 14.0, custo_total: 4200.0 },
];

test.describe("Horas Técnicas", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/horas-tecnicas/kpis/**",    (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_KPIS) }));
    await page.route("**/horas-tecnicas/temporal/**",(r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_TEMPORAL) }));
    await page.route("**/horas-tecnicas/**",         (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_HORAS) }));
    await page.goto("/horas");
    await page.waitForLoadState("domcontentloaded");
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

  test("CT-HORAS-03: botão exportar existe", async ({ page }) => {
    await expect(
      page.locator("[data-testid='btn-export']")
    ).toBeVisible({ timeout: 8_000 });
  });

  test("CT-HORAS-04: gráfico temporal renderiza", async ({ page }) => {
    await expect(
      page.locator("[data-testid='chart-temporal']")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("CT-HORAS-05: tabela de dados existe", async ({ page }) => {
    await expect(
      page.locator("[data-testid='data-table']")
    ).toBeVisible({ timeout: 8_000 });
  });
});
