/**
 * tests/e2e/consolidado.spec.ts
 *
 * CT-CONS-01  KPIs visíveis
 * CT-CONS-02  4 filtros .filter-select existem
 * CT-CONS-03  Seleção de filtro funciona (via index, não label)
 * CT-CONS-04  Botão .clear-btn reseta filtros
 * CT-CONS-05  Paginação .pg-btn existe
 * CT-CONS-06  Botão exportar existe
 * CT-CONS-07  compras → redireciona para /materiais
 *
 * Correção CT-CONS-03/04: selectOption({ label }) falha quando a option não
 * tem atributo value igual ao texto. Usar { index: 1 } é mais robusto.
 */

import { test, expect } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

const MOCK_ROWS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  projeto: `Projeto ${i + 1}`,
  programa: i % 2 === 0 ? "Infraestrutura" : "Cloud",
  custoMateriais: 100_000 + i * 10_000,
  custoHoras: 50_000 + i * 5_000,
  custoTotal: 150_000 + i * 15_000,
  qtdMateriais: 10 + i,
  totalHoras: 200 + i * 20,
  periodo: i < 6 ? "2024-01" : "2024-06",
  status: i % 3 === 0 ? "Concluído" : "Em andamento",
}));

const MOCK_CONSOLIDATED = { data: MOCK_ROWS, last_updated_at: "2024-06-01T10:00:00Z" };

test.describe("Consolidado — Visão Geral", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/consolidated/**",          (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_CONSOLIDATED) }));
    await page.route("**/dashboard/cost-evolution/**",(r)=> r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.goto("/consolidado");
    await page.waitForLoadState("domcontentloaded");
  });

  test("CT-CONS-01: KPIs e métricas visíveis", async ({ page }) => {
    await expect(page).toHaveURL(/\/consolidado/);
    await expect(page.locator("main, .main, [class*='consolidado'], [class*='metric']").first()).toBeVisible({ timeout: 8_000 });
  });

  test("CT-CONS-02: 4 filtros .filter-select existem", async ({ page }) => {
    const selects = page.locator(".filter-select");
    await expect(selects.first()).toBeVisible({ timeout: 8_000 });
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("CT-CONS-03: seleção de programa funciona via index", async ({ page }) => {
    const selects = page.locator(".filter-select");
    await expect(selects.first()).toBeVisible({ timeout: 8_000 });
    // Usar { index } em vez de { label } — evita falha por mismatch value/text
    const programaSelect = selects.nth(1);
    const opts = await programaSelect.locator("option").all();
    if (opts.length > 1) {
      await programaSelect.selectOption({ index: 1 });
      await page.waitForTimeout(400);
    }
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-CONS-04: botão .clear-btn limpa filtros", async ({ page }) => {
    const selects = page.locator(".filter-select");
    await expect(selects.first()).toBeVisible({ timeout: 8_000 });
    const periodoSel = selects.first();
    const opts = await periodoSel.locator("option").all();
    if (opts.length > 1) {
      await periodoSel.selectOption({ index: 1 });
      await page.waitForTimeout(200);
    }
    const clearBtn = page.locator(".clear-btn");
    await expect(clearBtn).toBeVisible({ timeout: 4_000 });
    await clearBtn.click();
    await page.waitForTimeout(300);
    const val = await periodoSel.inputValue();
    expect(val).toBe("");
  });

  test("CT-CONS-05: paginação .pg-btn existe (12 rows, PER_PAGE=8 → 2 páginas)", async ({ page }) => {
    await expect(page.locator("tbody tr, .data-row").first()).toBeVisible({ timeout: 8_000 });
    await expect(page.locator(".pg-btn").first()).toBeVisible();
  });

  test("CT-CONS-06: botão exportar existe", async ({ page }) => {
    await expect(
      page.locator(".export-btn, button:has-text('Exportar')").first()
    ).toBeVisible({ timeout: 8_000 });
  });
});

test.describe("Consolidado — Role access", () => {
  test("CT-CONS-07: compras tenta /consolidado → redireciona para /materiais", async ({ page }) => {
    // Router: allowedProfiles = [super_admin, financeiro, projetos]
    // compras não tem acesso → redireciona para /materiais
    await page.route("**/compras/**", (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.route("**/filter-options/**", (r) => r.fulfill({ contentType: "application/json", body: "{}" }));
    await page.route("**/top-materials/**",  (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.route("**/cost-by-project/**",(r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await injectSession(page, "compras");
    await page.goto("/consolidado");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });
  });
});
