/**
 * tests/e2e/auditoria.spec.ts
 *
 * CT-AUD-01  Página /auditoria carrega (não redireciona para /login)
 * CT-AUD-02  Abas Importação, Histórico e Falhas existem (.tab-btn)
 *
 * Usa injectSession() — funciona dentro do Docker.
 */

import { test, expect } from "@playwright/test";
import { injectSession } from "./e2e_helpers";

test.describe("Auditoria", () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, "superadmin");
    await page.route("**/monitoring/**", (r) =>
      r.fulfill({ contentType: "application/json", body: JSON.stringify({ count: 0, results: [] }) }));
    await page.goto("/auditoria");
    await page.waitForLoadState("domcontentloaded");
  });

  test("CT-AUD-01: página /auditoria carrega sem redirecionar para /login", async ({ page }) => {
    await expect(page).toHaveURL(/\/auditoria/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-AUD-02: abas Importação, Histórico e Falhas existem", async ({ page }) => {
    // Auditoria.vue tem 3 .tab-btn
    const tabs = page.locator(".tab-btn");
    await expect(tabs.first()).toBeVisible({ timeout: 8_000 });
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
