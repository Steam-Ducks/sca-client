<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">
        Orçamento e Saúde Financeira
      </h1>

      <div
        v-if="isLoading"
        class="loading-banner"
      >
        Carregando dados...
      </div>
      <div
        v-if="errorMsg"
        class="error-banner"
      >
        {{ errorMsg }}
      </div>

      <div
        v-if="isLoadingIndicators && !isLoading"
        class="loading-banner"
      >
        Atualizando indicadores...
      </div>

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

      <div
        class="chart-pagination-bar"
        data-testid="chart-pagination-bar"
      >
        <div class="chart-page-size-control">
          <span class="chart-page-label">Itens por página:</span>
          <select
            v-model.number="chartPageSize"
            class="filter-select chart-page-select"
            data-testid="chart-page-size-select"
            @change="chartPage = 1"
          >
            <option
              v-for="opt in chartPageSizeOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="chart-page-nav">
          <span class="chart-page-info">
            Página {{ chartPage }} de {{ totalChartPages }}
          </span>
          <button
            class="page-btn"
            data-testid="chart-page-prev"
            :disabled="chartPage <= 1"
            @click="chartPage--"
          >
            ‹
          </button>
          <button
            class="page-btn"
            data-testid="chart-page-next"
            :disabled="chartPage >= totalChartPages"
            @click="chartPage++"
          >
            ›
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
            v-for="p in pagedCardsData"
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
        <div class="section-pagination">
          <div class="chart-page-size-control">
            <span class="chart-page-label">Itens por página:</span>
            <select
              v-model.number="cardsPageSize"
              class="filter-select chart-page-select"
              data-testid="cards-page-size-select"
            >
              <option
                v-for="opt in cardsPageSizeOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="chart-page-nav">
            <span class="chart-page-info">
              Página {{ cardsPage }} de {{ totalCardsPages }}
            </span>
            <button
              class="page-btn"
              data-testid="cards-page-prev"
              :disabled="cardsPage <= 1"
              @click="cardsPage--"
            >
              ‹
            </button>
            <button
              class="page-btn"
              data-testid="cards-page-next"
              :disabled="cardsPage >= totalCardsPages"
              @click="cardsPage++"
            >
              ›
            </button>
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
              <tr v-if="pagedTableData.length === 0">
                <td
                  colspan="10"
                  class="table-feedback muted"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
              <tr
                v-for="row in pagedTableData"
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
        <div class="section-pagination">
          <div class="chart-page-size-control">
            <span class="chart-page-label">Itens por página:</span>
            <select
              v-model.number="tablePageSize"
              class="filter-select chart-page-select"
              data-testid="table-page-size-select"
            >
              <option
                v-for="opt in tablePageSizeOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="chart-page-nav">
            <span class="chart-page-info">
              Página {{ tablePage }} de {{ totalTablePages }}
            </span>
            <button
              class="page-btn"
              data-testid="table-page-prev"
              :disabled="tablePage <= 1"
              @click="tablePage--"
            >
              ‹
            </button>
            <button
              class="page-btn"
              data-testid="table-page-next"
              :disabled="tablePage >= totalTablePages"
              @click="tablePage++"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useChartsOrcamento } from "@/composables/useChartsOrcamento";
import { budgetService } from "@/services/budgetService";
import type { BudgetHealthStatus, BudgetIndicators, BudgetProjectRow } from "@/types/api";

const { buildChartsOrcamento, updateChartsOrcamento, destroyChartsOrcamento } =
  useChartsOrcamento();

const allData = ref<BudgetProjectRow[]>([]);
const lastUpdatedAt = ref<string | null>(null);
const isLoading = ref(false);
const isLoadingIndicators = ref(false);
const errorMsg = ref<string | null>(null);

const indicators = ref<BudgetIndicators>({
  budgetTotal: 0,
  custoRealTotal: 0,
  desvioPercentMedio: 0,
  projetosSaudaveis: 0,
  projetosAtencao: 0,
  projetosCriticos: 0,
});

const filters = ref({
  periodo: "",
  programa: "",
  projeto: "",
  saude: "" as BudgetHealthStatus | "",
});

const sortKey = ref<keyof BudgetProjectRow>("programa");
const sortDir = ref<1 | -1>(1);

