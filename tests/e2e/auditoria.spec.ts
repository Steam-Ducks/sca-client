/**
 * E2E — Auditoria
 *
 * CT-AUD-01: Página carrega sem erro
 * CT-AUD-02: Filtros de execução existem
 */

import { test, expect } from "@playwright/test";

test.describe("Auditoria", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("superadmin");
    await page.locator("#password").fill("superadmin123");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10_000 });
    await page.goto("/auditoria");
    await page.waitForLoadState("networkidle");
  });

  test("CT-AUD-01: página carrega", async ({ page }) => {
    await expect(page).toHaveURL(/\/auditoria/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("CT-AUD-02: filtros de histórico existem", async ({ page }) => {
    await expect(
      page.locator("select.hist-select, select.falhas-select, .filter-select").first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
