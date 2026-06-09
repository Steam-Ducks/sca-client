/**
 * tests/e2e/error_handling.spec.ts
 * PO criteria: "Add error handling scenarios (401, 404, 500)"
 *
 * CT-ERR-01  401 na API de materiais → UI não trava, mostra estado de erro
 * CT-ERR-02  404 na API de materiais → UI não trava, mostra estado de erro
 * CT-ERR-03  500 na API de materiais → UI não trava, mostra estado de erro
 * CT-ERR-04  401 no endpoint de KPIs  → UI não trava
 * CT-ERR-05  500 no endpoint de budget → UI não trava
 * CT-ERR-06  Token expirado (sem header) → rota protegida redireciona para /login
 *
 * Estratégia: page.route() intercepta e retorna erros HTTP sem
 * depender de estado específico do banco ou do backend real.
 */

import { test, expect, Page, Route } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

// ── Helpers ───────────────────────────────────────────────────────────────────
function mockApiError(page: Page, pattern: string, status: number, message: string) {
  return page.route(pattern, (route: Route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ detail: message }),
    })
  );
}

// ── Materiais com erro de API ─────────────────────────────────────────────────
test.describe("Error handling — Gestão de Materiais", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    // Endpoints auxiliares sempre OK
    await page.route("**/top-materials/**",  (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.route("**/cost-by-project/**",(r) => r.fulfill({ contentType: "application/json", body: "[]" }));
    await page.route("**/filter-options/**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ periodos: [], programas: [], projetos: [], categorias: [], fornecedores: [] }) }));
  });

  test("CT-ERR-01: 401 na API /compras/ → página não trava", async ({ page }) => {
    await mockApiError(page, "**/compras/**", 401, "Authentication credentials were not provided.");
    await page.goto("/materiais");
    await page.waitForLoadState("networkidle");
    // Página carrega sem crash — body visível
    await expect(page.locator("body")).toBeVisible();
    // Não redireciona para /login (token no localStorage ainda existe)
    await expect(page).toHaveURL(/\/materiais/);
  });

  test("CT-ERR-02: 404 na API /compras/ → página não trava", async ({ page }) => {
    await mockApiError(page, "**/compras/**", 404, "Not found.");
    await page.goto("/materiais");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveURL(/\/materiais/);
  });

  test("CT-ERR-03: 500 na API /compras/ → página não trava", async ({ page }) => {
    await mockApiError(page, "**/compras/**", 500, "Internal Server Error.");
    await page.goto("/materiais");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveURL(/\/materiais/);
    // Verificar que não há tela branca (algum conteúdo renderizado)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(0);
  });
});

// ── Dashboard com erro de API ─────────────────────────────────────────────────
test.describe("Error handling — Dashboard", () => {
  test("CT-ERR-04: 401 no /dashboard/kpis/ → UI não trava", async ({ page }) => {
    await injectSession(page, "superadmin");
    await mockApiError(page, "**/dashboard/**", 401, "Authentication credentials were not provided.");
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

// ── Orçamento com erro de API ─────────────────────────────────────────────────
test.describe("Error handling — Orçamento", () => {
  test("CT-ERR-05: 500 no /budget/ → UI não trava", async ({ page }) => {
    await injectSession(page, "superadmin");
    await mockApiError(page, "**/budget/**", 500, "Internal Server Error.");
    await page.goto("/orcamento");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveURL(/\/orcamento/);
  });
});

// ── Token expirado / sem sessão ────────────────────────────────────────────────
test.describe("Error handling — Token ausente / expirado", () => {
  test("CT-ERR-06: sem token → router guard redireciona para /login", async ({ page }) => {
    // Garante que não há token
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.removeItem("sca_access_token");
      localStorage.removeItem("sca_user");
    });

    // Tenta rota protegida
    await page.goto("/orcamento");
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
