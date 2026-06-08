/**
 * E2E — Dashboard Principal
 *
 * CT-DASH-01: KPIs carregam após login
 * CT-DASH-02: Filtros de data existem
 * CT-DASH-03: Tabela de resumo por programa está visível
 */

import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.locator("#username").fill("superadmin");
    await page.locator("#password").fill("superadmin123");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10_000 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("CT-DASH-01: KPIs são visíveis", async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.locator(".metrics, .metric-card, .kpi-card").first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("CT-DASH-02: filtros existem na página", async ({ page }) => {
    await expect(
      page.locator("select.filter-select, input[type='date']").first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("CT-DASH-03: seção de resumo ou tabela existe", async ({ page }) => {
    await expect(
      page.locator(".summary, .chart-card, table, .table-card").first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
