import { Chart, registerables } from "chart.js";
import type { TooltipItem } from "chart.js";
import type { BudgetHealthStatus, BudgetProjectRow } from "@/types/api";

Chart.register(...registerables);

const FONT = "'IBM Plex Sans', sans-serif";
const MONO = "'IBM Plex Mono', monospace";
const gridColor = "rgba(42,47,69,0.8)";
const textColor = "#555d7a";
const text2Color = "#8b92aa";

const SAUDE_COLORS: Record<BudgetHealthStatus, string> = {
  Saudável: "rgba(45,212,160,0.85)",
  Atenção: "rgba(245,166,35,0.85)",
  Crítico: "rgba(245,90,90,0.85)",
};

const tooltipBase = {
  backgroundColor: "#1c2030",
  borderColor: "#2a2f45",
  borderWidth: 1,
  titleColor: "#e2e6f0",
  bodyColor: "#8b92aa",
  titleFont: { family: FONT, size: 12 },
  bodyFont: { family: MONO, size: 12 },
  padding: 10,
};

function fmtBRL(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

function deviationMax(data: BudgetProjectRow[]): number {
  const maxDeviation = Math.max(...data.map((p) => p.desvioPercent), 100);
  return Math.ceil(maxDeviation / 10) * 10;
}

let chartBudget: Chart | null = null;
let chartDesvio: Chart | null = null;
let chartDistribuicao: Chart | null = null;

function destroyAll() {
  [chartBudget, chartDesvio, chartDistribuicao].forEach((c) => c?.destroy());
  chartBudget = chartDesvio = chartDistribuicao = null;
}

function buildChartsOrcamento(data: BudgetProjectRow[]) {
  destroyAll();

  const labels = data.map((p) => p.projeto);

  const ctxB = (
    document.getElementById("chartBudgetVsCusto") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxB) {
    chartBudget = new Chart(ctxB, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Budget",
            data: data.map((p) => p.budget),
            backgroundColor: "rgba(77,143,255,0.85)",
            borderRadius: 3,
            borderSkipped: false,
          },
          {
            label: "Custo Real",
            data: data.map((p) => p.custoReal),
            backgroundColor: "rgba(45,212,160,0.85)",
            borderRadius: 3,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500, easing: "easeOutQuart" },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: text2Color,
              font: { family: FONT, size: 11 },
              boxWidth: 12,
              padding: 16,
            },
          },
          tooltip: {
            ...tooltipBase,
            callbacks: {
              label: (ctx: TooltipItem<"bar">) =>
                ` ${fmtBRL(ctx.parsed.y ?? 0)}`,
            },
          },
        },
        scales: {
          x: {
            border: { display: false },
            grid: { color: gridColor },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
          y: {
            border: { display: false },
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: MONO, size: 11 },
              callback: (v: string | number) => fmtBRL(v as number),
            },
          },
        },
      },
    });
  }

  const ctxD = (
    document.getElementById("chartDesvioPercentual") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxD) {
    chartDesvio = new Chart(ctxD, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: data.map((p) => p.desvioPercent),
            backgroundColor: data.map((p) => SAUDE_COLORS[p.saude]),
            borderRadius: 3,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipBase,
            callbacks: {
              label: (ctx: TooltipItem<"bar">) =>
                ` ${(ctx.parsed.y ?? 0).toFixed(1)}%`,
            },
          },
        },
        scales: {
          x: {
            border: { display: false },
            grid: { color: gridColor },
            ticks: { color: text2Color, font: { family: FONT, size: 11 } },
          },
          y: {
            min: 0,
            max: deviationMax(data),
            border: { display: false },
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: MONO, size: 11 },
              callback: (v: string | number) => `${v}%`,
            },
          },
        },
      },
    });
  }

  const saudavelCount = data.filter((p) => p.saude === "Saudável").length;
  const atencaoCount = data.filter((p) => p.saude === "Atenção").length;
  const criticoCount = data.filter((p) => p.saude === "Crítico").length;

  const ctxDist = (
    document.getElementById("chartDistribuicao") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxDist) {
    chartDistribuicao = new Chart(ctxDist, {
      type: "doughnut",
      data: {
        labels: [
          `Saudável: ${saudavelCount}`,
          `Atenção: ${atencaoCount}`,
          `Crítico: ${criticoCount}`,
        ],
        datasets: [
          {
            data: [saudavelCount, atencaoCount, criticoCount],
            backgroundColor: [
              "rgba(45,212,160,0.9)",
              "rgba(245,166,35,0.9)",
              "rgba(245,90,90,0.9)",
            ],
            borderColor: "#141720",
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        cutout: "60%",
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: text2Color,
              font: { family: FONT, size: 12 },
              boxWidth: 12,
              padding: 16,
            },
          },
          tooltip: {
            ...tooltipBase,
            callbacks: {
              label: (ctx: TooltipItem<"doughnut">) =>
                ` ${ctx.label}: ${ctx.parsed} projetos`,
            },
          },
        },
      },
    });
  }
}

function updateChartsOrcamento(data: BudgetProjectRow[]) {
  const labels = data.map((p) => p.projeto);

  if (chartBudget) {
    chartBudget.data.labels = labels;
    chartBudget.data.datasets[0].data = data.map((p) => p.budget);
    chartBudget.data.datasets[1].data = data.map((p) => p.custoReal);
    chartBudget.update();
  }

  if (chartDesvio) {
    chartDesvio.data.labels = labels;
    chartDesvio.data.datasets[0].data = data.map((p) => p.desvioPercent);
    (chartDesvio.data.datasets[0].backgroundColor as string[]) = data.map(
      (p) => SAUDE_COLORS[p.saude],
    );
    if (chartDesvio.options.scales?.y) {
      chartDesvio.options.scales.y.max = deviationMax(data);
    }
    chartDesvio.update();
  }

  if (chartDistribuicao) {
    const s = data.filter((p) => p.saude === "Saudável").length;
    const a = data.filter((p) => p.saude === "Atenção").length;
    const c = data.filter((p) => p.saude === "Crítico").length;
    chartDistribuicao.data.labels = [
      `Saudável: ${s}`,
      `Atenção: ${a}`,
      `Crítico: ${c}`,
    ];
    chartDistribuicao.data.datasets[0].data = [s, a, c];
    chartDistribuicao.update();
  }
}

function destroyChartsOrcamento() {
  destroyAll();
}

export function useChartsOrcamento() {
  return {
    buildChartsOrcamento,
    updateChartsOrcamento,
    destroyChartsOrcamento,
  };
}
