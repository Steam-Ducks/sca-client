import { Chart, registerables } from "chart.js";
import type { HoraRow } from "@/types/api";
import {
  FONT, MONO, css, fmtCurrency, groupBy, baseOptions, tooltipBase, COLORS,
} from "./useChartsBase";

Chart.register(...registerables);

export interface TemporalPoint {
  periodo: string;
  total_horas: number;
  total_custo: number;
}

// ─── Chart instances ──────────────────────────────────────────────────────────
let chartHorasProjeto:    Chart | null = null;
let chartCustoProjeto:    Chart | null = null;
let chartCustoColaborador: Chart | null = null;
let chartTemporal:        Chart | null = null;

function destroyAll() {
  [chartHorasProjeto, chartCustoProjeto, chartCustoColaborador, chartTemporal].forEach(
    (c) => c?.destroy(),
  );
  chartHorasProjeto =
    chartCustoProjeto =
    chartCustoColaborador =
    chartTemporal =
      null;
}

// ─── Aggregation helper ───────────────────────────────────────────────────────
function aggregateTemporal(data: HoraRow[], allPeriodos: string[]): TemporalPoint[] {
  const map: Record<string, TemporalPoint> = {};
  for (const row of data) {
    if (!map[row.periodo]) map[row.periodo] = { periodo: row.periodo, total_horas: 0, total_custo: 0 };
    map[row.periodo].total_horas += row.horas;
    map[row.periodo].total_custo += row.custoTotal;
  }
  const labels = allPeriodos.length > 0
    ? allPeriodos
    : [...new Set(data.map((r) => r.periodo))].sort();
  return labels.map((p) => map[p] ?? { periodo: p, total_horas: 0, total_custo: 0 });
}

