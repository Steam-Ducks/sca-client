/**
 * tests/e2e/role_access.spec.ts
 * PO criteria: "Add role-based access validation tests"
 *
 * Mapa de acesso (router/index.ts + users/permissions.py):
 *
 *   /materiais   → todos os perfis (sem allowedProfiles no router)
 *   /auditoria   → todos os perfis (sem allowedProfiles no router)
 *   /dashboard   → super_admin, financeiro, projetos
 *   /horas       → super_admin, financeiro, projetos
 *   /consolidado → super_admin, financeiro, projetos
 *   /orcamento   → super_admin, financeiro  (compras/almoxarifado/projetos → /materiais)
 *
 * CT-ROLE-01  super_admin acessa todas as rotas
 * CT-ROLE-02  financeiro acessa dashboard, horas, consolidado, orcamento
 * CT-ROLE-03  projetos acessa dashboard, horas, consolidado — mas NÃO orcamento
 * CT-ROLE-04  compras acessa materiais e auditoria — mas NÃO dashboard
 * CT-ROLE-05  almoxarifado acessa materiais e auditoria — mas NÃO orcamento
 * CT-ROLE-06  compras tenta /orcamento → redirecionado para /materiais
 * CT-ROLE-07  projetos tenta /orcamento → redirecionado para /materiais
 * CT-ROLE-08  API: compras acessa /api/materials/ (200)
 * CT-ROLE-09  API: compras acessa /api/dashboard/kpis/ → 403 (perfil sem permissão)
 */

import { test, expect } from "@playwright/test";
import { loginAs, API_BASE } from "./e2e_helpers";

// ── Helper para testar acesso a uma rota ──────────────────────────────────────
async function canAccess(page: Parameters<typeof loginAs>[0], user: Parameters<typeof loginAs>[1], route: string): Promise<boolean> {
  await loginAs(page, user);
  await page.goto(route);
  await page.waitForURL(/\//, { timeout: 5_000 });
  const url = page.url();
  return url.includes(route);
}

// ── super_admin ───────────────────────────────────────────────────────────────
test.describe("Role access — super_admin", () => {
  test("CT-ROLE-01: super_admin acessa todas as rotas protegidas", async ({ page }) => {
    const routes = ["/materiais", "/dashboard", "/horas", "/consolidado", "/orcamento", "/auditoria"];
    for (const route of routes) {
      await loginAs(page, "superadmin");
      await page.goto(route);
      await page.waitForURL(/\//, { timeout: 5_000 });
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")), { timeout: 5_000 });
    }
  });
});

// ── financeiro ────────────────────────────────────────────────────────────────
test.describe("Role access — financeiro", () => {
  test("CT-ROLE-02: financeiro acessa dashboard, horas, consolidado e orcamento", async ({ page }) => {
    await loginAs(page, "financeiro");
    for (const route of ["/dashboard", "/horas", "/consolidado", "/orcamento"]) {
      await page.goto(route);
      await page.waitForURL(/\//, { timeout: 5_000 });
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")), { timeout: 5_000 });
    }
  });
});

// ── projetos ──────────────────────────────────────────────────────────────────
test.describe("Role access — projetos", () => {
  test("CT-ROLE-03: projetos acessa dashboard, horas, consolidado", async ({ page }) => {
    await loginAs(page, "projetos");
    for (const route of ["/dashboard", "/horas", "/consolidado"]) {
      await page.goto(route);
      await page.waitForURL(/\//, { timeout: 5_000 });
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")), { timeout: 5_000 });
    }
  });

  test("CT-ROLE-07: projetos tenta /orcamento → redireciona para /materiais", async ({ page }) => {
    await loginAs(page, "projetos");
    await page.goto("/orcamento");
    // Router guard: allowedProfiles para orcamento = [super_admin, financeiro]
    // projetos não está na lista → redireciona para /materiais
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });
  });
});

// ── compras ───────────────────────────────────────────────────────────────────
test.describe("Role access — compras", () => {
  test("CT-ROLE-04: compras acessa materiais e auditoria", async ({ page }) => {
    await loginAs(page, "compras");
    for (const route of ["/materiais", "/auditoria"]) {
      await page.goto(route);
      await page.waitForURL(/\//, { timeout: 5_000 });
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/")), { timeout: 5_000 });
    }
  });

  test("CT-ROLE-06: compras tenta /orcamento → redireciona para /materiais", async ({ page }) => {
    await loginAs(page, "compras");
    await page.goto("/orcamento");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });
  });
});

// ── almoxarifado ──────────────────────────────────────────────────────────────
test.describe("Role access — almoxarifado", () => {
  test("CT-ROLE-05: almoxarifado acessa materiais e auditoria, não orcamento", async ({ page }) => {
    await loginAs(page, "almoxarifado");

    // Acesso permitido
    await page.goto("/materiais");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });

    await page.goto("/auditoria");
    await expect(page).toHaveURL(/\/auditoria/, { timeout: 5_000 });

    // Acesso negado
    await page.goto("/orcamento");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });
  });
});

// ── Backend API role check ────────────────────────────────────────────────────
test.describe("Role access — Backend API (real requests)", () => {
  test("CT-ROLE-08: compras recebe 200 de /api/materials/indicators/", async ({ page }) => {
    await loginAs(page, "compras");
    const token = await page.evaluate(() => localStorage.getItem("sca_access_token"));
    const res = await page.request.get(`${API_BASE}/materials/indicators/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("CT-ROLE-09: compras recebe 403 de /api/dashboard/kpis/ (sem permissão)", async ({ page }) => {
    await loginAs(page, "compras");
    const token = await page.evaluate(() => localStorage.getItem("sca_access_token"));
    const res = await page.request.get(`${API_BASE}/dashboard/kpis/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // CanAccessDashboard exige super_admin | financeiro | projetos → compras = 403
    expect(res.status()).toBe(403);
  });
});
