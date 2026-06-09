/**
 * tests/e2e/login.spec.ts
 * PO criteria: "Add login flow tests"
 *
 * CT-LOGIN-01  Campos #username, #password e botão submit são visíveis
 * CT-LOGIN-02  Login válido (superadmin) → redireciona, salva token JWT real
 * CT-LOGIN-03  Login inválido → permanece em /login, mostra .error-general
 * CT-LOGIN-04  Submit com campos vazios → validação client-side (.error-msg)
 * CT-LOGIN-05  Rota protegida sem token → guard redireciona para /login
 * CT-LOGIN-06  Usuário autenticado acessa /login → guard redireciona para /materiais
 * CT-LOGIN-07  Sessão limpa → rota protegida volta para /login
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./e2e_helpers";

test.describe("Login — fluxo de autenticação", () => {

  test("CT-LOGIN-01: campos e botão de submit são visíveis", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("CT-LOGIN-02: credenciais válidas → redireciona e salva token JWT real", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("superadmin");
    await page.locator("#password").fill("superadmin123");
    await page.locator("button[type='submit']").click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 12_000 });

    // Token salvo e não é o fake de desenvolvimento
    const token = await page.evaluate(() => localStorage.getItem("sca_access_token"));
    expect(token).toBeTruthy();
    expect(token).not.toBe("mock-jwt-for-e2e-tests");

    // User salvo com perfil correto
    const raw = await page.evaluate(() => localStorage.getItem("sca_user"));
    const user = JSON.parse(raw ?? "{}");
    expect(user.perfil).toBe("super_admin");
  });

  test("CT-LOGIN-03: credenciais inválidas → .error-general visível", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("usuario_invalido");
    await page.locator("#password").fill("senha_errada");
    await page.locator("button[type='submit']").click();

    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
    // Classe .error-general vem do LoginView.vue
    await expect(page.locator(".error-general")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(".error-general")).not.toBeEmpty();
  });

  test("CT-LOGIN-04: campos vazios → .error-msg de validação client-side", async ({ page }) => {
    await page.goto("/login");
    await page.locator("button[type='submit']").click();
    // .error-msg é a classe usada para erro individual de campo
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

  test("CT-LOGIN-06: usuário autenticado em /login → redireciona para /materiais", async ({ page }) => {
    await loginAs(page, "superadmin");
    await page.goto("/login");
    await expect(page).toHaveURL(/\/materiais/, { timeout: 5_000 });
  });

  test("CT-LOGIN-07: limpar sessão → rota protegida volta para /login", async ({ page }) => {
    await loginAs(page, "superadmin");
    await page.evaluate(() => {
      localStorage.removeItem("sca_access_token");
      localStorage.removeItem("sca_user");
    });
    await page.goto("/orcamento");
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
