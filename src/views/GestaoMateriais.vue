<template>
  <div class="app">
    <main class="main">
      <!-- METRICS -->
      <div class="metrics">
        <div
          v-if="!isMaterialsLimitedProfile"
          class="metric-card"
        >
          <div class="metric-label">
            Custo Total de Materiais
          </div>
          <div class="metric-value blue">
            {{ fmt(totalCusto) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Total de Itens
          </div>
          <div class="metric-value">
            {{ sortedData.length }}
          </div>
        </div>
        <div
          v-if="!isMaterialsLimitedProfile"
          class="metric-card"
        >
          <div class="metric-label">
            Custo Médio por Item
          </div>
          <div class="metric-value green">
            {{ fmt(custoMedio) }}
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
              v-for="p in periodos"
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
              v-for="p in programas"
              :key="p"
              :value="p"
            >
              {{ p }}
            </option>
          </select>
          <select
            v-model="filters.projeto"
            class="filter-select"
          >
            <option value="">
              Todos os Projetos
            </option>
            <option
              v-for="p in projetosFiltered"
              :key="p"
              :value="p"
            >
              {{ p }}
            </option>
          </select>
          <select
            v-model="filters.categoria"
            class="filter-select"
          >
            <option value="">
              Todas as Categorias
            </option>
            <option
              v-for="c in categorias"
              :key="c"
              :value="c"
            >
              {{ c }}
            </option>
          </select>
          <select
            v-model="filters.fornecedor"
            class="filter-select"
          >
            <option value="">
              Todos os Fornecedores
            </option>
            <option
              v-for="f in fornecedores"
              :key="f"
              :value="f"
            >
              {{ f }}
            </option>
          </select>
          <button
            v-if="hasActiveFilters"
            class="clear-btn"
            @click="clearFilters"
          >
            Limpar filtros
          </button>
          <br>
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
        <div
          v-if="!isMaterialsLimitedProfile"
          class="chart-card"
        >
          <div class="chart-title">
            Top 10 Custo por Material
          </div>
          <div class="chart-wrap">
            <canvas id="chartCusto" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Top 10 Quantidade Consumida
          </div>
          <div class="chart-wrap">
            <canvas id="chartQtd" />
          </div>
        </div>
      </div>

      <!-- BOTTOM CHARTS -->
      <div
        v-if="!isMaterialsLimitedProfile"
        class="charts-row"
      >
        <div class="chart-card">
          <div class="chart-title">
            Custo de Materiais por Projeto
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartProjeto" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">
            Evolução Temporal do Custo
          </div>
          <div class="chart-wrap tall">
            <canvas id="chartTemporal" />
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-card">
        <div class="table-header">
          <h2>Tabela Detalhada de Materiais</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th
                  class="sort-col"
                  @click="sort('material')"
                >
                  Material {{ sortIcon("material") }}
                </th>
                <th
                  class="sort-col"
                  @click="sort('projeto')"
                >
                  Projeto {{ sortIcon("projeto") }}
                </th>
                <th
                  class="sort-col"
                  @click="sort('programa')"
                >
                  Programa {{ sortIcon("programa") }}
                </th>
                <th
                  v-if="!isCompras"
                  class="sort-col"
                  @click="sort('quantidade')"
                >
                  Quantidade {{ sortIcon("quantidade") }}
                </th>
                <th
                  v-if="!isMaterialsLimitedProfile"
                  class="sort-col"
                  @click="sort('valorUnitario')"
                >
                  Valor Unitário {{ sortIcon("valorUnitario") }}
                </th>
                <th
                  v-if="!isMaterialsLimitedProfile"
                  class="sort-col"
                  @click="sort('valorTotal')"
                >
                  Valor Total {{ sortIcon("valorTotal") }}
                </th>
                <th
                  class="sort-col"
                  @click="sort('periodo')"
                >
                  Período {{ sortIcon("periodo") }}
                </th>
                <th v-if="!isAlmoxarifado && !isProjetos">
                  Fornecedor
                </th>
                <th v-if="!isAlmoxarifado && !isProjetos">
                  Categoria
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tableLoading">
                <td
                  :colspan="tableColspan"
                  class="table-feedback muted"
                >
                  Carregando materiais...
                </td>
              </tr>
              <tr v-else-if="tableError">
                <td
                  :colspan="tableColspan"
                  class="table-feedback error"
                >
                  {{ tableError }}
                </td>
              </tr>
              <tr v-else-if="pagedData.length === 0">
                <td
                  :colspan="tableColspan"
                  class="table-feedback muted"
                >
                  Nenhum material encontrado.
                </td>
              </tr>
              <tr
                v-for="row in pagedData"
                :key="row.id"
              >
                <td class="material-name">
                  {{ row.material }}
                </td>
                <td class="muted">
                  {{ row.projeto }}
                </td>
                <td class="muted">
                  {{ row.programa }}
                </td>
                <td
                  v-if="!isCompras"
                  class="mono right"
                >
                  {{ row.quantidade }}
                </td>
                <td
                  v-if="!isMaterialsLimitedProfile"
                  class="mono"
                >
                  {{ fmt(row.valorUnitario) }}
                </td>
                <td
                  v-if="!isMaterialsLimitedProfile"
                  class="total"
                >
                  {{ fmt(row.valorTotal) }}
                </td>
                <td class="mono">
                  {{ row.periodo }}
                </td>
                <td
                  v-if="!isAlmoxarifado && !isProjetos"
                  class="muted"
                >
                  {{ row.fornecedor }}
                </td>
                <td v-if="!isAlmoxarifado && !isProjetos">
                  <span :class="badgeClass(row.categoria)">{{ row.categoria }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span>{{ sortedData.length }} registros · página {{ page }} de {{ totalPages }}</span>
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
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useCharts } from "@/composables/useCharts";
import { usePermissions } from "@/composables/usePermissions";
import { materiaisService } from "@/services/materiaisService";
import type { MaterialsApiRow } from "@/services/materiaisService";
import type { Filters, SortKey, SortDir, Material, Categoria, Status } from "@/types/materiais";
import { RAW } from "@/data/materiais";
import * as XLSX from 'xlsx'

const PER_PAGE = 8;
const isMounted = ref(false);

// ─── State ────────────────────────────────────────────────────────────────────
const tableData = ref<Material[]>(RAW);
const tableLoading = ref(false);
const tableError = ref("");
const topMaterials = ref<Material[]>([]);
const costByProject = ref<Material[]>([]);
const filters = reactive<Filters>({
  periodo: "",
  programa: "",
  projeto: "",
  categoria: "",
  fornecedor: "",
  status: "",
  area: "",
  search: "",
});
const sortKey = ref<SortKey>("valorTotal");
const sortDir = ref<SortDir>(-1);
const page = ref(1);

// ─── Filter option lists (derivados reativamente dos dados da tabela) ────────
const periodos = computed(() =>
  [...new Set(tableData.value.map((r) => r.periodo).filter(Boolean))].sort(),
);
const programas = computed(() =>
  [...new Set(tableData.value.map((r) => r.programa).filter(Boolean))].sort(),
);
const projetos = computed(() => {
  const map = new Map(tableData.value.map((r) => [r.projeto, { nome: r.projeto, programa: r.programa }]));
  return [...map.values()];
});
const categorias = computed(() =>
  [...new Set(tableData.value.map((r) => r.categoria).filter(Boolean))].sort(),
);
const fornecedores = computed(() =>
  [...new Set(tableData.value.map((r) => r.fornecedor).filter(Boolean))].sort(),
);

// ─── Data mapping ─────────────────────────────────────────────────────────────
function normalizeCategoria(value: string): Categoria {
  const allowed: Categoria[] = ["Hardware", "Storage", "Cloud", "Segurança", "Software", "Rede"];
  return allowed.includes(value as Categoria) ? (value as Categoria) : "Hardware";
}

function mapApiRow(row: MaterialsApiRow): Material {
  return {
    id: row.id,
    material: row.material,
    projeto: row.projeto,
    programa: row.programa,
    quantidade: row.quantidade,
    valorUnitario: row.valor_unitario,
    valorTotal: row.valor_total,
    periodo: row.periodo ?? "",
    fornecedor: row.fornecedor,
    categoria: normalizeCategoria(row.categoria),
    status: "Ativo" as Status,
    area: "Materiais",
  };
}


// ─── API call ──────────────────────────────────────────────────────────────────
async function loadTableData() {
  tableLoading.value = true;
  tableError.value = "";

  try {
    const data = await materiaisService.fetchMateriais(filters);
    tableData.value = data.map(mapApiRow);
  } catch (error) {
    console.error(error);
    tableError.value = "Não foi possível carregar a tabela de materiais.";
  } finally {
    tableLoading.value = false;
  }
}

type TopMaterialApi = {
  material: string;
  total_cost: number;
};

function mapTopMaterial(row: TopMaterialApi): Material {
  return {
    id: 0, // não usado no chart
    material: row.material,
    valorTotal: row.total_cost,
    quantidade: 0, // placeholder
    programa: "",
    projeto: "",
    periodo: "",
    valorUnitario: 0,
    fornecedor: "",
    categoria: "Hardware",
    status: "Ativo",
    area: "Materiais",
  };
}

async function loadTopMaterials() {
  try {
    const data = await materiaisService.fetchTopMaterials(filters);
    console.log("TOP MATERIALS API:", data);
    topMaterials.value = data.map(mapTopMaterial);
  } catch (error) {
    console.error("Erro ao carregar ranking", error);
    topMaterials.value = [];
  }
}

async function loadCostByProject() {
  try {
    const data = await materiaisService.fetchCostByProject(filters);

    console.log("COST BY PROJECT:", data);

    costByProject.value = data.map((item) => ({
      id: 0,
      material: "",
      projeto: item.projeto,
      programa: "",
      quantidade: 0,
      valorUnitario: 0,
      valorTotal: item.total_cost,
      periodo: "",
      fornecedor: "",
      categoria: "Hardware",
      status: "Ativo",
      area: "Materiais",
    }));
  } catch (error) {
    console.error("Erro ao carregar projeto", error);
    costByProject.value = [];
  }
}

function createDebouncedFn<T extends (...args: never[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, delay);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

const debouncedLoad = createDebouncedFn(() => {
  loadTableData();
  loadTopMaterials();
}, 400);

// ─── Computed ─────────────────────────────────────────────────────────────────
const projetosFiltered = computed(() => {
  const list = projetos.value ?? [];
  if (!filters.programa) {
    return list.map((p) => p.nome);
  }
  return list
    .filter((p) => p.programa === filters.programa)
    .map((p) => p.nome)
    .sort();
});

const hasActiveFilters = computed(() => {
  return (
    filters.periodo !== "" ||
    filters.programa !== "" ||
    filters.projeto !== "" ||
    filters.categoria !== "" ||
    filters.fornecedor !== "" ||
    filters.search !== ""
  );
});

type FilterEntry = { key: keyof Filters; label: string; value: string };

const FILTER_LABELS: Partial<Record<keyof Filters, string>> = {
  periodo: "Período",
  programa: "Programa",
  projeto: "Projeto",
  categoria: "Categoria",
  fornecedor: "Fornecedor",
  search: "Busca",
};

const activeFilterEntries = computed<FilterEntry[]>(() => {
  const keys: (keyof Filters)[] = ["periodo", "programa", "projeto", "categoria", "fornecedor", "search"];
  return keys
    .filter((k) => filters[k] !== "")
    .map((k) => ({ key: k, label: FILTER_LABELS[k]!, value: filters[k] }));
});

function removeFilter(key: keyof Filters) {
  filters[key] = "";
  page.value = 1;
}

const sortedData = computed(() =>
  [...tableData.value].sort((a, b) => {
    const av = a[sortKey.value];
    const bv = b[sortKey.value];
    return typeof av === "string"
      ? av.localeCompare(bv as string) * sortDir.value
      : ((av as number) - (bv as number)) * sortDir.value;
  }),
);

const totalCusto = computed(() => sortedData.value.reduce((s, r) => s + r.valorTotal, 0));

const custoMedio = computed(() =>
  sortedData.value.length ? totalCusto.value / sortedData.value.length : 0,
);

const totalPages = computed(() => Math.max(1, Math.ceil(sortedData.value.length / PER_PAGE)));

const pagedData = computed(() =>
  sortedData.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE),
);

const visiblePages = computed(() => {
  const p = page.value,
    t = totalPages.value;
  const start = Math.max(1, p - 2),
    end = Math.min(t, p + 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(
  () => [
    filters.periodo,
    filters.programa,
    filters.projeto,
    filters.categoria,
    filters.fornecedor,
  ],
  () => {
    page.value = 1;
    loadTableData();
    loadTopMaterials();
    loadCostByProject();
  },
);

watch(
  () => filters.search,
  () => {
    page.value = 1;
    debouncedLoad();
  },
);

onMounted(async () => {
  await loadTableData();
  try { await loadTopMaterials(); } catch { /* ignore */ }
  await loadCostByProject();
  isMounted.value = true;

  nextTick(() => {
    buildCharts(topMaterials.value, tableData.value, costByProject.value);
    updateCharts(costByProject.value);
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

function sort(k: SortKey) {
  if (sortKey.value === k) sortDir.value = (sortDir.value * -1) as SortDir;
  else {
    sortKey.value = k;
    sortDir.value = -1;
  }
}

const sortIcon = (k: SortKey) => {
  if (sortKey.value === k) return sortDir.value > 0 ? "↑" : "↓";
  return "↕";
};

function badgeClass(c: string) {
  const map: Record<string, string> = {
    Hardware: "badge badge-hw",
    Storage: "badge badge-st",
    Cloud: "badge badge-cl",
    Segurança: "badge badge-sg",
    Software: "badge badge-sw",
    Rede: "badge badge-rd",
  };
  return map[c] ?? "badge badge-hw";
}

function clearFilters() {
  Object.assign(filters, {
    periodo: "",
    programa: "",
    projeto: "",
    categoria: "",
    fornecedor: "",
    status: "",
    area: "",
    search: "",
  });
  page.value = 1;
}

function exportCSV() {
  const header =
    "Material,Projeto,Programa,Quantidade,Valor Unitário,Valor Total,Período,Fornecedor,Categoria";
  const rows = sortedData.value.map((r) =>
    [
      r.material,
      r.projeto,
      r.programa,
      r.quantidade,
      r.valorUnitario,
      r.valorTotal,
      r.periodo,
      r.fornecedor,
      r.categoria,
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "materiais.csv";
  a.click();
}

function exportExcel() {
  const rows = sortedData.value.map((r) => ({
    Material: r.material,
    Projeto: r.projeto,
    Programa: r.programa,
    Quantidade: r.quantidade,
    'Valor Unitário': r.valorUnitario,
    'Valor Total': r.valorTotal,
    Período: r.periodo,
    Fornecedor: r.fornecedor,
    Categoria: r.categoria,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Materiais')
  XLSX.writeFile(wb, 'materiais.xlsx')
}

// ─── Charts ──────────────────────────────────────────────────────────────
const { buildCharts, updateCharts, destroyCharts } = useCharts();
const { isMaterialsLimitedProfile, isCompras, isAlmoxarifado, isProjetos } = usePermissions();

const tableColspan = computed(() => {
  let cols = 5; // Material, Projeto, Programa, Período + always 1 fixed
  if (!isCompras.value) cols++;              // Quantidade
  if (!isMaterialsLimitedProfile.value) cols += 2; // Valor Unitário, Valor Total
  if (!isAlmoxarifado.value && !isProjetos.value) cols += 2; // Fornecedor, Categoria
  return cols;
});

watch([topMaterials, tableData, costByProject], () => {
  if (!isMounted.value) return;
  nextTick(() => updateCharts(topMaterials.value, tableData.value, costByProject.value));
});

onUnmounted(() => {
  debouncedLoad.cancel();
  destroyCharts();
});

defineExpose({ filters, sortKey, page, costByProject, topMaterials, isMounted });
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
  grid-template-columns: repeat(3, 1fr);
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
  min-width: 140px;
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
  margin-left: auto;
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

/* ── Active Filters ───────────────────────────────────────────────────────── */
.active-filters {
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 7px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.active-filters-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-right: 4px;
}
.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}
.active-filters-list span {
  background: rgba(77, 143, 255, 0.12);
  color: var(--blue);
  border: 1px solid rgba(77, 143, 255, 0.25);
  border-radius: 5px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
}
.clear-btn {
  background: transparent;
  border: 1px solid var(--border2);
  color: var(--text3);
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.clear-btn:hover {
  border-color: var(--red);
  color: var(--red);
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
td.right {
  text-align: right;
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