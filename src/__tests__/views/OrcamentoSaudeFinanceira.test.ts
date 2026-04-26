import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import OrcamentoSaudeFinanceira from "@/views/OrcamentoSaudeFinanceira.vue";

vi.mock("chart.js", () => {
  const ChartMock = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    options: { scales: { y: {} } },
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }, { data: [] }],
    },
  }));
  Object.assign(ChartMock, { register: vi.fn() });
  return { Chart: ChartMock, registerables: [] };
});

vi.mock("@/services/budgetService", () => ({
  budgetService: {
    fetchBudgetSnapshot: vi.fn().mockResolvedValue({
      rows: [
        {
          id: 1,
          projeto: "Projeto A",
          programa: "Programa Alpha",
          budget: 500000,
          custoMateriais: 180000,
          custoHoras: 120000,
          custoReal: 300000,
          desvioPercent: 60,
          saude: "Saudável",
          projecaoEstouro: null,
          periodo: "2026-01",
          status: "Em andamento",
        },
        {
          id: 2,
          projeto: "Projeto B",
          programa: "Programa Alpha",
          budget: 750000,
          custoMateriais: 450000,
          custoHoras: 280000,
          custoReal: 730000,
          desvioPercent: 97.3,
          saude: "Crítico",
          projecaoEstouro: null,
          periodo: "2026-01",
          status: "Em andamento",
        },
        {
          id: 3,
          projeto: "Projeto C",
          programa: "Programa Beta",
          budget: 450000,
          custoMateriais: 210000,
          custoHoras: 180000,
          custoReal: 390000,
          desvioPercent: 86.7,
          saude: "Atenção",
          projecaoEstouro: null,
          periodo: "2026-02",
          status: "Em andamento",
        },
      ],
      lastUpdatedAt: "2026-04-26T12:30:00Z",
    }),
  },
}));

async function mountView() {
  const wrapper = mount(OrcamentoSaudeFinanceira);
  await Promise.resolve();
  await nextTick();
  return wrapper;
}

describe("OrcamentoSaudeFinanceira.vue", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the main layout and metrics", async () => {
    const wrapper = await mountView();
    expect(wrapper.find(".main").exists()).toBe(true);
    expect(wrapper.text()).toContain("Budget Total");
    expect(wrapper.text()).toContain("Custo Real Total");
    expect(wrapper.text()).toContain("Desvio %");
  });

  it("renders filters, charts and table", async () => {
    const wrapper = await mountView();
    expect(wrapper.find('[data-testid="filters-section"]').exists()).toBe(true);
    expect(wrapper.find("#chartBudgetVsCusto").exists()).toBe(true);
    expect(wrapper.find("#chartDesvioPercentual").exists()).toBe(true);
    expect(wrapper.find("#chartDistribuicao").exists()).toBe(true);
    expect(wrapper.find('[data-testid="data-table"]').exists()).toBe(true);
  });

  it("renders rows and project cards from backend data", async () => {
    const wrapper = await mountView();
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(3);
    expect(wrapper.findAll('[data-testid^="project-card-"]').length).toBe(3);
  });

  it("filters by health status", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="filter-saude"]').setValue("Crítico");
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(1);
    expect(wrapper.text()).toContain("Projeto B");
  });

  it("filters by program and clears filters", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="filter-programa"]').setValue("Programa Alpha");
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(2);

    await wrapper.find('[data-testid="btn-limpar"]').trigger("click");
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(3);
  });

  it("sorts by budget when clicking the header", async () => {
    const wrapper = await mountView();
    const budgetHeader = wrapper.findAll(".sort-col").find((h) => h.text().includes("Budget"));
    expect(budgetHeader).toBeDefined();

    await budgetHeader!.trigger("click");
    expect(budgetHeader!.text()).toContain("↑");

    await budgetHeader!.trigger("click");
    expect(budgetHeader!.text()).toContain("↓");
  });

  it("shows empty state when filters match nothing", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="filter-programa"]').setValue("Programa Beta");
    await wrapper.find('[data-testid="filter-saude"]').setValue("Crítico");
    expect(wrapper.text()).toContain("Nenhum registro encontrado.");
  });
});
