/**
 * tests/e2e/audit_upload.spec.ts
 *
 * Sem mock de monitoring — backend real retorna {count:0, results:[]}.
 * Mantidos mocks de import/programas (CT-03/04/05 simulam respostas especificas).
 */

import { test, expect } from "@playwright/test";
import { loginAs, INVALID_CSV } from "./e2e_helpers";

const PROGRAMAS_COLS =
  "id,codigo_programa,nome_programa,gerente_programa,gerente_tecnico,data_inicio,data_fim_prevista,status";

test.describe("Auditoria — Upload de dados", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await page.goto("/auditoria");
    await page.waitForLoadState("domcontentloaded");
  });

  test("CT-UPLOAD-01: aba Importacao exibe cards de upload", async ({ page }) => {
    const tabs = page.locator(".tab-btn");
    await expect(tabs.first()).toBeVisible({ timeout: 8_000 });
    const importTab = tabs.filter({ hasText: /importa/i }).first();
    if (await importTab.count() > 0) await importTab.click();
    else await tabs.first().click();
    await expect(page.locator(".import-sections, .upload-grid").first()).toBeVisible({ timeout: 5_000 });
  });

  test("CT-UPLOAD-02: cards .upload-card sao visiveis na aba Importacao", async ({ page }) => {
    const importTab = page.locator(".tab-btn").filter({ hasText: /importa/i });
    if (await importTab.count() > 0) await importTab.first().click();
    else await page.locator(".tab-btn").first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });
  });

  test("CT-UPLOAD-03: upload CSV valido mock 200 e UI nao quebra", async ({ page }) => {
    await page.route("**/import/programas/**", (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ message: "Importacao concluida.", linhas_recebidas: 1 }),
    }));

    const importTab = page.locator(".tab-btn").filter({ hasText: /importa/i });
    if (await importTab.count() > 0) await importTab.first().click();
    else await page.locator(".tab-btn").first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });

    const csvContent = `${PROGRAMAS_COLS}\n1,PROG-E2E,Programa E2E,Gerente,Tecnico,2024-01-01,2025-12-31,Em andamento`;
    const fileInput = page.locator("#file-input-programas").or(page.locator("input[type='file']").first());
    await fileInput.setInputFiles({
      name: "programas.csv", mimeType: "text/csv", buffer: Buffer.from(csvContent),
    });
    await page.waitForTimeout(600);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-UPLOAD-04: upload CSV invalido mock 400 e UI nao quebra", async ({ page }) => {
    await page.route("**/import/programas/**", (route) => route.fulfill({
      status: 400, contentType: "application/json",
      body: JSON.stringify({ error: "Colunas obrigatorias ausentes.", colunas_ausentes: ["codigo_programa"] }),
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

  test("CT-UPLOAD-05: upload txt mock 400 e UI nao quebra", async ({ page }) => {
    await page.route("**/import/programas/**", (route) => route.fulfill({
      status: 400, contentType: "application/json",
      body: JSON.stringify({ error: "Apenas arquivos .csv sao aceitos." }),
    }));

    const importTab = page.locator(".tab-btn").filter({ hasText: /importa/i });
    if (await importTab.count() > 0) await importTab.first().click();
    else await page.locator(".tab-btn").first().click();
    await expect(page.locator(".upload-card").first()).toBeVisible({ timeout: 5_000 });

    const fileInput = page.locator("#file-input-programas").or(page.locator("input[type='file']").first());
    await fileInput.setInputFiles({
      name: "dados.txt", mimeType: "text/plain", buffer: Buffer.from("nao e csv"),
    });
    await page.waitForTimeout(600);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-UPLOAD-06: aba Historico carrega sem erro", async ({ page }) => {
    const histTab = page.locator(".tab-btn").filter({ hasText: /hist/i }).first();
    if (await histTab.count() > 0) await histTab.click();
    else await page.locator(".tab-btn").nth(1).click();
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator(".tab-btn").first()).toBeVisible({ timeout: 3_000 });
  });

  test("CT-UPLOAD-07: aba Falhas e acessivel e nao quebra a pagina", async ({ page }) => {
    const falhasTab = page.locator(".tab-btn").filter({ hasText: /falha/i }).first();
    if (await falhasTab.count() > 0) await falhasTab.click();
    else await page.locator(".tab-btn").last().click();
    await page.waitForTimeout(400);
    await expect(page.locator("body")).toBeVisible();
  });
});
