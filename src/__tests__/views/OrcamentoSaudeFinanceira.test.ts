import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import OrcamentoSaudeFinanceira from "@/views/OrcamentoSaudeFinanceira.vue";
import { budgetService } from "@/services/budgetService";

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

const ALL_ROWS = [
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
];

vi.mock("@/services/budgetService", () => ({
  budgetService: {
    fetchBudgetSnapshot: vi.fn().mockImplementation(async (filters: Record<string, string> = {}) => {
      let rows = [...ALL_ROWS];
      if (filters.programa) rows = rows.filter((r) => r.programa === filters.programa);
      if (filters.projeto) rows = rows.filter((r) => r.projeto === filters.projeto);
      if (filters.periodo) rows = rows.filter((r) => r.periodo === filters.periodo);
      return { rows, lastUpdatedAt: "2026-04-26T12:30:00Z" };
    }),
    fetchBudgetIndicators: vi.fn().mockResolvedValue({
      indicators: {
        budgetTotal: 1700000,
        custoRealTotal: 1420000,
        desvioPercentMedio: 81.3,
        projetosSaudaveis: 1,
        projetosAtencao: 1,
        projetosCriticos: 1,
      },
      lastUpdatedAt: "2026-04-26T12:30:00Z",
    }),
  },
}));

async function mountView() {
  const wrapper = mount(OrcamentoSaudeFinanceira);
  await flushPromises();
  return wrapper;
}

describe("OrcamentoSaudeFinanceira.vue", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // CT01 — filtragem por período
  it("filters by period (CT01)", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="filter-periodo"]').setValue("2026-01");
    await flushPromises();
    const rows = wrapper.findAll('[data-testid^="row-"]');
    expect(rows.length).toBe(2);
    expect(wrapper.text()).toContain("Projeto A");
    expect(wrapper.text()).toContain("Projeto B");
    expect(wrapper.text()).not.toContain("Projeto C");
  });

  // CT03 — filtragem por projeto
  it("filters by project (CT03)", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="filter-projeto"]').setValue("Projeto A");
    await flushPromises();
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(1);
    expect(wrapper.text()).toContain("Projeto A");
    expect(wrapper.text()).not.toContain("Projeto B");
  });

  // CT05 — combinação de filtros (período + programa)
  it("applies combined period and program filters (CT05)", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="filter-periodo"]').setValue("2026-01");
    await flushPromises();
    await wrapper.find('[data-testid="filter-programa"]').setValue("Programa Alpha");
    await flushPromises();
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(2);
    expect(wrapper.text()).toContain("Projeto A");
    expect(wrapper.text()).toContain("Projeto B");
    expect(wrapper.text()).not.toContain("Projeto C");
  });

  // CT06 — projeto dropdown restrito ao programa selecionado
  it("restricts project options to selected program (CT06)", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="filter-programa"]').setValue("Programa Beta");
    await flushPromises();
    const projetoSelect = wrapper.find('[data-testid="filter-projeto"]');
    const projectOptions = projetoSelect.findAll("option").filter((o) => o.element.value !== "");
    expect(projectOptions.length).toBe(1);
    expect(projectOptions[0].text()).toBe("Projeto C");
  });

  // CT08 — indicadores re-buscados após mudança de filtro
  it("re-fetches indicators when a filter changes (CT08)", async () => {
    const wrapper = await mountView();
    const fetchIndicatorsMock = vi.mocked(budgetService.fetchBudgetIndicators);
    const callsBefore = fetchIndicatorsMock.mock.calls.length;
    await wrapper.find('[data-testid="filter-periodo"]').setValue("2026-01");
    await flushPromises();
    expect(fetchIndicatorsMock.mock.calls.length).toBeGreaterThan(callsBefore);
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
    await flushPromises();
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(1);
    expect(wrapper.text()).toContain("Projeto B");
  });

  it("filters by program and clears filters", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="filter-programa"]').setValue("Programa Alpha");
    await flushPromises();
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(2);

    await wrapper.find('[data-testid="btn-limpar"]').trigger("click");
    await flushPromises();
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
    await flushPromises();
    await wrapper.find('[data-testid="filter-saude"]').setValue("Crítico");
    await flushPromises();
    expect(wrapper.text()).toContain("Nenhum registro encontrado.");
  });

  it("renders chart pagination bar with select and nav buttons", async () => {
    const wrapper = await mountView();
    expect(wrapper.find('[data-testid="chart-pagination-bar"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="chart-page-size-select"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="chart-page-prev"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="chart-page-next"]').exists()).toBe(true);
  });

  it("prev button is disabled on first page", async () => {
    const wrapper = await mountView();
    const prevBtn = wrapper.find('[data-testid="chart-page-prev"]');
    expect((prevBtn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders cards pagination controls", async () => {
    const wrapper = await mountView();
    expect(wrapper.find('[data-testid="cards-page-size-select"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="cards-page-prev"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="cards-page-next"]').exists()).toBe(true);
  });

  it("renders table pagination controls", async () => {
    const wrapper = await mountView();
    expect(wrapper.find('[data-testid="table-page-size-select"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="table-page-prev"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="table-page-next"]').exists()).toBe(true);
  });

  it("cards prev button is disabled on first page", async () => {
    const wrapper = await mountView();
    const prev = wrapper.find('[data-testid="cards-page-prev"]');
    expect((prev.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("table prev button is disabled on first page", async () => {
    const wrapper = await mountView();
    const prev = wrapper.find('[data-testid="table-page-prev"]');
    expect((prev.element as HTMLButtonElement).disabled).toBe(true);
  });
});

function make15Rows() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 100,
    projeto: `Projeto Pag ${i + 1}`,
    programa: "Programa Paginacao",
    budget: 100000,
    custoMateriais: 0,
    custoHoras: 0,
    custoReal: 0,
    desvioPercent: 0,
    saude: "Saudável" as const,
    projecaoEstouro: null,
    periodo: "2026-01",
    status: "Em andamento",
  }));
}

