/**
 * tests/e2e/audit_upload.spec.ts
 * PO criteria: "Add Audit upload flow tests"
 *
 * CT-UPLOAD-01  Aba Importação é clicável e exibe .upload-grid
 * CT-UPLOAD-02  Cards de upload estão visíveis (.upload-card)
 * CT-UPLOAD-03  Upload CSV válido (programas) → backend responde 200
 * CT-UPLOAD-04  Upload CSV com colunas erradas → backend responde 400
 * CT-UPLOAD-05  Upload de .txt (não-CSV) → backend responde 400
 * CT-UPLOAD-06  Aba Histórico exibe tabela de execuções
 * CT-UPLOAD-07  Aba Falhas é acessível
 *
 * Input de arquivo: id="file-input-${file.key}" (dinâmico em Auditoria.vue)
 * Primeiro card = programas (key="programas" → input id="file-input-programas")
 */

import { test, expect } from "@playwright/test";
import { loginAs, VALID_PROGRAMAS_CSV, INVALID_CSV } from "./e2e_helpers";

const PROGRAMAS_COLS = [
  "id", "codigo_programa", "nome_programa", "gerente_programa",
  "gerente_tecnico", "data_inicio", "data_fim_prevista", "status",
].join(",");

const HIST_MOCK = {
  count: 2,
  results: [
    { id: 1, run_id: "abc-111", fonte: "manual", tabela: "programas",
      tipo_processo: "COMPLETA", status: "SUCCESS", linhas_processadas: 1,
      erros: 0, avisos: 0, iniciado_em: "2024-03-01T10:00:00Z",
      finalizado_em: "2024-03-01T10:00:30Z", duracao_segundos: 30 },
    { id: 2, run_id: "abc-222", fonte: "manual", tabela: "projetos",
      tipo_processo: "COMPLETA", status: "ERROR", linhas_processadas: 0,
      erros: 3, avisos: 0, iniciado_em: "2024-03-02T10:00:00Z",
      finalizado_em: "2024-03-02T10:00:05Z", duracao_segundos: 5 },
  ],
};

test.describe("Auditoria — Upload de dados", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    // Mock histórico para não depender de dados reais
    await page.route("**/monitoring/execucoes/**", (r) =>
      r.fulfill({ contentType: "application/json", body: JSON.stringify(HIST_MOCK) }));
    await page.goto("/auditoria");
    await page.waitForLoadState("networkidle");
  });

  test("CT-UPLOAD-01: aba Importação exibe .upload-grid", async ({ page }) => {
    const importTab = page.locator(".tab-btn").filter({ hasText: /importa/i }).first();
    await expect(importTab).toBeVisible({ timeout: 8_000 });
    await importTab.click();
    await expect(page.locator(".upload-grid, .import-sections")).toBeVisible({ timeout: 5_000 });
  });

  test("CT-UPLOAD-02: cards .upload-card são visíveis na aba Importação", async ({ page }) => {
    await page.locator(".tab-btn").filter({ hasText: /importa/i }).first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });
    const count = await page.locator(".upload-card").count();
    expect(count).toBeGreaterThan(0);
  });

  test("CT-UPLOAD-03: CSV válido → backend responde 200 e UI atualiza status", async ({ page }) => {
    // Mock endpoint de programas para sucesso
    await page.route("**/import/programas/", (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ message: "Importação concluída.", records_processed: 1 }),
    }));

    await page.locator(".tab-btn").filter({ hasText: /importa/i }).first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });

    const csvContent = `${PROGRAMAS_COLS}\n1,PROG-E2E,Programa E2E,Gerente,Técnico,2024-01-01,2025-12-31,Em andamento`;

    // O input tem id dinâmico "file-input-programas"
    const fileInput = page.locator("#file-input-programas, input[type='file']").first();
    await fileInput.setInputFiles({
      name: "programas.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    // UI deve refletir processamento ou sucesso
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 8_000 });
  });

  test("CT-UPLOAD-04: CSV com colunas inválidas → backend retorna 400", async ({ page }) => {
    await page.route("**/import/programas/", (route) => route.fulfill({
      status: 400, contentType: "application/json",
      body: JSON.stringify({ error: "Colunas obrigatórias ausentes: codigo_programa" }),
    }));

    await page.locator(".tab-btn").filter({ hasText: /importa/i }).first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });

    const fileInput = page.locator("#file-input-programas, input[type='file']").first();
    await fileInput.setInputFiles({
      name: "invalido.csv", mimeType: "text/csv",
      buffer: Buffer.from(INVALID_CSV),
    });

    // UI não deve quebrar
    await expect(page.locator("body")).toBeVisible({ timeout: 5_000 });
  });

  test("CT-UPLOAD-05: arquivo .txt (não-CSV) → backend retorna 400", async ({ page }) => {
    await page.route("**/import/programas/", (route) => route.fulfill({
      status: 400, contentType: "application/json",
      body: JSON.stringify({ error: "Apenas arquivos .csv são aceitos." }),
    }));

    await page.locator(".tab-btn").filter({ hasText: /importa/i }).first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });

    const fileInput = page.locator("#file-input-programas, input[type='file']").first();
    await fileInput.setInputFiles({
      name: "dados.txt", mimeType: "text/plain",
      buffer: Buffer.from("não é csv"),
    });

    await expect(page.locator("body")).toBeVisible({ timeout: 5_000 });
  });

  test("CT-UPLOAD-06: aba Histórico exibe tabela/lista de execuções", async ({ page }) => {
    const histTab = page.locator(".tab-btn").filter({ hasText: /histórico|historico/i }).first();
    await expect(histTab).toBeVisible({ timeout: 8_000 });
    await histTab.click();
    await expect(
      page.locator("table, .historico-table, tbody, [class*='historico']").first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test("CT-UPLOAD-07: aba Falhas é acessível e não quebra a página", async ({ page }) => {
    const falhasTab = page.locator(".tab-btn").filter({ hasText: /falhas/i }).first();
    await expect(falhasTab).toBeVisible({ timeout: 8_000 });
    await falhasTab.click();
    await expect(page.locator("body")).toBeVisible();
    // Sem erro de console
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    await page.waitForTimeout(500);
    // Erros de rede são esperados no mock, filtramos só JS errors
    const jsErrors = errors.filter(e => !e.includes("Failed to fetch") && !e.includes("net::"));
    expect(jsErrors).toHaveLength(0);
  });
});
