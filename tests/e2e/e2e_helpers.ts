/**
 * helpers.ts — utilitários compartilhados para os E2E
 *
 * Uso:
 *   import { loginAsSuperAdmin } from "./helpers";
 *   await loginAsSuperAdmin(page);
 */

import type { Page } from "@playwright/test";

const SUPERADMIN = { username: "superadmin", password: "superadmin123" };

/**
 * Faz login real via formulário e aguarda sair do /login.
 * Reutilize no beforeEach de testes que precisam de autenticação.
 */
export async function loginAsSuperAdmin(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#username").fill(SUPERADMIN.username);
  await page.locator("#password").fill(SUPERADMIN.password);
  await page.locator("button[type='submit']").click();
  await page.waitForURL(/\/(?!login)/, { timeout: 10_000 });
}

/**
 * Injeta token fake no localStorage (para testes sem backend real).
 * Use apenas em testes que mocam todas as chamadas de API.
 */
export async function injectFakeToken(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("sca_access_token", "fake-e2e-token");
    localStorage.setItem(
      "sca_user",
      JSON.stringify({
        id: 1,
        username: "superadmin",
        name: "Super Admin",
        perfil: "super_admin",
      }),
    );
  });
}
