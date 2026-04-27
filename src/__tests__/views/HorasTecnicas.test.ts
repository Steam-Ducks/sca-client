import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import HorasTecnicas from "@/views/HorasTecnicas.vue";

interface Row {
  id: number;
  colaborador: string;
  projeto: string;
  programa: string;
  horas: number;
  custoPorHora: number;
  custoTotal: number;
  periodo: string;
  tarefa: string;
}

interface VmType {
  filters: {
    periodo: string;
    programa: string;
    projeto: string;
    colaborador: string;
    tarefa: string;
  };
  sortKey: string;
  sortDir: 1 | -1;
  page: number;
  filteredData: Row[];
  kpis: { custoTotal: number; totalHoras: number; custoMedio: number };
}

// ── Mocks hoisted so they're available inside vi.mock factories ───────────────
const { updateChartsMock, buildChartsMock } = vi.hoisted(() => ({
  updateChartsMock: vi.fn(),
  buildChartsMock: vi.fn(),
}));

vi.mock("@/composables/useChartsTechnical", () => ({
  useChartsTechnical: () => ({
    buildCharts: buildChartsMock,
    updateCharts: updateChartsMock,
    destroyCharts: vi.fn(),
  }),
}));

// ── Fixture data ──────────────────────────────────────────────────────────────
const API_ROWS = [
  {
    id: 1,
    colaborador: "Lucas Martins",
    projeto: "Migração AWS",
    programa: "Cloud",
    horas_trabalhadas: 40,
    custo_por_hora: 420,
    custo_total: 16800,
    periodo: "2024-03",
    tarefa: "Arquitetura Cloud",
  },
  {
    id: 2,
    colaborador: "Ana Oliveira",
    projeto: "Portal Web",
    programa: "Desenvolvimento",
    horas_trabalhadas: 52,
    custo_por_hora: 250,
    custo_total: 13000,
    periodo: "2024-01",
    tarefa: "Desenvolvimento",
  },
];

