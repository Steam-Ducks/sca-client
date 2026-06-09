import { Chart, registerables } from "chart.js";
import type { CostEvolutionRow } from "@/types/api";
import {
  FONT, MONO, css, fmtCurrency, groupBy, baseOptions, tooltipBase, COLORS,
} from "./useChartsBase";

Chart.register(...registerables);

export interface ConsolidadoRow {
  id: number;
  projeto: string;
  programa: string;
  custoMateriais: number;
  custoHoras: number;
  custoTotal: number;
  qtdMateriais: number;
  totalHoras: number;
  periodo: string;
  status: string;
}

let chartDistribuicao: Chart | null = null;
let chartPorPrograma: Chart | null = null;
let chartTemporal: Chart | null = null;
let chartTopCustos: Chart | null = null;

function destroyAll() {
  [chartDistribuicao, chartPorPrograma, chartTemporal, chartTopCustos].forEach(
    (c) => c?.destroy(),
  );
  chartDistribuicao = chartPorPrograma = chartTemporal = chartTopCustos = null;
}

function buildCharts(data: ConsolidadoRow[], evolution?: CostEvolutionRow[]) {
  destroyAll();
  const gridColor  = css("--border");
  const textColor  = css("--text3");
  const text2Color = css("--text2");

  // 1. Composição de Custos — doughnut Materiais vs Horas Técnicas
  const totalMat   = data.reduce((s, r) => s + r.custoMateriais, 0);
  const totalHoras = data.reduce((s, r) => s + r.custoHoras, 0);
  const totalGeral = totalMat + totalHoras;
  const pctMat     = totalGeral > 0 ? +((totalMat   / totalGeral) * 100).toFixed(1) : 0;
  const pctHoras   = totalGeral > 0 ? +((totalHoras / totalGeral) * 100).toFixed(1) : 0;

  const ctxDist = (
    document.getElementById("chartDistribuicao") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxDist) {
    chartDistribuicao = new Chart(ctxDist, {
      type: "doughnut",
      data: {
        labels: ["Materiais", "Horas Técnicas"],
        datasets: [
          {
            data: [pctMat, pctHoras],
            backgroundColor: ["rgba(77,143,255,0.85)", "rgba(45,212,160,0.85)"],
            borderColor:     ["rgba(77,143,255,1)",    "rgba(45,212,160,1)"],
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "55%",
        animation: { duration: 500 },
        layout: { padding: { top: 0, bottom: 4 } },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: css("--text"),
              font: { family: FONT, size: 12 },
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
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
            ...tooltipBase(0),
            callbacks: {
              label: (ctx) => {
                const pct = ctx.parsed;
                const val = ctx.dataIndex === 0 ? totalMat : totalHoras;
                return ` ${ctx.label}: ${pct}% (${fmtCurrency(val)})`;
              },
            },
          },
        },
      },
    });
  }

  // 2. Custo Total por Programa — vertical bar, amber
  const porPrograma = groupBy(data, (r) => r.programa, (r) => r.custoTotal).slice(0, 8);
  const ctxProg = (
    document.getElementById("chartPorPrograma") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxProg) {
    chartPorPrograma = new Chart(ctxProg, {
      type: "bar",
      data: {
        labels: porPrograma.map(([l]) => l),
        datasets: [
          {
            data:            porPrograma.map(([, v]) => v),
            backgroundColor: COLORS.amber,
            borderRadius:    4,
            borderSkipped:   false,
          },
        ],
      },
      options: {
        ...baseOptions("x", 0),
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
          y: {
            grid: { color: gridColor },
            border: { display: false },
            ticks: {
              color: textColor,
              font: { family: MONO, size: 11 },
              callback: (v) => fmtCurrency(v as number),
            },
          },
        },
      },
    });
  }

  // 3. Evolução Mensal Consolidada — line chart from /dashboard/cost-evolution/
  const evoLabels = evolution ? evolution.map((r) => r.period)      : [];
  const evoData   = evolution ? evolution.map((r) => r.total_cost)  : [];

  const ctxT = (
    document.getElementById("chartTemporalCons") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxT) {
    chartTemporal = new Chart(ctxT, {
      type: "line",
      data: {
        labels: evoLabels,
        datasets: [
          {
            data:                evoData,
            borderColor:         COLORS.purpleSolid,
            backgroundColor:     "rgba(155,127,255,0.12)",
            borderWidth:         2.5,
            pointBackgroundColor: COLORS.purpleSolid,
            pointBorderColor:    COLORS.purpleSolid,
            pointBorderWidth:    0,
            pointRadius:         5,
            pointHoverRadius:    7,
            fill:                true,
            tension:             0.35,
          },
        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 500 },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipBase(0),
            callbacks: { label: (ctx) => ` ${fmtCurrency(ctx.parsed.y ?? 0)}` },
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
              color: textColor,
              font:  { family: MONO, size: 11 },
              callback: (v) => fmtCurrency(v as number),
            },
          },
        },
      },
    });
  }

  // 4. Top 10 — Maior Custo Total — horizontal bar, red
  const topCustos = groupBy(data, (r) => r.projeto, (r) => r.custoTotal).slice(0, 10);
  const ctxTC = (
    document.getElementById("chartTopCustos") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxTC) {
    chartTopCustos = new Chart(ctxTC, {
      type: "bar",
      data: {
        labels: topCustos.map(([l]) => l),
        datasets: [
          {
            data:            topCustos.map(([, v]) => v),
            backgroundColor: COLORS.red,
            borderRadius:    4,
            borderSkipped:   false,
          },
        ],
      },
      options: {
        ...baseOptions("y", 0),
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
}

function updateCharts(data: ConsolidadoRow[], evolution?: CostEvolutionRow[]) {
  if (chartDistribuicao) {
    const updTotalMat   = data.reduce((s, r) => s + r.custoMateriais, 0);
    const updTotalHoras = data.reduce((s, r) => s + r.custoHoras, 0);
    const updTotal      = updTotalMat + updTotalHoras;
    const updPctMat     = updTotal > 0 ? +((updTotalMat   / updTotal) * 100).toFixed(1) : 0;
    const updPctHoras   = updTotal > 0 ? +((updTotalHoras / updTotal) * 100).toFixed(1) : 0;
    chartDistribuicao.data.datasets[0].data = [updPctMat, updPctHoras];
    chartDistribuicao.update();
  }

  const porPrograma = groupBy(data, (r) => r.programa, (r) => r.custoTotal).slice(0, 8);
  if (chartPorPrograma) {
    chartPorPrograma.data.labels           = porPrograma.map(([l]) => l);
    chartPorPrograma.data.datasets[0].data = porPrograma.map(([, v]) => v);
    chartPorPrograma.update();
  }

  if (chartTemporal && evolution) {
    chartTemporal.data.labels           = evolution.map((r) => r.period);
    chartTemporal.data.datasets[0].data = evolution.map((r) => r.total_cost);
    chartTemporal.update();
  }

  const topCustos = groupBy(data, (r) => r.projeto, (r) => r.custoTotal).slice(0, 10);
  if (chartTopCustos) {
    chartTopCustos.data.labels           = topCustos.map(([l]) => l);
    chartTopCustos.data.datasets[0].data = topCustos.map(([, v]) => v);
    chartTopCustos.update();
  }
}

export function useChartsConsolidado() {
  return { buildCharts, updateCharts, destroyCharts: destroyAll };
}
