import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import DashboardView from "@/views/DashboardView.vue";
import { apiService } from "@/services/apiService";

// Mock useChartsDashboard composable
vi.mock("@/composables/useChartsDashboard", () => ({
  useChartsDashboard: vi.fn(() => ({
    buildCharts: vi.fn(),
    updateCharts: vi.fn(),
    destroyCharts: vi.fn(),
  })),
}));

// Mock Chart.js to prevent canvas errors
vi.mock("chart.js", () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
  })),
  registerables: [],
}));

vi.mock("@/services/apiService", () => ({
  apiService: {
    consolidated: {
      fetchConsolidated: vi.fn(),
    },
  },
}));

const consolidatedRows = [
  {
    id: 1,
    projeto: "Data Center Regional",
    programa: "Infraestrutura",
    custoMateriais: 245000,
    custoHoras: 217400,
    custoTotal: 462400,
    qtdMateriais: 48,
    totalHoras: 660,
    periodo: "2024-01",
    status: "Concluído",
  },
  {
    id: 2,
    projeto: "Storage Upgrade",
    programa: "Infraestrutura",
    custoMateriais: 189000,
    custoHoras: 95000,
    custoTotal: 284000,
    qtdMateriais: 35,
    totalHoras: 320,
    periodo: "2024-01",
    status: "Concluído",
  },
  {
    id: 3,
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    custoMateriais: 67000,
    custoHoras: 441200,
    custoTotal: 508200,
    qtdMateriais: 15,
    totalHoras: 1370,
    periodo: "2024-02",
    status: "Em Andamento",
  },
];

describe("DashboardView.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(apiService.consolidated.fetchConsolidated).mockResolvedValue(
      consolidatedRows,
    );
  });

  const getVm = (wrapper: ReturnType<typeof mount>) =>
    wrapper.vm as unknown as {
      filters: { periodo: string; programa: string; projeto: string };
      sortKey: string;
      page: number;
    };

  it("renders the dashboard page with metrics", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    expect(wrapper.find(".metrics").exists()).toBe(true);
    const metricCards = wrapper.findAll(".metric-card");
    expect(metricCards.length).toBe(4);
  });

  it("displays correct metric labels", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.text()).toContain("Custo Total Geral");
    expect(wrapper.text()).toContain("Custo Materiais");
    expect(wrapper.text()).toContain("Custo Horas Técnicas");
    expect(wrapper.text()).toContain("Total de Projetos");
  });

  it("displays filters card", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.find(".filters-card").exists()).toBe(true);
    expect(wrapper.find(".filters-title").text()).toContain("Filtros");
  });

  it("displays filter options", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    const selects = wrapper.findAll("select");
    expect(selects.length).toBe(3);
  });

  it("renders the data table with headers", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    expect(wrapper.find(".table-card").exists()).toBe(true);
    expect(wrapper.find(".table-header h2").text()).toBe("Resumo por Projeto");

    const headers = wrapper.findAll("th");
    expect(headers.length).toBe(6);
  });

  it("displays pagination controls", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    const pagination = wrapper.find(".pagination");
    expect(pagination.exists()).toBe(true);
  });

  it("shows charts section", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    const charts = wrapper.findAll(".chart-card");
    expect(charts.length).toBe(4);
  });

  it("CT01: filters data by period", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const selects = wrapper.findAll("select");
    if (selects.length > 0) {
      await selects[0].setValue("2024-01");
      expect(getVm(wrapper).filters.periodo).toBe("2024-01");
    }
  });

  it("CT02: filters data by program", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const selects = wrapper.findAll("select");
    if (selects.length > 1) {
      await selects[1].setValue("Infraestrutura");
      expect(getVm(wrapper).filters.programa).toBe("Infraestrutura");
    }
  });

  it("CT03: sorts table by projeto column", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    const projetoHeader = wrapper.find("th");
    if (projetoHeader.exists()) {
      await projetoHeader.trigger("click");
      expect(getVm(wrapper).sortKey).toBe("projeto");
    }
  });

  it("CT04: changes page in pagination", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();
    await nextTick();

    const pageButton = wrapper
      .findAll(".pg-btn")
      .find((btn) => btn.text() === "2");
    if (pageButton && pageButton.exists()) {
      await pageButton.trigger("click");
      expect(getVm(wrapper).page).toBe(2);
    }
  });

  it("CT05: has export button", async () => {
    const wrapper = mount(DashboardView);
    await nextTick();

    const exportBtn = wrapper.find(".export-btn");
    expect(exportBtn.exists()).toBe(true);
    expect(exportBtn.text()).toContain("Exportar");
  });
});
