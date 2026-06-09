/**
 * tests/e2e/e2e_helpers.ts
 *
 * Credenciais seedadas (users/migrations/0002_seed_data.py):
 *   superadmin   / superadmin123   → super_admin
 *   financeiro   / financeiro123   → financeiro
 *   compras      / compras123      → compras
 *   almoxarifado / almoxarifado123 → almoxarifado
 *   projetos     / projetos123     → projetos
 *
 * Token: localStorage["sca_access_token"]
 * User:  localStorage["sca_user"] = { id, username, name, perfil }
 */

import type { Page } from "@playwright/test";

// ── Seeded users ──────────────────────────────────────────────────────────────
export const USERS = {
  superadmin:   { username: "superadmin",   password: "superadmin123",   perfil: "super_admin"   },
  financeiro:   { username: "financeiro",   password: "financeiro123",   perfil: "financeiro"    },
  compras:      { username: "compras",      password: "compras123",      perfil: "compras"       },
  almoxarifado: { username: "almoxarifado", password: "almoxarifado123", perfil: "almoxarifado"  },
  projetos:     { username: "projetos",     password: "projetos123",     perfil: "projetos"      },
} as const;

export type UserKey = keyof typeof USERS;

// ── Real login via form ───────────────────────────────────────────────────────
export async function loginAs(page: Page, user: UserKey = "superadmin"): Promise<void> {
  const { username, password } = USERS[user];
  await page.goto("/login");
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);
  await page.locator("button[type='submit']").click();
  await page.waitForURL(/\/(?!login)/, { timeout: 12_000 });
}

export const loginAsSuperAdmin = (page: Page) => loginAs(page, "superadmin");

// ── Inject fake session (mock-only tests — no real backend needed) ────────────
export async function injectSession(page: Page, user: UserKey = "superadmin"): Promise<void> {
  const u = USERS[user];
  await page.addInitScript((userData) => {
    localStorage.setItem("sca_access_token", "mock-jwt-for-e2e-tests");
    localStorage.setItem("sca_user", JSON.stringify({
      id: 1, username: userData.username, name: userData.username, perfil: userData.perfil,
    }));
  }, u);
}

// ── Route access (from router/index.ts + users/permissions.py) ───────────────
export const ROUTE_ACCESS: Record<string, UserKey[]> = {
  "/materiais":   ["superadmin", "financeiro", "compras", "almoxarifado", "projetos"],
  "/auditoria":   ["superadmin", "financeiro", "compras", "almoxarifado", "projetos"],
  "/dashboard":   ["superadmin", "financeiro", "projetos"],
  "/horas":       ["superadmin", "financeiro", "projetos"],
  "/consolidado": ["superadmin", "financeiro", "projetos"],
  "/orcamento":   ["superadmin", "financeiro"],
};

// ── CSV fixtures (imports/schemas.py) ─────────────────────────────────────────
export const VALID_PROGRAMAS_CSV = [
  "id,codigo_programa,nome_programa,gerente_programa,gerente_tecnico,data_inicio,data_fim_prevista,status",
  "1,PROG-E2E,Programa E2E,Gerente Teste,Técnico Teste,2024-01-01,2025-12-31,Em andamento",
].join("\n");

export const INVALID_CSV = "coluna_x,coluna_y\n1,2\n";

// ── API base URL ──────────────────────────────────────────────────────────────
export const API_BASE = process.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
