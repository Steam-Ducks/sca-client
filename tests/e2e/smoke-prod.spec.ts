import { test, expect } from "@playwright/test";

test("frontend responde e exibe página de login", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBeLessThan(400);
  await expect(page.locator("body")).toBeVisible();
});

test("página de login renderiza corretamente", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("input[type='password']")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("button[type='submit']")).toBeVisible();
});

test("rota raiz redireciona sem erro 5xx", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).not.toBeGreaterThanOrEqual(500);
});