const chartPageSize = ref(10);
const chartPage = ref(1);

const tablePage = ref(1);
const tablePageSize = ref(10);
const cardsPage = ref(1);
const cardsPageSize = ref(10);

const chartPageSizeOptions = computed(() => {
  const total = filteredData.value.length;
  if (total === 0) return [{ label: "Todos (0)", value: 0 }];
  const opts: { label: string; value: number }[] = [];
  for (let i = 1; i <= total; i++) {
    opts.push({ label: i === total ? `${i} (Todos)` : String(i), value: i });
  }
  return opts;
});

const totalChartPages = computed(() => {
  const size = chartPageSize.value;
  const total = filteredData.value.length;
  if (!size || total === 0) return 1;
  return Math.ceil(total / size);
});

const pagedChartData = computed(() => {
  const size = chartPageSize.value;
  const start = (chartPage.value - 1) * size;
  return filteredData.value.slice(start, start + size);
});

// Opções dinâmicas derivadas dos dados carregados (sem aplicar filtro de saúde
// para que o dropdown de saúde sempre mostre as 3 opções fixas)
const uniquePeriodos = computed(() =>
  [...new Set(allData.value.map((p) => p.periodo).filter((p) => p !== "Sem periodo"))].sort(),
);
const uniqueProgramas = computed(() =>
  [...new Set(allData.value.map((p) => p.programa))].sort(),
);
const uniqueProjetos = computed(() => {
  const base = filters.value.programa
    ? allData.value.filter((p) => p.programa === filters.value.programa)
    : allData.value;
  return [...new Set(base.map((p) => p.projeto))].sort();
});

