import { Chart, registerables } from "chart.js";
import type { CompositionData, CostEvolutionRow, DashboardSummaryRow, TopProjectRow } from "@/types/api";
import {
  FONT, MONO, css, fmtCurrency, groupBy, baseOptions, tooltipBase, COLORS,
} from "./useChartsBase";

Chart.register(...registerables);

export interface DashboardRow {
  projeto: string;
  programa: string;
  custoMateriais: number;
  custoHoras: number;
  custoTotal: number;
  periodo: string;
}

let chartCustoPrograma: Chart | null = null;
let chartComparativo:   Chart | null = null;
let chartTemporal:      Chart | null = null;
let chartTopProjetos:   Chart | null = null;
let chartCostEvolution: Chart | null = null;

function destroyAll() {
  [
    chartCustoPrograma,
    chartComparativo,
    chartTemporal,
    chartTopProjetos,
  ].forEach((c) => c?.destroy());
  chartCustoPrograma =
    chartComparativo =
    chartTemporal =
    chartTopProjetos =
    chartCostEvolution =
      null;
}

function buildCharts(
  data: DashboardRow[],
  composition?: CompositionData,
  topProjects?: TopProjectRow[],
  summary?: DashboardSummaryRow[],
  evolution?: CostEvolutionRow[],
) {
  destroyAll();
  const gridColor  = css("--border");
  const textColor  = css("--text3");
  const text2Color = css("--text2");

  // 1. Custo por Programa — uses /dashboard/summary/ when available
  const porPrograma: [string, number][] = summary && summary.length > 0
    ? summary.slice(0, 8).map((r) => [r.programa, r.custo_total])
    : groupBy(data, (r) => r.programa, (r) => r.custoTotal).slice(0, 8);

  const ctxProg = (
    document.getElementById("chartCustoPrograma") as HTMLCanvasElement
  )?.getContext("2d");

  if (ctxProg) {
    chartCustoPrograma = new Chart(ctxProg, {
      type: "bar",
      data: {
        labels: porPrograma.map(([l]) => l),
        datasets: [
          {
            data:            porPrograma.map(([, v]) => v),
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
            ticks: {
              color: text2Color,
              font:  { family: MONO, size: 11 },
              callback: (v) => fmtCurrency(v as number),
            },
          },
          y: {
            grid:  { display: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
        },
      },
    });
  }

  // 2. Composição: Materiais vs Horas Técnicas — doughnut, blue + green
  const totalMat   = composition?.custo_materiais ?? data.reduce((s, r) => s + r.custoMateriais, 0);
  const totalHoras = composition?.custo_horas     ?? data.reduce((s, r) => s + r.custoHoras,     0);
  const totalGeral = totalMat + totalHoras;
  const pctMat     = totalGeral > 0 ? +((totalMat   / totalGeral) * 100).toFixed(1) : 0;
  const pctHoras   = totalGeral > 0 ? +((totalHoras / totalGeral) * 100).toFixed(1) : 0;

  const ctxComp = (
    document.getElementById("chartComparativo") as HTMLCanvasElement
  )?.getContext("2d");

  if (ctxComp) {
    chartComparativo = new Chart(ctxComp, {
      type: "doughnut",
      data: {
        labels: ["Materiais", "Horas Técnicas"],
        datasets: [
          {
            data:            [pctMat, pctHoras],
            backgroundColor: ["rgba(77,143,255,0.85)", "rgba(45,212,160,0.85)"],
            borderColor:     ["rgba(77,143,255,1)",    "rgba(45,212,160,1)"],
            borderWidth:  2,
            hoverOffset:  8,
          },
        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        cutout:              "55%",
        animation:           { duration: 500 },
        plugins: {
          legend: {
            display:  true,
            position: "bottom",
            labels: {
              color:           css("--text"),
              font:            { family: FONT, size: 13 },
              padding:         16,
              usePointStyle:   true,
              pointStyle:      "circle",
              pointStyleWidth: 12,
              generateLabels: (chart) => {
                const dataset    = chart.data.datasets[0];
                const labelColor = css("--text");
                return (chart.data.labels as string[]).map((label, i) => ({
                  text:        `${label}  ${Number(dataset.data[i])}%`,
                  fillStyle:   (dataset.backgroundColor as string[])[i],
                  strokeStyle: (dataset.backgroundColor as string[])[i],
                  fontColor:   labelColor,
                  lineWidth:   0,
                  hidden:      false,
                  index:       i,
                }));
              },
            },
          },
          tooltip: {
            ...tooltipBase(),
            callbacks: {
              label: (ctx) => {
                const v     = Number(ctx.parsed);
                const total = (ctx.dataset.data as number[]).reduce(
                  (a: number, b: number) => a + b,
                  0,
                );
                const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
                return ` ${ctx.label}: ${fmtCurrency(v)} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  // 3. Evolução Temporal — bar chart, purple
  const temporalMap: Record<string, number> = {};
  data.forEach((r) => {
    temporalMap[r.periodo] = (temporalMap[r.periodo] || 0) + r.custoTotal;
  });
  const periodos = Object.keys(temporalMap).sort((a, b) => a.localeCompare(b));

  const ctxT = (
    document.getElementById("chartTemporalDash") as HTMLCanvasElement
  )?.getContext("2d");

  if (ctxT) {
    chartTemporal = new Chart(ctxT, {
      type: "bar",
      data: {
        labels: periodos,
        datasets: [
          {
            data:            periodos.map((p) => temporalMap[p]),
            backgroundColor: "rgba(155,127,255,0.85)",
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
      },
    });
  }

  // 4. Top 10 Projetos por Custo — horizontal bar, amber
  const topProjetos: [string, number][] = topProjects
    ? topProjects.map((r) => [r.project_name, r.total_cost])
    : groupBy(data, (r) => r.projeto, (r) => r.custoTotal).slice(0, 10);

  const ctxTP = (
    document.getElementById("chartTopProjetos") as HTMLCanvasElement
  )?.getContext("2d");

  if (ctxTP) {
    chartTopProjetos = new Chart(ctxTP, {
      type: "bar",
      data: {
        labels: topProjetos.map(([l]) => l),
        datasets: [
          {
            data:            topProjetos.map(([, v]) => v),
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
      },
    });
  }

  // 5. Cost Evolution — full-width line chart
  const evoLabels = evolution ? evolution.map((r) => r.period)           : [];
  const evoTotal  = evolution ? evolution.map((r) => r.total_cost)       : [];
  const evoMat    = evolution ? evolution.map((r) => r.materials_cost)   : [];
  const evoHrs    = evolution ? evolution.map((r) => r.hours_cost)       : [];

  const ctxEvo = (
    document.getElementById("chartCostEvolution") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxEvo) {
    chartCostEvolution = new Chart(ctxEvo, {
      type: "line",
      data: {
        labels: evoLabels,
        datasets: [
          {
            label:                "Custo Total",
            data:                 evoTotal,
            borderColor:          COLORS.amberSolid,
            backgroundColor:      "rgba(245,158,11,0.08)",
            borderWidth:          2.5,
            pointBackgroundColor: COLORS.amberSolid,
            pointBorderColor:     COLORS.amberSolid,
            pointBorderWidth:     0,
            pointRadius:          5,
            pointHoverRadius:     7,
            fill:                 true,
            tension:              0.35,
          },
          {
            label:                "Materiais",
            data:                 evoMat,
            borderColor:          COLORS.blueSolid,
            backgroundColor:      "transparent",
            borderWidth:          1.5,
            borderDash:           [5, 3],
            pointBackgroundColor: COLORS.blueSolid,
            pointBorderColor:     COLORS.blueSolid,
            pointBorderWidth:     0,
            pointRadius:          4,
            pointHoverRadius:     6,
            fill:                 false,
            tension:              0.35,
          },
          {
            label:                "Horas Técnicas",
            data:                 evoHrs,
            borderColor:          COLORS.greenSolid,
            backgroundColor:      "transparent",
            borderWidth:          1.5,
            borderDash:           [5, 3],
            pointBackgroundColor: COLORS.greenSolid,
            pointBorderColor:     COLORS.greenSolid,
            pointBorderWidth:     0,
            pointRadius:          4,
            pointHoverRadius:     6,
            fill:                 false,
            tension:              0.35,
          },
        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 500 },
        interaction:         { mode: "index", intersect: false },
        plugins: {
          legend: {
            display:  true,
            position: "top",
            align:    "end",
            labels: {
              color:           text2Color,
              font:            { family: FONT, size: 11 },
              usePointStyle:   true,
              pointStyleWidth: 10,
              padding:         16,
            },
          },
          tooltip: {
            ...tooltipBase(),
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${fmtCurrency(ctx.parsed.y ?? 0)}`,
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
            grid:   { color: gridColor },
            border: { display: false },
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

function updateCharts(
  data: DashboardRow[],
  composition?: CompositionData,
  topProjects?: TopProjectRow[],
  summary?: DashboardSummaryRow[],
  evolution?: CostEvolutionRow[],
) {
  const porPrograma: [string, number][] = summary && summary.length > 0
    ? summary.slice(0, 8).map((r) => [r.programa, r.custo_total])
    : groupBy(data, (r) => r.programa, (r) => r.custoTotal).slice(0, 8);

  if (chartCustoPrograma) {
    chartCustoPrograma.data.labels           = porPrograma.map(([l]) => l);
    chartCustoPrograma.data.datasets[0].data = porPrograma.map(([, v]) => v);
    chartCustoPrograma.update();
  }

  if (chartComparativo) {
    const totalMat   = composition?.custo_materiais ?? data.reduce((s, r) => s + r.custoMateriais, 0);
    const totalHoras = composition?.custo_horas     ?? data.reduce((s, r) => s + r.custoHoras,     0);
    const totalGeral = totalMat + totalHoras;
    const pctMat     = totalGeral > 0 ? +((totalMat   / totalGeral) * 100).toFixed(1) : 0;
    const pctHoras   = totalGeral > 0 ? +((totalHoras / totalGeral) * 100).toFixed(1) : 0;
    chartComparativo.data.datasets[0].data = [pctMat, pctHoras];
    chartComparativo.update();
  }

  const temporalMap: Record<string, number> = {};
  data.forEach((r) => {
    temporalMap[r.periodo] = (temporalMap[r.periodo] || 0) + r.custoTotal;
  });
  const periodos = Object.keys(temporalMap).sort((a, b) => a.localeCompare(b));

  if (chartTemporal) {
    chartTemporal.data.labels           = periodos;
    chartTemporal.data.datasets[0].data = periodos.map((p) => temporalMap[p]);
    chartTemporal.update();
  }

  const topProjetos: [string, number][] = topProjects
    ? topProjects.map((r) => [r.project_name, r.total_cost])
    : groupBy(data, (r) => r.projeto, (r) => r.custoTotal).slice(0, 10);

  if (chartTopProjetos) {
    chartTopProjetos.data.labels           = topProjetos.map(([l]) => l);
    chartTopProjetos.data.datasets[0].data = topProjetos.map(([, v]) => v);
    chartTopProjetos.update();
  }

  if (chartCostEvolution && evolution) {
    chartCostEvolution.data.labels           = evolution.map((r) => r.period);
    chartCostEvolution.data.datasets[0].data = evolution.map((r) => r.total_cost);
    chartCostEvolution.data.datasets[1].data = evolution.map((r) => r.materials_cost);
    chartCostEvolution.data.datasets[2].data = evolution.map((r) => r.hours_cost);
    chartCostEvolution.update();
  }
}

export function useChartsDashboard() {
  return { buildCharts, updateCharts, destroyCharts: destroyAll };
}
