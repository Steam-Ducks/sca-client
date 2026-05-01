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

const shortName = (name: string) => name.split(" ").slice(0, 2).join(" ");
const fmtK = (v: number) => "R$" + Math.round(v / 1000) + "K";

const BASE_OPTS = {
  color: "#8b92aa",
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      backgroundColor: "#222639",
      titleColor: "#8b92aa",
      bodyColor: "#fff",
      borderColor: "#353c58",
      borderWidth: 1,
      padding: 10,
      titleFont: { family: "IBM Plex Sans" },
      bodyFont: { family: "IBM Plex Mono" },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,.04)" },
      ticks: { color: "#555d7a", font: { family: "IBM Plex Sans", size: 11 } },
    },
    y: {
      grid: { color: "rgba(255,255,255,.06)" },
      ticks: { color: "#555d7a", font: { family: "IBM Plex Sans", size: 11 } },
    },
  },
};

let chartCusto: Chart | null = null;
let chartQtd: Chart | null = null;
let chartProjeto: Chart | null = null;
let chartTemporal: Chart | null = null;

function tempEntries(data: Material[]) {
  const map: Record<string, number> = {};
  data.forEach((r) => {
    map[r.periodo] = (map[r.periodo] || 0) + r.valorTotal;
  });
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
}

export function useCharts() {
  function buildCharts(raw: Material[]) {
    // ───────────── TOP CUSTO ─────────────
    const top10c = [...raw]
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 10);

    chartCusto = new Chart(
      document.getElementById("chartCusto") as HTMLCanvasElement,
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
          ...BASE_OPTS,
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ...BASE_OPTS.scales.x },
            y: {
              ...BASE_OPTS.scales.y,
              ticks: {
                ...BASE_OPTS.scales.y.ticks,
                callback: (v) => fmtK(Number(v)),
              },
            },
          },
        },
      },
    );

    // ───────────── TOP QUANTIDADE ─────────────
    const top10q = [...raw]
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    chartQtd = new Chart(
      document.getElementById("chartQtd") as HTMLCanvasElement,
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
        options: { ...BASE_OPTS, responsive: true, maintainAspectRatio: false },
      },
    );

    // ───────────── PROJETO ─────────────
    const labelsProjeto = raw.map((r) => r.projeto);
    const dataProjeto = raw.map((r) => r.valorTotal);

    if (chartProjeto) {
      chartProjeto.destroy();
    }

    chartProjeto = new Chart(
      document.getElementById("chartProjeto") as HTMLCanvasElement,
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
          ...BASE_OPTS,
          indexAxis: "y" as const,
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ...BASE_OPTS.scales.x,
              ticks: {
                ...BASE_OPTS.scales.x.ticks,
                callback: (v) => fmtK(Number(v)),
              },
            },
            y: {
              ...BASE_OPTS.scales.y,
              ticks: {
                ...BASE_OPTS.scales.y.ticks,
                font: { size: 10, family: "IBM Plex Sans" },
              },
            },
          },
        },
      },
    );

    // ───────────── TEMPORAL ─────────────
    const ts = tempEntries(raw);

    chartTemporal = new Chart(
      document.getElementById("chartTemporal") as HTMLCanvasElement,
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
          ...BASE_OPTS,
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ...BASE_OPTS.scales.x },
            y: {
              ...BASE_OPTS.scales.y,
              ticks: {
                ...BASE_OPTS.scales.y.ticks,
                callback: (v) => fmtK(Number(v)),
              },
            },
          },
        },
      },
    );
  }

  function updateCharts(filtered: Material[]) {
    const top10c = [...filtered]
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 10);

    if (chartCusto) {
      chartCusto.data.labels = top10c.map((r) => shortName(r.material));
      chartCusto.data.datasets[0].data = top10c.map((r) => r.valorTotal);
      chartCusto.update();
    }

    const top10q = [...filtered]
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    if (chartQtd) {
      chartQtd.data.labels = top10q.map((r) => shortName(r.material));
      chartQtd.data.datasets[0].data = top10q.map((r) => r.quantidade);
      chartQtd.update();
    }

    // ───────────── UPDATE PROJETO ─────────────
    const labelsProjeto = filtered.map((r) => r.projeto);
    const dataProjeto = filtered.map((r) => r.valorTotal);

    if (chartProjeto) {
      chartProjeto.data.labels = labelsProjeto;
      chartProjeto.data.datasets[0].data = dataProjeto;
      chartProjeto.update();
    }

    const ts = tempEntries(filtered);

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

  return { buildCharts, updateCharts, destroyCharts };
}