// filteredData aplica client-side o filtro de saúde (o backend no caminho
// silver não filtra por saúde; o caminho gold sim)
const filteredData = computed(() => {
  const f = filters.value;
  return allData.value.filter(
    (p) => (!f.saude || p.saude === f.saude),
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

function buildPageSizeOpts(total: number): { label: string; value: number }[] {
  if (total === 0) return [{ label: "Todos (0)", value: 0 }];
  const bases = [10, 25, 50, 100];
  const opts = bases
    .filter((n) => n < total)
    .map((n) => ({ label: String(n), value: n }));
  opts.push({ label: `Todos (${total})`, value: 0 });
  return opts;
}

const cardsPageSizeOptions = computed(() => buildPageSizeOpts(filteredData.value.length));
const tablePageSizeOptions = computed(() => buildPageSizeOpts(sortedData.value.length));

const totalCardsPages = computed(() => {
  const size = cardsPageSize.value;
  const total = filteredData.value.length;
  if (!size || total === 0) return 1;
  return Math.ceil(total / size);
});

const totalTablePages = computed(() => {
  const size = tablePageSize.value;
  const total = sortedData.value.length;
  if (!size || total === 0) return 1;
  return Math.ceil(total / size);
});

const pagedCardsData = computed(() => {
  const size = cardsPageSize.value;
  if (!size) return filteredData.value;
  const start = (cardsPage.value - 1) * size;
  return filteredData.value.slice(start, start + size);
});

const pagedTableData = computed(() => {
  const size = tablePageSize.value;
  if (!size) return sortedData.value;
  const start = (tablePage.value - 1) * size;
  return sortedData.value.slice(start, start + size);
});

const kpis = computed(() => ({
  budgetTotal: indicators.value.budgetTotal,
  custoRealTotal: indicators.value.custoRealTotal,
  desvioMedio: indicators.value.desvioPercentMedio,
  saudavelCount: indicators.value.projetosSaudaveis,
  atencaoCount: indicators.value.projetosAtencao,
  criticoCount: indicators.value.projetosCriticos,
  projecaoEstouro: filteredData.value.reduce((s, p) => s + (p.projecaoEstouro ?? 0), 0),
}));

const ultimaAtualizacao = computed(() => {
  if (!lastUpdatedAt.value) return "Não informado";
  return new Date(lastUpdatedAt.value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
    "Programa", "Projeto", "Budget", "Custo Materiais", "Custo Horas",
    "Custo Real", "Desvio %", "Saude", "Projecao Estouro", "Periodo",
  ];
  const rows = sortedData.value.map((p) => [
    p.programa, p.projeto, p.budget, p.custoMateriais, p.custoHoras,
    p.custoReal, `${p.desvioPercent.toFixed(1)}%`, p.saude,
    p.projecaoEstouro ?? "-", p.periodo,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "orcamento-saude-financeira.csv";
  a.click();
}

async function loadIndicators() {
  isLoadingIndicators.value = true;
  try {
    const f = filters.value;
    const snapshot = await budgetService.fetchBudgetIndicators({
      periodo: f.periodo || undefined,
      programa: f.programa || undefined,
      projeto: f.projeto || undefined,
      saude: f.saude || undefined,
    });
    indicators.value = snapshot.indicators;
    lastUpdatedAt.value = snapshot.lastUpdatedAt;
  } catch {
    // indicators remain at their previous/zero values; error shown by loadData
  } finally {
    isLoadingIndicators.value = false;
  }
}

// Busca dados do backend com os filtros server-side (periodo, programa, projeto, saude).
// O filtro de saúde é enviado ao backend; no caminho gold é aplicado server-side,
// no caminho silver é ignorado e aplicado client-side em filteredData.
async function loadData() {
  isLoading.value = true;
  errorMsg.value = null;
  try {
    const f = filters.value;
    const [snapshot] = await Promise.all([
      budgetService.fetchBudgetSnapshot({
        periodo: f.periodo || undefined,
        programa: f.programa || undefined,
        projeto: f.projeto || undefined,
        saude: f.saude || undefined,
      }),
      loadIndicators(),
    ]);
    allData.value = snapshot.rows;
    if (snapshot.lastUpdatedAt) lastUpdatedAt.value = snapshot.lastUpdatedAt;
  } catch {
    errorMsg.value = "Não foi possível conectar ao servidor. Verifique se o backend está em execução.";
    allData.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Quando filtros server-side (período, programa, projeto) mudam: refaz a busca
// na API. O filtro saúde (client-side) é tratado apenas em filteredData.
watch(
  () => [filters.value.periodo, filters.value.programa, filters.value.projeto],
  async () => {
    if (
      filters.value.projeto &&
      !uniqueProjetos.value.includes(filters.value.projeto)
    ) {
      filters.value.projeto = "";
    }
    chartPage.value = 1;
    tablePage.value = 1;
    cardsPage.value = 1;
    await loadData();
    await nextTick();
    buildChartsOrcamento(pagedChartData.value, filteredData.value);
  },
);

// Quando saúde muda: refaz indicadores server-side e atualiza charts client-side
watch(
  () => filters.value.saude,
  async () => {
    chartPage.value = 1;
    tablePage.value = 1;
    cardsPage.value = 1;
    await loadIndicators();
    await nextTick();
    updateChartsOrcamento(pagedChartData.value, filteredData.value);
  },
);

// Quando página ou tamanho de página muda: atualiza apenas os bar charts
watch(
  [chartPage, chartPageSize],
  async () => {
    await nextTick();
    updateChartsOrcamento(pagedChartData.value, filteredData.value);
  },
);

watch(tablePageSize, () => { tablePage.value = 1; });
watch(cardsPageSize, () => { cardsPage.value = 1; });

onMounted(async () => {
  await loadData();
  await nextTick();
  buildChartsOrcamento(pagedChartData.value, filteredData.value);
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

.loading-banner {
  padding: 12px 16px;
  background: rgba(77, 143, 255, 0.1);
  border: 1px solid rgba(77, 143, 255, 0.3);
  border-radius: 8px;
  color: var(--blue);
  font-size: 13px;
}

.error-banner {
  padding: 12px 16px;
  background: rgba(245, 90, 90, 0.1);
  border: 1px solid rgba(245, 90, 90, 0.3);
  border-radius: 8px;
  color: var(--red);
  font-size: 13px;
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

.chart-pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.chart-page-size-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-page-label {
  color: var(--text3);
  font-size: 13px;
  white-space: nowrap;
}

.chart-page-select {
  width: auto;
  min-width: 80px;
}

.chart-page-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-page-info {
  color: var(--text3);
  font-size: 13px;
  white-space: nowrap;
}

.page-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: var(--bg3);
  border-color: var(--blue);
  color: var(--blue);
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

.section-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.section-card .section-pagination {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.table-card .section-pagination {
  padding: 10px 16px;
  border-top: 1px solid var(--border);
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
