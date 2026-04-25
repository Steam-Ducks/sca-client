<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">Auditoria</h1>

      <!-- METRICS -->
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-label">Total de Registros</div>
          <div class="metric-value blue">
            {{ filteredData.length }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Aprovados</div>
          <div class="metric-value green">
            {{ kpis.aprovados }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Pendentes</div>
          <div class="metric-value amber">
            {{ kpis.pendentes }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Rejeitados</div>
          <div class="metric-value red">
            {{ kpis.rejeitados }}
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
          <select v-model="filters.tipo" class="filter-select">
            <option value="">Todos os Tipos</option>
            <option v-for="t in uniqueTipos" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
          <select v-model="filters.status" class="filter-select">
            <option value="">Todos os Status</option>
            <option v-for="s in uniqueStatuses" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
          <select v-model="filters.projeto" class="filter-select">
            <option value="">Todos os Projetos</option>
            <option v-for="p in uniqueProjetos" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
          <select v-model="filters.responsavel" class="filter-select">
            <option value="">Todos os Responsáveis</option>
            <option v-for="r in uniqueResponsaveis" :key="r" :value="r">
              {{ r }}
            </option>
          </select>
          <select v-model="filters.programa" class="filter-select">
            <option value="">Todos os Programas</option>
            <option v-for="p in uniqueProgramas" :key="p" :value="p">
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
          <div class="chart-title">Registros por Status</div>
          <div class="chart-wrap tall">
            <canvas id="chartStatusPeriodo" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Registros por Tipo</div>
          <div class="chart-wrap tall">
            <canvas id="chartPorTipo" />
          </div>
        </div>
      </div>

      <!-- BOTTOM CHARTS -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">Registros por Responsável</div>
          <div class="chart-wrap tall">
            <canvas id="chartPorResponsavel" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Evolução de Auditorias</div>
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
                <th class="sort-col" @click="sortBy('tipo')">
                  Tipo {{ sortIcon("tipo") }}
                </th>
                <th class="sort-col" @click="sortBy('descricao')">
                  Descrição {{ sortIcon("descricao") }}
                </th>
                <th class="sort-col" @click="sortBy('projeto')">
                  Projeto {{ sortIcon("projeto") }}
                </th>
                <th class="sort-col" @click="sortBy('programa')">
                  Programa {{ sortIcon("programa") }}
                </th>
                <th class="sort-col" @click="sortBy('responsavel')">
                  Responsável {{ sortIcon("responsavel") }}
                </th>
                <th class="sort-col" @click="sortBy('dataRegistro')">
                  Data Registro {{ sortIcon("dataRegistro") }}
                </th>
                <th class="sort-col" @click="sortBy('dataRevisao')">
                  Data Revisão {{ sortIcon("dataRevisao") }}
                </th>
                <th class="sort-col" @click="sortBy('valorImpacto')">
                  Valor Impacto {{ sortIcon("valorImpacto") }}
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagedData.length === 0">
                <td colspan="9" class="table-feedback muted">
                  Nenhum registro encontrado.
                </td>
              </tr>
              <tr v-for="row in pagedData" :key="row.id">
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
import { useChartsAuditoria } from "@/composables/useChartsAuditoria";
import type { AuditoriaRow } from "@/composables/useChartsAuditoria";

const PER_PAGE = 8;

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK: AuditoriaRow[] = [
  {
    id: 1,
    tipo: "Compra de Material",
    descricao: "Aquisição de servidores Dell PowerEdge",
    projeto: "Data Center Regional",
    programa: "Infraestrutura",
    responsavel: "João Silva",
    dataRegistro: "2024-01-15",
    dataRevisao: "2024-01-20",
    status: "Aprovado",
    valorImpacto: 185000,
    observacao: "",
  },
  {
    id: 2,
    tipo: "Horas Técnicas",
    descricao: "Consultoria em arquitetura cloud",
    projeto: "Migração AWS",
    programa: "Cloud",
    responsavel: "Lucas Martins",
    dataRegistro: "2024-01-18",
    dataRevisao: "2024-01-25",
    status: "Aprovado",
    valorImpacto: 168000,
    observacao: "",
  },
  {
    id: 3,
    tipo: "Compra de Material",
    descricao: "Licenças VMware vSphere Enterprise",
    projeto: "Container Platform",
    programa: "Cloud",
    responsavel: "Beatriz Rocha",
    dataRegistro: "2024-02-05",
    dataRevisao: "2024-02-12",
    status: "Aprovado",
    valorImpacto: 98000,
    observacao: "",
  },
  {
    id: 4,
    tipo: "Contrato",
    descricao: "Contrato de suporte AWS Enterprise",
    projeto: "Migração AWS",
    programa: "Cloud",
    responsavel: "Lucas Martins",
    dataRegistro: "2024-02-10",
    dataRevisao: "",
    status: "Pendente",
    valorImpacto: 240000,
    observacao: "Aguardando aprovação diretoria",
  },
  {
    id: 5,
    tipo: "Horas Técnicas",
    descricao: "Desenvolvimento módulo financeiro ERP",
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    responsavel: "Juliana Lima",
    dataRegistro: "2024-02-14",
    dataRevisao: "2024-02-20",
    status: "Aprovado",
    valorImpacto: 155800,
    observacao: "",
  },
  {
    id: 6,
    tipo: "Compra de Material",
    descricao: "Switches Cisco Catalyst 9300",
    projeto: "Modernização de Rede",
    programa: "Infraestrutura",
    responsavel: "Diego Castillo",
    dataRegistro: "2024-02-20",
    dataRevisao: "2024-03-01",
    status: "Rejeitado",
    valorImpacto: 134500,
    observacao: "Orçamento excedido",
  },
  {
    id: 7,
    tipo: "Ajuste Orçamentário",
    descricao: "Remanejamento verba infraestrutura → cloud",
    projeto: "Storage Upgrade",
    programa: "Infraestrutura",
    responsavel: "João Silva",
    dataRegistro: "2024-03-01",
    dataRevisao: "2024-03-05",
    status: "Aprovado",
    valorImpacto: 89000,
    observacao: "",
  },
  {
    id: 8,
    tipo: "Horas Técnicas",
    descricao: "Implementação regras SOC/SIEM",
    projeto: "SOC Implementation",
    programa: "Segurança",
    responsavel: "Roberto Alves",
    dataRegistro: "2024-03-05",
    dataRevisao: "",
    status: "Em Análise",
    valorImpacto: 120000,
    observacao: "Em revisão pelo comitê",
  },
  {
    id: 9,
    tipo: "Compra de Material",
    descricao: "Firewalls Palo Alto PA-5200",
    projeto: "Firewall Corporativo",
    programa: "Segurança",
    responsavel: "Roberto Alves",
    dataRegistro: "2024-03-08",
    dataRevisao: "2024-03-15",
    status: "Aprovado",
    valorImpacto: 142000,
    observacao: "",
  },
  {
    id: 10,
    tipo: "Contrato",
    descricao: "Renovação licenças Microsoft 365",
    projeto: "Sistema ERP",
    programa: "Desenvolvimento",
    responsavel: "Fernanda Torres",
    dataRegistro: "2024-03-10",
    dataRevisao: "",
    status: "Pendente",
    valorImpacto: 67000,
    observacao: "Análise de custo-benefício",
  },
  {
    id: 11,
    tipo: "Horas Técnicas",
    descricao: "Design UX portal institucional",
    projeto: "Portal Web",
    programa: "Desenvolvimento",
    responsavel: "Camila Nunes",
    dataRegistro: "2024-01-22",
    dataRevisao: "2024-01-28",
    status: "Aprovado",
    valorImpacto: 72800,
    observacao: "",
  },
  {
    id: 12,
    tipo: "Ajuste Orçamentário",
    descricao: "Aumento de verba para segurança",
    projeto: "SOC Implementation",
    programa: "Segurança",
    responsavel: "Marcos Pereira",
    dataRegistro: "2024-03-12",
    dataRevisao: "",
    status: "Pendente",
    valorImpacto: 95000,
    observacao: "Pendente aprovação financeiro",
  },
  {
    id: 13,
    tipo: "Compra de Material",
    descricao: "Storage NetApp AFF A400",
    projeto: "Storage Upgrade",
    programa: "Infraestrutura",
    responsavel: "Ricardo Souza",
    dataRegistro: "2024-01-10",
    dataRevisao: "2024-01-18",
    status: "Aprovado",
    valorImpacto: 189000,
    observacao: "",
  },
  {
    id: 14,
    tipo: "Horas Técnicas",
    descricao: "Configuração pipeline CI/CD",
    projeto: "DevOps Pipeline",
    programa: "Desenvolvimento",
    responsavel: "Pedro Costa",
    dataRegistro: "2024-03-15",
    dataRevisao: "2024-03-20",
    status: "Aprovado",
    valorImpacto: 87000,
    observacao: "",
  },
  {
    id: 15,
    tipo: "Contrato",
    descricao: "SLA suporte Palo Alto Networks",
    projeto: "Firewall Corporativo",
    programa: "Segurança",
    responsavel: "Roberto Alves",
    dataRegistro: "2024-02-25",
    dataRevisao: "2024-03-02",
    status: "Rejeitado",
    valorImpacto: 56000,
    observacao: "SLA inadequado",
  },
  {
    id: 16,
    tipo: "Compra de Material",
    descricao: "Módulos de memória para CRM",
    projeto: "CRM Customizado",
    programa: "Desenvolvimento",
    responsavel: "Thiago Ramos",
    dataRegistro: "2024-03-18",
    dataRevisao: "",
    status: "Em Análise",
    valorImpacto: 45000,
    observacao: "Verificando compatibilidade",
  },
];

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
const uniqueProjetos = computed(() =>
  [...new Set(tableData.value.map((r) => r.projeto))].sort(),
);
const uniqueResponsaveis = computed(() =>
  [...new Set(tableData.value.map((r) => r.responsavel))].sort(),
);
const uniqueProgramas = computed(() =>
  [...new Set(tableData.value.map((r) => r.programa))].sort(),
);

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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

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
    "Compra de Material": "badge badge-hw",
    "Horas Técnicas": "badge badge-cl",
    Contrato: "badge badge-sg",
    "Ajuste Orçamentário": "badge badge-sw",
  };
  return map[t] ?? "badge badge-hw";
}

function exportCSV() {
  const header =
    "Tipo,Descrição,Projeto,Programa,Responsável,Data Registro,Data Revisão,Valor Impacto,Status";
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

// ─── Charts ──────────────────────────────────────────────────────────────────
const { buildCharts, updateCharts, destroyCharts } = useChartsAuditoria();

onMounted(() => {
  tableData.value = MOCK;
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
  color: #fff;
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
