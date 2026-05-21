// src/__tests__/composables/useChartsTechnical.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HoraRow } from "@/composables/useChartsTechnical";

// ── Mock Chart.js ─────────────────────────────────────────────────────────────
vi.mock("chart.js", () => {
  const MockChart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: {
      labels: [] as unknown[],
      datasets: [{ data: [] as unknown[] }],
    },
  }));
  MockChart.register = vi.fn();
  return { Chart: MockChart, registerables: [] };
});

// ── Mock canvas DOM ───────────────────────────────────────────────────────────
const mockCtx = {};
const mockCanvas = { getContext: vi.fn().mockReturnValue(mockCtx) };

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_DATA: HoraRow[] = [
  {
    id: 1,
    colaborador: "Lucas",
    projeto: "P1",
    programa: "Cloud",
    horas: 40,
    custoPorHora: 420,
    custoTotal: 16800,
    periodo: "2024-03",
    tarefa: "Arquitetura",
  },
  {
    id: 2,
    colaborador: "Ana",
    projeto: "P2",
    programa: "Dev",
    horas: 52,
    custoPorHora: 250,
    custoTotal: 13000,
    periodo: "2024-01",
    tarefa: "Dev",
  },
  {
    id: 3,
    colaborador: "Pedro",
    projeto: "P2",
    programa: "Dev",
    horas: 30,
    custoPorHora: 250,
    custoTotal: 7500,
    periodo: "2024-03",
    tarefa: "Dev",
  },
];

