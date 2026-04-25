<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">Dashboard Principal</h1>

      <!-- METRICS -->
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-label">Custo Total Geral</div>
          <div class="metric-value blue">
            {{ fmt(kpis.custoTotal) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Custo Materiais</div>
          <div class="metric-value">
            {{ fmt(kpis.custoMateriais) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Custo Horas Técnicas</div>
          <div class="metric-value green">
            {{ fmt(kpis.custoHoras) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total de Projetos</div>
          <div class="metric-value">
            {{ kpis.totalProjetos }}
          </div>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="filters-card">
        <div class="filters-title">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              d="M3 4h18M7 10h10M11 16h2"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          Filtros
        </div>
        <div class="filters-row">
          <select v-model="filters.periodo" class="filter-select">
            <option value="">Todos os Períodos</option>
            <option v-for="p in uniquePeriodos" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
          <select v-model="filters.programa" class="filter-select">
            <option value="">Todos os Programas</option>
            <option v-for="p in uniqueProgramas" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
          <select v-model="filters.projeto" class="filter-select">
            <option value="">Todos os Projetos</option>
            <option v-for="p in uniqueProjetos" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
          <button class="export-btn" @click="exportCSV">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                d="M12 16l-4-4h3V4h2v8h3l-4 4z"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M4 20h16" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <!-- TOP CHARTS -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">Custo Total por Programa</div>
          <div class="chart-wrap tall">
            <canvas id="chartCustoPrograma" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Comparativo: Materiais vs Horas Técnicas
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartComparativo" />
          </div>
        </div>
      </div>

      <!-- BOTTOM CHARTS -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">Top 10 – Projetos por Custo Total</div>
          <div class="chart-wrap tall">
            <canvas id="chartTopProjetos" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Evolução Temporal do Custo</div>
          <div class="chart-wrap tall">
            <canvas id="chartTemporalDash" />
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-card">
        <div class="table-header">
          <h2>Resumo por Projeto</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="sort-col" @click="sortBy('projeto')">
                  Projeto {{ sortIcon("projeto") }}
                </th>
                <th class="sort-col" @click="sortBy('programa')">
                  Programa {{ sortIcon("programa") }}
                </th>
                <th class="sort-col" @click="sortBy('custoMateriais')">
                  Custo Materiais {{ sortIcon("custoMateriais") }}
                </th>
                <th class="sort-col" @click="sortBy('custoHoras')">
                  Custo Horas {{ sortIcon("custoHoras") }}
                </th>
                <th class="sort-col" @click="sortBy('custoTotal')">
                  Custo Total {{ sortIcon("custoTotal") }}
                </th>
                <th class="sort-col" @click="sortBy('periodo')">
                  Período {{ sortIcon("periodo") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagedData.length === 0">
                <td colspan="6" class="table-feedback muted">
                  Nenhum registro encontrado.
                </td>
              </tr>
              <tr v-for="row in pagedData" :key="row.projeto + row.periodo">
                <td class="material-name">
                  {{ row.projeto }}
                </td>
                <td class="muted">
                  {{ row.programa }}
                </td>
                <td class="mono">
                  {{ fmt(row.custoMateriais) }}
                </td>
                <td class="mono">
                  {{ fmt(row.custoHoras) }}
                </td>
                <td class="total">
                  {{ fmt(row.custoTotal) }}
                </td>
                <td class="mono">
                  {{ row.periodo }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span
            >{{ filteredData.length }} registros · página {{ page }} de
            {{ totalPages }}</span
          >
          <div class="pg-btns">
            <button class="pg-btn" :disabled="page === 1" @click="page = 1">
              «
            </button>
            <button class="pg-btn" :disabled="page === 1" @click="page--">
              ‹
            </button>
            <button
              v-for="p in visiblePages"
              :key="p"
              class="pg-btn"
              :class="{ active: p === page }"
              @click="page = p"
            >
              {{ p }}
            </button>
            <button
              class="pg-btn"
              :disabled="page === totalPages"
              @click="page++"
            >
              ›
            </button>
            <button
              class="pg-btn"
              :disabled="page === totalPages"
              @click="page = totalPages"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useChartsDashboard } from "@/composables/useChartsDashboard";
import type { DashboardRow } from "@/composables/useChartsDashboard";
import { apiService } from "@/services/apiService";

const PER_PAGE = 8;

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK: DashboardRow[] = [
  {
    projeto: "Data Center Regional",
    programa: "Infraestrutura",
    custoMateriais: 245000,
    custoHoras: 217400,
    custoTotal: 462400,
    periodo: "2024-01",
  },
  {
    projeto: "Storage Upgrade",
    programa: "Infraestrutura",
    custoMateriais: 189000,
    custoHoras: 95000,
    custoTotal: 284000,
    periodo: "2024-01",
  },
  {
    projeto: "Migração AWS",
    programa: "Cloud",
    custoMateriais: 156000,
    custoHoras: 282000,
    custoTotal: 438000,
    periodo: "2024-01",
  },
  {
    projeto: "SOC Implementation",
    programa: "Segurança",
    custoMateriais: 178000,
    custoHoras: 216200,
    custoTotal: 394200,
    periodo: "2024-03",
  },
  {
    projeto: "Modernização de Rede",
    programa: "Infraestrutura",
    custoMateriais: 134500,
    custoHoras: 95700,
    custoTotal: 230200,
    periodo: "2024-03",
  },
  {
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    custoMateriais: 67000,
    custoHoras: 441200,
    custoTotal: 508200,
    periodo: "2024-02",
  },
  {
    projeto: "Portal Web",
    programa: "Desenvolvimento",
    custoMateriais: 52000,
    custoHoras: 328800,
    custoTotal: 380800,
    periodo: "2024-01",
  },
  {
    projeto: "Container Platform",
    programa: "Cloud",
    custoMateriais: 98000,
    custoHoras: 145000,
    custoTotal: 243000,
    periodo: "2024-02",
  },
  {
    projeto: "App Mobile",
    programa: "Desenvolvimento",
    custoMateriais: 34000,
    custoHoras: 132400,
    custoTotal: 166400,
    periodo: "2024-02",
  },
  {
    projeto: "DevOps Pipeline",
    programa: "Desenvolvimento",
    custoMateriais: 87000,
    custoHoras: 110000,
    custoTotal: 197000,
    periodo: "2024-03",
  },
  {
    projeto: "Firewall Corporativo",
    programa: "Segurança",
    custoMateriais: 142000,
    custoHoras: 78000,
    custoTotal: 220000,
    periodo: "2024-02",
  },
  {
    projeto: "CRM Customizado",
    programa: "Desenvolvimento",
    custoMateriais: 45000,
    custoHoras: 165000,
    custoTotal: 210000,
    periodo: "2024-03",
  },
];

// ─── State ───────────────────────────────────────────────────────────────────
const tableData = ref<DashboardRow[]>([]);
const filters = ref({ periodo: "", programa: "", projeto: "" });
const sortKey = ref<keyof DashboardRow>("custoTotal");
const sortDir = ref<1 | -1>(-1);
const page = ref(1);

// ─── Filter options ──────────────────────────────────────────────────────────
const uniquePeriodos = computed(() =>
  [...new Set(tableData.value.map((r) => r.periodo))].sort(),
);
const uniqueProgramas = computed(() =>
  [...new Set(tableData.value.map((r) => r.programa))].sort(),
);
const uniqueProjetos = computed(() =>
  [...new Set(tableData.value.map((r) => r.projeto))].sort(),
);

// ─── Computed ────────────────────────────────────────────────────────────────
const filteredData = computed(() => {
  const f = filters.value;
  return tableData.value
    .filter(
      (r) =>
        (!f.periodo || r.periodo === f.periodo) &&
        (!f.programa || r.programa === f.programa) &&
        (!f.projeto || r.projeto === f.projeto),
    )
    .sort((a, b) => {
      const av = a[sortKey.value],
        bv = b[sortKey.value];
      return typeof av === "string"
        ? av.localeCompare(bv as string) * sortDir.value
        : ((av as number) - (bv as number)) * sortDir.value;
    });
});

const kpis = computed(() => {
  const d = filteredData.value;
  return {
    custoTotal: d.reduce((s, r) => s + r.custoTotal, 0),
    custoMateriais: d.reduce((s, r) => s + r.custoMateriais, 0),
    custoHoras: d.reduce((s, r) => s + r.custoHoras, 0),
    totalProjetos: new Set(d.map((r) => r.projeto)).size,
  };
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / PER_PAGE)),
);
const pagedData = computed(() =>
  filteredData.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE),
);
const visiblePages = computed(() => {
  const p = page.value,
    t = totalPages.value;
  const s = Math.max(1, p - 2),
    e = Math.min(t, p + 2);
  return Array.from({ length: e - s + 1 }, (_, i) => s + i);
});

// ─── Watchers ────────────────────────────────────────────────────────────────
watch(filteredData, (val) => {
  page.value = 1;
  nextTick(() => updateCharts(val));
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

function sortBy(k: keyof DashboardRow) {
  if (sortKey.value === k) sortDir.value = (sortDir.value * -1) as 1 | -1;
  else {
    sortKey.value = k;
    sortDir.value = -1;
  }
}
const sortIcon = (k: keyof DashboardRow) =>
  sortKey.value !== k ? "↕" : sortDir.value > 0 ? "↑" : "↓";

function exportCSV() {
  const header =
    "Projeto,Programa,Custo Materiais,Custo Horas,Custo Total,Período";
  const rows = filteredData.value.map((r) =>
    [
      r.projeto,
      r.programa,
      r.custoMateriais,
      r.custoHoras,
      r.custoTotal,
      r.periodo,
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "dashboard-geral.csv";
  a.click();
}

// ─── Charts ──────────────────────────────────────────────────────────────────
const { buildCharts, updateCharts, destroyCharts } = useChartsDashboard();

async function loadDashboard() {
  try {
    const consolidatedRows = await apiService.consolidated.fetchConsolidated();
    tableData.value = consolidatedRows.map(
      ({
        projeto,
        programa,
        custoMateriais,
        custoHoras,
        custoTotal,
        periodo,
      }) => ({
        projeto,
        programa,
        custoMateriais,
        custoHoras,
        custoTotal,
        periodo,
      }),
    );
  } catch (error) {
    console.error(error);
    tableData.value = MOCK;
  }

  nextTick(() => buildCharts(tableData.value));
}

onMounted(() => {
  void loadDashboard();
});
onUnmounted(destroyCharts);
</script>

<style scoped>
/* ── Variables ────────────────────────────────────────────────────────────── */
.app {
  --bg: #0d0f14;
  --bg2: #141720;
  --bg3: #1c2030;
  --bg4: #222639;
  --border: #2a2f45;
  --border2: #353c58;
  --text: #e2e6f0;
  --text2: #8b92aa;
  --text3: #555d7a;
  --blue: #4d8fff;
  --blue2: #3a7af5;
  --green: #2dd4a0;
  --amber: #f5a623;
  --red: #f55a5a;
  --purple: #9b7fff;

  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 14px;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg2);
}
::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 3px;
}

.main {
  padding: 24px 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Metrics ──────────────────────────────────────────────────────────────── */
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.metric-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 22px;
  transition: border-color 0.2s;
  animation: fadeIn 0.35s ease both;
}
.metric-card:nth-child(2) {
  animation-delay: 0.06s;
}
.metric-card:nth-child(3) {
  animation-delay: 0.12s;
}
.metric-card:nth-child(4) {
  animation-delay: 0.18s;
}
.metric-card:hover {
  border-color: var(--border2);
}
.metric-label {
  font-size: 11px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.metric-value {
  font-size: 26px;
  font-weight: 600;
  font-family: "IBM Plex Mono", monospace;
  letter-spacing: -0.5px;
  color: var(--text);
}
.metric-value.blue {
  color: var(--blue);
}
.metric-value.green {
  color: var(--green);
}

/* ── Filters ──────────────────────────────────────────────────────────────── */
.filters-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 20px;
  animation: fadeIn 0.35s ease both;
}
.filters-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 14px;
  color: var(--text2);
}
.filters-title svg {
  width: 14px;
  height: 14px;
  color: var(--text3);
}
.filters-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 7px;
  padding: 7px 30px 7px 10px;
  font-size: 12px;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  min-width: 155px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238b92aa'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.2s;
}
.filter-select:focus {
  outline: none;
  border-color: var(--blue2);
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--blue2);
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 7px 16px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  margin-left: auto;
}
.export-btn:hover {
  background: var(--blue);
}
.export-btn svg {
  width: 14px;
  height: 14px;
}

/* ── Charts ───────────────────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.chart-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 20px;
  animation: fadeIn 0.35s ease both;
}
.chart-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  margin-bottom: 16px;
}
.chart-wrap {
  position: relative;
  height: 220px;
}
.chart-wrap.tall {
  height: 360px;
}

/* ── Table ────────────────────────────────────────────────────────────────── */
.table-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  animation: fadeIn 0.35s ease both;
}
.table-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.table-header h2 {
  font-size: 14px;
  font-weight: 500;
}
.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}
thead tr {
  border-bottom: 1px solid var(--border);
}
th {
  padding: 11px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
}
th.sort-col {
  cursor: pointer;
  user-select: none;
}
th.sort-col:hover {
  color: var(--text2);
}
tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
tbody tr:hover {
  background: var(--bg3);
}
tbody tr:last-child {
  border-bottom: none;
}
td {
  padding: 13px 16px;
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
}
td.material-name {
  font-weight: 500;
  color: #fff;
}
td.muted {
  color: var(--text2);
}
td.mono {
  font-family: "IBM Plex Mono", monospace;
  font-size: 12px;
}
td.total {
  font-family: "IBM Plex Mono", monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--green);
}
.table-feedback {
  text-align: center;
  padding: 24px 16px;
}
.table-feedback.muted {
  color: var(--text3);
}

/* ── Pagination ───────────────────────────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text3);
}
.pg-btns {
  display: flex;
  gap: 4px;
}
.pg-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text2);
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}
.pg-btn:hover {
  border-color: var(--blue2);
  color: var(--blue);
}
.pg-btn.active {
  background: var(--blue2);
  border-color: var(--blue2);
  color: #fff;
}
.pg-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