// ── Suite ─────────────────────────────────────────────────────────────────────
describe("HorasTecnicas.vue", () => {
  beforeEach(() => {
    updateChartsMock.mockClear();
    buildChartsMock.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => API_ROWS }),
    );
  });

  // ── CT01: indicadores de horas técnicas ──────────────────────────────────────
  describe("CT01 - Indicadores de horas técnicas", () => {
    it("exibe os 4 cards de indicadores com labels corretos", async () => {
      const wrapper = mount(HorasTecnicas);
      await nextTick();

      expect(wrapper.text()).toContain("Custo Total - Horas");
      expect(wrapper.text()).toContain("Total de Horas");
      expect(wrapper.text()).toContain("Custo Médio/Hora");
      expect(wrapper.text()).toContain("Registros");
    });

    it("calcula os KPIs corretamente a partir dos dados da API", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      const vm = wrapper.vm as unknown as VmType;
      // total_horas = 40 + 52 = 92
      expect(vm.kpis.totalHoras).toBe(92);
      // custo_total = 16800 + 13000 = 29800
      expect(vm.kpis.custoTotal).toBe(29800);
      // custo_medio = 29800 / 92 ≈ 323.91
      expect(vm.kpis.custoMedio).toBeCloseTo(29800 / 92, 2);
    });

    it("exibe o total de registros igual ao número de linhas carregadas", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      const vm = wrapper.vm as unknown as VmType;
      expect(vm.filteredData.length).toBe(2);
    });
  });

  // ── CT02: tabela analítica ────────────────────────────────────────────────────
  describe("CT02 - Tabela analítica de horas", () => {
    it("exibe a tabela com os 8 cabeçalhos corretos", () => {
      const wrapper = mount(HorasTecnicas);
      const texts = wrapper.findAll("th").map((h) => h.text());

      expect(texts.some((t) => t.includes("Colaborador"))).toBe(true);
      expect(texts.some((t) => t.includes("Projeto"))).toBe(true);
      expect(texts.some((t) => t.includes("Programa"))).toBe(true);
      expect(texts.some((t) => t.includes("Horas"))).toBe(true);
      expect(texts.some((t) => t.includes("Custo/Hora"))).toBe(true);
      expect(texts.some((t) => t.includes("Custo Total"))).toBe(true);
      expect(texts.some((t) => t.includes("Período"))).toBe(true);
      expect(texts.some((t) => t.includes("Tarefa"))).toBe(true);
    });

    it("renderiza os dados da API nas linhas da tabela", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      expect(wrapper.text()).toContain("Lucas Martins");
      expect(wrapper.text()).toContain("Ana Oliveira");
    });

    it("define sortKey ao clicar no cabeçalho Colaborador", async () => {
      const wrapper = mount(HorasTecnicas);
      const vm = wrapper.vm as unknown as VmType;

      const th = wrapper
        .findAll("th")
        .find((h) => h.text().includes("Colaborador"));
      await th!.trigger("click");

      expect(vm.sortKey).toBe("colaborador");
    });

    it("inverte sortDir ao clicar duas vezes no mesmo cabeçalho", async () => {
      const wrapper = mount(HorasTecnicas);
      const vm = wrapper.vm as unknown as VmType;

      const th = wrapper
        .findAll("th")
        .find((h) => h.text().includes("Horas"));
      await th!.trigger("click");
      const dir1 = vm.sortDir;
      await th!.trigger("click");

      expect(vm.sortDir).toBe(-dir1);
    });

    it("exibe controles de paginação", () => {
      const wrapper = mount(HorasTecnicas);

      expect(wrapper.find(".pagination").exists()).toBe(true);
      expect(wrapper.findAll(".pg-btn").length).toBeGreaterThan(0);
    });

    it("exibe a tabela com o data-testid correto", () => {
      const wrapper = mount(HorasTecnicas);

      expect(wrapper.find('[data-testid="data-table"]').exists()).toBe(true);
    });
  });

  // ── CT03: atualização em tempo real ──────────────────────────────────────────
  describe("CT03 - Atualização em tempo real ao mudar filtros", () => {
    it("chama updateCharts ao alterar o filtro de período", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      updateChartsMock.mockClear();

      const vm = wrapper.vm as unknown as VmType;
      vm.filters.periodo = "2024-03";
      await nextTick();

      expect(updateChartsMock).toHaveBeenCalledOnce();
    });

    it("chama updateCharts com os dados filtrados", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      updateChartsMock.mockClear();

      const vm = wrapper.vm as unknown as VmType;
      vm.filters.programa = "Cloud";
      await nextTick();

      const chamadaArgs = updateChartsMock.mock.calls[0][0] as Row[];
      expect(chamadaArgs.length).toBe(1);
      expect(chamadaArgs[0].colaborador).toBe("Lucas Martins");
    });

    it("reseta a paginação para página 1 ao mudar filtro", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      const vm = wrapper.vm as unknown as VmType;
      vm.page = 3;
      vm.filters.programa = "Cloud";
      await nextTick();

      expect(vm.page).toBe(1);
    });

    it("filtra os registros corretamente ao selecionar um programa", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      const vm = wrapper.vm as unknown as VmType;
      vm.filters.programa = "Cloud";
      await nextTick();

      expect(vm.filteredData.length).toBe(1);
      expect(vm.filteredData[0].colaborador).toBe("Lucas Martins");
    });

    it("exibe todos os registros ao limpar o filtro", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      const vm = wrapper.vm as unknown as VmType;
      vm.filters.programa = "Cloud";
      await nextTick();
      vm.filters.programa = "";
      await nextTick();

      expect(vm.filteredData.length).toBe(2);
    });

    it("recarrega o backend com programa na query string", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => API_ROWS });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      const vm = wrapper.vm as unknown as VmType;
      vm.filters.programa = "Cloud";
      await flushPromises();
      await nextTick();

      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.stringContaining("/horas-tecnicas/?programa=Cloud"),
      );
    });

    it("restringe projetos ao programa selecionado e limpa filtros", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      const selects = wrapper.findAll("select");
      await selects[1].setValue("Cloud");
      await nextTick();

      const projectOptions = selects[2].findAll("option").map((option) => option.text());
      expect(projectOptions).toContain("Migração AWS");
      expect(projectOptions).not.toContain("Portal Web");

      expect(wrapper.text()).toContain("Filtros ativos");

      await wrapper.find('[data-testid="btn-clear-filters"]').trigger("click");
      await nextTick();
      expect((wrapper.vm as unknown as VmType).filters.programa).toBe("");
    });
  });

  // ── CT04: formatação de valores ───────────────────────────────────────────────
  describe("CT04 - Formatação de valores numéricos e monetários", () => {
    it("exibe valores monetários com prefixo R$", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      expect(wrapper.text()).toContain("R$");
    });

    it("exibe horas com sufixo h", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      expect(wrapper.text()).toMatch(/\d+h/);
    });

    it("KPI custo_total exibe separador decimal de duas casas", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      // Formato pt-BR: R$ X.XXX,XX ou R$ XX,XX
      expect(wrapper.text()).toMatch(/R\$\s[\d.,]+,\d{2}/);
    });

    it("horas na tabela possuem sufixo h após o número", async () => {
      const wrapper = mount(HorasTecnicas);
      await flushPromises();
      await nextTick();

      const rows = wrapper.findAll("tbody tr");
      const horasCell = rows[0]?.findAll("td")[3];
      expect(horasCell?.text()).toMatch(/\d+h/);
    });
  });
});
