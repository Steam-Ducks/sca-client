import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Consolidado from "@/views/Consolidado.vue";
import { apiService } from "@/services/apiService";

// Mock useChartsConsolidado composable
vi.mock("@/composables/useChartsConsolidado", () => ({
  useChartsConsolidado: vi.fn(() => ({
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
      fetchConsolidatedSnapshot: vi.fn(),
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
    projeto: "Migração AWS",
    programa: "Cloud",
    custoMateriais: 156000,
    custoHoras: 282000,
    custoTotal: 438000,
    qtdMateriais: 28,
    totalHoras: 780,
    periodo: "2024-01",
    status: "Em Andamento",
  },
  {
    id: 4,
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    custoMateriais: 67000,
    custoHoras: 441200,
    custoTotal: 508200,
    qtdMateriais: 15,
    totalHoras: 1370,
    periodo: "2024-02",
    status: "Planejado",
  },
];

describe("Consolidado.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(apiService.consolidated.fetchConsolidatedSnapshot).mockResolvedValue({
      rows: consolidatedRows,
      lastUpdatedAt: "2026-04-25T14:30:00Z",
    });
  });

  const getVm = (wrapper: ReturnType<typeof mount>) =>
    wrapper.vm as unknown as {
      filters: {
        periodo: string;
        programa: string;
        projeto: string;
        status: string;
      };
      sortKey: string;
      page: number;
    };

  it("renders the consolidado page with metrics", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();
    await nextTick();

    expect(wrapper.find(".metrics").exists()).toBe(true);
    const metricCards = wrapper.findAll(".metric-card");
    expect(metricCards.length).toBe(4);
  });

  it("CT01: displays the last update date and time", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();
    await nextTick();

    const banner = wrapper.find('[data-testid="last-update-banner"]');
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain("Última importação");
    expect(banner.text()).toContain("25/04/2026");
    expect(banner.text()).toMatch(/\d{2}:\d{2}/);
  });

  it("CT02: updates the displayed value after a new data load", async () => {
    vi.mocked(apiService.consolidated.fetchConsolidatedSnapshot)
      .mockResolvedValueOnce({
        rows: consolidatedRows,
        lastUpdatedAt: "2026-04-25T14:30:00Z",
      })
      .mockResolvedValueOnce({
        rows: consolidatedRows,
        lastUpdatedAt: "2026-04-26T09:45:00Z",
      });

    const firstWrapper = mount(Consolidado);
    await nextTick();
    await nextTick();
    expect(firstWrapper.text()).toContain("25/04/2026");
    firstWrapper.unmount();

    const secondWrapper = mount(Consolidado);
    await nextTick();
    await nextTick();
    expect(secondWrapper.text()).toContain("26/04/2026");
    expect(secondWrapper.text()).toMatch(/\d{2}:\d{2}/);
  });

  it("displays correct metric labels", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();

    expect(wrapper.text()).toContain("Custo Total Consolidado");
    expect(wrapper.text()).toContain("Custo Materiais");
    expect(wrapper.text()).toContain("Custo Horas Técnicas");
    expect(wrapper.text()).toContain("Total de Projetos");
  });

  it("displays filters card with correct options", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();

    expect(wrapper.find(".filters-card").exists()).toBe(true);
    expect(wrapper.find(".filters-title").text()).toContain("Filtros");

    const selects = wrapper.findAll("select");
    expect(selects.length).toBe(4);
  });

  it("renders the data table with correct headers", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();

    expect(wrapper.find(".table-card").exists()).toBe(true);
    expect(wrapper.find(".table-header h2").text()).toBe(
      "Tabela Consolidada por Projeto",
    );

    const headers = wrapper.findAll("th");
    expect(headers.length).toBe(9);
  });

  it("displays pagination controls", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();

    const pagination = wrapper.find(".pagination");
    expect(pagination.exists()).toBe(true);
  });

  it("shows charts section", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();

    const charts = wrapper.findAll(".chart-card");
    expect(charts.length).toBe(4);
  });

  it("displays status badges in table", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();
    await nextTick();

    const badges = wrapper.findAll(".badge");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("CT01: filters data by period", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();
    await nextTick();

    const selects = wrapper.findAll("select");
    if (selects.length > 0) {
      await selects[0].setValue("2024-01");
      expect(getVm(wrapper).filters.periodo).toBe("2024-01");
    }
  });

  it("CT02: filters data by program", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();
    await nextTick();

    const selects = wrapper.findAll("select");
    if (selects.length > 1) {
      await selects[1].setValue("Cloud");
      expect(getVm(wrapper).filters.programa).toBe("Cloud");
    }
  });

  it("CT03: filters data by status", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();
    await nextTick();

    const selects = wrapper.findAll("select");
    if (selects.length > 3) {
      await selects[3].setValue("Concluído");
      expect(getVm(wrapper).filters.status).toBe("Concluído");
    }
  });

  it("CT04: sorts table by custoTotal column", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();

    const headers = wrapper.findAll("th.sort-col");
    const custoTotalHeader = headers.find((h) =>
      h.text().includes("Custo Total"),
    );
    if (custoTotalHeader) {
      await custoTotalHeader.trigger("click");
      expect(getVm(wrapper).sortKey).toBe("custoTotal");
    }
  });

  it("CT05: has export button", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();

    const exportBtn = wrapper.find(".export-btn");
    expect(exportBtn.exists()).toBe(true);
    expect(exportBtn.text()).toContain("Exportar");
  });

  it("CT06: restricts project options when a program is selected", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();
    await nextTick();

    const selects = wrapper.findAll("select");
    await selects[1].setValue("Cloud");
    await nextTick();

    const projectOptions = selects[2].findAll("option").map((option) => option.text());
    expect(projectOptions).toContain("Migração AWS");
    expect(projectOptions).not.toContain("Storage Upgrade");
  });

  it("CT07: displays active filters, clears them, and refetches with filters", async () => {
    const wrapper = mount(Consolidado);
    await nextTick();
    await nextTick();

    const selects = wrapper.findAll("select");
    await selects[1].setValue("Cloud");
    await nextTick();

    expect(wrapper.text()).toContain("Filtros ativos");
    expect(wrapper.text()).toContain("Programa: Cloud");
    expect(apiService.consolidated.fetchConsolidatedSnapshot).toHaveBeenLastCalledWith(
      expect.objectContaining({ programa: "Cloud" }),
    );

    await wrapper.find(".clear-btn").trigger("click");
    await nextTick();

    expect(getVm(wrapper).filters.programa).toBe("");
  });
});
