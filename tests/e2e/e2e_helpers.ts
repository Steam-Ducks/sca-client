/**
 * tests/e2e/e2e_helpers.ts
 *
 * BACKEND_AVAILABLE — CORRIGIDO:
 *   Antes: IS_CI || (!IS_DOCKER && ...) — errado porque CI não necessariamente
 *   tem CORS configurado para localhost:4173 (frontend preview) vs localhost:8000.
 *   O CI usa DEBUG=0, então CORS_ALLOW_ALL_ORIGINS=False e só permite localhost:5173.
 *
 *   Agora: requer opt-in explícito via PLAYWRIGHT_BACKEND_AVAILABLE=true.
 *   No CI, adicionar ao e2e-tests job:
 *     - DEBUG: "1"  (habilita CORS_ALLOW_ALL_ORIGINS)
 *     - PLAYWRIGHT_BACKEND_AVAILABLE: "true"
 *
 * IS_DOCKER — detectado por /.dockerenv (criado automaticamente em containers Docker).
 */

import { existsSync } from "fs";
import type { Page } from "@playwright/test";

// ── Environment ───────────────────────────────────────────────────────────────

/** True dentro de um container Docker. */
export const IS_DOCKER = existsSync("/.dockerenv");

/** True quando o backend real está acessível E com CORS configurado. */
export const BACKEND_AVAILABLE = process.env.PLAYWRIGHT_BACKEND_AVAILABLE === "true";

export const API_BASE =
  process.env.PLAYWRIGHT_API_BASE ??
  process.env.VITE_API_BASE_URL ??
  "http://localhost:8000/api";

// ── Credentials ───────────────────────────────────────────────────────────────
export const USERS = {
  superadmin:   { username: "superadmin",   password: "superadmin123",   perfil: "super_admin"   },
  financeiro:   { username: "financeiro",   password: "financeiro123",   perfil: "financeiro"    },
  compras:      { username: "compras",      password: "compras123",      perfil: "compras"       },
  almoxarifado: { username: "almoxarifado", password: "almoxarifado123", perfil: "almoxarifado"  },
  projetos:     { username: "projetos",     password: "projetos123",     perfil: "projetos"      },
} as const;

export type UserKey = keyof typeof USERS;

// ── injectSession: use sempre que auth é pré-requisito mas não é o foco ───────
export async function injectSession(page: Page, user: UserKey = "superadmin"): Promise<void> {
  const u = USERS[user];
  await page.addInitScript((userData) => {
    localStorage.setItem("sca_access_token", "mock-jwt-for-e2e-tests");
    localStorage.setItem("sca_user", JSON.stringify({
      id: 1, username: userData.username, name: userData.username, perfil: userData.perfil,
    }));
  }, u);
}

// ── loginAs: APENAS para login.spec.ts — requer BACKEND_AVAILABLE=true ────────
export async function loginAs(page: Page, user: UserKey = "superadmin"): Promise<void> {
  const { username, password } = USERS[user];
  await page.goto("/login");
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);
  await page.locator("button[type='submit']").click();
  await page.waitForURL(/\/(?!login)/, { timeout: 12_000 });
}

export const loginAsSuperAdmin = (page: Page) => loginAs(page, "superadmin");

// ── Route access map ──────────────────────────────────────────────────────────
export const ROUTE_ACCESS: Record<string, UserKey[]> = {
  "/materiais":   ["superadmin", "financeiro", "compras", "almoxarifado", "projetos"],
  "/auditoria":   ["superadmin", "financeiro", "compras", "almoxarifado", "projetos"],
  "/dashboard":   ["superadmin", "financeiro", "projetos"],
  "/horas":       ["superadmin", "financeiro", "projetos"],
  "/consolidado": ["superadmin", "financeiro", "projetos"],
  "/orcamento":   ["superadmin", "financeiro"],
};

// ── CSV fixtures ──────────────────────────────────────────────────────────────
export const VALID_PROGRAMAS_CSV = [
  "id,codigo_programa,nome_programa,gerente_programa,gerente_tecnico,data_inicio,data_fim_prevista,status",
  "1,PROG-E2E,Programa E2E,Gerente Teste,Técnico Teste,2024-01-01,2025-12-31,Em andamento",
].join("\n");

export const INVALID_CSV = "coluna_x,coluna_y\n1,2\n";
