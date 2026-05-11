// src/composables/useChartsTechnical.ts
// Chart.js composable for TechnicalHours — matches exact visual style of Materiais charts

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface HoraRow {
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

// ─── Shared chart config helpers ──────────────────────────────────────────────
const FONT = "'IBM Plex Sans', sans-serif";
const MONO = "'IBM Plex Mono', monospace";

const gridColor = "rgba(42,47,69,0.8)"; // --border
const textColor = "#555d7a"; // --text3
const text2Color = "#8b92aa"; // --text2

const baseScales = (axis: "x" | "y" = "x") => ({
  x: {
    grid: {
      color: axis === "x" ? gridColor : "transparent",
      drawBorder: false,
    },
    ticks: { color: textColor, font: { family: MONO, size: 11 } },
  },
  y: {
    grid: {
      color: axis === "y" ? gridColor : "transparent",
      drawBorder: false,
    },
    ticks: {
      color: text2Color,
      font: { family: FONT, size: 11 },
      maxTicksLimit: 8,
    },
  },
});

const baseOptions = (indexAxis: "x" | "y" = "y") => ({
  indexAxis,
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500, easing: "easeOutQuart" as const },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1c2030",
      borderColor: "#2a2f45",
      borderWidth: 0,
      titleColor: "#e2e6f0",
      bodyColor: "#8b92aa",
      titleFont: { family: FONT, size: 12 },
      bodyFont: { family: MONO, size: 12 },
      padding: 10,
    },
  },
});

// ─── Chart instances ──────────────────────────────────────────────────────────
let chartHorasProjeto: Chart | null = null;
let chartCustoProjeto: Chart | null = null;
let chartCustoColaborador: Chart | null = null;
let chartTemporal: Chart | null = null;

function destroyAll() {
  [
    chartHorasProjeto,
    chartCustoProjeto,
    chartCustoColaborador,
    chartTemporal,
  ].forEach((c) => c?.destroy());
  chartHorasProjeto =
    chartCustoProjeto =
    chartCustoColaborador =
    chartTemporal =
      null;
}

// ─── Aggregation helpers ──────────────────────────────────────────────────────
function groupBy<T>(
  data: T[],
  keyFn: (r: T) => string,
  valFn: (r: T) => number,
) {
  const map: Record<string, number> = {};
  data.forEach((r) => {
    const k = keyFn(r);
    map[k] = (map[k] || 0) + valFn(r);
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function fmtR$(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

// ─── Build charts ─────────────────────────────────────────────────────────────
function buildCharts(data: HoraRow[]) {
  destroyAll();

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
            data: horasProjeto.map(([, v]) => v),
            backgroundColor: "rgba(77,143,255,0.85)",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...baseOptions("y"),
        scales: {
          ...baseScales("x"),
          x: {
            grid: { color: gridColor, drawBorder: false },
            ticks: { color: textColor, font: { family: MONO, size: 11 } },
          },
          y: {
            grid: { display: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
        },
        plugins: {
          ...baseOptions("y").plugins,
          tooltip: {
            ...baseOptions("y").plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.x}h`,
            },
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
            data: custoProjeto.map(([, v]) => v),
            backgroundColor: "rgba(45,212,160,0.85)",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...baseOptions("y"),
        scales: {
          x: {
            grid: { color: gridColor, drawBorder: false },
            ticks: {
              color: textColor,
              font: { family: MONO, size: 11 },
              callback: (v) => fmtR$(v as number),
            },
          },
          y: {
            grid: { display: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
        },
        plugins: {
          ...baseOptions("y").plugins,
          tooltip: {
            ...baseOptions("y").plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${fmtR$(ctx.parsed.x)}`,
            },
          },
        },
      },
    });
  }

  // 3. Top 10 - Custo por Colaborador — horizontal bars, amber
  const custoColab = groupBy(
    data,
    (r) => r.colaborador,
    (r) => r.custoTotal,
  ).slice(0, 10);

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
            data: custoColab.map(([, v]) => v),
            backgroundColor: "rgba(245,166,35,0.85)",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...baseOptions("y"),
        scales: {
          x: {
            grid: { color: gridColor, drawBorder: false },
            ticks: {
              color: textColor,
              font: { family: MONO, size: 11 },
              callback: (v) => fmtR$(v as number),
            },
          },
          y: {
            grid: { display: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
        },
        plugins: {
          ...baseOptions("y").plugins,
          tooltip: {
            ...baseOptions("y").plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${fmtR$(ctx.parsed.x)}`,
            },
          },
        },
      },
    });
  }

  // 4. Evolução Temporal das Horas — line chart, purple
  const temporalMap: Record<string, number> = {};
  data.forEach((r) => {
    temporalMap[r.periodo] = (temporalMap[r.periodo] || 0) + r.horas;
  });
  const periodos = Object.keys(temporalMap).sort();
  const horasPorPeriodo = periodos.map((p) => temporalMap[p]);

  const ctxT = (
    document.getElementById("chartTemporal") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxT) {
    chartTemporal = new Chart(ctxT, {
      type: "line",
      data: {
        labels: periodos,
        datasets: [
          {
            data: horasPorPeriodo,
            borderColor: "#9b7fff",
            backgroundColor: "rgba(155,127,255,0.12)",
            borderWidth: 2.5,
            pointBackgroundColor: "#9b7fff",
            pointBorderColor: "#141720",
            pointBorderWidth: 0,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1c2030",
            borderColor: "#2a2f45",
            borderWidth: 0,
            titleColor: "#e2e6f0",
            bodyColor: "#8b92aa",
            titleFont: { family: FONT, size: 12 },
            bodyFont: { family: MONO, size: 12 },
            padding: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y}h`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: gridColor, drawBorder: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
          y: {
            grid: { color: gridColor, drawBorder: false },
            ticks: {
              color: textColor,
              font: { family: MONO, size: 11 },
              callback: (v) => `${v}`,
            },
          },
        },
      },
    });
  }
}

