<template>
  <div class="app">
    <main class="main">

      <!-- METRICS -->
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-label">Custo Total - Horas</div>
          <div class="metric-value blue">{{ fmt(kpis.custoTotal) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total de Horas</div>
          <div class="metric-value">{{ kpis.totalHoras }}h</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Custo Médio/Hora</div>
          <div class="metric-value green">{{ fmt(kpis.custoMedio) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Registros</div>
          <div class="metric-value">{{ filteredData.length }}</div>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="filters-card">
        <div class="filters-title">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M3 4h18M7 10h10M11 16h2" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Filtros
        </div>
        <div class="filters-row">
          <select class="filter-select" v-model="filters.periodo" data-testid="filter-periodo">
            <option value="">Todos os Períodos</option>
            <option v-for="p in uniquePeriodos" :key="p" :value="p">{{ p }}</option>
          </select>
          <select class="filter-select" v-model="filters.programa" data-testid="filter-programa">
            <option value="">Todos os Programas</option>
            <option v-for="p in uniqueProgramas" :key="p" :value="p">{{ p }}</option>
          </select>
          <select class="filter-select" v-model="filters.projeto" data-testid="filter-projeto">
            <option value="">Todos os Projetos</option>
            <option v-for="p in uniqueProjetos" :key="p" :value="p">{{ p }}</option>
          </select>
          <select class="filter-select" v-model="filters.colaborador" data-testid="filter-colaborador">
            <option value="">Todos os Colaboradores</option>
            <option v-for="c in uniqueColaboradores" :key="c" :value="c">{{ c }}</option>
          </select>
          <select class="filter-select" v-model="filters.funcao" data-testid="filter-funcao">
            <option value="">Todas as Funções</option>
            <option v-for="f in uniqueFuncoes" :key="f" :value="f">{{ f }}</option>
          </select>
          <select class="filter-select" v-model="filters.tarefa" data-testid="filter-tarefa">
            <option value="">Todas as Tarefas</option>
            <option v-for="t in uniqueTarefas" :key="t" :value="t">{{ t }}</option>
          </select>
          <button class="export-btn" @click="exportCSV" data-testid="btn-export">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 16l-4-4h3V4h2v8h3l-4 4z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 20h16" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <!-- TOP CHARTS -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">Total de Horas por Projeto</div>
          <div class="bar-chart">
            <div v-for="item in horasPorProjeto" :key="item.projeto" class="bar-row">
              <span class="bar-label" :title="item.projeto">{{ item.projeto }}</span>
              <div class="bar-track">
                <div class="bar-fill blue-bar" :style="{ width: item.pct + '%' }"></div>
              </div>
              <span class="bar-val">{{ item.horas }}h</span>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Custo de Horas por Projeto</div>
          <div class="bar-chart">
            <div v-for="item in custoPorProjeto" :key="item.projeto" class="bar-row">
              <span class="bar-label" :title="item.projeto">{{ item.projeto }}</span>
              <div class="bar-track">
                <div class="bar-fill green-bar" :style="{ width: item.pct + '%' }"></div>
              </div>
              <span class="bar-val">{{ fmtShort(item.custo) }}</span>
            </div>
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
                <th class="sort-col" @click="sortBy('colaborador')">Colaborador {{ sortIcon('colaborador') }}</th>
                <th class="sort-col" @click="sortBy('funcao')">Função {{ sortIcon('funcao') }}</th>
                <th class="sort-col" @click="sortBy('projeto')">Projeto {{ sortIcon('projeto') }}</th>
                <th class="sort-col" @click="sortBy('programa')">Programa {{ sortIcon('programa') }}</th>
                <th class="sort-col" @click="sortBy('horas')">Horas {{ sortIcon('horas') }}</th>
                <th class="sort-col" @click="sortBy('custoPorHora')">Custo/Hora {{ sortIcon('custoPorHora') }}</th>
                <th class="sort-col" @click="sortBy('custoTotal')">Custo Total {{ sortIcon('custoTotal') }}</th>
                <th class="sort-col" @click="sortBy('periodo')">Período {{ sortIcon('periodo') }}</th>
                <th>Tarefa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagedData.length === 0">
                <td colspan="9" class="table-feedback muted">Nenhum registro encontrado.</td>
              </tr>
              <tr v-for="row in pagedData" :key="row.id" :data-testid="`row-${row.id}`">
                <td class="material-name">{{ row.colaborador }}</td>
                <td class="muted">{{ row.funcao }}</td>
                <td class="muted">{{ row.projeto }}</td>
                <td class="muted">{{ row.programa }}</td>
                <td class="mono right">{{ row.horas }}h</td>
                <td class="mono">{{ fmt(row.custoPorHora) }}</td>
                <td class="total">{{ fmt(row.custoTotal) }}</td>
                <td class="mono">{{ row.periodo }}</td>
                <td><span :class="tagClass(row.tarefa)">{{ row.tarefa }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span>{{ filteredData.length }} registros · página {{ page }} de {{ totalPages }}</span>
          <div class="pg-btns">
            <button class="pg-btn" @click="page = 1" :disabled="page === 1">«</button>
            <button class="pg-btn" @click="page--" :disabled="page === 1">‹</button>
            <button
              v-for="p in visiblePages" :key="p"
              class="pg-btn" :class="{ active: p === page }"
              @click="page = p"
            >{{ p }}</button>
            <button class="pg-btn" @click="page++" :disabled="page === totalPages">›</button>
            <button class="pg-btn" @click="page = totalPages" :disabled="page === totalPages">»</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Row {
  id: number
  colaborador: string
  funcao: string
  projeto: string
  programa: string
  horas: number
  custoPorHora: number
  custoTotal: number
  periodo: string
  tarefa: string
}

type SortKey = keyof Row
type SortDir = 1 | -1

// ─── Mock data (substituir por fetch da API quando disponível) ────────────────
const RAW: Row[] = [
  { id: 1,  colaborador: 'Lucas Martins',   funcao: 'Cloud Architect',           projeto: 'Migração AWS',         programa: 'Cloud',           horas: 400, custoPorHora: 420, custoTotal: 168000, periodo: '2024-03', tarefa: 'Arquitetura Cloud' },
  { id: 2,  colaborador: 'Juliana Lima',    funcao: 'Tech Lead',                 projeto: 'Sistema ERP',          programa: 'Desenvolvimento', horas: 410, custoPorHora: 380, custoTotal: 155800, periodo: '2024-02', tarefa: 'Liderança Técnica' },
  { id: 3,  colaborador: 'Ana Oliveira',    funcao: 'Desenvolvedora Full Stack', projeto: 'Portal Web',           programa: 'Desenvolvimento', horas: 520, custoPorHora: 250, custoTotal: 130000, periodo: '2024-01', tarefa: 'Desenvolvimento' },
  { id: 4,  colaborador: 'Pedro Costa',     funcao: 'DevOps Engineer',           projeto: 'Portal Web',           programa: 'Desenvolvimento', horas: 450, custoPorHora: 280, custoTotal: 126000, periodo: '2024-01', tarefa: 'Desenvolvimento' },
  { id: 5,  colaborador: 'Carlos Ferreira', funcao: 'DBA',                       projeto: 'Sistema ERP',          programa: 'Desenvolvimento', horas: 380, custoPorHora: 320, custoTotal: 121600, periodo: '2024-02', tarefa: 'Banco de Dados' },
  { id: 6,  colaborador: 'Roberto Alves',   funcao: 'Especialista em Segurança', projeto: 'SOC Implementation',  programa: 'Segurança',       horas: 300, custoPorHora: 400, custoTotal: 120000, periodo: '2024-03', tarefa: 'Configuração' },
  { id: 7,  colaborador: 'Beatriz Rocha',   funcao: 'DevOps Engineer',           projeto: 'Migração AWS',         programa: 'Cloud',           horas: 380, custoPorHora: 300, custoTotal: 114000, periodo: '2024-03', tarefa: 'Migração' },
  { id: 8,  colaborador: 'João Silva',      funcao: 'Arquiteto de Soluções',     projeto: 'Data Center Regional', programa: 'Infraestrutura',  horas: 320, custoPorHora: 350, custoTotal: 112000, periodo: '2024-01', tarefa: 'Arquitetura' },
  { id: 9,  colaborador: 'Fernanda Torres', funcao: 'Analista de Sistemas',      projeto: 'Sistema ERP',          programa: 'Desenvolvimento', horas: 360, custoPorHora: 290, custoTotal: 104400, periodo: '2024-02', tarefa: 'Desenvolvimento' },
  { id: 10, colaborador: 'Ricardo Souza',   funcao: 'Network Engineer',          projeto: 'Data Center Regional', programa: 'Infraestrutura',  horas: 340, custoPorHora: 310, custoTotal: 105400, periodo: '2024-01', tarefa: 'Configuração' },
  { id: 11, colaborador: 'Camila Nunes',    funcao: 'UX Designer',               projeto: 'Portal Web',           programa: 'Desenvolvimento', horas: 280, custoPorHora: 260, custoTotal: 72800,  periodo: '2024-01', tarefa: 'Design' },
  { id: 12, colaborador: 'Marcos Pereira',  funcao: 'Analista de Segurança',     projeto: 'SOC Implementation',  programa: 'Segurança',       horas: 260, custoPorHora: 370, custoTotal: 96200,  periodo: '2024-03', tarefa: 'Configuração' },
]

const PER_PAGE = 8

// ─── State ────────────────────────────────────────────────────────────────────
const filters = ref({ periodo: '', programa: '', projeto: '', colaborador: '', funcao: '', tarefa: '' })
const sortKey = ref<SortKey>('custoTotal')
const sortDir = ref<SortDir>(-1)
const page    = ref(1)

// ─── Filter options ───────────────────────────────────────────────────────────
const uniq = (key: keyof Row) => [...new Set(RAW.map(r => r[key]))].sort() as string[]
const uniquePeriodos      = uniq('periodo')
const uniqueProgramas     = uniq('programa')
const uniqueProjetos      = uniq('projeto')
const uniqueColaboradores = uniq('colaborador')
const uniqueFuncoes       = uniq('funcao')
const uniqueTarefas       = uniq('tarefa')

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredData = computed(() => {
  const f = filters.value
  return RAW
    .filter(r =>
      (!f.periodo     || r.periodo     === f.periodo)     &&
      (!f.programa    || r.programa    === f.programa)    &&
      (!f.projeto     || r.projeto     === f.projeto)     &&
      (!f.colaborador || r.colaborador === f.colaborador) &&
      (!f.funcao      || r.funcao      === f.funcao)      &&
      (!f.tarefa      || r.tarefa      === f.tarefa)
    )
    .sort((a, b) => {
      const av = a[sortKey.value], bv = b[sortKey.value]
      return typeof av === 'string'
        ? av.localeCompare(bv as string) * sortDir.value
        : ((av as number) - (bv as number)) * sortDir.value
    })
})

const kpis = computed(() => {
  const total = filteredData.value.reduce((s, r) => s + r.custoTotal, 0)
  const horas = filteredData.value.reduce((s, r) => s + r.horas, 0)
  return { custoTotal: total, totalHoras: horas, custoMedio: horas > 0 ? total / horas : 0 }
})

const totalPages   = computed(() => Math.max(1, Math.ceil(filteredData.value.length / PER_PAGE)))
const pagedData    = computed(() => filteredData.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
const visiblePages = computed(() => {
  const p = page.value, t = totalPages.value
  const start = Math.max(1, p - 2), end = Math.min(t, p + 2)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const horasPorProjeto = computed(() => {
  const map: Record<string, number> = {}
  filteredData.value.forEach(r => { map[r.projeto] = (map[r.projeto] || 0) + r.horas })
  const max = Math.max(...Object.values(map), 1)
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([projeto, horas]) => ({ projeto, horas, pct: (horas / max) * 100 }))
})

const custoPorProjeto = computed(() => {
  const map: Record<string, number> = {}
  filteredData.value.forEach(r => { map[r.projeto] = (map[r.projeto] || 0) + r.custoTotal })
  const max = Math.max(...Object.values(map), 1)
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([projeto, custo]) => ({ projeto, custo, pct: (custo / max) * 100 }))
})

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(filteredData, () => { page.value = 1 })

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}k`
  return fmt(v)
}

function sortBy(k: SortKey) {
  if (sortKey.value === k) sortDir.value = (sortDir.value * -1) as SortDir
  else { sortKey.value = k; sortDir.value = -1 }
}

const sortIcon = (k: SortKey) =>
  sortKey.value !== k ? '↕' : sortDir.value > 0 ? '↑' : '↓'

function tagClass(t: string) {
  const map: Record<string, string> = {
    'Arquitetura Cloud': 'badge badge-cl',
    'Liderança Técnica': 'badge badge-sg',
    'Desenvolvimento':   'badge badge-hw',
    'Banco de Dados':    'badge badge-st',
    'Configuração':      'badge badge-rd',
    'Migração':          'badge badge-sw',
    'Arquitetura':       'badge badge-cl',
    'Design':            'badge badge-sg',
  }
  return map[t] ?? 'badge badge-hw'
}

function exportCSV() {
  const header = 'Colaborador,Função,Projeto,Programa,Horas,Custo/Hora,Custo Total,Período,Tarefa'
  const rows = filteredData.value.map(r =>
    [r.colaborador, r.funcao, r.projeto, r.programa, r.horas,
     r.custoPorHora, r.custoTotal, r.periodo, r.tarefa].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = 'horas-tecnicas.csv'
  a.click()
}
</script>

<style scoped>
/* ── Variables ────────────────────────────────────────────────────────────── */
.app {
  --bg:      #0d0f14;
  --bg2:     #141720;
  --bg3:     #1c2030;
  --bg4:     #222639;
  --border:  #2a2f45;
  --border2: #353c58;
  --text:    #e2e6f0;
  --text2:   #8b92aa;
  --text3:   #555d7a;
  --blue:    #4d8fff;
  --blue2:   #3a7af5;
  --green:   #2dd4a0;
  --amber:   #f5a623;
  --red:     #f55a5a;
  --purple:  #9b7fff;

  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
}

/* ── Scrollbar ────────────────────────────────────────────────────────────── */
::-webkit-scrollbar       { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg2); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

/* ── Main ─────────────────────────────────────────────────────────────────── */
.main { padding: 24px 28px; flex: 1; display: flex; flex-direction: column; gap: 20px; }

/* ── Metrics ──────────────────────────────────────────────────────────────── */
.metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.metric-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 22px;
  transition: border-color .2s;
  animation: fadeIn .35s ease both;
}
.metric-card:nth-child(2) { animation-delay: .06s; }
.metric-card:nth-child(3) { animation-delay: .12s; }
.metric-card:nth-child(4) { animation-delay: .18s; }
.metric-card:hover { border-color: var(--border2); }
.metric-label {
  font-size: 11px; color: var(--text3);
  text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px;
}
.metric-value {
  font-size: 26px; font-weight: 600;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: -0.5px; color: var(--text);
}
.metric-value.blue  { color: var(--blue); }
.metric-value.green { color: var(--green); }

/* ── Filters ──────────────────────────────────────────────────────────────── */
.filters-card {
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: 10px; padding: 16px 20px;
  animation: fadeIn .35s ease both;
}
.filters-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 500; margin-bottom: 14px; color: var(--text2);
}
.filters-title svg { width: 14px; height: 14px; color: var(--text3); }
.filters-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

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
  min-width: 155px;   /* wide enough to show full placeholder text */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238b92aa'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color .2s;
}
.filter-select:focus { outline: none; border-color: var(--blue2); }

.export-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--blue2); color: #fff; border: none;
  border-radius: 7px; padding: 7px 16px;
  font-size: 12px; font-family: inherit; font-weight: 500;
  cursor: pointer; transition: background .2s; white-space: nowrap;
  margin-left: auto;
}
.export-btn:hover { background: var(--blue); }
.export-btn svg   { width: 14px; height: 14px; }

/* ── Charts ───────────────────────────────────────────────────────────────── */
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.chart-card {
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: 10px; padding: 18px 20px;
  animation: fadeIn .35s ease both;
}
.chart-title {
  font-size: 13px; font-weight: 500; color: var(--text2); margin-bottom: 20px;
}

/* Bar chart — same visual weight as Chart.js bars in Materiais */
.bar-chart { display: flex; flex-direction: column; gap: 14px; }
.bar-row   { display: grid; grid-template-columns: 175px 1fr 80px; align-items: center; gap: 12px; }
.bar-label { font-size: 12px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-track { height: 8px; background: var(--bg4); border-radius: 99px; overflow: hidden; }
.bar-fill  { height: 100%; border-radius: 99px; transition: width .5s cubic-bezier(.4,0,.2,1); }
.blue-bar  { background: var(--blue); }
.green-bar { background: var(--green); }
.bar-val   { font-size: 12px; color: var(--text); text-align: right; font-family: 'IBM Plex Mono', monospace; }

/* ── Table ────────────────────────────────────────────────────────────────── */
.table-card {
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: 10px; overflow: hidden;
  animation: fadeIn .35s ease both;
}
.table-header    { padding: 16px 20px; border-bottom: 1px solid var(--border); }
.table-header h2 { font-size: 14px; font-weight: 500; }
.table-wrap      { overflow-x: auto; }

table        { width: 100%; min-width: 960px; border-collapse: collapse; }
thead tr     { border-bottom: 1px solid var(--border); }
th {
  padding: 11px 16px; text-align: left;
  font-size: 11px; font-weight: 500; color: var(--text3);
  text-transform: uppercase; letter-spacing: .07em; white-space: nowrap;
}
th.sort-col       { cursor: pointer; user-select: none; }
th.sort-col:hover { color: var(--text2); }
tbody tr          { border-bottom: 1px solid var(--border); transition: background .15s; }
tbody tr:hover    { background: var(--bg3); }
tbody tr:last-child { border-bottom: none; }
td {
  padding: 13px 16px; font-size: 13px;
  color: var(--text); white-space: nowrap;
}
td.material-name { font-weight: 500; color: #fff; }
td.muted         { color: var(--text2); }
td.mono          { font-family: 'IBM Plex Mono', monospace; font-size: 12px; }
td.right         { text-align: right; }
td.total         { font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 600; color: var(--green); }
.table-feedback  { text-align: center; padding: 24px 16px; color: var(--text3); }

/* ── Badges ───────────────────────────────────────────────────────────────── */
.badge    { display: inline-block; padding: 3px 9px; border-radius: 5px; font-size: 11px; font-weight: 500; }
.badge-hw { background: rgba(77,143,255,.15);  color: var(--blue); }
.badge-st { background: rgba(45,212,160,.12);  color: var(--green); }
.badge-cl { background: rgba(155,127,255,.12); color: var(--purple); }
.badge-sg { background: rgba(245,166,35,.12);  color: var(--amber); }
.badge-sw { background: rgba(245,166,35,.12);  color: var(--amber); }
.badge-rd { background: rgba(245,90,90,.12);   color: var(--red); }

/* ── Pagination ───────────────────────────────────────────────────────────── */
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-top: 1px solid var(--border);
  font-size: 12px; color: var(--text3);
}
.pg-btns { display: flex; gap: 4px; }
.pg-btn {
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--text2); border-radius: 5px;
  padding: 5px 10px; cursor: pointer; font-size: 12px; transition: all .15s;
}
.pg-btn:hover    { border-color: var(--blue2); color: var(--blue); }
.pg-btn.active   { background: var(--blue2); border-color: var(--blue2); color: #fff; }
.pg-btn:disabled { opacity: .3; cursor: not-allowed; }

/* ── Animation ────────────────────────────────────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
</style>