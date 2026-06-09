/**
 * playwright.config.ts
 *
 * Alteração desta versão:
 *   - Adicionado reporter "json" no CI para gerar playwright-report/results.json
 *   - Esse arquivo é lido pelo workflow e2e-report.yml para publicar no GitHub Pages
 *   - Step Summary atualizado para incluir link direto ao relatório publicado
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["json", { outputFile: "playwright-report/results.json" }],
        ["github"],
        ["list"],
      ]
    : [["html", { open: "on-failure" }]],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run preview -- --port 4173",
        url: "http://localhost:4173",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
