/**
 * tests/e2e/role_access.spec.ts
 *
 * CT-ROLE-01..07: router guard com injectSession — funciona em Docker e CI.
 * CT-ROLE-08..09: chamadas reais à API — requerem PLAYWRIGHT_BACKEND_AVAILABLE=true.
 *
 * CORRIGIDO: CT-ROLE-08/09 recebiam 401 porque loginAs() falhava (CORS bloqueava
 * o login real no CI). Token resultante era null → Authorization: "Bearer null".
 * Fix: skip automático se BACKEND_AVAILABLE=false.
 */

import { test, expect } from "@playwright/test";
import { injectSession, loginAs, API_BASE, BACKEND_AVAILABLE } from "./e2e_helpers";

async function mockAllAPIs(page: Parameters<typeof injectSession>[0]) {
  await page.route("**/compras/**",         (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/top-materials/**",   (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/cost-by-project/**", (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/filter-options/**",  (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ periodos: [], programas: [], projetos: [], categorias: [], fornecedores: [] }) }));
  await page.route("**/dashboard/**",       (r) => r.fulfill({ contentType: "application/json", body: "{}" }));
  await page.route("**/horas-tecnicas/**",  (r) => r.fulfill({ contentType: "application/json", body: "[]" }));
  await page.route("**/consolidated/**",    (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ data: [], last_updated_at: null }) }));
  await page.route("**/budget/**",          (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ data: [], last_updated_at: null }) }));
  await page.route("**/monitoring/**",      (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ count: 0, results: [] }) }));
}

// ── CT-ROLE-01: super_admin ───────────────────────────────────────────────────
test.describe("Role access — super_admin", () => {
  test("CT-ROLE-01: super_admin acessa todas as rotas protegidas", async ({ page }) => {
    await mockAllAPIs(page);
    for (const route of ["/materiais", "/dashboard", "/horas", "/consolidado", "/orcamento", "/auditoria"]) {
      await injectSession(page, "superadmin");
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")), { timeout: 5_000 });
    }
  });
});

// ── CT-ROLE-02: financeiro ────────────────────────────────────────────────────
test.describe("Role access — financeiro", () => {
  test("CT-ROLE-02: financeiro acessa dashboard, horas, consolidado e orcamento", async ({ page }) => {
    await mockAllAPIs(page);
    for (const route of ["/dashboard", "/horas", "/consolidado", "/orcamento"]) {
      await injectSession(page, "financeiro");
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")), { timeout: 5_000 });
    }
  });
});

// ── CT-ROLE-03/07: projetos ───────────────────────────────────────────────────
test.describe("Role access — projetos", () => {
  test("CT-ROLE-03: projetos acessa dashboard, horas, consolidado", async ({ page }) => {
    await mockAllAPIs(page);
    for (const route of ["/dashboard", "/horas", "/consolidado"]) {
      await injectSession(page, "projetos");
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")), { timeout: 5_000 });
    }
  });

  test("CT-ROLE-07: projetos tenta /orcamento → redireciona para /materiais", async ({ page }) => {
    await mockAllAPIs(page);
    await injectSession(page, "projetos");
    await page.goto("/orcamento");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });
  });
});

// ── CT-ROLE-04/06: compras ────────────────────────────────────────────────────
test.describe("Role access — compras", () => {
  test("CT-ROLE-04: compras acessa materiais e auditoria", async ({ page }) => {
    await mockAllAPIs(page);
    for (const route of ["/materiais", "/auditoria"]) {
      await injectSession(page, "compras");
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")), { timeout: 5_000 });
    }
  });

  test("CT-ROLE-06: compras tenta /orcamento → redireciona para /materiais", async ({ page }) => {
    await mockAllAPIs(page);
    await injectSession(page, "compras");
    await page.goto("/orcamento");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });
  });
});

// ── CT-ROLE-05: almoxarifado ──────────────────────────────────────────────────
test.describe("Role access — almoxarifado", () => {
  test("CT-ROLE-05: almoxarifado acessa materiais e auditoria, não orcamento", async ({ page }) => {
    await mockAllAPIs(page);
    await injectSession(page, "almoxarifado");
    await page.goto("/materiais");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });

    await injectSession(page, "almoxarifado");
    await page.goto("/auditoria");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/auditoria/, { timeout: 5_000 });

    await injectSession(page, "almoxarifado");
    await page.goto("/orcamento");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });
  });
});

// ── CT-ROLE-08/09: API real ───────────────────────────────────────────────────
test.describe("Role access — Backend API (real requests)", () => {
  test("CT-ROLE-08: compras recebe 200 de /api/materials/indicators/", async ({ page }) => {
    if (!BACKEND_AVAILABLE) {
      test.skip(true, "Requer PLAYWRIGHT_BACKEND_AVAILABLE=true e DEBUG=1 no backend (CORS).");
      return;
    }
    await loginAs(page, "compras");
    const token = await page.evaluate(() => localStorage.getItem("sca_access_token"));
    const res = await page.request.get(`${API_BASE}/materials/indicators/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("CT-ROLE-09: compras recebe 403 de /api/dashboard/kpis/ (sem permissão)", async ({ page }) => {
    if (!BACKEND_AVAILABLE) {
      test.skip(true, "Requer PLAYWRIGHT_BACKEND_AVAILABLE=true e DEBUG=1 no backend (CORS).");
      return;
    }
    await loginAs(page, "compras");
    const token = await page.evaluate(() => localStorage.getItem("sca_access_token"));
    const res = await page.request.get(`${API_BASE}/dashboard/kpis/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(403);
  });
});
