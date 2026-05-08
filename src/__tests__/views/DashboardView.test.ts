// src/__tests__/views/DashboardView.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import DashboardView from "@/views/DashboardView.vue";

const KPIS_MOCK = {
  total_consolidated_cost: 750000.0,
  total_materials_cost: 450000.0,
  total_hours_cost: 300000.0,
  total_projects: 8,
  total_programs: 3,
};

const COMPOSITION_MOCK = {
  custo_materiais: 450000.0,
  custo_horas: 300000.0,
  custo_total: 750000.0,
  pct_materiais: 60.0,
  pct_horas: 40.0,
};

vi.mock("@/composables/useChartsDashboard", () => ({
  useChartsDashboard: vi.fn(() => ({
    buildCharts: vi.fn(),
    updateCharts: vi.fn(),
    destroyCharts: vi.fn(),
  })),
}));

vi.mock("chart.js", () => {
  const MockChart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
  }));
  Object.assign(MockChart, { register: vi.fn() });
  return { Chart: MockChart, registerables: [] };
});

const fetchKPIsMock = vi.hoisted(() => vi.fn());
const fetchSummaryMock = vi.hoisted(() => vi.fn());
const fetchCompositionMock = vi.hoisted(() => vi.fn());
const fetchTopProjectsMock = vi.hoisted(() => vi.fn());
const fetchCostEvolutionMock = vi.hoisted(() => vi.fn());
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

vi.mock("@/services/dashboardService", () => ({
  dashboardService: {
    fetchKPIs: fetchKPIsMock,
    fetchSummary: fetchSummaryMock,
    fetchComposition: fetchCompositionMock,
    fetchTopProjects: fetchTopProjectsMock,
    fetchCostEvolution: fetchCostEvolutionMock,
  },
}));

