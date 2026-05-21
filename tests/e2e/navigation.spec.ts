import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sca_access_token", "fake-e2e-token");
    });
    await page.goto("/");
  });

  test("CT01: should navigate to materials page (home)", async ({ page }) => {
    await expect(page).toHaveURL(/\/materiais$/);
    await expect(page.locator(".filters-title")).toContainText("Filtros");
  });

  test("CT02: should navigate to dashboard", async ({ page }) => {
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator(".metrics")).toBeVisible();
    await expect(page.locator(".filters-title")).toContainText("Filtros");
  });

  test("CT03: should navigate to horas técnicas page", async ({ page }) => {
    await page.getByRole("link", { name: "Horas Técnicas" }).click();
    await expect(page).toHaveURL(/\/horas$/);
    await expect(page.locator("h1")).toContainText("Horas Técnicas");
  });

  test("CT04: should navigate back to materials", async ({ page }) => {
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Materiais" }).click();
    await expect(page).toHaveURL(/\/materiais$/);
    await expect(page.locator(".filters-title")).toContainText("Filtros");
  });
});
