import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import GestaoMateriais from "@/views/GestaoMateriais.vue";
import { RAW } from "@/data/materiais";
import type { Filters, SortKey } from "@/types/materiais";

// Mock useCharts composable
vi.mock("@/composables/useCharts", () => ({
  useCharts: vi.fn(() => ({
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
}));

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

describe("GestaoMateriais.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => apiRows,
      }),
    );
  });

  const getVm = (wrapper: ReturnType<typeof mount>) =>
    wrapper.vm as unknown as {
      filters: Filters;
      sortKey: SortKey;
      page: number;
    };

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
    await nextTick();

    const selects = wrapper.findAll("select");
    if (selects.length > 0) {
      await selects[0].setValue("2024-01");
      expect(getVm(wrapper).filters.periodo).toBe("2024-01");
    }
  });

  it("CT02: filters data by program", async () => {
    const wrapper = mount(GestaoMateriais);
    await nextTick();

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
    await nextTick();
    await nextTick();

    const selects = wrapper.findAll("select");
    await selects[1].setValue("Cloud");
    await nextTick();

    const projectOptions = selects[2].findAll("option").map((option) => option.text());
    expect(projectOptions).toContain("Migração AWS");
    expect(projectOptions).not.toContain("Data Center Regional");
  });

  it("CT07: shows and clears active filters", async () => {
    const wrapper = mount(GestaoMateriais);
    await nextTick();
    await nextTick();

    const selects = wrapper.findAll("select");
    await selects[1].setValue("Infraestrutura");
    await nextTick();

    expect(wrapper.text()).toContain("Filtros ativos");
    expect(wrapper.text()).toContain("Programa: Infraestrutura");

    await wrapper.find(".clear-btn").trigger("click");
    await nextTick();

    expect(getVm(wrapper).filters.programa).toBe("");
  });
});
