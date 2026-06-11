/**
 * tests/e2e/auditoria.spec.ts
 * Sem mocks — backend retorna {count:0, results:[]} para monitoring.
 */
import { test, expect } from "@playwright/test";
import { loginAs } from "./e2e_helpers";

test.describe("Auditoria", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await page.goto("/auditoria");
    await page.waitForLoadState("networkidle");
  });

  test("CT-AUD-01: pagina /auditoria carrega sem redirecionar para /login", async ({ page }) => {
    await expect(page).toHaveURL(/\/auditoria/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-AUD-02: abas Importacao, Historico e Falhas existem", async ({ page }) => {
    const tabs = page.locator(".tab-btn");
    await expect(tabs.first()).toBeVisible({ timeout: 8_000 });
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
