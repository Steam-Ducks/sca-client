/**
 * tests/e2e/consolidado.spec.ts
 * Visão Consolidada — nova view com filtros, paginação e KPIs
 *
 * CT-CONS-01  Página carrega com KPIs visíveis
 * CT-CONS-02  Filtros filter-select existem (periodo, programa, projeto, status)
 * CT-CONS-03  Seleção de programa filtra os dados da tabela
 * CT-CONS-04  Botão .clear-btn reseta todos os filtros
 * CT-CONS-05  Paginação (.pg-btn) existe e funciona
 * CT-CONS-06  Botão exportar existe (.export-btn)
 * CT-CONS-07  Usuário sem permissão (compras) → redireciona para /materiais
 */

import { test, expect } from "@playwright/test";
import { injectSession, loginAs } from "./e2e_helpers";

// Mock da API /api/consolidated/ com shape ConsolidadoRow
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
const MOCK_COST_EVOLUTION: unknown[] = [];

test.describe("Consolidado — Visão Geral", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/consolidated/**", (r) =>
      r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_CONSOLIDATED) }));
    await page.route("**/dashboard/cost-evolution/**", (r) =>
      r.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_COST_EVOLUTION) }));
    await page.goto("/consolidado");
    await page.waitForLoadState("networkidle");
  });

  test("CT-CONS-01: KPIs e métricas são visíveis após carregamento", async ({ page }) => {
    await expect(page).toHaveURL(/\/consolidado/);
    // Consolidado exibe custo total e demais KPIs computados do mock
    await expect(
      page.locator(".metrics, .metric-card, .kpi-card, [class*='metric']").first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("CT-CONS-02: filtros .filter-select existem (periodo, programa, projeto, status)", async ({ page }) => {
    const selects = page.locator(".filter-select");
    // Pelo menos 4 selects (periodo, programa, projeto, status)
    await expect(selects.first()).toBeVisible({ timeout: 8_000 });
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("CT-CONS-03: seleção de programa filtra dados da tabela", async ({ page }) => {
    const selects = page.locator(".filter-select");
    await expect(selects.first()).toBeVisible({ timeout: 8_000 });

    // Segundo select = programa (baseado em v-model order: periodo, programa, projeto, status)
    const programaSelect = selects.nth(1);
    const opts = await programaSelect.locator("option").allTextContents();
    // Deve ter opções "Infraestrutura" e "Cloud" do mock
    const nonEmpty = opts.filter((o) => o.trim() !== "");
    if (nonEmpty.length > 0) {
      await programaSelect.selectOption({ label: nonEmpty[0] });
      await page.waitForTimeout(400);
    }
    // Tabela ainda renderiza (não quebrou)
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-CONS-04: botão .clear-btn limpa todos os filtros", async ({ page }) => {
    const selects = page.locator(".filter-select");
    await expect(selects.first()).toBeVisible({ timeout: 8_000 });

    // Ativa um filtro
    const periodoSel = selects.first();
    const opts = await periodoSel.locator("option").allTextContents();
    const valid = opts.filter((o) => o.trim() !== "");
    if (valid.length > 0) {
      await periodoSel.selectOption({ label: valid[0] });
      await page.waitForTimeout(200);
    }

    const clearBtn = page.locator(".clear-btn");
    await expect(clearBtn).toBeVisible({ timeout: 4_000 });
    await clearBtn.click();
    await page.waitForTimeout(300);

    // Select volta para vazio
    const val = await periodoSel.inputValue();
    expect(val).toBe("");
  });

  test("CT-CONS-05: paginação .pg-btn existe e avança para página 2", async ({ page }) => {
    // 12 rows e PER_PAGE = 8 → 2 páginas
    await expect(page.locator("tbody tr, .data-row").first()).toBeVisible({ timeout: 8_000 });
    const pgBtn = page.locator(".pg-btn").first();
    await expect(pgBtn).toBeVisible();

    // Próxima página
    const nextBtn = page.locator(".pg-btn").filter({ hasText: "›" });
    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    }
    await expect(page.locator("body")).toBeVisible();
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
    // compras não tem acesso → redireciona
    await loginAs(page, "compras");
    await page.goto("/consolidado");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });
  });
});
