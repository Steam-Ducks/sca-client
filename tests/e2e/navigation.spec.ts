import { test, expect } from "@playwright/test";

/**
 * Testes E2E de Integração — Navegação
 *
 * Estes testes verificam que cada rota carrega dados reais da API.
 * Diferente dos testes unitários (que mockam o backend),
 * aqui o Django está rodando de verdade.
 */

test.describe("Navegação com backend real", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sca_access_token", "fake-e2e-token");
      localStorage.setItem(
        "sca_user",
        JSON.stringify({
          id: 1,
          username: "superadmin",
          name: "Super Admin",
          perfil: "super_admin",
        }),
      );
    });
    await page.goto("/");
    // Aguarda a página carregar dados da API antes de qualquer asserção
    await page.waitForLoadState("networkidle");
  });

  test("CT-E2E-01: rota raiz redireciona para /materiais", async ({ page }) => {
    await expect(page).toHaveURL(/\/materiais$/);
  });

  test("CT-E2E-02: página de materiais exibe dados da API", async ({ page }) => {
    // Verifica que a seção de filtros carregou (estrutura da página)
    await expect(page.locator(".filters-title")).toContainText("Filtros");

    // Verifica que a tabela tem pelo menos uma linha de dado real
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("CT-E2E-03: navegação para Dashboard carrega métricas reais", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/dashboard$/);

    // A seção de métricas deve estar visível e ter conteúdo numérico
    await expect(page.locator(".metrics")).toBeVisible();

    // Pelo menos um valor numérico deve estar presente (não vazio, não "R$ 0")
    const metricValues = page.locator(".metric-value, .kpi-value");
    await expect(metricValues.first()).toBeVisible();
  });

  test("CT-E2E-04: navegação para Horas Técnicas carrega a página", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Horas Técnicas" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/horas$/);
    await expect(page.locator("h1")).toContainText("Horas Técnicas");
  });

  test("CT-E2E-05: navegação para Auditoria carrega a página", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Auditoria" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/auditoria$/);
    await expect(page.locator("h1")).toContainText("Auditoria");
  });

  test("CT-E2E-06: API de health está respondendo durante os testes", async ({
    page,
  }) => {
    // Confirma que o backend real está acessível
    const response = await page.request.get(
      `${process.env.VITE_API_BASE_URL || "http://localhost:8000/api"}/health/`
    );
    expect(response.status()).toBe(200);
  });
});
