<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">
        Orçamento e Saúde Financeira
      </h1>

      <div
        class="metrics"
        data-testid="metrics-section"
      >
        <div class="metric-card">
          <div class="metric-label">
            Budget Total
          </div>
          <div class="metric-value blue">
            {{ fmtBRL(kpis.budgetTotal) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Custo Real Total
          </div>
          <div class="metric-value">
            {{ fmtBRL(kpis.custoRealTotal) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Desvio % Médio
          </div>
          <div class="metric-value">
            {{ kpis.desvioMedio.toFixed(1) }}%
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Projetos Saudáveis
          </div>
          <div class="metric-value green">
            {{ kpis.saudavelCount }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Projetos em Atenção
          </div>
          <div class="metric-value amber">
            {{ kpis.atencaoCount }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Projetos Críticos
          </div>
          <div class="metric-value red">
            {{ kpis.criticoCount }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Projeção de Estouro
          </div>
          <div class="metric-value">
            {{ fmtBRL(kpis.projecaoEstouro) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Última Atualização
          </div>
          <div class="metric-value date">
            {{ ultimaAtualizacao }}
          </div>
          <div class="metric-sub">
            Snapshot
          </div>
        </div>
      </div>

      <div
        class="filters-card"
        data-testid="filters-section"
      >
        <div class="filters-title">
          Filtros
        </div>
        <div class="filters-row">
          <select
            v-model="filters.periodo"
            class="filter-select"
            data-testid="filter-periodo"
          >
            <option value="">
              Todos os períodos
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
              Todos os programas
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
          >
            <option value="">
              Todos os projetos
            </option>
            <option
              v-for="p in uniqueProjetos"
              :key="p"
              :value="p"
            >
              {{ p }}
            </option>
          </select>
          <select
            v-model="filters.saude"
            class="filter-select"
            data-testid="filter-saude"
          >
            <option value="">
              Todas as classificações
            </option>
            <option value="Saudável">
              Saudável
            </option>
            <option value="Atenção">
              Atenção
            </option>
            <option value="Crítico">
              Crítico
            </option>
          </select>
          <button
            class="clear-btn"
            data-testid="btn-limpar"
            @click="clearFilters"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">
            Budget vs Custo Real por Projeto
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartBudgetVsCusto" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Desvio Percentual por Projeto
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartDesvioPercentual" />
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">
            Distribuição de Projetos por Status de Saúde
          </div>
          <div class="chart-wrap donut">
            <canvas id="chartDistribuicao" />
          </div>
        </div>
        <div class="chart-card projecao-card">
          <div class="chart-title">
            Projeção de Estouro Orçamentário
          </div>
          <div class="projecao-empty">
            <span v-if="kpis.projecaoEstouro > 0">
              {{ fmtBRL(kpis.projecaoEstouro) }} acima do budget estimado
            </span>
            <span v-else>Sem projeções de estouro</span>
          </div>
        </div>
      </div>

      <div
        class="section-card"
        data-testid="project-cards-section"
      >
        <div class="section-header">
          <h2>Saúde Financeira dos Projetos</h2>
        </div>
        <div class="project-grid">
          <div
            v-for="p in filteredData"
            :key="p.id"
            class="project-card"
            :data-testid="`project-card-${p.id}`"
          >
            <div class="project-card-top">
              <div>
                <div class="project-name">
                  {{ p.projeto }}
                </div>
                <div class="project-program">
                  {{ p.programa }}
                </div>
              </div>
              <span :class="['saude-badge', saudeBadgeClass(p.saude)]">{{ p.saude }}</span>
            </div>
            <div class="project-stats">
              <div class="project-stat">
                <span class="stat-label">Budget:</span>
                <span class="stat-value">{{ fmtBRL(p.budget) }}</span>
              </div>
              <div class="project-stat">
                <span class="stat-label">Custo Real:</span>
                <span class="stat-value">{{ fmtBRL(p.custoReal) }}</span>
              </div>
              <div class="project-stat">
                <span class="stat-label">Desvio:</span>
                <span class="stat-value">{{ p.desvioPercent.toFixed(1) }}%</span>
              </div>
            </div>
            <div class="progress-bar-wrap">
              <div
                class="progress-bar-fill"
                :class="saudeProgressClass(p.saude)"
                :style="{ width: Math.min(p.desvioPercent, 100) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        class="table-card"
        data-testid="table-section"
      >
        <div class="table-header">
          <h2>Tabela Analítica</h2>
          <button
            class="export-btn"
            data-testid="btn-export"
            @click="exportCSV"
          >
            Exportar
          </button>
        </div>
        <div class="table-wrap">
          <table data-testid="data-table">
            <thead>
              <tr>
                <th
                  class="sort-col"
                  @click="sortBy('programa')"
                >
                  Programa {{ sortIcon("programa") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('projeto')"
                >
                  Projeto {{ sortIcon("projeto") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('budget')"
                >
                  Budget {{ sortIcon("budget") }}
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
                  @click="sortBy('custoReal')"
                >
                  Custo Real {{ sortIcon("custoReal") }}
                </th>
                <th
                  class="sort-col"
                  @click="sortBy('desvioPercent')"
                >
                  Desvio % {{ sortIcon("desvioPercent") }}
                </th>
                <th>Saúde</th>
                <th>Projeção Estouro</th>
                <th
                  class="sort-col"
                  @click="sortBy('periodo')"
                >
                  Período {{ sortIcon("periodo") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sortedData.length === 0">
                <td
                  colspan="10"
                  class="table-feedback muted"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
              <tr
                v-for="row in sortedData"
                :key="row.id"
                :data-testid="`row-${row.id}`"
              >
                <td class="muted">
                  {{ row.programa }}
                </td>
                <td class="material-name">
                  {{ row.projeto }}
                </td>
                <td class="mono">
                  {{ fmtBRL(row.budget) }}
                </td>
                <td class="mono">
                  {{ fmtBRL(row.custoMateriais) }}
                </td>
                <td class="mono">
                  {{ fmtBRL(row.custoHoras) }}
                </td>
                <td class="total">
                  {{ fmtBRL(row.custoReal) }}
                </td>
                <td class="mono">
                  {{ row.desvioPercent.toFixed(1) }}%
                </td>
                <td>
                  <span :class="['saude-badge', saudeBadgeClass(row.saude)]">{{ row.saude }}</span>
                </td>
                <td class="mono">
                  {{ row.projecaoEstouro ? fmtBRL(row.projecaoEstouro) : "-" }}
                </td>
                <td class="mono">
                  {{ row.periodo }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useChartsOrcamento } from "@/composables/useChartsOrcamento";
import { budgetService } from "@/services/budgetService";
import type { BudgetHealthStatus, BudgetProjectRow } from "@/types/api";

const { buildChartsOrcamento, updateChartsOrcamento, destroyChartsOrcamento } =
  useChartsOrcamento();

const allData = ref<BudgetProjectRow[]>([]);
const lastUpdatedAt = ref<string | null>(null);

const filters = ref({
  periodo: "",
  programa: "",
  projeto: "",
  saude: "" as BudgetHealthStatus | "",
});

const sortKey = ref<keyof BudgetProjectRow>("programa");
const sortDir = ref<1 | -1>(1);

const uniquePeriodos = computed(() =>
  [...new Set(allData.value.map((p) => p.periodo))].sort(),
);
const uniqueProgramas = computed(() =>
  [...new Set(allData.value.map((p) => p.programa))].sort(),
);
const uniqueProjetos = computed(() =>
  [...new Set(allData.value.map((p) => p.projeto))].sort(),
);

const filteredData = computed(() => {
  const f = filters.value;
  return allData.value.filter(
    (p) =>
      (!f.periodo || p.periodo === f.periodo) &&
      (!f.programa || p.programa === f.programa) &&
      (!f.projeto || p.projeto === f.projeto) &&
      (!f.saude || p.saude === f.saude),
  );
});

const sortedData = computed(() => {
  return [...filteredData.value].sort((a, b) => {
    const av = a[sortKey.value];
    const bv = b[sortKey.value];

    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;

    return typeof av === "string"
      ? av.localeCompare(bv as string) * sortDir.value
      : ((av as number) - (bv as number)) * sortDir.value;
  });
});

const kpis = computed(() => {
  const data = filteredData.value;
  return {
    budgetTotal: data.reduce((s, p) => s + p.budget, 0),
    custoRealTotal: data.reduce((s, p) => s + p.custoReal, 0),
    desvioMedio:
      data.length > 0
        ? data.reduce((s, p) => s + p.desvioPercent, 0) / data.length
        : 0,
    saudavelCount: data.filter((p) => p.saude === "Saudável").length,
    atencaoCount: data.filter((p) => p.saude === "Atenção").length,
    criticoCount: data.filter((p) => p.saude === "Crítico").length,
    projecaoEstouro: data.reduce((s, p) => s + (p.projecaoEstouro ?? 0), 0),
  };
});

const ultimaAtualizacao = computed(() => {
  const date = lastUpdatedAt.value ? new Date(lastUpdatedAt.value) : new Date();
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});

function sortBy(key: keyof BudgetProjectRow) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 1 ? -1 : 1;
    return;
  }

  sortKey.value = key;
  sortDir.value = 1;
}

function sortIcon(key: keyof BudgetProjectRow): string {
  if (sortKey.value !== key) return "⇅";
  return sortDir.value === 1 ? "↑" : "↓";
}

function fmtBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);
}

function saudeBadgeClass(saude: BudgetHealthStatus): string {
  if (saude === "Saudável") return "badge-green";
  if (saude === "Atenção") return "badge-amber";
  return "badge-red";
}

function saudeProgressClass(saude: BudgetHealthStatus): string {
  if (saude === "Saudável") return "progress-green";
  if (saude === "Atenção") return "progress-amber";
  return "progress-red";
}

function clearFilters() {
  filters.value = { periodo: "", programa: "", projeto: "", saude: "" };
}

function exportCSV() {
  const headers = [
    "Programa",
    "Projeto",
    "Budget",
    "Custo Materiais",
    "Custo Horas",
    "Custo Real",
    "Desvio %",
    "Saude",
    "Projecao Estouro",
    "Periodo",
  ];

  const rows = sortedData.value.map((p) => [
    p.programa,
    p.projeto,
    p.budget,
    p.custoMateriais,
    p.custoHoras,
    p.custoReal,
    `${p.desvioPercent.toFixed(1)}%`,
    p.saude,
    p.projecaoEstouro ?? "-",
    p.periodo,
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "orcamento-saude-financeira.csv";
  a.click();
}

async function fetchBudgetSnapshot() {
  const snapshot = await budgetService.fetchBudgetSnapshot();
  allData.value = snapshot.rows;
  lastUpdatedAt.value = snapshot.lastUpdatedAt;
}

watch(filteredData, async () => {
  await nextTick();
  updateChartsOrcamento(filteredData.value);
});

onMounted(async () => {
  await fetchBudgetSnapshot();
  await nextTick();
  buildChartsOrcamento(filteredData.value);
});

onUnmounted(() => {
  destroyChartsOrcamento();
});
</script>

<style scoped>
.app {
  display: flex;
  flex: 1;
  min-height: 0;
}

.main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.metric-card,
.filters-card,
.chart-card,
.section-card,
.table-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.metric-card {
  padding: 16px;
}

.metric-label,
.filters-title,
.chart-title,
.project-program,
.stat-label,
th,
.metric-sub {
  color: var(--text3);
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  font-family: "IBM Plex Mono", monospace;
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

.metric-value.date {
  font-size: 15px;
}

.filters-card,
.chart-card,
.section-card {
  padding: 16px;
}

.filters-row,
.project-card-top,
.project-stat,
.table-header {
  display: flex;
  align-items: center;
}

.filters-row {
  gap: 10px;
  flex-wrap: wrap;
}

.filter-select,
.clear-btn,
.export-btn {
  border-radius: 6px;
  padding: 8px 12px;
  font: inherit;
}

.filter-select,
.clear-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
}

.clear-btn,
.export-btn,
.sort-col {
  cursor: pointer;
}

.export-btn {
  background: var(--blue2);
  border: none;
  color: #fff;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-wrap {
  position: relative;
}

.chart-wrap.tall,
.chart-wrap.donut {
  height: 280px;
}

.projecao-card,
.projecao-empty,
.project-stats {
  display: flex;
  flex-direction: column;
}

.projecao-empty {
  min-height: 280px;
  justify-content: center;
  align-items: center;
  color: var(--text2);
}

.section-header {
  margin-bottom: 16px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.project-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.project-card-top {
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-name,
.material-name {
  color: var(--text);
  font-weight: 600;
}

.project-stats {
  gap: 4px;
  margin-bottom: 10px;
}

.project-stat {
  justify-content: space-between;
}

.stat-value,
.mono,
.total {
  font-family: "IBM Plex Mono", monospace;
}

.progress-bar-wrap {
  height: 4px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
}

.progress-green {
  background: var(--green);
}

.progress-amber {
  background: var(--amber);
}

.progress-red {
  background: var(--red);
}

.saude-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-green {
  background: rgba(45, 212, 160, 0.15);
  color: var(--green);
}

.badge-amber {
  background: rgba(245, 166, 35, 0.15);
  color: var(--amber);
}

.badge-red {
  background: rgba(245, 90, 90, 0.15);
  color: var(--red);
}

.table-card {
  overflow: hidden;
}

.table-header {
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px 14px;
  text-align: left;
  white-space: nowrap;
}

td {
  color: var(--text);
  border-bottom: 1px solid var(--border);
}

.muted {
  color: var(--text2);
}

.total {
  font-weight: 600;
}

.table-feedback {
  text-align: center;
  padding: 32px;
}

@media (max-width: 1200px) {
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .charts-row,
  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
