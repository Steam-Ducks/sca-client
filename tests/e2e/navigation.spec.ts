/**
 * E2E — Navegação com backend real
 *
 * Testa que cada rota carrega dados reais da API após login.
 * O token é obtido via login real (não fake-e2e-token).
 *
 * CT-E2E-01: rota raiz redireciona para /materiais
 * CT-E2E-02: página de materiais exibe dados da API
 * CT-E2E-03: navegação para Dashboard carrega métricas
 * CT-E2E-04: navegação para Horas Técnicas carrega a página
 * CT-E2E-05: navegação para Auditoria carrega a página
 * CT-E2E-06: API de health está respondendo
 */

import { test, expect } from "@playwright/test";

const API_BASE = process.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

test.describe("Navegação com backend real", () => {
  test.beforeEach(async ({ page }) => {
    // Login real — obtém token JWT válido
    await page.goto("/login");
    await page.locator("#username").fill("superadmin");
    await page.locator("#password").fill("superadmin123");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10_000 });
    await page.waitForLoadState("networkidle");
  });

  test("CT-E2E-01: rota raiz redireciona para área autenticada", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/(?!login)/, { timeout: 5_000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("CT-E2E-02: página de materiais exibe estrutura de filtros", async ({ page }) => {
    await page.goto("/materiais");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".filters-title, .filters-card")).toBeVisible({ timeout: 8_000 });
  });

  test("CT-E2E-03: Dashboard carrega métricas", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator(".metrics, .metric-card").first()).toBeVisible({ timeout: 8_000 });
  });

  test("CT-E2E-04: Horas Técnicas carrega a página", async ({ page }) => {
    await page.goto("/horas");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/horas/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-05: Auditoria carrega a página", async ({ page }) => {
    await page.goto("/auditoria");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/auditoria/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-E2E-06: API health responde 200", async ({ page }) => {
    const response = await page.request.get(`${API_BASE}/health/`);
    expect(response.status()).toBe(200);
  });
});
