import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import GestaoMateriais from "@/views/GestaoMateriais.vue";
import { RAW } from "@/data/materiais";
import type { Filters, SortKey } from "@/types/materiais";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockBuildCharts = vi.fn();
const mockUpdateCharts = vi.fn();
const mockDestroyCharts = vi.fn();

vi.mock("@/composables/useCharts", () => ({
  useCharts: vi.fn(() => ({
    buildCharts: mockBuildCharts,
    updateCharts: mockUpdateCharts,
    destroyCharts: mockDestroyCharts,
  })),
}));

vi.mock("chart.js", () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
  })),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const apiRows = RAW.map((row) => ({
  id: row.id,
  material: row.material,
  projeto: row.projeto,
  programa: row.programa,
  quantidade: row.quantidade,
  valor_unitario: row.valorUnitario,
  valor_total: row.valorTotal,
  periodo: row.periodo,
  fornecedor: row.fornecedor,
  categoria: row.categoria,
}));

const mockCostByProjectResponse = [
  { projeto: "Data Center Regional", total_cost: 150000 },
  { projeto: "Migração Cloud", total_cost: 98000 },
  { projeto: "Segurança Perimetral", total_cost: 47500 },
];

const mockTopMaterialsResponse = [
  { material: "Servidor Dell PowerEdge", total: 80000 },
  { material: "Switch Cisco Catalyst", total: 45000 },
];

const mockFilterOptions = {
  periodos: [...new Set(RAW.map((r) => r.periodo).filter(Boolean))].sort(),
  programas: [...new Set(RAW.map((r) => r.programa).filter(Boolean))].sort(),
  projetos: [
    ...new Map(
      RAW.map((r) => [r.projeto, { nome: r.projeto, programa: r.programa }]),
    ).values(),
  ],
  categorias: [...new Set(RAW.map((r) => r.categoria).filter(Boolean))].sort(),
  fornecedores: [...new Set(RAW.map((r) => r.fornecedor).filter(Boolean))].sort(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getVm = (wrapper: ReturnType<typeof mount>) =>
  wrapper.vm as unknown as {
    filters: Filters;
    sortKey: SortKey;
    page: number;
    costByProject: unknown[];
    topMaterials: unknown[];
    isMounted: boolean;
  };

const flushAll = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
  await nextTick();
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("GestaoMateriais.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("cost-by-project")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockCostByProjectResponse,
          });
        }
        if (url.includes("top-materials")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTopMaterialsResponse,
          });
        }
        if (url.includes("filter-options")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockFilterOptions,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => apiRows,
        });
      }),
    );
  });

  // ── Testes originais ──────────────────────────────────────────────────────

  it("displays filter options", async () => {
    const wrapper = mount(GestaoMateriais);
    await nextTick();

    const selects = wrapper.findAll("select");
    expect(selects.length).toBeGreaterThanOrEqual(4);
  });

  it("renders the data table with headers", async () => {
    const wrapper = mount(GestaoMateriais);
    await nextTick();

    const headers = wrapper.findAll("th");
    expect(headers.length).toBeGreaterThan(0);
  });

  it("displays pagination controls", async () => {
    const wrapper = mount(GestaoMateriais);
    await nextTick();

    const pagination = wrapper.find(".pagination");
    expect(pagination.exists()).toBe(true);
  });

  it("shows charts section", async () => {
    const wrapper = mount(GestaoMateriais);
    await nextTick();

    const charts = wrapper.findAll(".chart-card");
    expect(charts.length).toBeGreaterThan(0);
  });

  it("CT01: filters data by period", async () => {
    const wrapper = mount(GestaoMateriais);
    await flushAll();

    const selects = wrapper.findAll("select");
    if (selects.length > 0) {
      await selects[0].setValue("2024-01");
      expect(getVm(wrapper).filters.periodo).toBe("2024-01");
    }
  });

  it("CT02: filters data by program", async () => {
    const wrapper = mount(GestaoMateriais);
    await flushAll();

    const selects = wrapper.findAll("select");
    if (selects.length > 1) {
      await selects[1].setValue("Infraestrutura");
      expect(getVm(wrapper).filters.programa).toBe("Infraestrutura");
    }
  });

  it("CT03: searches materials by text", async () => {
    const wrapper = mount(GestaoMateriais);
    await nextTick();

    const searchInput = wrapper.find(".search-input");
    if (searchInput.exists()) {
      await searchInput.setValue("Dell");
      expect(getVm(wrapper).filters.search).toBe("Dell");
    }
  });

  it("CT04: sorts table by material column", async () => {
    const wrapper = mount(GestaoMateriais);
    await nextTick();

    const materialHeader = wrapper.find("th");
    if (materialHeader.exists()) {
      await materialHeader.trigger("click");
      expect(getVm(wrapper).sortKey).toBe("material");
    }
  });

  it("CT05: changes page in pagination", async () => {
    const wrapper = mount(GestaoMateriais);
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

  it("CT06: restricts project options when a program is selected", async () => {
    const wrapper = mount(GestaoMateriais);
    await flushAll();

    const selects = wrapper.findAll("select");

    await selects[1].setValue("Cloud");
    await nextTick();

    const projectOptions = selects[2]
      .findAll("option")
      .map((option) => option.text());

    expect(projectOptions.length).toBeGreaterThan(1);
    expect(projectOptions).not.toContain("Data Center Regional");
  });

  it("CT07: shows and clears active filters", async () => {
    const wrapper = mount(GestaoMateriais);
    await flushAll();

    const selects = wrapper.findAll("select");
    await selects[1].setValue("Infraestrutura");
    await flushAll();

    expect(wrapper.text()).toContain("Filtros ativos");
    expect(wrapper.find(".active-filters").text()).toContain("Programa: Infraestrutura");

    await wrapper.find(".clear-btn").trigger("click");
    await flushAll();

    expect(getVm(wrapper).filters.programa).toBe("");
  });

  // ── loadCostByProject – caminho feliz ─────────────────────────────────────

  it("CT08: popula costByProject com os dados retornados pela API", async () => {
    const wrapper = mount(GestaoMateriais);
    await flushAll();

    const { costByProject } = getVm(wrapper);
    const first = costByProject[0] as Record<string, unknown>;

    expect(costByProject).toHaveLength(mockCostByProjectResponse.length);
    expect(first.projeto).toBe("Data Center Regional");
    expect(first.valorTotal).toBe(150000);
  });

  // ── loadCostByProject – tratamento de erro ────────────────────────────────

  it("CT09: define costByProject como [] quando a API lança erro", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("cost-by-project")) {
          return Promise.reject(new Error("Network error"));
        }
        if (url.includes("top-materials")) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTopMaterialsResponse,
          });
        }
        return Promise.resolve({ ok: true, json: async () => apiRows });
      }),
    );

    const wrapper = mount(GestaoMateriais);
    await flushAll();

    expect(getVm(wrapper).costByProject).toEqual([]);
  });

  // ── onMounted – sequência de inicialização ────────────────────────────────

  it("CT10: isMounted é true após a conclusão do onMounted", async () => {
    const wrapper = mount(GestaoMateriais);
    await flushAll();

    expect(getVm(wrapper).isMounted).toBe(true);
  });

  it("CT11: updateCharts é chamado no onMounted com os dados de costByProject", async () => {
    mount(GestaoMateriais);
    await flushAll();

    expect(mockUpdateCharts).toHaveBeenCalled();
    expect(mockUpdateCharts).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ projeto: expect.any(String) }),
      ]),
    );
  });
});