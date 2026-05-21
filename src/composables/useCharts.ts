import {
  Chart,
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";
import type { Material } from "@/types/materiais";

Chart.register(
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
);

const FONT = "'IBM Plex Sans', sans-serif";
const MONO = "'IBM Plex Mono', monospace";

const shortName = (name: string) => name.split(" ").slice(0, 2).join(" ");
const fmtK = (v: number) => "R$" + Math.round(v / 1000) + "K";

const css = (v: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim();

const BASE_OPTS = () => ({
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      backgroundColor: css("--bg3"),
      titleColor: css("--text2"),
      bodyColor: css("--text"),
      borderColor: css("--border"),
      borderWidth: 1,
      padding: 10,
      titleFont: { family: FONT, size: 12 },
      bodyFont: { family: MONO, size: 12 },
    },
  },
});

let chartCusto: Chart | null = null;
let chartQtd: Chart | null = null;
let chartProjeto: Chart | null = null;
let chartTemporal: Chart | null = null;

function tempEntries(data: Material[]) {
  const map: Record<string, number> = {};
  data.forEach((r) => {
    const month = r.periodo ? r.periodo.slice(0, 7) : null;
    if (!month) return;
    map[month] = (map[month] || 0) + r.valorTotal;
  });
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
}

function buildCharts(topData: Material[], tableData: Material[], projectData: Material[]) {
  const gridColor = css("--border");
  const tickStyle = { color: css("--text3"), font: { family: FONT, size: 11 } };

  // ───────────── TOP CUSTO ─────────────
  const top10c = [...topData]
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 10);

  chartCusto = new Chart(
    document.getElementById("chartCusto"),
    {
      type: "bar",
      data: {
        labels: top10c.map((r) => shortName(r.material)),
        datasets: [
          {
            data: top10c.map((r) => r.valorTotal),
            backgroundColor: "#3a7af5",
            borderRadius: 4,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        ...BASE_OPTS(),
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: gridColor }, ticks: tickStyle },
          y: {
            grid: { color: gridColor },
            ticks: { ...tickStyle, callback: (v) => fmtK(Number(v)) },
          },
        },
      },
    },
  );

  // ───────────── TOP QUANTIDADE ─────────────
  const top10q = [...tableData]
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  chartQtd = new Chart(
    document.getElementById("chartQtd"),
    {
      type: "bar",
      data: {
        labels: top10q.map((r) => shortName(r.material)),
        datasets: [
          {
            data: top10q.map((r) => r.quantidade),
            backgroundColor: "#2dd4a0",
            borderRadius: 4,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        ...BASE_OPTS(),
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: gridColor }, ticks: tickStyle },
          y: { grid: { color: gridColor }, ticks: tickStyle },
        },
      },
    },
  );

  // ───────────── PROJETO ─────────────
  const labelsProjeto = projectData.map((r) => r.projeto);
  const dataProjeto = projectData.map((r) => r.valorTotal);

  if (chartProjeto) {
    chartProjeto.destroy();
  }

  chartProjeto = new Chart(
    document.getElementById("chartProjeto"),
    {
      type: "bar",
      data: {
        labels: labelsProjeto,
        datasets: [
          {
            data: dataProjeto,
            backgroundColor: "#f5a623",
            borderRadius: 4,
            barPercentage: 0.65,
          },
        ],
      },
      options: {
        ...BASE_OPTS(),
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { ...tickStyle, callback: (v) => fmtK(Number(v)) },
          },
          y: {
            grid: { color: gridColor },
            ticks: { ...tickStyle, font: { size: 10, family: FONT } },
          },
        },
      },
    },
  );

  // ───────────── TEMPORAL ─────────────
  const ts = tempEntries(tableData);

  chartTemporal = new Chart(
    document.getElementById("chartTemporal"),
    {
      type: "line",
      data: {
        labels: ts.map((e) => e[0]),
        datasets: [
          {
            data: ts.map((e) => e[1]),
            borderColor: "#9b7fff",
            backgroundColor: "rgba(155,127,255,.08)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#9b7fff",
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        ...BASE_OPTS(),
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: gridColor }, ticks: tickStyle },
          y: {
            grid: { color: gridColor },
            ticks: { ...tickStyle, callback: (v) => fmtK(Number(v)) },
          },
        },
      },
    },
  );
}

function updateCharts(topData: Material[], tableDataArg?: Material[], projectData?: Material[]) {
  if (!tableDataArg || !projectData) {
    const labelsProjeto = topData.map((r) => r.projeto);
    const dataProjeto = topData.map((r) => r.valorTotal);
    if (chartProjeto) {
      chartProjeto.data.labels = labelsProjeto;
      chartProjeto.data.datasets[0].data = dataProjeto;
      chartProjeto.update();
    }
    return;
  }

  const top10c = [...topData]
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 10);

  if (chartCusto) {
    chartCusto.data.labels = top10c.map((r) => shortName(r.material));
    chartCusto.data.datasets[0].data = top10c.map((r) => r.valorTotal);
    chartCusto.update();
  }

  const top10q = [...tableDataArg]
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  if (chartQtd) {
    chartQtd.data.labels = top10q.map((r) => shortName(r.material));
    chartQtd.data.datasets[0].data = top10q.map((r) => r.quantidade);
    chartQtd.update();
  }

  const labelsProjeto = projectData.map((r) => r.projeto);
  const dataProjeto = projectData.map((r) => r.valorTotal);

  if (chartProjeto) {
    chartProjeto.data.labels = labelsProjeto;
    chartProjeto.data.datasets[0].data = dataProjeto;
    chartProjeto.update();
  }

  const ts = tempEntries(tableDataArg);

  if (chartTemporal) {
    chartTemporal.data.labels = ts.map((e) => e[0]);
    chartTemporal.data.datasets[0].data = ts.map((e) => e[1]);
    chartTemporal.update();
  }
}

function destroyCharts() {
  chartCusto?.destroy();
  chartQtd?.destroy();
  chartProjeto?.destroy();
  chartTemporal?.destroy();
  chartCusto = chartQtd = chartProjeto = chartTemporal = null;
}

export function useCharts() {
  return { buildCharts, updateCharts, destroyCharts };
}
