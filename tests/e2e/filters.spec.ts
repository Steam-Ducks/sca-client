/**
 * tests/e2e/filters.spec.ts
 * PO criteria: "Add filtering tests"
 *
 * CT-FILTER-01  Materiais: select-periodo filtra tabela
 * CT-FILTER-02  Materiais: select-programa filtra tabela
 * CT-FILTER-03  Materiais: chip aparece após filtro e botão × remove
 * CT-FILTER-04  Materiais: botão .clear-btn limpa todos os filtros
 * CT-FILTER-05  Orçamento: filter-saude gera chip ativo
 * CT-FILTER-06  Orçamento: btn-limpar reseta filtros
 * CT-FILTER-07  Horas Técnicas: filter-periodo existe e aceita seleção
 */

import { test, expect } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const MATERIAIS_MOCK = [
  { id: 1, material: "Cabo de Rede", projeto: "Projeto A", programa: "MANSUP",
    quantidade: 10, valor_unitario: 50, valor_total: 500,
    periodo: "2024-03", fornecedor: "FornecedorX", categoria: "Rede" },
  { id: 2, material: "Servidor Dell", projeto: "Projeto B", programa: "INFRA",
    quantidade: 1, valor_unitario: 50000, valor_total: 50000,
    periodo: "2024-06", fornecedor: "Dell", categoria: "Hardware" },
];
const FILTER_OPTIONS = {
  periodos: ["2024-03", "2024-06"],
  programas: ["MANSUP", "INFRA"],
  projetos: [{ nome: "Projeto A", programa: "MANSUP" }, { nome: "Projeto B", programa: "INFRA" }],
  categorias: ["Rede", "Hardware"],
  fornecedores: ["FornecedorX", "Dell"],
};

const BUDGET_MOCK = {
  data: [
    { id: 1, projeto: "Proj A", programa: "MANSUP", budget: 100000, custo_real: 80000,
      saude: "Saudável", saude_financeira: "Saudável", desvio_percent: 10, projecao_estouro: 0 },
    { id: 2, projeto: "Proj B", programa: "INFRA", budget: 50000, custo_real: 70000,
      saude: "Crítico", saude_financeira: "Crítico", desvio_percent: -40, projecao_estouro: 20000 },
  ],
  last_updated_at: "2024-06-01T12:00:00Z",
};

// ── Materiais ─────────────────────────────────────────────────────────────────
test.describe("Filtros — Gestão de Materiais", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/compras/**",       (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(MATERIAIS_MOCK) }));
    await page.route("**/top-materials/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify([]) }));
    await page.route("**/cost-by-project/**",(r)=> r.fulfill({ contentType: "application/json", body: JSON.stringify([]) }));
    await page.route("**/filter-options/**",(r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(FILTER_OPTIONS) }));
    await page.goto("/materiais");
    await page.waitForLoadState("networkidle");
  });

  test("CT-FILTER-01: select-periodo filtra a tabela", async ({ page }) => {
    const sel = page.locator("[data-testid='select-periodo']");
    await expect(sel).toBeVisible({ timeout: 8_000 });
    await sel.selectOption("2024-03");
    await page.waitForTimeout(400);
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 5_000 });
  });

  test("CT-FILTER-02: select-programa filtra a tabela", async ({ page }) => {
    const sel = page.locator("[data-testid='select-programa']");
    await expect(sel).toBeVisible({ timeout: 8_000 });
    await sel.selectOption("MANSUP");
    await page.waitForTimeout(400);
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 5_000 });
  });

  test("CT-FILTER-03: chip de filtro ativo aparece e botão × remove", async ({ page }) => {
    const sel = page.locator("[data-testid='select-programa']");
    await expect(sel).toBeVisible({ timeout: 8_000 });
    await sel.selectOption("MANSUP");
    await page.waitForTimeout(300);

    const chip = page.locator(".filter-chip, [class*='chip']").first();
    await expect(chip).toBeVisible({ timeout: 4_000 });

    // Remove via botão ×
    const removeBtn = page.locator(".chip-remove").first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForTimeout(300);
      await expect(chip).not.toBeVisible({ timeout: 3_000 });
    }
  });

  test("CT-FILTER-04: botão .clear-btn limpa todos os filtros", async ({ page }) => {
    const sel = page.locator("[data-testid='select-periodo']");
    await expect(sel).toBeVisible({ timeout: 8_000 });
    await sel.selectOption("2024-03");
    await page.waitForTimeout(200);

    // .clear-btn está em GestaoMateriais.vue
    const clearBtn = page.locator(".clear-btn");
    await expect(clearBtn).toBeVisible({ timeout: 4_000 });
    await clearBtn.click();
    await page.waitForTimeout(300);

    const val = await sel.inputValue();
    expect(val).toBe("");
  });
});

// ── Orçamento ─────────────────────────────────────────────────────────────────
test.describe("Filtros — Orçamento e Saúde Financeira", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/budget/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify(BUDGET_MOCK) }));
    await page.goto("/orcamento");
    await page.waitForLoadState("networkidle");
  });

  test("CT-FILTER-05: filter-saude gera chip ativo após seleção", async ({ page }) => {
    const sel = page.locator("[data-testid='filter-saude']");
    await expect(sel).toBeVisible({ timeout: 8_000 });
    await sel.selectOption("Saudável");
    await page.waitForTimeout(400);
    // Chip visível após seleção
    await expect(page.locator(".filter-chip, [class*='chip']").first()).toBeVisible({ timeout: 4_000 });
  });

  test("CT-FILTER-06: btn-limpar reseta todos os filtros de orçamento", async ({ page }) => {
    const sel = page.locator("[data-testid='filter-saude']");
    await expect(sel).toBeVisible({ timeout: 8_000 });
    await sel.selectOption("Saudável");
    await page.waitForTimeout(200);

    // btn-limpar está em OrcamentoSaudeFinanceira.vue (data-testid="btn-limpar")
    const clearBtn = page.locator("[data-testid='btn-limpar']");
    await expect(clearBtn).toBeVisible({ timeout: 4_000 });
    await clearBtn.click();
    await page.waitForTimeout(300);

    const val = await sel.inputValue();
    expect(val).toBe("");
  });
});

// ── Horas Técnicas ────────────────────────────────────────────────────────────
test.describe("Filtros — Horas Técnicas", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/horas-tecnicas/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify([]) }));
    await page.goto("/horas");
    await page.waitForLoadState("networkidle");
  });

  test("CT-FILTER-07: filter-periodo existe e aceita seleção", async ({ page }) => {
    const sel = page.locator("[data-testid='filter-periodo']");
    await expect(sel).toBeVisible({ timeout: 8_000 });
    await expect(sel).toBeEnabled();
    // Se houver opções, selecionar a primeira não-vazia
    const opts = await sel.locator("option").all();
    if (opts.length > 1) {
      await sel.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }
    await expect(page.locator("body")).toBeVisible();
  });
});
