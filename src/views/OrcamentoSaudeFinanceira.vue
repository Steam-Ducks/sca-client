<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">
        Orçamento e Saúde Financeira
      </h1>

      <!-- KPI CARDS -->
      <div
        class="metrics"
        data-testid="metrics-section"
      >
        <div class="metric-card">
          <div class="metric-icon-wrap neutral">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />
              <path
                d="M12 7v5l3 3"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div>
            <div class="metric-label">
              Budget Total
            </div>
            <div class="metric-value blue">
              {{ fmtBRL(kpis.budgetTotal) }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap neutral">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <polyline
                points="22 12 18 12 15 21 9 3 6 12 2 12"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <div class="metric-label">
              Custo Real Total
            </div>
            <div class="metric-value">
              {{ fmtBRL(kpis.custoRealTotal) }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap neutral">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <polyline
                points="23 6 13.5 15.5 8.5 10.5 1 18"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="17 6 23 6 23 12"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <div class="metric-label">
              Desvio % Médio
            </div>
            <div class="metric-value">
              {{ kpis.desvioMedio.toFixed(1) }}%
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap green">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                stroke-linecap="round"
              />
              <polyline
                points="22 4 12 14.01 9 11.01"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <div class="metric-label">
              Projetos Saudáveis
            </div>
            <div class="metric-value green">
              {{ kpis.saudavelCount }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap amber">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <polyline
                points="12 6 12 12 16 14"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <div class="metric-label">
              Projetos em Atenção
            </div>
            <div class="metric-value amber">
              {{ kpis.atencaoCount }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap red">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
                stroke-linecap="round"
              />
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div>
            <div class="metric-label">
              Projetos Críticos
            </div>
            <div class="metric-value red">
              {{ kpis.criticoCount }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap neutral">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <polyline
                points="23 18 13.5 8.5 8.5 13.5 1 6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="17 18 23 18 23 12"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <div class="metric-label">
              Projeção de Estouro
            </div>
            <div class="metric-value">
              {{ fmtBRL(kpis.projecaoEstouro) }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap neutral">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
              />
              <line
                x1="16"
                y1="2"
                x2="16"
                y2="6"
                stroke-linecap="round"
              />
              <line
                x1="8"
                y1="2"
                x2="8"
                y2="6"
                stroke-linecap="round"
              />
              <line
                x1="3"
                y1="10"
                x2="21"
                y2="10"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div>
            <div class="metric-label">
              Última Atualização
            </div>
            <div class="metric-value date">
              {{ ultimaAtualizacao }}
            </div>
            <div class="metric-sub">
              Hoje
            </div>
          </div>
        </div>
      </div>

      <!-- FILTERS -->
      <div
        class="filters-card"
        data-testid="filters-section"
      >
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

      <!-- CHARTS ROW 1 -->
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

      <!-- CHARTS ROW 2 -->
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
            <svg
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <polyline
                points="44 36 28 20 18 30 4 16"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="34 36 44 36 44 26"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>Sem projeções de estouro</span>
          </div>
        </div>
      </div>

      <!-- PROJECT HEALTH CARDS -->
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
              <span :class="['saude-badge', saudeBadgeClass(p.saude)]">{{
                p.saude
              }}</span>
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

      <!-- ANALYTICAL TABLE -->
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
                  <span :class="['saude-badge', saudeBadgeClass(row.saude)]">{{
                    row.saude
                  }}</span>
                </td>
                <td class="muted center">
                  -
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { PROJETOS_FINANCEIROS } from "@/data/orcamento";
import type { ProjetoFinanceiro, SaudeStatus } from "@/data/orcamento";
import { useChartsOrcamento } from "@/composables/useChartsOrcamento";

const { buildChartsOrcamento, updateChartsOrcamento, destroyChartsOrcamento } =
  useChartsOrcamento();

// ─── State ────────────────────────────────────────────────────────────────────
const allData = ref<ProjetoFinanceiro[]>(PROJETOS_FINANCEIROS);

const filters = ref({
  periodo: "",
  programa: "",
  projeto: "",
  saude: "" as SaudeStatus | "",
});

const sortKey = ref<keyof ProjetoFinanceiro>("programa");
const sortDir = ref<1 | -1>(1);

// ─── Filter options ───────────────────────────────────────────────────────────
const uniquePeriodos = computed(() =>
  [...new Set(allData.value.map((p) => p.periodo))].sort(),
);
const uniqueProgramas = computed(() =>
  [...new Set(allData.value.map((p) => p.programa))].sort(),
);
const uniqueProjetos = computed(() =>
  [...new Set(allData.value.map((p) => p.projeto))].sort(),
);

// ─── Filtered data ────────────────────────────────────────────────────────────
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
    const av = a[sortKey.value],
      bv = b[sortKey.value];
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return typeof av === "string"
      ? av.localeCompare(bv as string) * sortDir.value
      : ((av as number) - (bv as number)) * sortDir.value;
  });
});

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const kpis = computed(() => {
  const data = filteredData.value;
  const budgetTotal = data.reduce((s, p) => s + p.budget, 0);
  const custoRealTotal = data.reduce((s, p) => s + p.custoReal, 0);
  const desvioMedio =
    data.length > 0
      ? data.reduce((s, p) => s + p.desvioPercent, 0) / data.length
      : 0;
  const saudavelCount = data.filter((p) => p.saude === "Saudável").length;
  const atencaoCount = data.filter((p) => p.saude === "Atenção").length;
  const criticoCount = data.filter((p) => p.saude === "Crítico").length;
  const projecaoEstouro = data.reduce(
    (s, p) => s + (p.projecaoEstouro ?? 0),
    0,
  );
  return {
    budgetTotal,
    custoRealTotal,
    desvioMedio,
    saudavelCount,
    atencaoCount,
    criticoCount,
    projecaoEstouro,
  };
});

const ultimaAtualizacao = computed(() => {
  const d = new Date();
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});

// ─── Sorting ──────────────────────────────────────────────────────────────────
function sortBy(key: keyof ProjetoFinanceiro) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 1 ? -1 : 1;
  } else {
    sortKey.value = key;
    sortDir.value = 1;
  }
}

