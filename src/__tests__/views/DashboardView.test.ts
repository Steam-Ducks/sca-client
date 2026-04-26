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
  }))
  Object.assign(MockChart, { register: vi.fn() })
  return { Chart: MockChart, registerables: [] }
});

const fetchKPIsMock = vi.hoisted(() => vi.fn());

vi.mock("@/services/dashboardService", () => ({
  dashboardService: {
    fetchKPIs: fetchKPIsMock,
  },
}));



describe("DashboardView.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchKPIsMock.mockResolvedValue(KPIS_MOCK);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("composition")) {
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

  it("renders table with six headers", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.find(".table-card").exists()).toBe(true);
    expect(wrapper.findAll("th").length).toBe(6);
  });

  it("displays pagination controls", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.find(".pagination").exists()).toBe(true);
  });

  it("displays four chart cards", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.findAll(".chart-card").length).toBe(4);
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
    const card = cards.find((c) =>
      c.text().includes("Custo Total Consolidado"),
    );
    expect(card).toBeDefined();
    expect(card!.text()).toContain("750");
  });

  // ── CT02: Custo Total de Materiais ───────────────────────────────────────

  it("CT02: displays total materials cost from API", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const cards = wrapper.findAll(".metric-card");
    const card = cards.find((c) =>
      c.text().includes("Custo Total de Materiais"),
    );
    expect(card).toBeDefined();
    expect(card!.text()).toContain("450");
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

  // ── CT06: Atualizar indicadores ao aplicar filtros ───────────────────────

  it("CT06: re-fetches KPIs when period filter is applied", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    // First call on mount
    expect(fetchKPIsMock).toHaveBeenCalledTimes(1);

    // Seta o estado reativo diretamente para garantir que o watch
    // dispara com o valor correto já disponível
    const vm = wrapper.vm as unknown as { filters: { periodo: string; programa: string; projeto: string } };
    vm.filters.periodo = "2024-01";
    await nextTick();
    await nextTick();

    // Should have called fetchKPIs again with date filters
    expect(fetchKPIsMock).toHaveBeenCalledTimes(2);
    const secondCall = fetchKPIsMock.mock.calls[1][0];
    expect(secondCall).toMatchObject({
      start_date: "2024-01-01",
      end_date: "2024-01-31",
    });
  });
});