// ── Suite ─────────────────────────────────────────────────────────────────────
describe("useChartsTechnical", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(document, "getElementById").mockReturnValue(
      mockCanvas as unknown as HTMLElement,
    );
  });

  // ── Interface pública ───────────────────────────────────────────────────────

  it("retorna buildCharts, updateCharts e destroyCharts", async () => {
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );
    const composable = useChartsTechnical();

    expect(typeof composable.buildCharts).toBe("function");
    expect(typeof composable.updateCharts).toBe("function");
    expect(typeof composable.destroyCharts).toBe("function");
  });

  it("buildCharts cria 4 instâncias de Chart", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );

    useChartsTechnical().buildCharts(SAMPLE_DATA);

    expect(Chart).toHaveBeenCalledTimes(4);
  });

  it("buildCharts consulta os 4 canvas pelo id correto", async () => {
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );

    useChartsTechnical().buildCharts(SAMPLE_DATA);

    const ids = (
      document.getElementById as ReturnType<typeof vi.fn>
    ).mock.calls.map((c: string[]) => c[0]);
    expect(ids).toContain("chartHorasProjeto");
    expect(ids).toContain("chartCustoProjeto");
    expect(ids).toContain("chartCustoColaborador");
    expect(ids).toContain("chartTemporal");
  });

  it("buildCharts com dados vazios ainda cria os 4 gráficos", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );

    useChartsTechnical().buildCharts([]);

    expect(Chart).toHaveBeenCalledTimes(4);
  });

  it("buildCharts não cria gráfico quando o contexto do canvas é null", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );

    vi.spyOn(document, "getElementById").mockReturnValue(null);
    useChartsTechnical().buildCharts(SAMPLE_DATA);

    expect(Chart).not.toHaveBeenCalled();
  });

  it("destroyCharts chama destroy em todas as instâncias ativas", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );
    const { buildCharts, destroyCharts } = useChartsTechnical();

    buildCharts(SAMPLE_DATA);
    const instances = vi.mocked(Chart).mock.results.map((r) => r.value);
    vi.clearAllMocks();

    destroyCharts();

    instances.forEach((inst) => expect(inst.destroy).toHaveBeenCalled());
  });

  it("buildCharts chama destroyAll antes de criar novos gráficos", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );
    const { buildCharts } = useChartsTechnical();

    buildCharts(SAMPLE_DATA);
    const firstInstance = vi.mocked(Chart).mock.results[0].value;
    vi.clearAllMocks();

    buildCharts(SAMPLE_DATA);

    expect(firstInstance.destroy).toHaveBeenCalled();
    expect(Chart).toHaveBeenCalledTimes(4);
  });

  it("updateCharts chama update em todos os gráficos existentes", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );
    const { buildCharts, updateCharts } = useChartsTechnical();

    buildCharts(SAMPLE_DATA);
    const instances = vi.mocked(Chart).mock.results.map((r) => r.value);
    vi.clearAllMocks();

    updateCharts([SAMPLE_DATA[0]]);

    instances.forEach((inst) => expect(inst.update).toHaveBeenCalled());
  });

  it("updateCharts não lança erro quando chamado antes de buildCharts", async () => {
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );
    const { destroyCharts, updateCharts } = useChartsTechnical();

    destroyCharts();

    expect(() => updateCharts(SAMPLE_DATA)).not.toThrow();
  });

  // ── TC01: evolução temporal exibida corretamente ────────────────────────────

  it("TC01: gráfico temporal usa tipo 'line'", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );

    useChartsTechnical().buildCharts(SAMPLE_DATA);

    // 4º gráfico (índice 3) é o temporal
    const temporalConfig = vi.mocked(Chart).mock.calls[3][1];
    expect(temporalConfig.type).toBe("line");
  });

  it("TC01: labels do gráfico temporal são ordenados cronologicamente", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );

    useChartsTechnical().buildCharts(SAMPLE_DATA);

    const labels = vi.mocked(Chart).mock.calls[3][1].data.labels as string[];
    expect(labels).toEqual(["2024-01", "2024-03"]);
  });

  it("TC01: valores temporais são a soma de horas por período", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );

    useChartsTechnical().buildCharts(SAMPLE_DATA);

    // 2024-01: 52h (Ana); 2024-03: 40+30=70h (Lucas+Pedro)
    const values = vi.mocked(Chart).mock.calls[3][1].data.datasets[0]
      .data as number[];
    expect(values).toEqual([52, 70]);
  });

  // ── TC02: responsividade a filtros ─────────────────────────────────────────

  it("TC02: updateCharts atualiza os dados do gráfico temporal com allPeriodos", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );
    const { buildCharts, updateCharts } = useChartsTechnical();

    buildCharts(SAMPLE_DATA);
    const instances = vi.mocked(Chart).mock.results.map((r) => r.value);
    vi.clearAllMocks();

    // Filtra só Cloud (2024-03), mas allPeriodos tem os 3 meses
    const cloudOnly = SAMPLE_DATA.filter((r) => r.programa === "Cloud");
    updateCharts(cloudOnly, ["2024-01", "2024-02", "2024-03"]);

    // O gráfico temporal (índice 3) deve ter os labels de allPeriodos
    expect(instances[3].data.labels).toEqual([
      "2024-01",
      "2024-02",
      "2024-03",
    ]);
    expect(instances[3].update).toHaveBeenCalled();
  });

  it("TC02: gráfico temporal chama update ao receber novos dados", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );
    const { buildCharts, updateCharts } = useChartsTechnical();

    buildCharts(SAMPLE_DATA);
    const temporalInstance = vi.mocked(Chart).mock.results[3].value;
    vi.clearAllMocks();

    updateCharts([SAMPLE_DATA[0]]);

    expect(temporalInstance.update).toHaveBeenCalledOnce();
  });

  // ── TC03: períodos sem horas registradas ───────────────────────────────────

  it("TC03: allPeriodos preenche períodos ausentes com 0", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );

    // SAMPLE_DATA tem 2024-01 e 2024-03; allPeriodos adiciona 2024-02 no meio
    useChartsTechnical().buildCharts(SAMPLE_DATA, [
      "2024-01",
      "2024-02",
      "2024-03",
    ]);

    const labels = vi.mocked(Chart).mock.calls[3][1].data.labels as string[];
    const values = vi.mocked(Chart).mock.calls[3][1].data.datasets[0]
      .data as number[];

    expect(labels).toEqual(["2024-01", "2024-02", "2024-03"]);
    expect(values[0]).toBe(52);  // 2024-01 → Ana: 52h
    expect(values[1]).toBe(0);   // 2024-02 → sem dados
    expect(values[2]).toBe(70);  // 2024-03 → Lucas + Pedro: 70h
  });

  it("TC03: updateCharts com allPeriodos preenche lacunas com 0", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );
    const { buildCharts, updateCharts } = useChartsTechnical();

    buildCharts(SAMPLE_DATA);
    const temporalInstance = vi.mocked(Chart).mock.results[3].value;
    vi.clearAllMocks();

    // Apenas Cloud (2024-03), mas o eixo X deve ter 3 meses
    const cloudOnly = SAMPLE_DATA.filter((r) => r.programa === "Cloud");
    updateCharts(cloudOnly, ["2024-01", "2024-02", "2024-03"]);

    const values = temporalInstance.data.datasets[0].data as number[];
    expect(values[0]).toBe(0);  // 2024-01 → sem dados Cloud
    expect(values[1]).toBe(0);  // 2024-02 → sem dados Cloud
    expect(values[2]).toBe(40); // 2024-03 → Lucas: 40h
  });

  it("TC03: sem allPeriodos, períodos ausentes não aparecem no gráfico", async () => {
    const { Chart } = await import("chart.js");
    const { useChartsTechnical } = await import(
      "@/composables/useChartsTechnical"
    );

    // Apenas Lucas (2024-03) — 2024-01 e 2024-03 estão em SAMPLE_DATA
    // mas sem allPeriodos, só o período de Lucas aparece
    useChartsTechnical().buildCharts([SAMPLE_DATA[0]]);

    const labels = vi.mocked(Chart).mock.calls[3][1].data.labels as string[];
    expect(labels).toEqual(["2024-03"]);
  });
});
