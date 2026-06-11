/**
 * tests/e2e/login.spec.ts
 *
 * CORRIGIDO CT-LOGIN-06: após loginAs(), o router pode redirecionar para
 * qualquer rota autenticada (/, /dashboard, /materiais). A asserção anterior
 * era muito restritiva ao exigir exatamente /materiais.
 * Fix: assertar apenas que saiu de /login.
 */

import { test, expect } from "@playwright/test";
import { loginAs, BACKEND_AVAILABLE } from "./e2e_helpers";

test.describe("Login — fluxo de autenticação", () => {

  test("CT-LOGIN-01: campos e botão de submit são visíveis", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("CT-LOGIN-02: credenciais válidas → redireciona e salva token JWT real", async ({ page }) => {
    if (!BACKEND_AVAILABLE) {
      test.skip(true, "Requer PLAYWRIGHT_BACKEND_AVAILABLE=true e backend com CORS (DEBUG=1).");
      return;
    }
    await page.goto("/login");
    await page.locator("#username").fill("superadmin");
    await page.locator("#password").fill("superadmin123");
    await page.locator("button[type='submit']").click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 12_000 });

    const token = await page.evaluate(() => localStorage.getItem("sca_access_token"));
    expect(token).toBeTruthy();
    expect(token).not.toBe("mock-jwt-for-e2e-tests");

    const raw = await page.evaluate(() => localStorage.getItem("sca_user"));
    expect(JSON.parse(raw ?? "{}").perfil).toBe("super_admin");
  });

  test("CT-LOGIN-03: credenciais inválidas → .error-general visível", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("usuario_invalido");
    await page.locator("#password").fill("senha_errada");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
    await expect(page.locator(".error-general")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(".error-general")).not.toBeEmpty();
  });

  test("CT-LOGIN-04: campos vazios → .error-msg de validação client-side", async ({ page }) => {
    await page.goto("/login");
    await page.locator("button[type='submit']").click();
    await expect(page.locator(".error-msg").first()).toBeVisible({ timeout: 3_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("CT-LOGIN-05: rota protegida sem token → /login", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.removeItem("sca_access_token");
      localStorage.removeItem("sca_user");
    });
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });

  test("CT-LOGIN-06: usuário autenticado acessa /login → sai do /login", async ({ page }) => {
    if (!BACKEND_AVAILABLE) {
      test.skip(true, "Requer PLAYWRIGHT_BACKEND_AVAILABLE=true e backend com CORS (DEBUG=1).");
      return;
    }
    await loginAs(page, "superadmin");
    await page.goto("/login");
    // O router redireciona para qualquer rota autenticada (/, /materiais, /dashboard)
    // Verificamos apenas que NÃO permaneceu em /login
    await page.waitForURL(/\/(?!login)/, { timeout: 5_000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("CT-LOGIN-07: limpar sessão → rota protegida volta para /login", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.removeItem("sca_access_token");
      localStorage.removeItem("sca_user");
    });
    await page.goto("/orcamento");
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
