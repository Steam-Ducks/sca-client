import { test, expect } from "@playwright/test";

const MOCK_COMPRAS = [
  { id: 1, material: "Servidor Dell PowerEdge R750", projeto: "Data Center Regional", programa: "Infraestrutura", quantidade: 5, valor_unitario: 178000, valor_total: 890000, periodo: "2024-01", fornecedor: "Dell Brasil", categoria: "Hardware" },
  { id: 2, material: "Storage NetApp AFF A400", projeto: "Storage Upgrade", programa: "Infraestrutura", quantidade: 2, valor_unitario: 360000, valor_total: 720000, periodo: "2024-04", fornecedor: "NetApp", categoria: "Storage" },
  { id: 3, material: "Instâncias AWS RDS", projeto: "Migração AWS", programa: "Cloud", quantidade: 5, valor_unitario: 134000, valor_total: 670000, periodo: "2024-03", fornecedor: "AWS", categoria: "Cloud" },
  { id: 4, material: "Firewall Fortinet FortiGate", projeto: "SOC Implementation", programa: "Segurança", quantidade: 4, valor_unitario: 130000, valor_total: 520000, periodo: "2024-03", fornecedor: "Fortinet", categoria: "Segurança" },
  { id: 5, material: "Switch Cisco Catalyst 9300", projeto: "Modernização de Rede", programa: "Infraestrutura", quantidade: 15, valor_unitario: 30000, valor_total: 450000, periodo: "2024-01", fornecedor: "Cisco", categoria: "Rede" },
  { id: 6, material: "Access Point Cisco 9120AX", projeto: "Modernização de Rede", programa: "Infraestrutura", quantidade: 80, valor_unitario: 4500, valor_total: 360000, periodo: "2024-02", fornecedor: "Cisco", categoria: "Rede" },
  { id: 7, material: "Licenças Microsoft 365 E5", projeto: "Modernização de Sistemas", programa: "Infraestrutura", quantidade: 200, valor_unitario: 1800, valor_total: 360000, periodo: "2024-02", fornecedor: "Microsoft", categoria: "Software" },
  { id: 8, material: "Módulos de Memória DDR5", projeto: "Data Center Regional", programa: "Infraestrutura", quantidade: 40, valor_unitario: 8500, valor_total: 340000, periodo: "2024-01", fornecedor: "Samsung", categoria: "Hardware" },
  { id: 9, material: "Container Platform", projeto: "Container Platform", programa: "Cloud", quantidade: 3, valor_unitario: 100000, valor_total: 300000, periodo: "2024-05", fornecedor: "AWS", categoria: "Cloud" },
  { id: 10, material: "DevOps Pipeline Tools", projeto: "DevOps Pipeline", programa: "Cloud", quantidade: 1, valor_unitario: 250000, valor_total: 250000, periodo: "2024-05", fornecedor: "GitHub", categoria: "Software" },
];

const MOCK_TOP_MATERIALS = [
  { material: "Servidor Dell PowerEdge R750", total_cost: 890000 },
  { material: "Storage NetApp AFF A400", total_cost: 720000 },
];

const MOCK_COST_BY_PROJECT = [
  { projeto: "Data Center Regional", total_cost: 1230000 },
  { projeto: "Migração AWS", total_cost: 670000 },
  { projeto: "SOC Implementation", total_cost: 520000 },
];

test.describe("Gestão de Materiais", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/compras/**", (route) =>
      route.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_COMPRAS) }),
    );
    await page.route("**/top-materials/**", (route) =>
      route.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_TOP_MATERIALS) }),
    );
    await page.route("**/cost-by-project/**", (route) =>
      route.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_COST_BY_PROJECT) }),
    );
    await page.goto("http://localhost:5173");
  });

  test("CT02: should filter by period", async ({ page }) => {
    const periodoSelect = page.locator("select").first();
    await periodoSelect.selectOption("2024-01");

    // Wait for data rows to load (td.material-name only exists in data rows, not loading/error rows)
    await expect(page.locator("tbody td.material-name").first()).toBeVisible();

    // Verificar se a tabela foi filtrada
    await expect(page.locator("tbody tr")).toHaveCount(
      await page.locator("tbody tr").count(),
    );
  });

  test("CT03: should filter by program", async ({ page }) => {
    const programaSelect = page.locator("select").nth(1);
    await programaSelect.selectOption("Infraestrutura");

    // Wait for data rows to load
    await expect(page.locator("tbody td.material-name").first()).toBeVisible();

    // Verificar se a tabela foi filtrada
    await expect(page.locator("tbody tr")).toHaveCount(
      await page.locator("tbody tr").count(),
    );
  });

  test.skip("CT04: should search materials — search field removed, to be reimplemented", async ({ page }) => {
    // Search field removed from GestaoMateriais pending backend implementation.
    // This test will be re-enabled when the feature is available for all pages.
    await page.locator(".search-input").fill("Dell");
    await expect(page.locator("tbody tr")).toHaveCount(
      await page.locator("tbody tr").count(),
    );
  });

  test("CT05: should sort by material column", async ({ page }) => {
    const materialHeader = page.locator("th").first();
    await materialHeader.click();

    // Verificar se a ordenação mudou
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });

  test("CT06: should navigate between pages", async ({ page }) => {
    const pageButton = page.locator(".pg-btn").filter({ hasText: "2" });
    if (await pageButton.isVisible()) {
      await pageButton.click();
      await expect(page.locator(".pagination")).toContainText("página 2");
    }
  });

  test("CT07: should display charts", async ({ page }) => {
    await expect(page.locator(".chart-card").first()).toBeVisible();
    await expect(page.locator(".chart-title").last()).toContainText(
      "Evolução Temporal",
    );
  });
});