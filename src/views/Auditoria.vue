<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">
        Auditoria
      </h1>

      <!-- METRICS -->
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-label">
            Total de Registros
          </div>
          <div class="metric-value blue">
            {{ filteredData.length }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Aprovados
          </div>
          <div class="metric-value green">
            {{ kpis.aprovados }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Pendentes
          </div>
          <div class="metric-value amber">
            {{ kpis.pendentes }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Rejeitados
          </div>
          <div class="metric-value red">
            {{ kpis.rejeitados }}
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
            v-model="filters.tipo"
            class="filter-select"
          >
            <option value="">
              Todos os Tipos
            </option>
            <option
              v-for="t in uniqueTipos"
              :key="t"
              :value="t"
            >
              {{ t }}
            </option>
          </select>
          <select
            v-model="filters.status"
            class="filter-select"
          >
            <option value="">
              Todos os Status
            </option>
            <option
              v-for="s in uniqueStatuses"
              :key="s"
              :value="s"
            >
              {{ s }}
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
          <select
            v-model="filters.responsavel"
            class="filter-select"
          >
            <option value="">
              Todos os Responsáveis
            </option>
            <option
              v-for="r in uniqueResponsaveis"
              :key="r"
              :value="r"
            >
              {{ r }}
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
          </span>
        </div>
      </div>

      <!-- TOP CHARTS -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">
            Registros por Status
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartStatusPeriodo" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Registros por Tipo
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartPorTipo" />
          </div>
        </div>
      </div>

      <!-- BOTTOM CHARTS -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">
            Registros por Responsável
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartPorResponsavel" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Evolução de Auditorias
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartTemporalAud" />
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-card">
        <div class="table-header">
          <h2>Registros de Auditoria</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th
                  class="sort-col"
                  @click="sortBy('tipo')"
                >
                  Tipo {{ sortIcon("tipo") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('descricao')"
                >
                  Descrição {{ sortIcon("descricao") }}
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
                  @click="sortBy('responsavel')"
                >
                  Responsável {{ sortIcon("responsavel") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('dataRegistro')"
                >
                  Data Registro {{ sortIcon("dataRegistro") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('dataRevisao')"
                >
                  Data Revisão {{ sortIcon("dataRevisao") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('valorImpacto')"
                >
                  Linhas Afetadas {{ sortIcon("valorImpacto") }}
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagedData.length === 0">
                <td
                  colspan="9"
                  class="table-feedback muted"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
              <tr
                v-for="row in pagedData"
                :key="row.id"
              >
                <td>
                  <span :class="tipoClass(row.tipo)">{{ row.tipo }}</span>
                </td>
                <td class="material-name">
                  {{ row.descricao }}
                </td>
                <td class="muted">
                  {{ row.projeto }}
                </td>
                <td class="muted">
                  {{ row.programa }}
                </td>
                <td class="muted">
                  {{ row.responsavel }}
                </td>
                <td class="mono">
                  {{ row.dataRegistro }}
                </td>
                <td class="mono">
                  {{ row.dataRevisao }}
                </td>
                <td class="mono">
                  {{ fmt(row.valorImpacto) }}
                </td>
                <td>
                  <span :class="statusClass(row.status)">{{ row.status }}</span>
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
import { useChartsAuditoria } from "@/composables/useChartsAuditoria";
import type { AuditoriaRow } from "@/composables/useChartsAuditoria";
import { CONFIG } from "@/utils/config";

const PER_PAGE = 8;

const API_URL = `${CONFIG.API_BASE_URL}/audit/`;

interface ApiRow {
  id: number;
  operation: string;
  status: string;
  table_schema: string | null;
  table_name: string | null;
  affected_rows: number | null;
  started_at: string;
  finalized_at: string | null;
  operation_metadata: Record<string, unknown> | null;
}

const STATUS_MAP: Record<string, string> = {
  SUCCESS: "Aprovado",
  FAILED: "Rejeitado",
  PARTIAL: "Parcial",
};

const OPERATION_MAP: Record<string, string> = {
  INGEST: "Ingestão",
  TRANSFORM: "Transformação",
  EXPORT: "Exportação",
};

function toRow(r: ApiRow): AuditoriaRow {
  const meta = r.operation_metadata ?? {};
  const descricao = [r.table_schema, r.table_name].filter(Boolean).join(".");
  return {
    id: r.id,
    tipo: OPERATION_MAP[r.operation] ?? r.operation,
    descricao: descricao || r.operation,
    projeto: String(meta.nome_projeto ?? meta.projeto ?? ""),
    programa: String(meta.nome_programa ?? meta.programa ?? ""),
    responsavel: String(meta.responsavel ?? ""),
    dataRegistro: r.started_at ? r.started_at.split("T")[0] : "",
    dataRevisao: r.finalized_at ? r.finalized_at.split("T")[0] : "",
    status: STATUS_MAP[r.status] ?? r.status,
    valorImpacto: r.affected_rows ?? 0,
    observacao: "",
  };
}

// ─── State ───────────────────────────────────────────────────────────────────
const tableData = ref<AuditoriaRow[]>([]);
const filters = ref({
  tipo: "",
  status: "",
  projeto: "",
  responsavel: "",
  programa: "",
});
const sortKey = ref<keyof AuditoriaRow>("dataRegistro");
const sortDir = ref<1 | -1>(-1);
const page = ref(1);

// ─── Filter options ──────────────────────────────────────────────────────────
const uniqueTipos = computed(() =>
  [...new Set(tableData.value.map((r) => r.tipo))].sort(),
);
const uniqueStatuses = computed(() =>
  [...new Set(tableData.value.map((r) => r.status))].sort(),
);
const availableProjects = computed(() => {
  const rows = filters.value.programa
    ? tableData.value.filter((r) => r.programa === filters.value.programa)
    : tableData.value;
  return [...new Set(rows.map((r) => r.projeto))].sort();
});
const uniqueResponsaveis = computed(() =>
  [...new Set(tableData.value.map((r) => r.responsavel))].sort(),
);
const uniqueProgramas = computed(() =>
  [...new Set(tableData.value.map((r) => r.programa))].sort(),
);
const activeFilterEntries = computed(() =>
  [
    { key: "tipo", label: "Tipo", value: filters.value.tipo },
    { key: "status", label: "Status", value: filters.value.status },
    { key: "programa", label: "Programa", value: filters.value.programa },
    { key: "projeto", label: "Projeto", value: filters.value.projeto },
    {
      key: "responsavel",
      label: "Responsável",
      value: filters.value.responsavel,
    },
  ].filter((entry) => Boolean(entry.value)),
);
const hasActiveFilters = computed(() => activeFilterEntries.value.length > 0);

// ─── Computed ────────────────────────────────────────────────────────────────
const filteredData = computed(() => {
  const f = filters.value;
  return tableData.value
    .filter(
      (r) =>
        (!f.tipo || r.tipo === f.tipo) &&
        (!f.status || r.status === f.status) &&
        (!f.projeto || r.projeto === f.projeto) &&
        (!f.responsavel || r.responsavel === f.responsavel) &&
        (!f.programa || r.programa === f.programa),
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
    aprovados: d.filter((r) => r.status === "Aprovado").length,
    pendentes: d.filter(
      (r) => r.status === "Pendente" || r.status === "Em Análise",
    ).length,
    rejeitados: d.filter((r) => r.status === "Rejeitado").length,
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

watch(
  () => filters.value.programa,
  () => {
    if (
      filters.value.projeto &&
      !availableProjects.value.includes(filters.value.projeto)
    ) {
      filters.value.projeto = "";
    }
  },
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString("pt-BR");

function sortBy(k: keyof AuditoriaRow) {
  if (sortKey.value === k) sortDir.value = (sortDir.value * -1) as 1 | -1;
  else {
    sortKey.value = k;
    sortDir.value = -1;
  }
}
const sortIcon = (k: keyof AuditoriaRow) =>
  sortKey.value !== k ? "↕" : sortDir.value > 0 ? "↑" : "↓";

function statusClass(s: string) {
  const map: Record<string, string> = {
    Aprovado: "badge badge-st",
    Pendente: "badge badge-sg",
    "Em Análise": "badge badge-hw",
    Rejeitado: "badge badge-rd",
  };
  return map[s] ?? "badge badge-hw";
}

function tipoClass(t: string) {
  const map: Record<string, string> = {
    Ingestão: "badge badge-hw",
    Transformação: "badge badge-cl",
    Exportação: "badge badge-sg",
  };
  return map[t] ?? "badge badge-hw";
}

function exportCSV() {
  const header =
    "Tipo,Descrição,Projeto,Programa,Responsável,Data Registro,Data Revisão,Linhas Afetadas,Status";
  const rows = filteredData.value.map((r) =>
    [
      r.tipo,
      r.descricao,
      r.projeto,
      r.programa,
      r.responsavel,
      r.dataRegistro,
      r.dataRevisao,
      r.valorImpacto,
      r.status,
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "auditoria.csv";
  a.click();
}

function clearFilters() {
  filters.value = {
    tipo: "",
    status: "",
    projeto: "",
    responsavel: "",
    programa: "",
  };
}

// ─── Charts ──────────────────────────────────────────────────────────────────
const { buildCharts, updateCharts, destroyCharts } = useChartsAuditoria();

async function loadData() {
  try {
    const params = new URLSearchParams();
    if (filters.value.programa) params.set("programa", filters.value.programa);
    if (filters.value.projeto) params.set("projeto", filters.value.projeto);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_URL}${query}`);
    if (!res.ok) return;
    const raw: ApiRow[] = await res.json();
    tableData.value = raw.map(toRow);
  } catch {
    // keep existing data on error
  }
}

watch(
  () => [filters.value.programa, filters.value.projeto],
  () => { void loadData(); },
);

onMounted(async () => {
  await loadData();
  nextTick(() => buildCharts(tableData.value));
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
.metric-value.amber {
  color: var(--amber);
}
.metric-value.red {
  color: var(--red);
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
  min-width: 1200px;
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
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
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