describe("DashboardView.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchKPIsMock.mockResolvedValue(KPIS_MOCK);
    fetchSummaryMock.mockResolvedValue([]);
    fetchCompositionMock.mockResolvedValue(COMPOSITION_MOCK);
    fetchTopProjectsMock.mockResolvedValue([]);
    fetchCostEvolutionMock.mockResolvedValue([]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url?.includes && url.includes("composition")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(COMPOSITION_MOCK),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }),
    );
  });

  // ── Estrutura geral ──────────────────────────────────────────────────────

  it("renders metrics section with five cards", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    expect(wrapper.find(".metrics").exists()).toBe(true);
    expect(wrapper.findAll(".metric-card").length).toBe(5);
  });

  it("displays correct indicator labels", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.text()).toContain("Custo Total Consolidado");
    expect(wrapper.text()).toContain("Custo Total de Materiais");
    expect(wrapper.text()).toContain("Custo Total de Horas Técnicas");
    expect(wrapper.text()).toContain("Número de Projetos");
    expect(wrapper.text()).toContain("Número de Programas");
  });

  it("displays filters card with three selects", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.find(".filters-card").exists()).toBe(true);
    expect(wrapper.findAll("select").length).toBe(3);
  });

  it("renders detailed project table with six headers", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    const tables = wrapper.findAll("table");
    expect(tables.length).toBe(2);
    expect(tables[0].findAll("th").length).toBe(6);
  });

  it("renders summary aggregate table with five headers", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    const tables = wrapper.findAll("table");
    expect(tables[1].findAll("th").length).toBe(5);
  });

  it("displays pagination controls", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.find(".pagination").exists()).toBe(true);
  });

  it("displays five chart cards", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.findAll(".chart-card").length).toBe(5);
  });

  it("export button is present", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    const exportBtn = wrapper.find(".export-btn");
    expect(exportBtn.exists()).toBe(true);
    expect(exportBtn.text()).toContain("Exportar");
  });

  // ── CT01: Custo Total Consolidado ────────────────────────────────────────

  it("CT01: displays total consolidated cost from API", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const cards = wrapper.findAll(".metric-card");
    const card = cards.find((c) => c.text().includes("Custo Total Consolidado"));
    expect(card).toBeDefined();
    expect(card!.text()).toContain("750");
  });

  // ── CT02: Custo Total de Materiais ───────────────────────────────────────

  it("CT02-summary: filters rows when programa filter is applied", async () => {
    // 1. Iniciamos o mock mantendo a referência viva da função
    fetchSummaryMock.mockResolvedValue([
      { programa: "Programa X", qtd_projetos: 1, custo_materiais: 1000, custo_horas: 500, custo_total: 1500 },
      { programa: "Programa Y", qtd_projetos: 1, custo_materiais: 500, custo_horas: 250, custo_total: 750 },
    ]);
    
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url?.includes && url.includes("composition")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { nome_projeto: "Projeto A", programa: "Programa X", custo_materiais: 1000, custo_horas: 500, custo_total: 1500, status: "2024-01" },
            { nome_projeto: "Projeto C", programa: "Programa Y", custo_materiais: 500, custo_horas: 250, custo_total: 750, status: "2024-01" },
          ]),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const wrapper = mount(DashboardView);
    await flushPromises();
    await nextTick();
    await nextTick();

    // Valida que a tabela montou com 2 linhas
    expect(wrapper.findAll("table")[1].findAll("tbody tr").length).toBe(2);

    // 2. Alteramos a resposta DA MESMA instância do mock (sem usar stubGlobal de novo)
    fetchSummaryMock.mockResolvedValue([
      { programa: "Programa X", qtd_projetos: 1, custo_materiais: 1000, custo_horas: 500, custo_total: 1500 },
    ]);
    fetchMock.mockImplementation((url: string) => {
      if (url?.includes && url.includes("composition")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { nome_projeto: "Projeto A", programa: "Programa X", custo_materiais: 1000, custo_horas: 500, custo_total: 1500, status: "2024-01" },
          ]),
      });
    });

    // 3. Simula a interação real do usuário com o Select de Programa no DOM
    const selects = wrapper.findAll("select");
    if (selects.length > 1) {
      await selects[1].setValue("Programa X");
    } else {
      const vm = wrapper.vm as unknown as {
        filters: {
          periodo: string;
          programa: string;
          projeto: string;
        };
      };
      vm.filters.programa = "Programa X";
    }

    // 4. Aguardamos as requisições e ciclos de renderização
    await flushPromises();
    await nextTick();
    await nextTick();

    // 5. Validamos se a tabela filtrou corretamente para 1 linha
    const rows = wrapper.findAll("table")[1].findAll("tbody tr");
    expect(rows.length).toBe(1);
    expect(rows[0].text()).toContain("Programa X");
  });

  // ── CT03: Custo Total de Horas Técnicas ──────────────────────────────────

  it("CT03: displays total technical hours cost from API", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const cards = wrapper.findAll(".metric-card");
    const card = cards.find((c) =>
      c.text().includes("Custo Total de Horas Técnicas"),
    );
    expect(card).toBeDefined();
    expect(card!.text()).toContain("300");
  });

  // ── CT04: Número de Projetos ─────────────────────────────────────────────

  it("CT04: displays number of projects from API", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const cards = wrapper.findAll(".metric-card");
    const card = cards.find((c) => c.text().includes("Número de Projetos"));
    expect(card).toBeDefined();
    expect(card!.text()).toContain("8");
  });

  // ── CT05: Número de Programas ────────────────────────────────────────────

  it("CT05: displays number of programs from API", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const cards = wrapper.findAll(".metric-card");
    const card = cards.find((c) => c.text().includes("Número de Programas"));
    expect(card).toBeDefined();
    expect(card!.text()).toContain("3");
  });

  // ── Summary table: CT01 display ─────────────────────────────────────────

  it("CT01-summary: renders summary table title", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.text()).toContain("Resumo Agregado por Programa");
  });

  it("CT01-summary: renders correct column headers", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    const summaryTable = wrapper.findAll("table")[1];
    const headers = summaryTable.findAll("th").map((th) => th.text());
    expect(headers).toContain("Programa ↕");
    expect(headers).toContain("Qtd. Projetos ↕");
    expect(headers).toContain("Custo Materiais ↕");
    expect(headers).toContain("Custo Horas ↕");
    expect(headers).toContain("Custo Total ↓");
  });

  it("CT01-summary: shows empty state when no data", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const summaryTable = wrapper.findAll("table")[1];
    expect(summaryTable.text()).toContain("Nenhum registro encontrado.");
  });

  it("CT01-summary: aggregates rows by program and shows totals", async () => {
    fetchSummaryMock.mockResolvedValue([
      { programa: "Programa X", qtd_projetos: 2, custo_materiais: 3000, custo_horas: 1500, custo_total: 4500 },
      { programa: "Programa Y", qtd_projetos: 1, custo_materiais: 500, custo_horas: 250, custo_total: 750 },
    ]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url?.includes && url.includes("composition")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { nome_projeto: "Projeto A", programa: "Programa X", custo_materiais: 1000, custo_horas: 500, custo_total: 1500, status: "2024-01" },
              { nome_projeto: "Projeto B", programa: "Programa X", custo_materiais: 2000, custo_horas: 1000, custo_total: 3000, status: "2024-01" },
              { nome_projeto: "Projeto C", programa: "Programa Y", custo_materiais: 500, custo_horas: 250, custo_total: 750, status: "2024-01" },
            ]),
        });
      })
    );

    const wrapper = mount(DashboardView);
    await flushPromises();
    await nextTick();
    await nextTick();

    const summaryTable = wrapper.findAll("table")[1];
    const bodyRows = summaryTable.findAll("tbody tr");
    expect(bodyRows.length).toBe(2);

    const totalRow = summaryTable.find("tfoot tr");
    expect(totalRow.exists()).toBe(true);
    expect(totalRow.text()).toContain("Total");
  });

  it("CT01-summary: shows formatted currency values", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url?.includes && url.includes("composition")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { nome_projeto: "Projeto A", programa: "Programa X", custo_materiais: 1000, custo_horas: 500, custo_total: 1500, status: "2024-01" },
            ]),
        });
      })
    );

    const wrapper = mount(DashboardView);
    await flushPromises();
    await nextTick();
    await nextTick();

    const summaryTable = wrapper.findAll("table")[1];
    expect(summaryTable.text()).toContain("R$");
  });

  // ── Summary table: CT02 filter response ─────────────────────────────────

  it("CT02-summary: filters rows when programa filter is applied", async () => {
    fetchSummaryMock.mockResolvedValue([
      { programa: "Programa X", qtd_projetos: 1, custo_materiais: 1000, custo_horas: 500, custo_total: 1500 },
      { programa: "Programa Y", qtd_projetos: 1, custo_materiais: 500, custo_horas: 250, custo_total: 750 },
    ]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url?.includes && url.includes("composition")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { nome_projeto: "Projeto A", programa: "Programa X", custo_materiais: 1000, custo_horas: 500, custo_total: 1500, status: "2024-01" },
              { nome_projeto: "Projeto C", programa: "Programa Y", custo_materiais: 500, custo_horas: 250, custo_total: 750, status: "2024-01" },
            ]),
        });
      })
    );

    const wrapper = mount(DashboardView);
    await flushPromises();
    await nextTick();
    await nextTick();

    expect(wrapper.findAll("table")[1].findAll("tbody tr").length).toBe(2);

    const vm = wrapper.vm as unknown as {
      filters: { periodo: string; programa: string; projeto: string };
    };
    vm.filters.programa = "Programa X";
    await nextTick();

    const rows = wrapper.findAll("table")[1].findAll("tbody tr");
    expect(rows.length).toBe(1);
    expect(rows[0].text()).toContain("Programa X");
  });

  it("CT02-summary: shows empty state when filter matches nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url?.includes && url.includes("composition")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { nome_projeto: "Projeto A", programa: "Programa X", custo_materiais: 1000, custo_horas: 500, custo_total: 1500, status: "2024-01" },
            ]),
        });
      })
    );

    const wrapper = mount(DashboardView);
    await flushPromises();
    await nextTick();
    await nextTick();

    const vm = wrapper.vm as unknown as {
      filters: { periodo: string; programa: string; projeto: string };
    };
    vm.filters.programa = "Programa Inexistente";
    await nextTick();

    const summaryTable = wrapper.findAll("table")[1];
    expect(summaryTable.text()).toContain("Nenhum registro encontrado.");
  });

  // ── Summary table: CT03 sorting ──────────────────────────────────────────

  it("CT03-summary: clicking a header changes sort indicator", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url?.includes && url.includes("composition")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { nome_projeto: "Projeto A", programa: "Programa X", custo_materiais: 1000, custo_horas: 500, custo_total: 1500, status: "2024-01" },
              { nome_projeto: "Projeto C", programa: "Programa Y", custo_materiais: 200, custo_horas: 100, custo_total: 300, status: "2024-01" },
            ]),
        });
      })
    );

    const wrapper = mount(DashboardView);
    await flushPromises();
    await nextTick();
    await nextTick();

    const summaryTable = wrapper.findAll("table")[1];
    const programaHeader = summaryTable.findAll("th")[0];

    expect(programaHeader.text()).toContain("↕");

    await programaHeader.trigger("click");
    expect(programaHeader.text()).toContain("↓");

    await programaHeader.trigger("click");
    expect(programaHeader.text()).toContain("↑");
  });

  it("CT03-summary: sorting by qtdProjetos reorders rows", async () => {
    fetchSummaryMock.mockResolvedValue([
      { programa: "Programa X", qtd_projetos: 2, custo_materiais: 1500, custo_horas: 750, custo_total: 2250 },
      { programa: "Programa Y", qtd_projetos: 1, custo_materiais: 300, custo_horas: 150, custo_total: 450 },
    ]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url?.includes && url.includes("composition")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { nome_projeto: "Projeto A", programa: "Programa X", custo_materiais: 1000, custo_horas: 500, custo_total: 1500, status: "2024-01" },
              { nome_projeto: "Projeto B", programa: "Programa X", custo_materiais: 500, custo_horas: 250, custo_total: 750, status: "2024-01" },
              { nome_projeto: "Projeto C", programa: "Programa Y", custo_materiais: 300, custo_horas: 150, custo_total: 450, status: "2024-01" },
            ]),
        });
      })
    );

    const wrapper = mount(DashboardView);
    await flushPromises();
    await nextTick();
    await nextTick();

    const summaryTable = wrapper.findAll("table")[1];
    const qtdHeader = summaryTable.findAll("th")[1];

    await qtdHeader.trigger("click");
    let rows = summaryTable.findAll("tbody tr");
    expect(rows[0].text()).toContain("Programa X");

    await qtdHeader.trigger("click");
    rows = summaryTable.findAll("tbody tr");
    expect(rows[0].text()).toContain("Programa Y");
  });

  // ── CT06: Atualizar indicadores ao aplicar filtros ───────────────────────

  it("CT06: re-fetches KPIs when period filter is applied", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    expect(fetchKPIsMock).toHaveBeenCalledTimes(1);

    const vm = wrapper.vm as unknown as {
      filters: { periodo: string; programa: string; projeto: string };
    };
    vm.filters.periodo = "2024-01";
    await nextTick();
    await nextTick();

    expect(fetchKPIsMock).toHaveBeenCalledTimes(2);
    const secondCall = fetchKPIsMock.mock.calls[1][0];
    // periodo is sent as status filter (no date conversion for status-based filter)
    expect(secondCall).toMatchObject({
      status: "2024-01",
    });
  });

  it("CT07: displays active filters and clears them", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const vm = wrapper.vm as unknown as {
      filters: { periodo: string; programa: string; projeto: string };
    };
    vm.filters.programa = "Cloud";
    await nextTick();

    expect(wrapper.text()).toContain("Filtros ativos");
    expect(wrapper.text()).toContain("Programa: Cloud");

    await wrapper.find(".clear-btn").trigger("click");
    await nextTick();

    expect(vm.filters.programa).toBe("");
  });
});