/**
 * E2E — Login
 *
 * Estratégia: testa o fluxo real de autenticação (JWT).
 * O backend precisa estar acessível com o usuário superadmin seedado.
 *
 * CT-LOGIN-01: Página de login carrega os campos corretos
 * CT-LOGIN-02: Login com credenciais válidas → redireciona e armazena token
 * CT-LOGIN-03: Login com credenciais inválidas → permanece na página
 * CT-LOGIN-04: Rota protegida sem token → redireciona para /login
 */

import { test, expect } from "@playwright/test";

const VALID = { username: "superadmin", password: "superadmin123" };

test.describe("Login", () => {
  test("CT-LOGIN-01: campos de login são visíveis", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("CT-LOGIN-02: credenciais válidas → sai do /login", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill(VALID.username);
    await page.locator("#password").fill(VALID.password);
    await page.locator("button[type='submit']").click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
    // Token salvo no localStorage
    const token = await page.evaluate(() => localStorage.getItem("sca_access_token"));
    expect(token).toBeTruthy();
  });

  test("CT-LOGIN-03: credenciais inválidas → permanece em /login", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("user_invalido");
    await page.locator("#password").fill("senha_errada");
    await page.locator("button[type='submit']").click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
  });

  test("CT-LOGIN-04: acesso a rota protegida sem token → /login", async ({ page }) => {
    // Sem token, router guard deve redirecionar
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