describe("OrcamentoSaudeFinanceira.vue – paginação com 15 linhas", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.mocked(budgetService.fetchBudgetSnapshot).mockResolvedValueOnce({
      rows: make15Rows(),
      lastUpdatedAt: "2026-04-26T12:30:00Z",
    });
  });

  it("tabela exibe 10 linhas na primeira página e next habilitado", async () => {
    const wrapper = await mountView();
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(10);
    const next = wrapper.find('[data-testid="table-page-next"]');
    expect((next.element as HTMLButtonElement).disabled).toBe(false);
  });

  it("tabela navega para página 2 mostrando as 5 linhas restantes", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="table-page-next"]').trigger("click");
    await flushPromises();
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(5);
    expect(wrapper.text()).toContain("Página 2 de 2");
  });

  it("tabela – prev habilitado na página 2 e next desabilitado", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="table-page-next"]').trigger("click");
    await flushPromises();
    const prev = wrapper.find('[data-testid="table-page-prev"]');
    const next = wrapper.find('[data-testid="table-page-next"]');
    expect((prev.element as HTMLButtonElement).disabled).toBe(false);
    expect((next.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("tabela – voltar para página 1 restaura 10 linhas", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="table-page-next"]').trigger("click");
    await flushPromises();
    await wrapper.find('[data-testid="table-page-prev"]').trigger("click");
    await flushPromises();
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(10);
    expect(wrapper.text()).toContain("Página 1 de 2");
  });

  it("cards exibe 10 cards na primeira página e next habilitado", async () => {
    const wrapper = await mountView();
    expect(wrapper.findAll('[data-testid^="project-card-"]').length).toBe(10);
    const next = wrapper.find('[data-testid="cards-page-next"]');
    expect((next.element as HTMLButtonElement).disabled).toBe(false);
  });

  it("cards navega para página 2 mostrando os 5 cards restantes", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="cards-page-next"]').trigger("click");
    await flushPromises();
    expect(wrapper.findAll('[data-testid^="project-card-"]').length).toBe(5);
  });

  it("cards – prev habilitado na página 2 e next desabilitado", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="cards-page-next"]').trigger("click");
    await flushPromises();
    const prev = wrapper.find('[data-testid="cards-page-prev"]');
    const next = wrapper.find('[data-testid="cards-page-next"]');
    expect((prev.element as HTMLButtonElement).disabled).toBe(false);
    expect((next.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("cards – voltar para página 1 restaura 10 cards", async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="cards-page-next"]').trigger("click");
    await flushPromises();
    await wrapper.find('[data-testid="cards-page-prev"]').trigger("click");
    await flushPromises();
    expect(wrapper.findAll('[data-testid^="project-card-"]').length).toBe(10);
  });
});
