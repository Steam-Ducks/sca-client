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
      borderWidth: 1,
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

export interface DashboardRow {
  projeto: string;
  programa: string;
  custoMateriais: number;
  custoHoras: number;
  custoTotal: number;
  periodo: string;
}

let chartCustoPrograma: Chart | null = null;
let chartComparativo: Chart | null = null;
let chartTemporal: Chart | null = null;
let chartTopProjetos: Chart | null = null;

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
      null;
}

function buildCharts(data: DashboardRow[]) {
  destroyAll();

  // 1. Custo por Programa — horizontal bar, blue
  const porPrograma = groupBy(
    data,
    (r) => r.programa,
    (r) => r.custoTotal,
  ).slice(0, 8);
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
            data: porPrograma.map(([, v]) => v),
            backgroundColor: "rgba(77,143,255,0.85)",
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

  // 2. Comparativo Materiais vs Horas — grouped bar, blue + green
  const projetos = [...new Set(data.map((r) => r.projeto))].slice(0, 8);
  const matPorProjeto = projetos.map((p) =>
    data
      .filter((r) => r.projeto === p)
      .reduce((s, r) => s + r.custoMateriais, 0),
  );
  const horasPorProjeto = projetos.map((p) =>
    data.filter((r) => r.projeto === p).reduce((s, r) => s + r.custoHoras, 0),
  );

  const ctxComp = (
    document.getElementById("chartComparativo") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxComp) {
    chartComparativo = new Chart(ctxComp, {
      type: "bar",
      data: {
        labels: projetos,
        datasets: [
          {
            label: "Materiais",
            data: matPorProjeto,
            backgroundColor: "rgba(77,143,255,0.85)",
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: "Horas Técnicas",
            data: horasPorProjeto,
            backgroundColor: "rgba(45,212,160,0.85)",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...baseOptions("y"),
        plugins: {
          ...baseOptions("y").plugins,
          legend: {
            display: true,
            labels: { color: text2Color, font: { family: FONT, size: 11 } },
          },
        },
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

  // 3. Evolução Temporal — line chart, purple
  const temporalMap: Record<string, number> = {};
  data.forEach((r) => {
    temporalMap[r.periodo] = (temporalMap[r.periodo] || 0) + r.custoTotal;
  });
  const periodos = Object.keys(temporalMap).sort();

  const ctxT = (
    document.getElementById("chartTemporalDash") as HTMLCanvasElement
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
            pointBorderWidth: 2,
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

  // 4. Top 10 Projetos por Custo — horizontal bar, amber
  const topProjetos = groupBy(
    data,
    (r) => r.projeto,
    (r) => r.custoTotal,
  ).slice(0, 10);
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
            data: topProjetos.map(([, v]) => v),
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
      },
    });
  }
}

function updateCharts(data: DashboardRow[]) {
  const porPrograma = groupBy(
    data,
    (r) => r.programa,
    (r) => r.custoTotal,
  ).slice(0, 8);
  if (chartCustoPrograma) {
    chartCustoPrograma.data.labels = porPrograma.map(([l]) => l);
    chartCustoPrograma.data.datasets[0].data = porPrograma.map(([, v]) => v);
    chartCustoPrograma.update();
  }

  const projetos = [...new Set(data.map((r) => r.projeto))].slice(0, 8);
  if (chartComparativo) {
    chartComparativo.data.labels = projetos;
    chartComparativo.data.datasets[0].data = projetos.map((p) =>
      data
        .filter((r) => r.projeto === p)
        .reduce((s, r) => s + r.custoMateriais, 0),
    );
    chartComparativo.data.datasets[1].data = projetos.map((p) =>
      data.filter((r) => r.projeto === p).reduce((s, r) => s + r.custoHoras, 0),
    );
    chartComparativo.update();
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

  const topProjetos = groupBy(
    data,
    (r) => r.projeto,
    (r) => r.custoTotal,
  ).slice(0, 10);
  if (chartTopProjetos) {
    chartTopProjetos.data.labels = topProjetos.map(([l]) => l);
    chartTopProjetos.data.datasets[0].data = topProjetos.map(([, v]) => v);
    chartTopProjetos.update();
  }
}

export function useChartsDashboard() {
  return { buildCharts, updateCharts, destroyCharts: destroyAll };
}
