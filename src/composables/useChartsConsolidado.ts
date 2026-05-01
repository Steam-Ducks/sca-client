import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const FONT = "'IBM Plex Sans', sans-serif";
const MONO = "'IBM Plex Mono', monospace";

const gridColor = "rgba(42,47,69,0.8)";
const textColor = "#555d7a";
const text2Color = "#8b92aa";

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

function fmtR$(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

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

function destroyAll() {
  [chartDistribuicao, chartPorPrograma, chartTemporal, chartTopCustos].forEach(
    (c) => c?.destroy(),
  );
  chartDistribuicao = chartPorPrograma = chartTemporal = chartTopCustos = null;
}

function buildCharts(data: ConsolidadoRow[]) {
  destroyAll();

  // 1. Composição de Custos — doughnut Materiais vs Horas Técnicas
  const totalMat = data.reduce((s, r) => s + r.custoMateriais, 0);
  const totalHoras = data.reduce((s, r) => s + r.custoHoras, 0);
  const totalGeral = totalMat + totalHoras;
  const pctMat = totalGeral > 0 ? +((totalMat / totalGeral) * 100).toFixed(1) : 0;
  const pctHoras = totalGeral > 0 ? +((totalHoras / totalGeral) * 100).toFixed(1) : 0;

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
            borderColor: ["rgba(77,143,255,1)", "rgba(45,212,160,1)"],
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
              color: text2Color,
              font: { family: FONT, size: 12 },
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
              pointStyleWidth: 12,
              generateLabels: (chart) => {
                const dataset = chart.data.datasets[0];
                return (chart.data.labels as string[]).map((label, i) => ({
                  text: `${label}  ${dataset.data[i]}%`,
                  fillStyle: (dataset.backgroundColor as string[])[i],
                  strokeStyle: (dataset.backgroundColor as string[])[i],
                  lineWidth: 0,
                  hidden: false,
                  index: i,
                }));
              },
            },
          },
          tooltip: {
            ...baseOptions().plugins?.tooltip,
            callbacks: {
              label: (ctx) => {
                const pct = ctx.parsed;
                const val = ctx.dataIndex === 0 ? totalMat : totalHoras;
                return ` ${ctx.label}: ${pct}% (${fmtR$(val)})`;
              },
            },
          },
        },
      },
    });
  }

  // 2. Custo Total por Programa — vertical bar, amber
  const porPrograma = groupBy(
    data,
    (r) => r.programa,
    (r) => r.custoTotal,
  ).slice(0, 8);
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
            data: porPrograma.map(([, v]) => v),
            backgroundColor: "rgba(245,166,35,0.85)",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...baseOptions("x"),
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
          y: {
            grid: { color: gridColor, drawBorder: false },
            ticks: {
              color: textColor,
              font: { family: MONO, size: 11 },
              callback: (v) => fmtR$(v as number),
            },
          },
        },
      },
    });
  }

  // 3. Evolução Mensal Consolidada — line chart, purple
  const temporalMap: Record<string, number> = {};
  data.forEach((r) => {
    temporalMap[r.periodo] = (temporalMap[r.periodo] || 0) + r.custoTotal;
  });
  const periodos = Object.keys(temporalMap).sort();

  const ctxT = (
    document.getElementById("chartTemporalCons") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxT) {
    chartTemporal = new Chart(ctxT, {
      type: "line",
      data: {
        labels: periodos,
        datasets: [
          {
            data: periodos.map((p) => temporalMap[p]),
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
            ...baseOptions().plugins.tooltip,
            callbacks: { label: (ctx) => ` ${fmtR$(ctx.parsed.y)}` },
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
              callback: (v) => fmtR$(v as number),
            },
          },
        },
      },
    });
  }

  // 4. Top 10 — Maior Custo Total — horizontal bar, red
  const topCustos = groupBy(
    data,
    (r) => r.projeto,
    (r) => r.custoTotal,
  ).slice(0, 10);
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
            data: topCustos.map(([, v]) => v),
            backgroundColor: "rgba(245,90,90,0.85)",
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
      },
    });
  }
}

function updateCharts(data: ConsolidadoRow[]) {
  if (chartDistribuicao) {
    const updTotalMat = data.reduce((s, r) => s + r.custoMateriais, 0);
    const updTotalHoras = data.reduce((s, r) => s + r.custoHoras, 0);
    const updTotal = updTotalMat + updTotalHoras;
    const updPctMat = updTotal > 0 ? +((updTotalMat / updTotal) * 100).toFixed(1) : 0;
    const updPctHoras = updTotal > 0 ? +((updTotalHoras / updTotal) * 100).toFixed(1) : 0;
    chartDistribuicao.data.datasets[0].data = [updPctMat, updPctHoras];
    chartDistribuicao.update();
  }

  const porPrograma = groupBy(
    data,
    (r) => r.programa,
    (r) => r.custoTotal,
  ).slice(0, 8);
  if (chartPorPrograma) {
    chartPorPrograma.data.labels = porPrograma.map(([l]) => l);
    chartPorPrograma.data.datasets[0].data = porPrograma.map(([, v]) => v);
    chartPorPrograma.update();
  }

  const temporalMap: Record<string, number> = {};
  data.forEach((r) => {
    temporalMap[r.periodo] = (temporalMap[r.periodo] || 0) + r.custoTotal;
  });
  const periodos = Object.keys(temporalMap).sort();
  if (chartTemporal) {
    chartTemporal.data.labels = periodos;
    chartTemporal.data.datasets[0].data = periodos.map((p) => temporalMap[p]);
    chartTemporal.update();
  }

  const topCustos = groupBy(
    data,
    (r) => r.projeto,
    (r) => r.custoTotal,
  ).slice(0, 10);
  if (chartTopCustos) {
    chartTopCustos.data.labels = topCustos.map(([l]) => l);
    chartTopCustos.data.datasets[0].data = topCustos.map(([, v]) => v);
    chartTopCustos.update();
  }
}

export function useChartsConsolidado() {
  return { buildCharts, updateCharts, destroyCharts: destroyAll };
}