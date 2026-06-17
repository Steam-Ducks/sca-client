<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">
        Horas Técnicas
      </h1>

      <!-- METRICS -->
      <div class="metrics">
        <MetricCard
          v-if="!isProjetos"
          label="Custo Total - Horas"
          :value="fmt(kpis.custoTotal)"
          color="blue"
        />
        <MetricCard
          label="Total de Horas"
          :value="totalHorasFormatted"
        />
        <MetricCard
          v-if="!isProjetos"
          label="Custo Médio/Hora"
          :value="fmt(kpis.custoMedio)"
          color="green"
        />
        <MetricCard
          label="Registros"
          :value="filteredData.length"
        />
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
            data-testid="filter-periodo"
          >
            <option value="">
              Todos os Períodos
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
            data-testid="filter-programa"
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
            data-testid="filter-projeto"
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
          <select
            v-model="filters.colaborador"
            class="filter-select"
            data-testid="filter-colaborador"
          >
            <option value="">
              Todos os Colaboradores
            </option>
            <option
              v-for="c in uniqueColaboradores"
              :key="c"
              :value="c"
            >
              {{ c }}
            </option>
          </select>
          <select
            v-model="filters.tarefa"
            class="filter-select"
            data-testid="filter-tarefa"
          >
            <option value="">
              Todas as Tarefas
            </option>
            <option
              v-for="t in uniqueTarefas"
              :key="t"
              :value="t"
            >
              {{ t }}
            </option>
          </select>
          <button
            v-if="hasActiveFilters"
            class="clear-btn"
            data-testid="btn-clear-filters"
            @click="clearFilters"
          >
            Limpar filtros
          </button>
          <div class="export-group">
            <button
              class="export-btn"
              data-testid="btn-export"
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
              Exportar CSV
            </button>
            <button
              class="export-btn"
              @click="exportExcel"
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
              Exportar Excel
            </button>
          </div>
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

      <!-- TOP CHARTS: Horas e Custo por Projeto -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">
            Total de Horas por Projeto
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartHorasProjeto" />
          </div>
        </div>
        <div
          v-if="!isProjetos"
          class="chart-card"
        >
          <div class="chart-title">
            Custo de Horas por Projeto
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartCustoProjeto" />
          </div>
        </div>
      </div>

      <!-- BOTTOM CHARTS: Custo por Colaborador + Temporal -->
      <div class="charts-row">
        <div
          v-if="!isProjetos"
          class="chart-card"
        >
          <div class="chart-title">
            Top 10 - Custo por Colaborador
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartCustoColaborador" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Evolução Temporal das Horas
          </div>
          <div class="chart-wrap tall">
            <canvas
              id="chartTemporal"
              data-testid="chart-temporal"
            />
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-card">
        <div class="table-header">
          <h2>Tabela Detalhada de Horas Técnicas</h2>
        </div>
        <div class="table-wrap">
          <table data-testid="data-table">
            <thead>
              <tr>
                <th
                  class="sort-col"
                  @click="sortBy('colaborador')"
                >
                  Colaborador {{ sortIcon("colaborador") }}
                </th>
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
                  @click="sortBy('horas')"
                >
                  Horas {{ sortIcon("horas") }}
                </th>
                <th
                  v-if="!isProjetos"
                  class="sort-col"
                  @click="sortBy('custoPorHora')"
                >
                  Custo/Hora {{ sortIcon("custoPorHora") }}
                </th>
                <th
                  v-if="!isProjetos"
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
                <th>Tarefa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tableLoading">
                <td
                  colspan="8"
                  class="table-feedback muted"
                >
                  Carregando dados...
                </td>
              </tr>
              <tr v-else-if="tableError">
                <td
                  colspan="8"
                  class="table-feedback error"
                >
                  {{ tableError }}
                </td>
              </tr>
              <tr v-else-if="pagedData.length === 0">
                <td
                  colspan="8"
                  class="table-feedback muted"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
              <tr
                v-for="row in pagedData"
                :key="row.id"
                :data-testid="`row-${row.id}`"
              >
                <td class="material-name">
                  {{ row.colaborador }}
                </td>
                <td class="muted">
                  {{ row.projeto }}
                </td>
                <td class="muted">
                  {{ row.programa }}
                </td>
                <td class="mono right">
                  {{ fmtH(row.horas) }}
                </td>
                <td
                  v-if="!isProjetos"
                  class="mono"
                >
                  {{ fmt(row.custoPorHora) }}
                </td>
                <td
                  v-if="!isProjetos"
                  class="total"
                >
                  {{ fmt(row.custoTotal) }}
                </td>
                <td class="mono">
                  {{ row.periodo }}
                </td>
                <td>
                  <span :class="tagClass(row.tarefa)">{{ row.tarefa }}</span>
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import type { HoraRow } from "@/types/api";
import { useChartsTechnical } from "@/composables/useChartsTechnical";
import { usePermissions } from "@/composables/usePermissions";
import { horasTecnicasService } from '@/services/horasTecnicasService'
import { useExport } from '@/composables/useExport'
import { fmtBRL, fmtHours } from '@/utils/format'
import MetricCard from "@/components/MetricCard.vue";

