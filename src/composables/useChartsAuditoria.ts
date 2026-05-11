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

export interface AuditoriaRow {
  id: number;
  tipo: string;
  descricao: string;
  projeto: string;
  programa: string;
  responsavel: string;
  dataRegistro: string;
  dataRevisao: string;
  status: string;
  valorImpacto: number;
  observacao: string;
}

let chartStatusPeriodo: Chart | null = null;
let chartPorTipo: Chart | null = null;
let chartPorResponsavel: Chart | null = null;
let chartTemporal: Chart | null = null;

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
    chartStatusPeriodo,
    chartPorTipo,
    chartPorResponsavel,
    chartTemporal,
  ].forEach((c) => c?.destroy());
  chartStatusPeriodo =
    chartPorTipo =
    chartPorResponsavel =
    chartTemporal =
      null;
}

function buildCharts(data: AuditoriaRow[]) {
  destroyAll();

  // 1. Registros por Status — vertical bar, multi-color
  const porStatus = groupBy(
    data,
    (r) => r.status,
    () => 1,
  );
  const statusColors: Record<string, string> = {
    Aprovado: "rgba(45,212,160,0.85)",
    Pendente: "rgba(245,166,35,0.85)",
    Rejeitado: "rgba(245,90,90,0.85)",
    "Em Análise": "rgba(77,143,255,0.85)",
  };

  const ctxSP = (
    document.getElementById("chartStatusPeriodo") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxSP) {
    chartStatusPeriodo = new Chart(ctxSP, {
      type: "bar",
      data: {
        labels: porStatus.map(([l]) => l),
        datasets: [
          {
            data: porStatus.map(([, v]) => v),
            backgroundColor: porStatus.map(
              ([l]) => statusColors[l] || "rgba(155,127,255,0.85)",
            ),
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
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  // 2. Registros por Tipo — horizontal bar, purple
  const porTipo = groupBy(
    data,
    (r) => r.tipo,
    () => 1,
  );
  const ctxTipo = (
    document.getElementById("chartPorTipo") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxTipo) {
    chartPorTipo = new Chart(ctxTipo, {
      type: "bar",
      data: {
        labels: porTipo.map(([l]) => l),
        datasets: [
          {
            data: porTipo.map(([, v]) => v),
            backgroundColor: "rgba(155,127,255,0.85)",
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
              stepSize: 1,
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

  // 3. Aprovações por Responsável — horizontal bar, green
  const porResp = groupBy(
    data,
    (r) => r.responsavel,
    () => 1,
  ).slice(0, 10);
  const ctxResp = (
    document.getElementById("chartPorResponsavel") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxResp) {
    chartPorResponsavel = new Chart(ctxResp, {
      type: "bar",
      data: {
        labels: porResp.map(([l]) => l),
        datasets: [
          {
            data: porResp.map(([, v]) => v),
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
              stepSize: 1,
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

  // 4. Evolução de Auditorias — line chart, amber
  const temporalMap: Record<string, number> = {};
  data.forEach((r) => {
    const mes = r.dataRegistro.slice(0, 7);
    temporalMap[mes] = (temporalMap[mes] || 0) + 1;
  });
  const periodos = Object.keys(temporalMap).sort();

  const ctxT = (
    document.getElementById("chartTemporalAud") as HTMLCanvasElement
  )?.getContext("2d");
  if (ctxT) {
    chartTemporal = new Chart(ctxT, {
      type: "line",
      data: {
        labels: periodos,
        datasets: [
          {
            data: periodos.map((p) => temporalMap[p]),
            borderColor: "#f5a623",
            backgroundColor: "rgba(245,166,35,0.12)",
            borderWidth: 2.5,
            pointBackgroundColor: "#f5a623",
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
            callbacks: { label: (ctx) => ` ${ctx.parsed.y} registros` },
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
              stepSize: 1,
            },
          },
        },
      },
    });
  }
}

function updateCharts(data: AuditoriaRow[]) {
  const porStatus = groupBy(
    data,
    (r) => r.status,
    () => 1,
  );
  const statusColors: Record<string, string> = {
    Aprovado: "rgba(45,212,160,0.85)",
    Pendente: "rgba(245,166,35,0.85)",
    Rejeitado: "rgba(245,90,90,0.85)",
    "Em Análise": "rgba(77,143,255,0.85)",
  };
  if (chartStatusPeriodo) {
    chartStatusPeriodo.data.labels = porStatus.map(([l]) => l);
    chartStatusPeriodo.data.datasets[0].data = porStatus.map(([, v]) => v);
    chartStatusPeriodo.data.datasets[0].backgroundColor = porStatus.map(
      ([l]) => statusColors[l] || "rgba(155,127,255,0.85)",
    );
    chartStatusPeriodo.update();
  }

  const porTipo = groupBy(
    data,
    (r) => r.tipo,
    () => 1,
  );
  if (chartPorTipo) {
    chartPorTipo.data.labels = porTipo.map(([l]) => l);
    chartPorTipo.data.datasets[0].data = porTipo.map(([, v]) => v);
    chartPorTipo.update();
  }

  const porResp = groupBy(
    data,
    (r) => r.responsavel,
    () => 1,
  ).slice(0, 10);
  if (chartPorResponsavel) {
    chartPorResponsavel.data.labels = porResp.map(([l]) => l);
    chartPorResponsavel.data.datasets[0].data = porResp.map(([, v]) => v);
    chartPorResponsavel.update();
  }

  const temporalMap: Record<string, number> = {};
  data.forEach((r) => {
    const mes = r.dataRegistro.slice(0, 7);
    temporalMap[mes] = (temporalMap[mes] || 0) + 1;
  });
  const periodos = Object.keys(temporalMap).sort();
  if (chartTemporal) {
    chartTemporal.data.labels = periodos;
    chartTemporal.data.datasets[0].data = periodos.map((p) => temporalMap[p]);
    chartTemporal.update();
  }
}

export function useChartsAuditoria() {
  return { buildCharts, updateCharts, destroyCharts: destroyAll };
}
