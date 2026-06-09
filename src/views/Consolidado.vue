<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">
        Consolidado
      </h1>

      <div
        class="update-banner"
        data-testid="last-update-banner"
      >
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke-width="1.5"
          />
          <path
            d="M12 8v5l3 2"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="update-label">Última importação</span>
        <strong class="update-value">{{ formattedLastUpdatedAt }}</strong>
      </div>

      <!-- METRICS -->
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-label">
            Custo Total Consolidado
          </div>
          <div class="metric-value blue">
            {{ fmt(kpis.custoTotal) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Custo Materiais
          </div>
          <div class="metric-value">
            {{ fmt(kpis.custoMateriais) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Custo Horas Técnicas
          </div>
          <div class="metric-value green">
            {{ fmt(kpis.custoHoras) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Total de Projetos
          </div>
          <div class="metric-value">
            {{ kpis.totalProjetos }}
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
          <button
            v-if="hasActiveFilters"
            class="clear-btn"
            @click="clearFilters"
          >
            Limpar filtros
          </button>
          <div class="export-group">
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

      <!-- TOP CHARTS -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">
            Distribuição de Custos por Projeto (Materiais vs Horas)
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartDistribuicao" />
          </div>
        </div>
        <div
          v-if="!isProjetos"
          class="chart-card"
        >
          <div class="chart-title">
            Custo Total por Programa
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartPorPrograma" />
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
            Top 10 – Maior Custo Total
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartTopCustos" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Evolução Mensal Consolidada
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartTemporalCons" />
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-card">
        <div class="table-header">
          <h2>Tabela Consolidada por Projeto</h2>
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
                  @click="sortBy('qtdMateriais')"
                >
                  Qtd Materiais {{ sortIcon("qtdMateriais") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('totalHoras')"
                >
                  Total Horas {{ sortIcon("totalHoras") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('periodo')"
                >
                  Período {{ sortIcon("periodo") }}
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
                <td class="mono right">
                  {{ row.qtdMateriais }}
                </td>
                <td class="mono right">
                  {{ row.totalHoras }}h
                </td>
                <td class="mono">
                  {{ row.periodo }}
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
import { useTheme } from "@/composables/useTheme";
import { useChartsConsolidado } from "@/composables/useChartsConsolidado";
import type { ConsolidadoRow } from "@/composables/useChartsConsolidado";
import { usePermissions } from "@/composables/usePermissions";
import { apiService } from "@/services/apiService";
import { dashboardService } from "@/services/dashboardService";
import type { CostEvolutionRow } from "@/types/api";
import * as XLSX from 'xlsx'

const PER_PAGE = 8;

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK: ConsolidadoRow[] = [
  {
    id: 1,
    projeto: "Data Center Regional",
    programa: "Infraestrutura",
    custoMateriais: 245000,
    custoHoras: 217400,
    custoTotal: 462400,
    qtdMateriais: 48,
    totalHoras: 660,
    periodo: "2024-01",
    status: "Concluído",
  },
  {
    id: 2,
    projeto: "Storage Upgrade",
    programa: "Infraestrutura",
    custoMateriais: 189000,
    custoHoras: 95000,
    custoTotal: 284000,
    qtdMateriais: 35,
    totalHoras: 320,
    periodo: "2024-01",
    status: "Concluído",
  },
  {
    id: 3,
    projeto: "Migração AWS",
    programa: "Cloud",
    custoMateriais: 156000,
    custoHoras: 282000,
    custoTotal: 438000,
    qtdMateriais: 28,
    totalHoras: 780,
    periodo: "2024-01",
    status: "Em Andamento",
  },
  {
    id: 4,
    projeto: "SOC Implementation",
    programa: "Segurança",
    custoMateriais: 178000,
    custoHoras: 216200,
    custoTotal: 394200,
    qtdMateriais: 42,
    totalHoras: 560,
    periodo: "2024-03",
    status: "Em Andamento",
  },
  {
    id: 5,
    projeto: "Modernização de Rede",
    programa: "Infraestrutura",
    custoMateriais: 134500,
    custoHoras: 95700,
    custoTotal: 230200,
    qtdMateriais: 30,
    totalHoras: 290,
    periodo: "2024-03",
    status: "Concluído",
  },
  {
    id: 6,
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    custoMateriais: 67000,
    custoHoras: 441200,
    custoTotal: 508200,
    qtdMateriais: 15,
    totalHoras: 1370,
    periodo: "2024-02",
    status: "Em Andamento",
  },
  {
    id: 7,
    projeto: "Portal Web",
    programa: "Desenvolvimento",
    custoMateriais: 52000,
    custoHoras: 328800,
    custoTotal: 380800,
    qtdMateriais: 12,
    totalHoras: 1250,
    periodo: "2024-01",
    status: "Concluído",
  },
  {
    id: 8,
    projeto: "Container Platform",
    programa: "Cloud",
    custoMateriais: 98000,
    custoHoras: 145000,
    custoTotal: 243000,
    qtdMateriais: 22,
    totalHoras: 450,
    periodo: "2024-02",
    status: "Em Andamento",
  },
  {
    id: 9,
    projeto: "App Mobile",
    programa: "Desenvolvimento",
    custoMateriais: 34000,
    custoHoras: 132400,
    custoTotal: 166400,
    qtdMateriais: 8,
    totalHoras: 510,
    periodo: "2024-02",
    status: "Planejado",
  },
  {
    id: 10,
    projeto: "DevOps Pipeline",
    programa: "Desenvolvimento",
    custoMateriais: 87000,
    custoHoras: 110000,
    custoTotal: 197000,
    qtdMateriais: 20,
    totalHoras: 380,
    periodo: "2024-03",
    status: "Concluído",
  },
  {
    id: 11,
    projeto: "Firewall Corporativo",
    programa: "Segurança",
    custoMateriais: 142000,
    custoHoras: 78000,
    custoTotal: 220000,
    qtdMateriais: 38,
    totalHoras: 240,
    periodo: "2024-02",
    status: "Concluído",
  },
  {
    id: 12,
    projeto: "CRM Customizado",
    programa: "Desenvolvimento",
    custoMateriais: 45000,
    custoHoras: 165000,
    custoTotal: 210000,
    qtdMateriais: 10,
    totalHoras: 580,
    periodo: "2024-03",
    status: "Planejado",
  },
];

// ─── State ───────────────────────────────────────────────────────────────────
const tableData = ref<ConsolidadoRow[]>([]);
const costEvolutionData = ref<CostEvolutionRow[]>([]);
const lastUpdatedAt = ref<string | null>(null);
const filters = ref({ periodo: "", programa: "", projeto: "", status: "" });
const sortKey = ref<keyof ConsolidadoRow>("custoTotal");
const sortDir = ref<1 | -1>(-1);
const page = ref(1);

// ─── Filter options ──────────────────────────────────────────────────────────
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
const uniqueStatuses = computed(() =>
  [...new Set(tableData.value.map((r) => r.status))].sort(),
);
const activeFilterEntries = computed(() =>
  [
    { key: "periodo", label: "Período", value: filters.value.periodo },
    { key: "programa", label: "Programa", value: filters.value.programa },
    { key: "projeto", label: "Projeto", value: filters.value.projeto },
    { key: "status", label: "Status", value: filters.value.status },
  ].filter((entry) => Boolean(entry.value)),
);
const hasActiveFilters = computed(() => activeFilterEntries.value.length > 0);

// ─── Computed ────────────────────────────────────────────────────────────────
const filteredData = computed(() => {
  const f = filters.value;
  return tableData.value
    .filter(
      (r) =>
        (!f.periodo || r.periodo === f.periodo) &&
        (!f.programa || r.programa === f.programa) &&
        (!f.projeto || r.projeto === f.projeto) &&
        (!f.status || r.status === f.status),
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

const formattedLastUpdatedAt = computed(() => {
  if (!lastUpdatedAt.value) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(lastUpdatedAt.value));
});

// ─── Watchers ────────────────────────────────────────────────────────────────
watch(filteredData, (val) => {
  page.value = 1;
  nextTick(() => updateCharts(val, costEvolutionData.value));
});



watch(
  () => [
    filters.value.periodo,
    filters.value.programa,
    filters.value.projeto,
    filters.value.status,
  ],
  () => {
    void loadConsolidado();
  },
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

function sortBy(k: keyof ConsolidadoRow) {
  if (sortKey.value === k) sortDir.value = (sortDir.value * -1) as 1 | -1;
  else {
    sortKey.value = k;
    sortDir.value = -1;
  }
}
const sortIcon = (k: keyof ConsolidadoRow) => {
  if (sortKey.value === k) return sortDir.value > 0 ? "↑" : "↓";
  return "↕";
};

function statusClass(s: string) {
  const map: Record<string, string> = {
    Concluído: "badge badge-st",
    "Em Andamento": "badge badge-hw",
    Planejado: "badge badge-sg",
    Cancelado: "badge badge-rd",
  };
  return map[s] ?? "badge badge-hw";
}

function exportCSV() {
  const header =
    "Projeto,Programa,Custo Materiais,Custo Horas,Custo Total,Qtd Materiais,Total Horas,Período,Status";
  const rows = filteredData.value.map((r) =>
    [
      r.projeto,
      r.programa,
      r.custoMateriais,
      r.custoHoras,
      r.custoTotal,
      r.qtdMateriais,
      r.totalHoras,
      r.periodo,
      r.status,
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "consolidado.csv";
  a.click();
}

function exportExcel() {
  const rows = filteredData.value.map((r) => ({
    Projeto: r.projeto,
    Programa: r.programa,
    'Custo Materiais': r.custoMateriais,
    'Custo Horas': r.custoHoras,
    'Custo Total': r.custoTotal,
    'Qtd Materiais': r.qtdMateriais,
    'Total Horas': r.totalHoras,
    Período: r.periodo,
    Status: r.status,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Consolidado')
  XLSX.writeFile(wb, 'consolidado.xlsx')
}

function removeFilter(key: string) {
  (filters.value as Record<string, string>)[key] = "";
}
function clearFilters() {
  filters.value = { periodo: "", programa: "", projeto: "", status: "" };
}

// ─── Charts ──────────────────────────────────────────────────────────────────
const { buildCharts, updateCharts, destroyCharts } = useChartsConsolidado();
const { theme } = useTheme();
const { isProjetos } = usePermissions();

watch(theme, () => {
  nextTick(() => buildCharts(tableData.value, costEvolutionData.value));
});

async function fetchEvolution() {
  try {
    const f = filters.value;
    const apiFilters: Record<string, string> = {};
    if (f.programa) apiFilters.program = f.programa;
    if (f.projeto) apiFilters.project = f.projeto;
    if (f.status) apiFilters.status = f.status;
    costEvolutionData.value = await dashboardService.fetchCostEvolution(apiFilters);
  } catch (err) {
    console.error("Erro ao buscar evolução de custos:", err);
  }
}

async function loadConsolidado() {
  try {
    const snapshot = await apiService.consolidated.fetchConsolidatedSnapshot(
      filters.value,
    );
    tableData.value = snapshot.rows;
    lastUpdatedAt.value = snapshot.lastUpdatedAt;
  } catch (error) {
    console.error(error);
    tableData.value = MOCK;
    lastUpdatedAt.value = null;
  }

  await fetchEvolution();
  nextTick(() => buildCharts(tableData.value, costEvolutionData.value));
}

onMounted(() => {
  void loadConsolidado();
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

.update-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(90deg, rgba(77, 143, 255, 0.12), var(--bg2));
  border: 1px solid rgba(77, 143, 255, 0.28);
  border-radius: 10px;
  color: var(--text);
}

.update-banner svg {
  width: 16px;
  height: 16px;
  color: var(--blue);
  flex-shrink: 0;
}

.update-label {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text2);
}

.update-value {
  font-family: inherit;
  font-size: 13px;
  color: var(--blue);
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
  font-family: inherit;
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
  min-width: 1060px;
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