<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">Horas Técnicas</h1>

      <!-- METRICS -->
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-label">Custo Total - Horas</div>
          <div class="metric-value blue">
            {{ fmt(kpis.custoTotal) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total de Horas</div>
          <div class="metric-value">{{ kpis.totalHoras }}h</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Custo Médio/Hora</div>
          <div class="metric-value green">
            {{ fmt(kpis.custoMedio) }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Registros</div>
          <div class="metric-value">
            {{ filteredData.length }}
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
          <select
            v-model="filters.periodo"
            class="filter-select"
            data-testid="filter-periodo"
          >
            <option value="">Todos os Períodos</option>
            <option v-for="p in uniquePeriodos" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
          <select
            v-model="filters.programa"
            class="filter-select"
            data-testid="filter-programa"
          >
            <option value="">Todos os Programas</option>
            <option v-for="p in uniqueProgramas" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
          <select
            v-model="filters.projeto"
            class="filter-select"
            data-testid="filter-projeto"
          >
            <option value="">Todos os Projetos</option>
            <option v-for="p in uniqueProjetos" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
          <select
            v-model="filters.colaborador"
            class="filter-select"
            data-testid="filter-colaborador"
          >
            <option value="">Todos os Colaboradores</option>
            <option v-for="c in uniqueColaboradores" :key="c" :value="c">
              {{ c }}
            </option>
          </select>
          <select
            v-model="filters.tarefa"
            class="filter-select"
            data-testid="filter-tarefa"
          >
            <option value="">Todas as Tarefas</option>
            <option v-for="t in uniqueTarefas" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
          <button
            class="export-btn"
            data-testid="btn-export"
            @click="exportCSV"
          >
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

      <!-- TOP CHARTS: Horas e Custo por Projeto -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">Total de Horas por Projeto</div>
          <div class="chart-wrap tall">
            <canvas id="chartHorasProjeto" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Custo de Horas por Projeto</div>
          <div class="chart-wrap tall">
            <canvas id="chartCustoProjeto" />
          </div>
        </div>
      </div>

      <!-- BOTTOM CHARTS: Custo por Colaborador + Temporal -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">Top 10 - Custo por Colaborador</div>
          <div class="chart-wrap tall">
            <canvas id="chartCustoColaborador" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Evolução Temporal das Horas</div>
          <div class="chart-wrap tall">
            <canvas id="chartTemporal" />
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
                <th class="sort-col" @click="sortBy('colaborador')">
                  Colaborador {{ sortIcon("colaborador") }}
                </th>
                <th class="sort-col" @click="sortBy('projeto')">
                  Projeto {{ sortIcon("projeto") }}
                </th>
                <th class="sort-col" @click="sortBy('programa')">
                  Programa {{ sortIcon("programa") }}
                </th>
                <th class="sort-col" @click="sortBy('horas')">
                  Horas {{ sortIcon("horas") }}
                </th>
                <th class="sort-col" @click="sortBy('custoPorHora')">
                  Custo/Hora {{ sortIcon("custoPorHora") }}
                </th>
                <th class="sort-col" @click="sortBy('custoTotal')">
                  Custo Total {{ sortIcon("custoTotal") }}
                </th>
                <th class="sort-col" @click="sortBy('periodo')">
                  Período {{ sortIcon("periodo") }}
                </th>
                <th>Tarefa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tableLoading">
                <td colspan="8" class="table-feedback muted">
                  Carregando dados...
                </td>
              </tr>
              <tr v-else-if="tableError">
                <td colspan="8" class="table-feedback error">
                  {{ tableError }}
                </td>
              </tr>
              <tr v-else-if="pagedData.length === 0">
                <td colspan="8" class="table-feedback muted">
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
                <td class="mono right">{{ row.horas }}h</td>
                <td class="mono">
                  {{ fmt(row.custoPorHora) }}
                </td>
                <td class="total">
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
import { useChartsTechnical } from "@/composables/useChartsTechnical";
import { CONFIG } from "@/utils/config";

const PER_PAGE = 8;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Row {
  id: number;
  colaborador: string;
  projeto: string;
  programa: string;
  horas: number;
  custoPorHora: number;
  custoTotal: number;
  periodo: string;
  tarefa: string;
}

// Interface para dados vindos da API
interface ApiRow {
  id: number;
  colaborador: string;
  projeto: string;
  programa: string;
  horas_trabalhadas: number;
  custo_por_hora: number;
  custo_total: number;
  periodo: string | null;
  tarefa: string;
}

// ─── Mock / fallback data (usado se API indisponível) ─────────────────────────
const MOCK: Row[] = [
  {
    id: 1,
    colaborador: "Lucas Martins",
    projeto: "Migração AWS",
    programa: "Cloud",
    horas: 400,
    custoPorHora: 420,
    custoTotal: 168000,
    periodo: "2024-01",
    tarefa: "Arquitetura Cloud",
  },
  {
    id: 2,
    colaborador: "Juliana Lima",
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    horas: 410,
    custoPorHora: 380,
    custoTotal: 155800,
    periodo: "2024-02",
    tarefa: "Liderança Técnica",
  },
  {
    id: 3,
    colaborador: "Ana Oliveira",
    projeto: "Portal Web",
    programa: "Desenvolvimento",
    horas: 520,
    custoPorHora: 250,
    custoTotal: 130000,
    periodo: "2024-01",
    tarefa: "Desenvolvimento",
  },
  {
    id: 4,
    colaborador: "Pedro Costa",
    projeto: "Portal Web",
    programa: "Desenvolvimento",
    horas: 450,
    custoPorHora: 280,
    custoTotal: 126000,
    periodo: "2024-01",
    tarefa: "Desenvolvimento",
  },
  {
    id: 5,
    colaborador: "Carlos Ferreira",
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    horas: 380,
    custoPorHora: 320,
    custoTotal: 121600,
    periodo: "2024-02",
    tarefa: "Banco de Dados",
  },
  {
    id: 6,
    colaborador: "Roberto Alves",
    projeto: "SOC Implementation",
    programa: "Segurança",
    horas: 300,
    custoPorHora: 400,
    custoTotal: 120000,
    periodo: "2024-03",
    tarefa: "Configuração",
  },
  {
    id: 7,
    colaborador: "Beatriz Rocha",
    projeto: "Migração AWS",
    programa: "Cloud",
    horas: 380,
    custoPorHora: 300,
    custoTotal: 114000,
    periodo: "2024-03",
    tarefa: "Migração",
  },
  {
    id: 8,
    colaborador: "João Silva",
    projeto: "Data Center Regional",
    programa: "Infraestrutura",
    horas: 320,
    custoPorHora: 350,
    custoTotal: 112000,
    periodo: "2024-01",
    tarefa: "Arquitetura",
  },
  {
    id: 9,
    colaborador: "Fernanda Torres",
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    horas: 360,
    custoPorHora: 290,
    custoTotal: 104400,
    periodo: "2024-02",
    tarefa: "Desenvolvimento",
  },
  {
    id: 10,
    colaborador: "Ricardo Souza",
    projeto: "Data Center Regional",
    programa: "Infraestrutura",
    horas: 340,
    custoPorHora: 310,
    custoTotal: 105400,
    periodo: "2024-01",
    tarefa: "Configuração",
  },
  {
    id: 11,
    colaborador: "Camila Nunes",
    projeto: "Portal Web",
    programa: "Desenvolvimento",
    horas: 280,
    custoPorHora: 260,
    custoTotal: 72800,
    periodo: "2024-01",
    tarefa: "Design",
  },
  {
    id: 12,
    colaborador: "Marcos Pereira",
    projeto: "SOC Implementation",
    programa: "Segurança",
    horas: 260,
    custoPorHora: 370,
    custoTotal: 96200,
    periodo: "2024-03",
    tarefa: "Configuração",
  },
  {
    id: 13,
    colaborador: "Thiago Ramos",
    projeto: "App Mobile",
    programa: "Desenvolvimento",
    horas: 310,
    custoPorHora: 240,
    custoTotal: 74400,
    periodo: "2024-02",
    tarefa: "Desenvolvimento",
  },
  {
    id: 14,
    colaborador: "Paula Mendes",
    projeto: "App Mobile",
    programa: "Desenvolvimento",
    horas: 200,
    custoPorHora: 290,
    custoTotal: 58000,
    periodo: "2024-02",
    tarefa: "Liderança Técnica",
  },
  {
    id: 15,
    colaborador: "Diego Castillo",
    projeto: "Modernização de Rede",
    programa: "Infraestrutura",
    horas: 290,
    custoPorHora: 330,
    custoTotal: 95700,
    periodo: "2024-03",
    tarefa: "Configuração",
  },
  {
    id: 16,
    colaborador: "Renata Fontes",
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    horas: 220,
    custoPorHora: 270,
    custoTotal: 59400,
    periodo: "2024-03",
    tarefa: "Desenvolvimento",
  },
];

// ─── State ────────────────────────────────────────────────────────────────────
const tableData = ref<Row[]>([]);
const tableLoading = ref(false);
const tableError = ref("");

const filters = ref({
  periodo: "",
  programa: "",
  projeto: "",
  colaborador: "",
  tarefa: "",
});
const sortKey = ref<keyof Row>("custoTotal");
const sortDir = ref<1 | -1>(-1);
const page = ref(1);

// ─── Filter options (derived from tableData) ──────────────────────────────────
const uniq = (key: keyof Row) =>
  computed(() =>
    [...new Set(tableData.value.map((r) => String(r[key])))].sort(),
  );

const uniquePeriodos = uniq("periodo");
const uniqueProgramas = uniq("programa");
const uniqueProjetos = uniq("projeto");
const uniqueColaboradores = uniq("colaborador");
const uniqueTarefas = uniq("tarefa");

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
watch(filteredData, () => {
  page.value = 1;
});

// ─── API load ─────────────────────────────────────────────────────────────────
function mapApiRow(r: ApiRow): Row {
  return {
    id: r.id,
    colaborador: r.colaborador,
    projeto: r.projeto,
    programa: r.programa,
    horas: r.horas_trabalhadas,
    custoPorHora: r.custo_por_hora,
    custoTotal: r.custo_total,
    periodo: r.periodo ?? "",
    tarefa: r.tarefa,
  };
}

async function loadData() {
  tableLoading.value = true;
  tableError.value = "";
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/horas-tecnicas/`);
    if (!res.ok) throw new Error();
    const data = (await res.json()) as ApiRow[];
    tableData.value = data.map(mapApiRow);
  } catch {
    // fallback para dados mock se API indisponível
    tableData.value = MOCK;
  } finally {
    tableLoading.value = false;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

function sortBy(k: keyof Row) {
  if (sortKey.value === k) sortDir.value = (sortDir.value * -1) as 1 | -1;
  else {
    sortKey.value = k;
    sortDir.value = -1;
  }
}
const sortIcon = (k: keyof Row) =>
  sortKey.value !== k ? "↕" : sortDir.value > 0 ? "↑" : "↓";

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

function exportCSV() {
  const header =
    "Colaborador,Projeto,Programa,Horas,Custo/Hora,Custo Total,Período,Tarefa";
  const rows = filteredData.value.map((r) =>
    [
      r.colaborador,
      r.projeto,
      r.programa,
      r.horas,
      r.custoPorHora,
      r.custoTotal,
      r.periodo,
      r.tarefa,
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "horas-tecnicas.csv";
  a.click();
}

// ─── Charts ───────────────────────────────────────────────────────────────────
const { buildCharts, destroyCharts } = useChartsTechnical();

onMounted(async () => {
  await loadData();
  nextTick(() => buildCharts(MOCK));
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
  color: #fff;
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
</style>