function sortIcon(key: keyof ProjetoFinanceiro): string {
  if (sortKey.value !== key) return "⇅";
  return sortDir.value === 1 ? "↑" : "↓";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);
}

function saudeBadgeClass(saude: SaudeStatus): string {
  if (saude === "Saudável") return "badge-green";
  if (saude === "Atenção") return "badge-amber";
  return "badge-red";
}

function saudeProgressClass(saude: SaudeStatus): string {
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
    "Saúde",
    "Projeção Estouro",
    "Período",
  ];
  const rows = sortedData.value.map((p) => [
    p.programa,
    p.projeto,
    p.budget,
    p.custoMateriais,
    p.custoHoras,
    p.custoReal,
    p.desvioPercent.toFixed(1) + "%",
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

// ─── Charts ───────────────────────────────────────────────────────────────────
watch(filteredData, async () => {
  await nextTick();
  updateChartsOrcamento(filteredData.value);
});

onMounted(async () => {
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
  flex-direction: column;
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

/* ─── Metrics ──────────────────────────────────────────────────────────────── */
.metrics {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
}

.metric-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.metric-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon-wrap svg {
  width: 16px;
  height: 16px;
}

.metric-icon-wrap.neutral {
  background: rgba(139, 146, 170, 0.1);
  color: var(--text3);
}
.metric-icon-wrap.green {
  background: rgba(45, 212, 160, 0.12);
  color: var(--green);
}
.metric-icon-wrap.amber {
  background: rgba(245, 166, 35, 0.12);
  color: var(--amber);
}
.metric-icon-wrap.red {
  background: rgba(245, 90, 90, 0.12);
  color: var(--red);
}

.metric-label {
  font-size: 11px;
  color: var(--text2);
  margin-bottom: 4px;
  white-space: nowrap;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  font-family: "IBM Plex Mono", monospace;
  white-space: nowrap;
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

.metric-sub {
  font-size: 10px;
  color: var(--text3);
  margin-top: 2px;
}

/* ─── Filters ──────────────────────────────────────────────────────────────── */
.filters-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  margin-bottom: 12px;
}

.filters-title svg {
  width: 14px;
  height: 14px;
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
  border-radius: 6px;
  color: var(--text);
  font-size: 12px;
  font-family: inherit;
  padding: 7px 28px 7px 10px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b92aa' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: border-color 0.15s;
  min-width: 180px;
}

.filter-select:hover {
  border-color: var(--border2);
}
.filter-select:focus {
  outline: none;
  border-color: var(--blue2);
}

.clear-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 12px;
  font-family: inherit;
  padding: 7px 14px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.clear-btn:hover {
  border-color: var(--border2);
  background: var(--bg4);
}

/* ─── Charts ───────────────────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
}

.chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
}

.chart-wrap {
  position: relative;
}
.chart-wrap.tall {
  height: 280px;
}
.chart-wrap.donut {
  height: 280px;
}

.projecao-card {
  display: flex;
  flex-direction: column;
}

.projecao-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text3);
}

.projecao-empty svg {
  width: 48px;
  height: 48px;
  opacity: 0.3;
}

.projecao-empty span {
  font-size: 13px;
}

/* ─── Project Cards ─────────────────────────────────────────────────────────── */
.section-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}

.project-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.project-program {
  font-size: 11px;
  color: var(--text3);
  margin-top: 2px;
}

.project-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.project-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.stat-label {
  color: var(--text3);
}
.stat-value {
  color: var(--text2);
  font-family: "IBM Plex Mono", monospace;
}

.progress-bar-wrap {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
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

/* ─── Health badges ──────────────────────────────────────────────────────────── */
.saude-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
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

/* ─── Table ──────────────────────────────────────────────────────────────────── */
.table-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.table-header h2 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.export-btn {
  background: var(--blue2);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  padding: 7px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.15s;
}

.export-btn:hover {
  opacity: 0.85;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

thead tr {
  border-bottom: 1px solid var(--border);
}

th {
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  white-space: nowrap;
  user-select: none;
}

th.sort-col {
  cursor: pointer;
}
th.sort-col:hover {
  color: var(--text2);
}

td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  white-space: nowrap;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.muted {
  color: var(--text2) !important;
}
.mono {
  font-family: "IBM Plex Mono", monospace;
  font-size: 12px;
}
.total {
  font-family: "IBM Plex Mono", monospace;
  font-weight: 600;
}
.right {
  text-align: right;
}
.center {
  text-align: center;
}

.material-name {
  font-weight: 500;
}

.table-feedback {
  text-align: center;
  padding: 32px;
  font-size: 13px;
}

.table-feedback.muted {
  color: var(--text3);
}
.table-feedback.error {
  color: var(--red);
}

/* ─── Responsive tweaks ─────────────────────────────────────────────────────── */
@media (max-width: 1400px) {
  .metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
