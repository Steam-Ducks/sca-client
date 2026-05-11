import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Auditoria from "@/views/Auditoria.vue";

vi.mock("@/composables/useChartsAuditoria", () => ({
  useChartsAuditoria: vi.fn(() => ({
    buildCharts: vi.fn(),
    updateCharts: vi.fn(),
    destroyCharts: vi.fn(),
  })),
}));

vi.mock("chart.js", () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
  })),
  registerables: [],
}));

// ── Fixture ───────────────────────────────────────────────────────────────────
const API_ROWS = [
  {
    id: 1,
    operation: "bronze_ingest",
    status: "SUCCESS",
    table_schema: "bronze",
    table_name: "horas_tecnicas",
    affected_rows: 100,
    started_at: "2024-03-01T10:00:00Z",
    finalized_at: "2024-03-01T10:05:00Z",
    operation_metadata: {
      nome_projeto: "Migração AWS",
      nome_programa: "Cloud",
      responsavel: "Lucas Martins",
    },
  },
  {
    id: 2,
    operation: "silver_ingest",
    status: "FAILED",
    table_schema: "silver",
    table_name: "materiais",
    affected_rows: 0,
    started_at: "2024-01-15T09:00:00Z",
    finalized_at: "2024-01-15T09:03:00Z",
    operation_metadata: {
      nome_projeto: "Portal Web",
      nome_programa: "Desenvolvimento",
      responsavel: "Ana Oliveira",
    },
  },
];

interface AuditoriaRow {
  id: number;
  tipo: string;
  status: string;
  projeto: string;
  programa: string;
  responsavel: string;
}

interface VmType {
  filters: {
    tipo: string;
    status: string;
    projeto: string;
    responsavel: string;
    programa: string;
  };
  sortKey: string;
  page: number;
  filteredData: AuditoriaRow[];
}