const PER_PAGE = 8;

// ─── State ────────────────────────────────────────────────────────────────────
const tableData = ref<HoraRow[]>([]);
const tableLoading = ref(false);
const tableError = ref("");

const filters = ref({
  periodo: "",
  programa: "",
  projeto: "",
  colaborador: "",
  tarefa: "",
});
const sortKey = ref<keyof HoraRow>("custoTotal");
const sortDir = ref<1 | -1>(-1);
const page = ref(1);

// ─── Filter options (derived from tableData) ──────────────────────────────────
const uniq = (key: keyof HoraRow) =>
  computed(() =>
    [...new Set(tableData.value.map((r) => String(r[key])))].sort(),
  );

const allPeriodos = computed(() =>
  [...new Set(tableData.value.map((r) => r.periodo))].filter(Boolean).sort(),
);
const uniquePeriodos = uniq("periodo");
const uniqueProgramas = uniq("programa");
const uniqueColaboradores = uniq("colaborador");
const uniqueTarefas = uniq("tarefa");
const availableProjects = computed(() => {
  const rows = filters.value.programa
    ? tableData.value.filter((r) => r.programa === filters.value.programa)
    : tableData.value;
  return [...new Set(rows.map((r) => r.projeto))].sort();
});
const activeFilterEntries = computed(() =>
  [
    { key: "periodo", label: "Período", value: filters.value.periodo },
    { key: "programa", label: "Programa", value: filters.value.programa },
    { key: "projeto", label: "Projeto", value: filters.value.projeto },
    {
      key: "colaborador",
      label: "Colaborador",
      value: filters.value.colaborador,
    },
    { key: "tarefa", label: "Tarefa", value: filters.value.tarefa },
  ].filter((entry) => Boolean(entry.value)),
);
const hasActiveFilters = computed(() => activeFilterEntries.value.length > 0);

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredData = computed(() => {
  const f = filters.value;
  return tableData.value
    .filter(
      (r) =>
        (!f.periodo || r.periodo === f.periodo) &&
        (!f.programa || r.programa === f.programa) &&
        (!f.projeto || r.projeto === f.projeto) &&
        (!f.colaborador || r.colaborador === f.colaborador) &&
        (!f.tarefa || r.tarefa === f.tarefa),
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
  const total = filteredData.value.reduce((s, r) => s + r.custoTotal, 0);
  const horas = filteredData.value.reduce((s, r) => s + r.horas, 0);
  return {
    custoTotal: total,
    totalHoras: horas,
    custoMedio: horas > 0 ? total / horas : 0,
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

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(filteredData, (data) => {
  page.value = 1;
  updateCharts(data, allPeriodos.value);
});

// ─── API load ─────────────────────────────────────────────────────────────────
async function loadData() {
  tableLoading.value = true
  tableError.value = ''
  try {
    tableData.value = await horasTecnicasService.fetchAll({
      periodo: filters.value.periodo || undefined,
      programa: filters.value.programa || undefined,
      projeto: filters.value.projeto || undefined,
    })
  } catch (err) {
    console.error('Erro ao buscar horas técnicas:', err)
    tableError.value = 'Erro ao carregar dados. Tente novamente.'
  } finally {
    tableLoading.value = false
  }
}

watch(
  () => [filters.value.periodo, filters.value.programa, filters.value.projeto],
  () => {
    void loadData();
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = fmtBRL
const fmtH = fmtHours

const totalHorasFormatted = computed(() => `${fmtH(kpis.value.totalHoras)}h`);

function sortBy(k: keyof HoraRow) {
  if (sortKey.value === k) sortDir.value = (sortDir.value * -1) as 1 | -1;
  else {
    sortKey.value = k;
    sortDir.value = -1;
  }
}
const sortIcon = (k: keyof HoraRow) => {
  if (sortKey.value === k) return sortDir.value > 0 ? "↑" : "↓";
  return "↕";
};

function tagClass(t: string) {
  const map: Record<string, string> = {
    "Arquitetura Cloud": "badge badge-cl",
    "Liderança Técnica": "badge badge-sg",
    Desenvolvimento: "badge badge-hw",
    "Banco de Dados": "badge badge-st",
    Configuração: "badge badge-rd",
    Migração: "badge badge-sw",
    Arquitetura: "badge badge-cl",
    Design: "badge badge-sg",
  };
  return map[t] ?? "badge badge-hw";
}

const { exportCSV: downloadCSV, exportExcel: downloadExcel } = useExport()

function toExportRows() {
  return filteredData.value.map((r) => ({
    Colaborador: r.colaborador,
    Projeto: r.projeto,
    Programa: r.programa,
    Horas: r.horas,
    'Custo/Hora': r.custoPorHora,
    'Custo Total': r.custoTotal,
    Período: r.periodo,
    Tarefa: r.tarefa,
  }))
}

function exportCSV() { downloadCSV(toExportRows(), 'horas-tecnicas') }
function exportExcel() { downloadExcel(toExportRows(), 'horas-tecnicas', 'Horas Técnicas') }

function removeFilter(key: string) {
  (filters.value as Record<string, string>)[key] = "";
}
function clearFilters() {
  filters.value = {
    periodo: "",
    programa: "",
    projeto: "",
    colaborador: "",
    tarefa: "",
  };
}

// ─── Charts ───────────────────────────────────────────────────────────────────
const { buildCharts, updateCharts, destroyCharts } = useChartsTechnical();
const { isProjetos } = usePermissions();

onMounted(async () => {
  await loadData();
  nextTick(() => buildCharts(filteredData.value, allPeriodos.value));
});
onUnmounted(destroyCharts);
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
}

/* ── Scrollbar ────────────────────────────────────────────────────────────── */
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

/* ── Main ─────────────────────────────────────────────────────────────────── */
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
.metric-card:nth-child(2) {
  animation-delay: 0.06s;
}
.metric-card:nth-child(3) {
  animation-delay: 0.12s;
}
.metric-card:nth-child(4) {
  animation-delay: 0.18s;
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

.export-group {
  display: flex;
  gap: 8px;
  margin-left: auto;
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
  min-width: 960px;
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
  font-family: inherit;
  font-size: 12px;
}
td.right {
  text-align: right;
}
td.total {
  font-family: inherit;
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
.table-feedback.error {
  color: var(--red);
}

/* ── Badges ───────────────────────────────────────────────────────────────── */
.badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
}
.badge-hw {
  background: rgba(77, 143, 255, 0.15);
  color: var(--blue);
}
.badge-st {
  background: rgba(45, 212, 160, 0.12);
  color: var(--green);
}
.badge-cl {
  background: rgba(155, 127, 255, 0.12);
  color: var(--purple);
}
.badge-sg {
  background: rgba(245, 166, 35, 0.12);
  color: var(--amber);
}
.badge-sw {
  background: rgba(245, 166, 35, 0.12);
  color: var(--amber);
}
.badge-rd {
  background: rgba(245, 90, 90, 0.12);
  color: var(--red);
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

/* ── Accessibility ────────────────────────────────────────────────────────── */
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

/* ── Animation ────────────────────────────────────────────────────────────── */
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