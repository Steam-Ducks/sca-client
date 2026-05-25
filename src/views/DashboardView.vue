<!-- src/views/DashboardView.vue -->
<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">
        Dashboard Principal
      </h1>
      <!-- METRICS -->
      <div class="metrics">
        <div
          v-if="!isProjetos"
          class="metric-card"
        >
          <div class="metric-label">
            Custo Total Consolidado
          </div>
          <div class="metric-value blue">
            {{ kpisLoading ? "..." : fmt(kpis.total_consolidated_cost) }}
          </div>
        </div>
        <div
          v-if="!isProjetos"
          class="metric-card"
        >
          <div class="metric-label">
            Custo Total de Materiais
          </div>
          <div class="metric-value">
            {{ kpisLoading ? "..." : fmt(kpis.total_materials_cost) }}
          </div>
        </div>
        <div
          v-if="!isProjetos"
          class="metric-card"
        >
          <div class="metric-label">
            Custo Total de Horas Técnicas
          </div>
          <div class="metric-value green">
            {{ kpisLoading ? "..." : fmt(kpis.total_hours_cost) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Número de Projetos
          </div>
          <div class="metric-value">
            {{ kpisLoading ? "..." : kpis.total_projects }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Número de Programas
          </div>
          <div class="metric-value">
            {{ kpisLoading ? "..." : kpis.total_programs }}
          </div>
        </div>
      </div>
      <!-- FILTERS -->
      <div class="filters-card">
        <div class="filters-title">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              d="M3 4h18M7 10h10M11 16h2"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          Filtros
        </div>
        <div class="filters-row">
          <select
            v-model="filters.periodo"
            class="filter-select"
          >
            <option value="">
              Todos os Status
            </option>
            <option
              v-for="p in uniquePeriodos"
              :key="p"
              :value="p"
            >
              {{ p }}
            </option>
          </select>
          <select
            v-model="filters.programa"
            class="filter-select"
          >
            <option value="">
              Todos os Programas
            </option>
            <option
              v-for="p in uniqueProgramas"
              :key="p"
              :value="p"
            >
              {{ p }}
            </option>
          </select>
          <select
            v-model="filters.projeto"
            class="filter-select"
            :disabled="availableProjects.length === 0"
          >
            <option value="">
              Todos os Projetos
            </option>
            <option
              v-for="p in availableProjects"
              :key="p"
              :value="p"
            >
              {{ p }}
            </option>
          </select>
          <button
            v-if="hasActiveFilters"
            class="clear-btn"
            @click="clearFilters"
          >
            Limpar filtros
          </button>
          <button
            class="export-btn"
            @click="exportCSV"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                d="M12 16l-4-4h3V4h2v8h3l-4 4z"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 20h16"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            Exportar
          </button>
        </div>
        <div
          v-if="hasActiveFilters"
          class="active-filters"
        >
          <span class="active-filters-label">Filtros ativos</span>
          <span
            v-for="filter in activeFilterEntries"
            :key="filter.key"
            class="filter-chip"
          >
            {{ filter.label }}: {{ filter.value }}
            <button
              class="chip-remove"
              :aria-label="`Remover filtro ${filter.label}`"
              @click="removeFilter(filter.key)"
            >×</button>
          </span>
        </div>
      </div>
      <!-- TOP CHARTS -->
      <div
        v-if="!isProjetos"
        class="charts-row"
      >
        <div class="chart-card">
          <div class="chart-title">
            Custo Total por Programa
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartCustoPrograma" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Composição do Custo: Materiais vs Horas Técnicas
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartComparativo" />
          </div>
        </div>
      </div>
      <!-- BOTTOM CHARTS -->
      <div class="charts-row">
        <div
          v-if="!isProjetos"
          class="chart-card"
        >
          <div class="chart-title">
            Top 10 – Projetos por Custo Total
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartTopProjetos" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Custo Total por Status do Projeto
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartTemporalDash" />
          </div>
        </div>
      </div>
      <!-- COST EVOLUTION — full width -->
      <div class="chart-card chart-card--full">
        <div class="chart-title">
          Evolução Temporal dos Custos
        </div>
        <div class="chart-wrap evolution">
          <canvas id="chartCostEvolution" />
        </div>
      </div>

      <!-- DETAILED TABLE -->
      <div class="table-card">
        <div class="table-header">
          <h2>Resumo por Projeto</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th
                  class="sort-col"
                  @click="sortBy('projeto')"
                >
                  Projeto {{ sortIcon("projeto") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('programa')"
                >
                  Programa {{ sortIcon("programa") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('custoMateriais')"
                >
                  Custo Materiais {{ sortIcon("custoMateriais") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('custoHoras')"
                >
                  Custo Horas {{ sortIcon("custoHoras") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('custoTotal')"
                >
                  Custo Total {{ sortIcon("custoTotal") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('periodo')"
                >
                  Período {{ sortIcon("periodo") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagedData.length === 0">
                <td
                  colspan="6"
                  class="table-feedback muted"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
              <tr
                v-for="row in pagedData"
                :key="row.projeto + row.periodo"
              >
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
          <span>{{ filteredData.length }} registros · página {{ page }} de
            {{ totalPages }}</span>
          <div class="pg-btns">
            <button
              class="pg-btn"
              :disabled="page === 1"
              @click="page = 1"
            >
              «
            </button>
            <button
              class="pg-btn"
              :disabled="page === 1"
              @click="page--"
            >
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
      <!-- SUMMARY TABLE: hidden for projetos (program-level aggregation) -->
      <div
        v-if="!isProjetos"
        class="table-card"
      >
        <div class="table-header">
          <h2>Resumo Agregado por Programa</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th
                  class="sort-col"
                  @click="sortSummaryBy('programa')"
                >
                  Programa {{ summarySortIcon("programa") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortSummaryBy('qtdProjetos')"
                >
                  Qtd. Projetos {{ summarySortIcon("qtdProjetos") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortSummaryBy('custoMateriais')"
                >
                  Custo Materiais {{ summarySortIcon("custoMateriais") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortSummaryBy('custoHoras')"
                >
                  Custo Horas {{ summarySortIcon("custoHoras") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortSummaryBy('custoTotal')"
                >
                  Custo Total {{ summarySortIcon("custoTotal") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="aggregateSummary.length === 0">
                <td
                  colspan="5"
                  class="table-feedback muted"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
              <tr
                v-for="row in aggregateSummary"
                :key="row.programa"
              >
                <td class="material-name">
                  {{ row.programa }}
                </td>
                <td class="mono">
                  {{ row.qtdProjetos }}
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
              </tr>
            </tbody>
            <tfoot>
              <tr class="totals-row">
                <td class="totals-label">
                  Total
                </td>
                <td class="mono totals-value">
                  {{ summaryTotals.qtdProjetos }}
                </td>
                <td class="mono totals-value">
                  {{ fmt(summaryTotals.custoMateriais) }}
                </td>
                <td class="mono totals-value">
                  {{ fmt(summaryTotals.custoHoras) }}
                </td>
                <td class="total totals-value">
                  {{ fmt(summaryTotals.custoTotal) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useTheme } from "@/composables/useTheme";
import { useChartsDashboard } from "@/composables/useChartsDashboard";
import { usePermissions } from "@/composables/usePermissions";
import type { DashboardRow } from "@/composables/useChartsDashboard";
import { dashboardService } from "@/services/dashboardService";
import { CONFIG } from "@/utils/config";
import type {
  CompositionData,
  DashboardKPIs,
  DashboardFilters,
  DashboardSummaryRow,
  TopProjectRow,
  CostEvolutionRow,
} from "@/types/api";

const PER_PAGE = 8;

// ─── State ───────────────────────────────────────────────────────────────────
const tableData = ref<DashboardRow[]>([]);
const tableLoading = ref(true);
const kpisLoading = ref(true);
const kpis = ref<DashboardKPIs>({
  total_consolidated_cost: 0,
  total_materials_cost: 0,
  total_hours_cost: 0,
  total_projects: 0,
  total_programs: 0,
});
const compositionData = ref<CompositionData | null>(null);
const topProjectsData = ref<TopProjectRow[]>([]);
const summaryData = ref<DashboardSummaryRow[]>([]);
const costEvolutionData = ref<CostEvolutionRow[]>([]);
const filters = ref({ periodo: "", programa: "", projeto: "" });
const sortKey = ref<keyof DashboardRow>("custoTotal");
const sortDir = ref<1 | -1>(-1);
const page = ref(1);

// ─── Filter options — derivadas da tabela real ────────────────────────────────
const uniquePeriodos = computed(() =>
  [...new Set(tableData.value.map((r) => r.periodo))].sort(),
);
const uniqueProgramas = computed(() =>
  [...new Set(tableData.value.map((r) => r.programa))].sort(),
);
const availableProjects = computed(() => {
  const rows = filters.value.programa
    ? tableData.value.filter((r) => r.programa === filters.value.programa)
    : tableData.value;
  return [...new Set(rows.map((r) => r.projeto))].sort();
});
const activeFilterEntries = computed(() =>
  [
    { key: "periodo", label: "Status", value: filters.value.periodo },
    { key: "programa", label: "Programa", value: filters.value.programa },
    { key: "projeto", label: "Projeto", value: filters.value.projeto },
  ].filter((entry) => Boolean(entry.value)),
);
const hasActiveFilters = computed(() => activeFilterEntries.value.length > 0);

// ─── Tabela filtrada localmente ───────────────────────────────────────────────
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

// ─── Buscar KPIs da API ───────────────────────────────────────────────────────
function buildApiFilters(): DashboardFilters {
  const f = filters.value;
  const apiFilters: DashboardFilters = {};
  // f.periodo holds a status value (e.g. "Em andamento") — send as status filter
  if (f.periodo) apiFilters.status = f.periodo;
  if (f.programa) apiFilters.program = f.programa;
  if (f.projeto) apiFilters.project = f.projeto;
  return apiFilters;
}

async function fetchKPIs() {
  kpisLoading.value = true;
  try {
    kpis.value = await dashboardService.fetchKPIs(buildApiFilters());
  } catch (err) {
    console.error("Erro ao buscar KPIs:", err);
  } finally {
    kpisLoading.value = false;
  }
}

// ─── Buscar tabela consolidada da API ─────────────────────────────────────────
async function fetchTableData() {
  tableLoading.value = true
  try {
    const raw = await dashboardService.fetchConsolidated(buildApiFilters())
    tableData.value = raw.map((row) => ({
      projeto: row.nome_projeto ?? '',
      programa: row.programa ?? '',
      custoMateriais: row.custo_materiais,
      custoHoras: row.custo_horas,
      custoTotal: row.custo_total,
      periodo: row.status ?? '',
    }))
  } catch (err) {
    console.error('Erro ao buscar tabela:', err)
  } finally {
    tableLoading.value = false
  }
}

// ─── Buscar composição de custos da API ───────────────────────────────────────
async function fetchComposition() {
  try {
    const apiFilters = buildApiFilters();
    compositionData.value = await dashboardService.fetchComposition(apiFilters);
  } catch (err) {
    console.error("Erro ao buscar composição:", err);
  }
}

async function fetchTopProjects() {
  try {
    const apiFilters = buildApiFilters();
    topProjectsData.value = await dashboardService.fetchTopProjects(apiFilters);
  } catch (err) {
    console.error("Erro ao buscar top projetos:", err);
  }
}

async function fetchSummary() {
  try {
    const apiFilters = buildApiFilters();
    summaryData.value = await dashboardService.fetchSummary(apiFilters);
  } catch (err) {
    console.error("Erro ao buscar resumo por programa:", err);
  }
}

async function fetchCostEvolution() {
  try {
    const apiFilters = buildApiFilters();
    costEvolutionData.value = await dashboardService.fetchCostEvolution(apiFilters);
  } catch (err) {
    console.error("Erro ao buscar evolução de custos:", err);
  }
}

// ─── Watchers ────────────────────────────────────────────────────────────────
watch(filteredData, (val) => {
  page.value = 1;
  nextTick(() => updateCharts(val, compositionData.value ?? undefined, topProjectsData.value, summaryData.value, costEvolutionData.value));
});
watch(
  filters,
  async () => {
    await Promise.all([fetchKPIs(), fetchTableData(), fetchComposition(), fetchTopProjects(), fetchSummary(), fetchCostEvolution()]);
    // Re-render charts with fresh API data after async fetches complete
    nextTick(() =>
      updateCharts(filteredData.value, compositionData.value ?? undefined, topProjectsData.value, summaryData.value, costEvolutionData.value),
    );
  },
  { deep: true },
);


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
const sortIcon = (k: keyof DashboardRow) => {
  if (sortKey.value === k) return sortDir.value > 0 ? "↑" : "↓";
  return "↕";
};

function exportCSV() {
  const header = "Projeto,Programa,Custo Materiais,Custo Horas,Custo Total,Período";

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

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "dashboard-geral.csv");

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


function removeFilter(key: string) {
  (filters.value as Record<string, string>)[key] = "";
}
function clearFilters() {
  filters.value = { periodo: "", programa: "", projeto: "" };
}

// ─── Summary aggregate table ──────────────────────────────────────────────────
type SummaryRow = {
  programa: string;
  qtdProjetos: number;
  custoMateriais: number;
  custoHoras: number;
  custoTotal: number;
};
const summarySortKey = ref<keyof SummaryRow>("custoTotal");
const summarySortDir = ref<1 | -1>(-1);

const aggregateSummary = computed<SummaryRow[]>(() => {
  // Use API data from /dashboard/summary/ mapped to SummaryRow shape
  const rows: SummaryRow[] = summaryData.value.map((r) => ({
    programa: r.programa,
    qtdProjetos: r.qtd_projetos,
    custoMateriais: r.custo_materiais,
    custoHoras: r.custo_horas,
    custoTotal: r.custo_total,
  }));
  return rows
  .filter((row) => !filters.value.programa || row.programa === filters.value.programa)
  .sort((a, b) => {
    const av = a[summarySortKey.value];
    const bv = b[summarySortKey.value];
    return typeof av === "string"
      ? av.localeCompare(bv as string) * summarySortDir.value
      : ((av as number) - (bv as number)) * summarySortDir.value;
  });
});

const summaryTotals = computed(() => ({
  qtdProjetos: aggregateSummary.value.reduce((s, r) => s + r.qtdProjetos, 0),
  custoMateriais: aggregateSummary.value.reduce(
    (s, r) => s + r.custoMateriais,
    0,
  ),
  custoHoras: aggregateSummary.value.reduce((s, r) => s + r.custoHoras, 0),
  custoTotal: aggregateSummary.value.reduce((s, r) => s + r.custoTotal, 0),
}));

function sortSummaryBy(k: keyof SummaryRow) {
  if (summarySortKey.value === k)
    summarySortDir.value = (summarySortDir.value * -1) as 1 | -1;
  else {
    summarySortKey.value = k;
    summarySortDir.value = -1;
  }
}
const summarySortIcon = (k: keyof SummaryRow) => {
  if (summarySortKey.value === k) return summarySortDir.value > 0 ? "↑" : "↓";
  return "↕";
};

// ─── Charts ──────────────────────────────────────────────────────────────────
const { buildCharts, updateCharts, destroyCharts } = useChartsDashboard();
const { theme } = useTheme();
const { isProjetos } = usePermissions();

watch(theme, () => {
  nextTick(() => buildCharts(tableData.value, compositionData.value ?? undefined, topProjectsData.value, summaryData.value, costEvolutionData.value));
});

onMounted(async () => {
  await Promise.all([fetchKPIs(), fetchTableData(), fetchComposition(), fetchTopProjects(), fetchSummary(), fetchCostEvolution()]);
  nextTick(() =>
    buildCharts(tableData.value, compositionData.value ?? undefined, topProjectsData.value, summaryData.value, costEvolutionData.value),
  );
});
onUnmounted(destroyCharts);
</script>

<style scoped>
/* ── Variables ────────────────────────────────────────────────────────────── */
.app {
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
  grid-template-columns: repeat(5, 1fr);
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
.clear-btn {
  background: transparent;
  border: 1px solid var(--border2);
  color: var(--text2);
  border-radius: 7px;
  padding: 7px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-btn:hover {
  color: var(--text);
  border-color: var(--blue2);
}
.active-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 12px;
}
.active-filters-label {
  font-size: 11px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg3);
  border: 1px solid var(--border2);
  color: var(--text);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
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
.chart-card--full {
  grid-column: 1 / -1;
}
.chart-wrap.evolution {
  height: 280px;
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
  color: var(--text);
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
/* ── Summary tfoot ────────────────────────────────────────────────────────── */
tfoot tr.totals-row {
  background: var(--bg3);
  border-top: 2px solid var(--border2);
}
tfoot td {
  padding: 11px 16px;
  white-space: nowrap;
}
tfoot td.totals-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
tfoot td.totals-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
tfoot td.total.totals-value {
  color: var(--green);
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

.chip-remove {
  background: none;
  border: none;
  color: var(--text3);
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  padding: 0 1px;
  display: flex;
  align-items: center;
  opacity: 0.5;
  transition: opacity 0.15s, color 0.15s;
}
.chip-remove:hover {
  opacity: 1;
  color: #e05252;
}
</style>