describe("Auditoria.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => API_ROWS }),
    );
  });

  const getVm = (wrapper: ReturnType<typeof mount>) =>
    wrapper.vm as unknown as VmType;

  // ── Estrutura ───────────────────────────────────────────────────────────────

  it("renders the auditoria page with metrics", async () => {
    const wrapper = mount(Auditoria);
    await flushPromises();
    await nextTick();

    expect(wrapper.find(".metrics").exists()).toBe(true);
    const metricCards = wrapper.findAll(".metric-card");
    expect(metricCards.length).toBe(4);
  });

  it("displays correct metric labels", async () => {
    const wrapper = mount(Auditoria);
    await nextTick();

    expect(wrapper.text()).toContain("Total de Registros");
    expect(wrapper.text()).toContain("Aprovados");
    expect(wrapper.text()).toContain("Pendentes");
    expect(wrapper.text()).toContain("Rejeitados");
  });

  it("displays filters card with correct options", async () => {
    const wrapper = mount(Auditoria);
    await nextTick();

    expect(wrapper.find(".filters-card").exists()).toBe(true);
    expect(wrapper.find(".filters-title").text()).toContain("Filtros");

    const selects = wrapper.findAll("select");
    expect(selects.length).toBe(5);
  });

  it("renders the data table with correct headers", async () => {
    const wrapper = mount(Auditoria);
    await nextTick();

    expect(wrapper.find(".table-card").exists()).toBe(true);
    expect(wrapper.find(".table-header h2").text()).toBe(
      "Registros de Auditoria",
    );

    const headers = wrapper.findAll("th");
    expect(headers.length).toBe(9);
  });

  it("displays pagination controls", async () => {
    const wrapper = mount(Auditoria);
    await nextTick();

    const pagination = wrapper.find(".pagination");
    expect(pagination.exists()).toBe(true);
  });

  it("shows charts section", async () => {
    const wrapper = mount(Auditoria);
    await nextTick();

    const charts = wrapper.findAll(".chart-card");
    expect(charts.length).toBe(4);
  });

  it("displays status and tipo badges in table", async () => {
    const wrapper = mount(Auditoria);
    await flushPromises();
    await nextTick();

    const badges = wrapper.findAll(".badge");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("carrega dados da API no mount", async () => {
    const wrapper = mount(Auditoria);
    await flushPromises();
    await nextTick();

    expect(getVm(wrapper).filteredData.length).toBe(2);
    expect(wrapper.text()).toContain("Migração AWS");
    expect(wrapper.text()).toContain("Portal Web");
  });

  // ── CT01–CT04 (comportamento da tabela) ─────────────────────────────────────

  it("CT01: filters data by tipo", async () => {
    const wrapper = mount(Auditoria);
    await flushPromises();
    await nextTick();

    const selects = wrapper.findAll("select");
    if (selects.length > 0) {
      await selects[0].setValue("bronze_ingest");
      expect(getVm(wrapper).filters.tipo).toBe("bronze_ingest");
    }
  });

  it("CT02: filters data by status", async () => {
    const wrapper = mount(Auditoria);
    await flushPromises();
    await nextTick();

    const selects = wrapper.findAll("select");
    if (selects.length > 1) {
      await selects[1].setValue("Aprovado");
      expect(getVm(wrapper).filters.status).toBe("Aprovado");
    }
  });

  it("CT03: filters data by responsavel", async () => {
    const wrapper = mount(Auditoria);
    await flushPromises();
    await nextTick();

    const selects = wrapper.findAll("select");
    if (selects.length > 3) {
      await selects[3].setValue("Lucas Martins");
      expect(getVm(wrapper).filters.responsavel).toBe("Lucas Martins");
    }
  });

  it("CT04: sorts table by dataRegistro column", async () => {
    const wrapper = mount(Auditoria);
    await nextTick();

    const headers = wrapper.findAll("th.sort-col");
    const dataHeader = headers.find((h) => h.text().includes("Data Registro"));
    if (dataHeader) {
      await dataHeader.trigger("click");
      expect(getVm(wrapper).sortKey).toBe("dataRegistro");
    }
  });

  it("CT05: has export button", async () => {
    const wrapper = mount(Auditoria);
    await nextTick();

    const exportBtn = wrapper.find(".export-btn");
    expect(exportBtn.exists()).toBe(true);
    expect(exportBtn.text()).toContain("Exportar");
  });

  it("CT06: changes page in pagination", async () => {
    const wrapper = mount(Auditoria);
    await flushPromises();
    await nextTick();

    const pageButton = wrapper
      .findAll(".pg-btn")
      .find((btn) => btn.text() === "2");
    if (pageButton && pageButton.exists()) {
      await pageButton.trigger("click");
      expect(getVm(wrapper).page).toBe(2);
    }
  });

  // ── Filtros por programa e projeto (US acceptance criteria) ─────────────────

  describe("Filtros por programa e projeto", () => {
    it("CT01-US: filtra registros pelo programa selecionado", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      getVm(wrapper).filters.programa = "Cloud";
      await nextTick();

      expect(getVm(wrapper).filteredData.length).toBe(1);
      expect(getVm(wrapper).filteredData[0].projeto).toBe("Migração AWS");
    });

    it("CT02-US: filtra registros pelo projeto selecionado", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      getVm(wrapper).filters.projeto = "Portal Web";
      await nextTick();

      expect(getVm(wrapper).filteredData.length).toBe(1);
      expect(getVm(wrapper).filteredData[0].programa).toBe("Desenvolvimento");
    });

    it("CT03-US: combinação de programa e projeto filtra corretamente", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      getVm(wrapper).filters.programa = "Cloud";
      getVm(wrapper).filters.projeto = "Migração AWS";
      await nextTick();

      expect(getVm(wrapper).filteredData.length).toBe(1);
      expect(getVm(wrapper).filteredData[0].tipo).toBe("bronze_ingest");
    });

    it("CT04-US: limpar filtros restaura todos os registros", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      getVm(wrapper).filters.programa = "Cloud";
      await nextTick();
      expect(getVm(wrapper).filteredData.length).toBe(1);

      await wrapper.find(".clear-btn").trigger("click");
      await nextTick();

      expect(getVm(wrapper).filters.programa).toBe("");
      expect(getVm(wrapper).filteredData.length).toBe(2);
    });

    it("CT05-US: exibe chips de filtros ativos ao selecionar programa", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      getVm(wrapper).filters.programa = "Cloud";
      await nextTick();

      expect(wrapper.text()).toContain("Filtros ativos");
      expect(wrapper.text()).toContain("Programa: Cloud");
    });

    it("CT06-US: lista de projetos é restrita ao programa selecionado", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      getVm(wrapper).filters.programa = "Cloud";
      await nextTick();

      const projectSelect = wrapper.findAll("select")[2];
      const options = projectSelect.findAll("option").map((o) => o.text());
      expect(options).toContain("Migração AWS");
      expect(options).not.toContain("Portal Web");
    });
  });
});
