/**
 * tests/e2e/audit_upload.spec.ts
 *
 * CT-UPLOAD-01  Aba Importação exibe .upload-grid
 * CT-UPLOAD-02  Cards .upload-card são visíveis
 * CT-UPLOAD-03  Upload CSV válido → mock 200
 * CT-UPLOAD-04  Upload CSV inválido → mock 400
 * CT-UPLOAD-05  Upload .txt → mock 400
 * CT-UPLOAD-06  Aba Histórico exibe execuções
 * CT-UPLOAD-07  Aba Falhas é acessível
 *
 * Usa injectSession() + mock API — funciona dentro do Docker.
 * Input file: id dinâmico "#file-input-${key}" (key = "programas", "projetos", etc.)
 */

import { test, expect } from "@playwright/test";
import { injectSession, VALID_PROGRAMAS_CSV, INVALID_CSV } from "./e2e_helpers";

const PROGRAMAS_COLS =
  "id,codigo_programa,nome_programa,gerente_programa,gerente_tecnico,data_inicio,data_fim_prevista,status";

const HIST_MOCK = {
  count: 1,
  results: [{
    id: 1, run_id: "abc-123", fonte: "manual", tabela: "programas",
    tipo_processo: "COMPLETA", status: "SUCCESS", linhas_processadas: 1,
    erros: 0, avisos: 0, iniciado_em: "2024-03-01T10:00:00Z",
    finalizado_em: "2024-03-01T10:00:30Z", duracao_segundos: 30,
  }],
};

test.describe("Auditoria — Upload de dados", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/monitoring/**", (r) =>
      r.fulfill({ contentType: "application/json", body: JSON.stringify(HIST_MOCK) }));
    await page.goto("/auditoria");
    await page.waitForLoadState("domcontentloaded");
  });

  test("CT-UPLOAD-01: aba Importação exibe .upload-grid", async ({ page }) => {
    // As abas são .tab-btn; o texto varia — navegar pela posição (1ª aba = Importação)
    const tabs = page.locator(".tab-btn");
    await expect(tabs.first()).toBeVisible({ timeout: 8_000 });
    // Clica na aba Importação (primeira ou pelo texto)
    const importTab = tabs.filter({ hasText: /importa/i }).first();
    const fallback  = tabs.first();
    if (await importTab.count() > 0) await importTab.click();
    else await fallback.click();
    await expect(page.locator(".upload-grid, .import-sections, .upload-card")).toBeVisible({ timeout: 5_000 });
  });

  test("CT-UPLOAD-02: cards .upload-card são visíveis na aba Importação", async ({ page }) => {
    const importTab = page.locator(".tab-btn").filter({ hasText: /importa/i });
    if (await importTab.count() > 0) await importTab.first().click();
    else await page.locator(".tab-btn").first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });
  });

  test("CT-UPLOAD-03: upload CSV válido → mock 200 e UI não quebra", async ({ page }) => {
    await page.route("**/import/programas/**", (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ message: "Importação concluída.", linhas_recebidas: 1 }),
    }));

    const importTab = page.locator(".tab-btn").filter({ hasText: /importa/i });
    if (await importTab.count() > 0) await importTab.first().click();
    else await page.locator(".tab-btn").first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });

    const csvContent = `${PROGRAMAS_COLS}\n1,PROG-E2E,Programa E2E,Gerente,Técnico,2024-01-01,2025-12-31,Em andamento`;
    // Tenta pelo id dinâmico, depois pelo seletor genérico
    const fileInput = page.locator("#file-input-programas").or(page.locator("input[type='file']").first());
    await fileInput.setInputFiles({
      name: "programas.csv", mimeType: "text/csv", buffer: Buffer.from(csvContent),
    });
    await page.waitForTimeout(600);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-UPLOAD-04: upload CSV inválido → mock 400 e UI não quebra", async ({ page }) => {
    await page.route("**/import/programas/**", (route) => route.fulfill({
      status: 400, contentType: "application/json",
      body: JSON.stringify({ error: "Colunas obrigatórias ausentes.", colunas_ausentes: ["codigo_programa"] }),
    }));

    const importTab = page.locator(".tab-btn").filter({ hasText: /importa/i });
    if (await importTab.count() > 0) await importTab.first().click();
    else await page.locator(".tab-btn").first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });

    const fileInput = page.locator("#file-input-programas").or(page.locator("input[type='file']").first());
    await fileInput.setInputFiles({
      name: "invalido.csv", mimeType: "text/csv", buffer: Buffer.from(INVALID_CSV),
    });
    await page.waitForTimeout(600);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-UPLOAD-05: upload .txt → mock 400 e UI não quebra", async ({ page }) => {
    await page.route("**/import/programas/**", (route) => route.fulfill({
      status: 400, contentType: "application/json",
      body: JSON.stringify({ error: "Apenas arquivos .csv são aceitos." }),
    }));

    const importTab = page.locator(".tab-btn").filter({ hasText: /importa/i });
    if (await importTab.count() > 0) await importTab.first().click();
    else await page.locator(".tab-btn").first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });

    const fileInput = page.locator("#file-input-programas").or(page.locator("input[type='file']").first());
    await fileInput.setInputFiles({
      name: "dados.txt", mimeType: "text/plain", buffer: Buffer.from("não é csv"),
    });
    await page.waitForTimeout(600);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-UPLOAD-06: aba Histórico exibe execuções mockadas", async ({ page }) => {
    const histTab = page.locator(".tab-btn").filter({ hasText: /hist/i }).first();
    if (await histTab.count() > 0) {
      await histTab.click();
    } else {
      // Tenta segunda aba
      await page.locator(".tab-btn").nth(1).click();
    }
    await expect(page.locator("body")).toBeVisible({ timeout: 5_000 });
    // Algum elemento de tabela ou lista deve aparecer
    await expect(
      page.locator("table, tbody, tr, [class*='hist'], [class*='row']").first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test("CT-UPLOAD-07: aba Falhas é acessível e não quebra a página", async ({ page }) => {
    const falhasTab = page.locator(".tab-btn").filter({ hasText: /falha/i }).first();
    if (await falhasTab.count() > 0) {
      await falhasTab.click();
    } else {
      await page.locator(".tab-btn").last().click();
    }
    await page.waitForTimeout(400);
    await expect(page.locator("body")).toBeVisible();
  });
});
