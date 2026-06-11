/**
 * tests/e2e/e2e_helpers.ts
 *
 * ESTRATÉGIA DE AUTH:
 *
 *   injectSession(page, user) — injeta token no localStorage antes de navegar.
 *     Use em todo teste onde auth é pré-requisito mas NÃO é o que está sendo testado.
 *     Funciona em Docker, CI e host. Não faz chamada real ao backend.
 *
 *   loginAs(page, user) — login real via formulário.
 *     Use APENAS em login.spec.ts para testar o fluxo de autenticação.
 *     Requer backend acessível em localhost:8000 (CI e host).
 *     Dentro do Docker: backend está em backend:8000, não localhost:8000 → tests skipam.
 *
 * DETECÇÃO DE AMBIENTE:
 *   IS_DOCKER — detectado por /.dockerenv (arquivo criado automaticamente pelo Docker).
 *               Confiável, não depende de variáveis de ambiente do usuário.
 *   IS_CI     — process.env.CI === "true" (GitHub Actions define isso automaticamente).
 *
 * Credenciais (users/migrations/0002_seed_data.py):
 *   superadmin   / superadmin123   → super_admin
 *   financeiro   / financeiro123   → financeiro
 *   compras      / compras123      → compras
 *   almoxarifado / almoxarifado123 → almoxarifado
 *   projetos     / projetos123     → projetos
 */

import { existsSync } from "fs";
import type { Page } from "@playwright/test";

// ── Environment detection ─────────────────────────────────────────────────────

/** True quando rodando dentro de um container Docker. */
export const IS_DOCKER = existsSync("/.dockerenv");

/** True quando rodando no CI (GitHub Actions define process.env.CI = "true"). */
export const IS_CI = process.env.CI === "true";

/**
 * True quando o backend real está acessível em localhost:8000.
 * CI: sempre true (backend sobe no mesmo runner).
 * Docker local: false (backend está em backend:8000, não localhost).
 * Host local: true se o backend estiver rodando.
 */
export const BACKEND_AVAILABLE = IS_CI || (!IS_DOCKER && !process.env.SKIP_REAL_LOGIN);

// ── API base URL ──────────────────────────────────────────────────────────────
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

// ── injectSession: preferred for all non-login tests ─────────────────────────
export async function injectSession(page: Page, user: UserKey = "superadmin"): Promise<void> {
  const u = USERS[user];
  await page.addInitScript((userData) => {
    localStorage.setItem("sca_access_token", "mock-jwt-for-e2e-tests");
    localStorage.setItem("sca_user", JSON.stringify({
      id: 1,
      username: userData.username,
      name: userData.username,
      perfil: userData.perfil,
    }));
  }, u);
}

// ── loginAs: ONLY for login.spec.ts ──────────────────────────────────────────
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