// ─── Update charts (called on filter change) ──────────────────────────────────
function updateCharts(data: HoraRow[]) {
  // Horas por projeto
  const horasProjeto = groupBy(
    data,
    (r) => `${r.programa} - ${r.projeto}`,
    (r) => r.horas,
  ).slice(0, 8);
  if (chartHorasProjeto) {
    chartHorasProjeto.data.labels = horasProjeto.map(([l]) => l);
    chartHorasProjeto.data.datasets[0].data = horasProjeto.map(([, v]) => v);
    chartHorasProjeto.update();
  }

  // Custo por projeto
  const custoProjeto = groupBy(
    data,
    (r) => `${r.programa} - ${r.projeto}`,
    (r) => r.custoTotal,
  ).slice(0, 8);
  if (chartCustoProjeto) {
    chartCustoProjeto.data.labels = custoProjeto.map(([l]) => l);
    chartCustoProjeto.data.datasets[0].data = custoProjeto.map(([, v]) => v);
    chartCustoProjeto.update();
  }

  // Custo por colaborador
  const custoColab = groupBy(
    data,
    (r) => r.colaborador,
    (r) => r.custoTotal,
  ).slice(0, 10);
  if (chartCustoColaborador) {
    chartCustoColaborador.data.labels = custoColab.map(([l]) => l);
    chartCustoColaborador.data.datasets[0].data = custoColab.map(([, v]) => v);
    chartCustoColaborador.update();
  }

  // Temporal
  const temporalMap: Record<string, number> = {};
  data.forEach((r) => {
    temporalMap[r.periodo] = (temporalMap[r.periodo] || 0) + r.horas;
  });
  const periodos = Object.keys(temporalMap).sort();
  if (chartTemporal) {
    chartTemporal.data.labels = periodos;
    chartTemporal.data.datasets[0].data = periodos.map((p) => temporalMap[p]);
    chartTemporal.update();
  }
}

// ─── Composable export ────────────────────────────────────────────────────────
export function useChartsTechnical() {
  return { buildCharts, updateCharts, destroyCharts: destroyAll };
}