// ─── Build charts ─────────────────────────────────────────────────────────────
function buildCharts(data: HoraRow[], allPeriodos: string[] = []) {
  const temporalData = aggregateTemporal(data, allPeriodos);
  destroyAll();
  const gridColor  = css("--border");
  const textColor  = css("--text3");
  const text2Color = css("--text2");

  // 1. Total de Horas por Projeto — horizontal bars, blue
  const horasProjeto = groupBy(
    data,
    (r) => `${r.programa} - ${r.projeto}`,
    (r) => r.horas,
  ).slice(0, 8);

  const ctxHP = (
    document.getElementById("chartHorasProjeto") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxHP) {
    chartHorasProjeto = new Chart(ctxHP, {
      type: "bar",
      data: {
        labels: horasProjeto.map(([l]) => l),
        datasets: [
          {
            data:            horasProjeto.map(([, v]) => v),
            backgroundColor: COLORS.blue,
            borderRadius:    4,
            borderSkipped:   false,
          },
        ],
      },
      options: {
        ...baseOptions("y"),
        scales: {
          x: {
            grid:   { color: gridColor },
            border: { display: false },
            ticks:  { color: textColor, font: { family: MONO, size: 11 } },
          },
          y: {
            grid:  { display: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
        },
        plugins: {
          ...baseOptions("y").plugins,
          tooltip: {
            ...tooltipBase(),
            callbacks: { label: (ctx) => ` ${ctx.parsed.x}h` },
          },
        },
      },
    });
  }

  // 2. Custo de Horas por Projeto — horizontal bars, green
  const custoProjeto = groupBy(
    data,
    (r) => `${r.programa} - ${r.projeto}`,
    (r) => r.custoTotal,
  ).slice(0, 8);

  const ctxCP = (
    document.getElementById("chartCustoProjeto") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxCP) {
    chartCustoProjeto = new Chart(ctxCP, {
      type: "bar",
      data: {
        labels: custoProjeto.map(([l]) => l),
        datasets: [
          {
            data:            custoProjeto.map(([, v]) => v),
            backgroundColor: COLORS.green,
            borderRadius:    4,
            borderSkipped:   false,
          },
        ],
      },
      options: {
        ...baseOptions("y"),
        scales: {
          x: {
            grid:   { color: gridColor },
            border: { display: false },
            ticks: {
              color: textColor,
              font:  { family: MONO, size: 11 },
              callback: (v) => fmtCurrency(v as number),
            },
          },
          y: {
            grid:  { display: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
        },
        plugins: {
          ...baseOptions("y").plugins,
          tooltip: {
            ...tooltipBase(),
            callbacks: { label: (ctx) => ` ${fmtCurrency(ctx.parsed.x ?? 0)}` },
          },
        },
      },
    });
  }

  // 3. Top 10 - Custo por Colaborador — horizontal bars, amber
  const custoColab = groupBy(data, (r) => r.colaborador, (r) => r.custoTotal).slice(0, 10);

  const ctxCC = (
    document.getElementById("chartCustoColaborador") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxCC) {
    chartCustoColaborador = new Chart(ctxCC, {
      type: "bar",
      data: {
        labels: custoColab.map(([l]) => l),
        datasets: [
          {
            data:            custoColab.map(([, v]) => v),
            backgroundColor: COLORS.amber,
            borderRadius:    4,
            borderSkipped:   false,
          },
        ],
      },
      options: {
        ...baseOptions("y"),
        scales: {
          x: {
            grid:   { color: gridColor },
            border: { display: false },
            ticks: {
              color: textColor,
              font:  { family: MONO, size: 11 },
              callback: (v) => fmtCurrency(v as number),
            },
          },
          y: {
            grid:  { display: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
        },
        plugins: {
          ...baseOptions("y").plugins,
          tooltip: {
            ...tooltipBase(),
            callbacks: { label: (ctx) => ` ${fmtCurrency(ctx.parsed.x ?? 0)}` },
          },
        },
      },
    });
  }

  // 4. Evolução Temporal — dual-line: horas (purple, left) + custo (blue, right)
  const ctxT = (
    document.getElementById("chartTemporal") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxT) {
    chartTemporal = new Chart(ctxT, {
      type: "line",
      data: {
        labels: temporalData.map((p) => p.periodo),
        datasets: [
          {
            label:                "Horas",
            data:                 temporalData.map((p) => p.total_horas),
            borderColor:          COLORS.purpleSolid,
            backgroundColor:      "rgba(155,127,255,0.12)",
            borderWidth:          2.5,
            pointBackgroundColor: COLORS.purpleSolid,
            pointBorderColor:     "#141720",
            pointBorderWidth:     0,
            pointRadius:          5,
            pointHoverRadius:     7,
            fill:                 true,
            tension:              0.35,
            yAxisID:              "y",
          },
          {
            label:                "Custo (R$)",
            data:                 temporalData.map((p) => p.total_custo),
            borderColor:          COLORS.blueSolid,
            backgroundColor:      "rgba(77,143,255,0.06)",
            borderWidth:          2,
            pointBackgroundColor: COLORS.blueSolid,
            pointBorderColor:     "#141720",
            pointBorderWidth:     0,
            pointRadius:          4,
            pointHoverRadius:     6,
            fill:                 false,
            tension:              0.35,
            yAxisID:              "y1",
          },
        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 500 },
        plugins: {
          legend: {
            display: true,
            labels:  { color: text2Color, font: { family: FONT, size: 11 }, boxWidth: 12 },
          },
          tooltip: {
            ...tooltipBase(),
            callbacks: {
              label: (ctx) =>
                ctx.datasetIndex === 0
                  ? ` ${(ctx.parsed.y as number).toFixed(2)}h`
                  : ` ${fmtCurrency(ctx.parsed.y as number)}`,
            },
          },
        },
        scales: {
          x: {
            grid:   { color: gridColor },
            border: { display: false },
            ticks:  { color: text2Color, font: { family: FONT, size: 11 } },
          },
          y: {
            position: "left",
            grid:     { color: gridColor },
            border:   { display: false },
            ticks: {
              color: textColor,
              font:  { family: MONO, size: 11 },
              callback: (v) => `${v}h`,
            },
          },
          y1: {
            position: "right",
            grid:     { drawOnChartArea: false },
            border:   { display: false },
            ticks: {
              color: text2Color,
              font:  { family: MONO, size: 11 },
              callback: (v) => fmtCurrency(v as number),
            },
          },
        },
      },
    });
  }
}

// ─── Update charts (called on filter change) ──────────────────────────────────
function updateCharts(data: HoraRow[], allPeriodos: string[] = []) {
  const temporalData = aggregateTemporal(data, allPeriodos);
  const horasProjeto = groupBy(
    data,
    (r) => `${r.programa} - ${r.projeto}`,
    (r) => r.horas,
  ).slice(0, 8);
  if (chartHorasProjeto) {
    chartHorasProjeto.data.labels           = horasProjeto.map(([l]) => l);
    chartHorasProjeto.data.datasets[0].data = horasProjeto.map(([, v]) => v);
    chartHorasProjeto.update();
  }

  const custoProjeto = groupBy(
    data,
    (r) => `${r.programa} - ${r.projeto}`,
    (r) => r.custoTotal,
  ).slice(0, 8);
  if (chartCustoProjeto) {
    chartCustoProjeto.data.labels           = custoProjeto.map(([l]) => l);
    chartCustoProjeto.data.datasets[0].data = custoProjeto.map(([, v]) => v);
    chartCustoProjeto.update();
  }

  const custoColab = groupBy(data, (r) => r.colaborador, (r) => r.custoTotal).slice(0, 10);
  if (chartCustoColaborador) {
    chartCustoColaborador.data.labels           = custoColab.map(([l]) => l);
    chartCustoColaborador.data.datasets[0].data = custoColab.map(([, v]) => v);
    chartCustoColaborador.update();
  }

  if (chartTemporal) {
    chartTemporal.data.labels           = temporalData.map((p) => p.periodo);
    chartTemporal.data.datasets[0].data = temporalData.map((p) => p.total_horas);
    if (chartTemporal.data.datasets[1]) {
      chartTemporal.data.datasets[1].data = temporalData.map((p) => p.total_custo);
    }
    chartTemporal.update();
  }
}

// ─── Composable export ────────────────────────────────────────────────────────
export function useChartsTechnical() {
  return { buildCharts, updateCharts, destroyCharts: destroyAll };
}
