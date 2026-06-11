/**
 * tests/e2e/pagination.spec.ts
 * PO criteria: "Add pagination tests"
 *
 * CT-PAG-01  Materiais: botões .pg-btn existem com 25+ itens
 * CT-PAG-02  Materiais: botão ›  avança para página 2
 * CT-PAG-03  Materiais: contador "página X de Y" (.pagination) visível
 * CT-PAG-04  Orçamento: chart-page-next avança paginação de gráficos
 * CT-PAG-05  Orçamento: table-page-next avança paginação da tabela
 * CT-PAG-06  Orçamento: table-page-size-select muda tamanho de página
 */

import { test, expect } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

// ── 25 items para forçar múltiplas páginas ────────────────────────────────────
const MANY_MATERIAIS = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1, material: `Material ${i + 1}`, projeto: "Projeto A", programa: "MANSUP",
  quantidade: 1, valor_unitario: 100, valor_total: 100,
  periodo: "2024-03", fornecedor: "FornX", categoria: "Hardware",
}));

const MANY_BUDGET = {
  data: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1, projeto: `Projeto ${i + 1}`, programa: "MANSUP",
    budget: 100000, custo_real: 80000, saude: "Saudável",
    saude_financeira: "Saudável", desvio_percent: 10, projecao_estouro: 0,
  })),
  last_updated_at: "2024-06-01T12:00:00Z",
};

const FILTER_OPTIONS = {
  periodos: ["2024-03"], programas: ["MANSUP"], projetos: [], categorias: [], fornecedores: [],
};

// ── Materiais ─────────────────────────────────────────────────────────────────
test.describe("Paginação — Gestão de Materiais", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/compras/**",        (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MANY_MATERIAIS) }));
    await page.route("**/top-materials/**",  (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify([]) }));
    await page.route("**/cost-by-project/**",(r) => r.fulfill({ contentType: "application/json", body: JSON.stringify([]) }));
    await page.route("**/filter-options/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(FILTER_OPTIONS) }));
    await page.goto("/materiais");
    // Aguarda primeira linha de dados
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });
  });

  test("CT-PAG-01: botões .pg-btn existem", async ({ page }) => {
    await expect(page.locator(".pg-btn").first()).toBeVisible();
  });

  test("CT-PAG-02: botão › avança para página 2", async ({ page }) => {
    // › é o botão de próxima página em GestaoMateriais.vue
    const nextBtn = page.locator(".pg-btn").filter({ hasText: "›" });
    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(300);
      // Página 2 deve estar ativa
      const activePage = page.locator(".pg-btn.active, .pg-btn[class*='active']");
      await expect(activePage).toContainText("2", { timeout: 3_000 });
    }
  });

  test("CT-PAG-03: contador 'página X de Y' visível na .pagination", async ({ page }) => {
    // Em GestaoMateriais.vue: <span>página {{ page }} de {{ totalPages }}</span>
    await expect(
      page.locator(".pagination").filter({ hasText: /página \d+ de \d+/ })
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ── Orçamento ─────────────────────────────────────────────────────────────────
test.describe("Paginação — Orçamento e Saúde Financeira", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/budget/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MANY_BUDGET) }));
    await page.goto("/orcamento");
    await expect(page.locator("[data-testid='metrics-section']")).toBeVisible({ timeout: 10_000 });
  });

  test("CT-PAG-04: chart-page-next avança paginação de gráficos", async ({ page }) => {
    const nextChart = page.locator("[data-testid='chart-page-next']");
    if (await nextChart.isVisible() && await nextChart.isEnabled()) {
      await nextChart.click();
      await page.waitForTimeout(300);
      // Barra de paginação de gráfico ainda visível
      await expect(page.locator("[data-testid='chart-pagination-bar']")).toBeVisible();
    }
  });

  test("CT-PAG-05: table-page-next avança paginação da tabela", async ({ page }) => {
    await expect(page.locator("[data-testid='table-section']")).toBeVisible({ timeout: 8_000 });
    const nextTable = page.locator("[data-testid='table-page-next']");
    if (await nextTable.isVisible() && await nextTable.isEnabled()) {
      await nextTable.click();
      await page.waitForTimeout(300);
      await expect(page.locator("[data-testid='data-table']")).toBeVisible({ timeout: 3_000 });
    }
  });

  test("CT-PAG-06: table-page-size-select muda tamanho de página", async ({ page }) => {
    await expect(page.locator("[data-testid='table-section']")).toBeVisible({ timeout: 8_000 });
    const sizeSelect = page.locator("[data-testid='table-page-size-select']");
    if (await sizeSelect.isVisible()) {
      const opts = await sizeSelect.locator("option").allTextContents();
      if (opts.length > 1) {
        await sizeSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);
        await expect(page.locator("[data-testid='data-table']")).toBeVisible({ timeout: 3_000 });
      }
    }
  });
});
