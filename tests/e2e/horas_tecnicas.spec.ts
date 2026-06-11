/**
 * tests/e2e/horas_tecnicas.spec.ts
 *
 * CORRIGIDO: Playwright aplica routes em ordem REVERSA (último registrado = primeiro aplicado).
 * Com 3 routes separadas, "horas-tecnicas/*" (registrada por último) capturava
 * kpis/ e temporal/ também, retornando array no lugar do objeto de KPI.
 * O componente Vue falhava ao parsear → filtros não renderizavam.
 *
 * Fix: route ÚNICA com if/else por URL — garante resposta correta para cada endpoint.
 */

import { test, expect } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

const MOCK_KPIS     = { custo_total: 2400.0, total_horas: 8.0, custo_medio: 300.0, registros: 1 };
const MOCK_TEMPORAL = [{ periodo: "2024-03", total_horas: 8.0, total_custo: 2400.0 }];
const MOCK_HORAS    = [
  { id: 1, colaborador: "dev1@sca.com", projeto: "Proj A", programa: "MANSUP",
    horas_trabalhadas: 8.0, custo_total: 2400.0, periodo: "2024-03" },
];

test.describe("Horas Técnicas", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/filter-options/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ periodos: [], programas: [], projetos: [], categorias: [], fornecedores: [] }) }));
    // UMA única route com if/else — evita problema de ordem de registro do Playwright
    await page.route("**/horas-tecnicas/**", (route) => {
      const url = route.request().url();
      if (url.includes("/kpis")) {
        return route.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_KPIS) });
      } else if (url.includes("/temporal")) {
        return route.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_TEMPORAL) });
      } else {
        return route.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_HORAS) });
      }
    });

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
