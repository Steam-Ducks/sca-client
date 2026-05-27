import { test, expect } from "@playwright/test";

test("opens the application", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toBeVisible();
});
