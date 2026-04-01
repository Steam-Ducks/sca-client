<template>
  <div class="page">

    <!-- PAGE HEADER -->
    <div class="page-header">
      <div class="page-title">
        <span class="icon-circle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </span>
        <div>
          <h1>Horas Técnicas</h1>
          <p class="page-subtitle">Análise detalhada de custos com mão de obra e horas técnicas</p>
        </div>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-icon green">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </span>
        <p class="kpi-label">Custo Total - Horas</p>
        <p class="kpi-value">{{ formatCurrency(kpis.custoTotal) }}</p>
      </div>
      <div class="kpi-card">
        <span class="kpi-icon blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </span>
        <p class="kpi-label">Total de Horas</p>
        <p class="kpi-value">{{ kpis.totalHoras }}h</p>
      </div>
      <div class="kpi-card">
        <span class="kpi-icon purple">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>
        </span>
        <p class="kpi-label">Custo Médio/Hora</p>
        <p class="kpi-value">{{ formatCurrency(kpis.custoMedio) }}</p>
      </div>
      <div class="kpi-card">
        <span class="kpi-icon orange">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </span>
        <p class="kpi-label">Registros</p>
        <p class="kpi-value">{{ filteredRows.length }}</p>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filters-card">
      <div class="filters-header">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <span>Filtros</span>
      </div>
      <div class="filters-row">
        <select v-model="filters.periodo" class="filter-select">
          <option value="">Todos os Períodos</option>
          <option v-for="p in uniquePeriodos" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="filters.programa" class="filter-select">
          <option value="">Todos os Programas</option>
          <option v-for="p in uniqueProgramas" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="filters.projeto" class="filter-select">
          <option value="">Todos os Projetos</option>
          <option v-for="p in uniqueProjetos" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="filters.colaborador" class="filter-select">
          <option value="">Todos os Colaboradores</option>
          <option v-for="c in uniqueColaboradores" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="filters.funcao" class="filter-select">
          <option value="">Todas as Funções</option>
          <option v-for="f in uniqueFuncoes" :key="f" :value="f">{{ f }}</option>
        </select>
        <select v-model="filters.tarefa" class="filter-select">
          <option value="">Todas as Tarefas</option>
          <option v-for="t in uniqueTarefas" :key="t" :value="t">{{ t }}</option>
        </select>
        <button class="btn-export" @click="exportCSV">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar
        </button>
      </div>
    </div>

    <!-- CHARTS ROW -->
    <div class="charts-row">
      <div class="chart-card">
        <h3 class="chart-title">Total de Horas por Projeto</h3>
        <div class="bar-chart">
          <div v-for="item in horasPorProjeto" :key="item.projeto" class="bar-row">
            <span class="bar-label">{{ item.projeto }}</span>
            <div class="bar-track">
              <div class="bar-fill blue-bar" :style="{ width: item.pct + '%' }"></div>
            </div>
            <span class="bar-val">{{ item.horas }}h</span>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">Custo de Horas por Projeto</h3>
        <div class="bar-chart">
          <div v-for="item in custoPorProjeto" :key="item.projeto" class="bar-row">
            <span class="bar-label">{{ item.projeto }}</span>
            <div class="bar-track">
              <div class="bar-fill purple-bar" :style="{ width: item.pct + '%' }"></div>
            </div>
            <span class="bar-val">{{ formatCurrencyShort(item.custo) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-card">
      <h3 class="table-title">Tabela Detalhada de Horas Técnicas</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th @click="sortBy('colaborador')" class="sortable">Colaborador <span class="sort-icon">{{ sortKey === 'colaborador' ? (sortAsc ? '↑' : '↓') : '↕' }}</span></th>
              <th @click="sortBy('funcao')" class="sortable">Função <span class="sort-icon">{{ sortKey === 'funcao' ? (sortAsc ? '↑' : '↓') : '↕' }}</span></th>
              <th @click="sortBy('projeto')" class="sortable">Projeto <span class="sort-icon">{{ sortKey === 'projeto' ? (sortAsc ? '↑' : '↓') : '↕' }}</span></th>
              <th @click="sortBy('programa')" class="sortable">Programa <span class="sort-icon">{{ sortKey === 'programa' ? (sortAsc ? '↑' : '↓') : '↕' }}</span></th>
              <th @click="sortBy('horas')" class="sortable">Horas <span class="sort-icon">{{ sortKey === 'horas' ? (sortAsc ? '↑' : '↓') : '↕' }}</span></th>
              <th @click="sortBy('custoPorHora')" class="sortable">Custo/Hora <span class="sort-icon">{{ sortKey === 'custoPorHora' ? (sortAsc ? '↑' : '↓') : '↕' }}</span></th>
              <th @click="sortBy('custoTotal')" class="sortable">Custo Total <span class="sort-icon">{{ sortKey === 'custoTotal' ? (sortAsc ? '↑' : '↓') : '↕' }}</span></th>
              <th @click="sortBy('periodo')" class="sortable">Período <span class="sort-icon">{{ sortKey === 'periodo' ? (sortAsc ? '↑' : '↓') : '↕' }}</span></th>
              <th>Tarefa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sortedRows" :key="row.id" class="table-row">
              <td class="td-bold">{{ row.colaborador }}</td>
              <td class="td-muted">{{ row.funcao }}</td>
              <td class="td-muted">{{ row.projeto }}</td>
              <td class="td-muted">{{ row.programa }}</td>
              <td class="td-bold">{{ row.horas }}h</td>
              <td>{{ formatCurrency(row.custoPorHora) }}</td>
              <td class="td-bold">{{ formatCurrency(row.custoTotal) }}</td>
              <td>{{ row.periodo }}</td>
              <td><span class="tag" :class="tagClass(row.tarefa)">{{ row.tarefa }}</span></td>
            </tr>
            <tr v-if="sortedRows.length === 0">
              <td colspan="9" class="empty-state">Nenhum registro encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// ─── TYPES ────────────────────────────────────────────────────────────────────
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

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Future API integration:
// const rows = ref<Row[]>([])
// onMounted(async () => { const res = await fetch('/api/technical-hours'); rows.value = await res.json() })

const rows = ref<Row[]>([
  { id: 1,  colaborador: 'Lucas Martins',   funcao: 'Cloud Architect',           projeto: 'Migração AWS',          programa: 'Cloud',           horas: 400, custoPorHora: 420, custoTotal: 168000, periodo: '2024-03', tarefa: 'Arquitetura Cloud' },
  { id: 2,  colaborador: 'Juliana Lima',     funcao: 'Tech Lead',                 projeto: 'Sistema ERP',           programa: 'Desenvolvimento', horas: 410, custoPorHora: 380, custoTotal: 155800, periodo: '2024-02', tarefa: 'Liderança Técnica' },
  { id: 3,  colaborador: 'Ana Oliveira',     funcao: 'Desenvolvedora Full Stack',  projeto: 'Portal Web',            programa: 'Desenvolvimento', horas: 520, custoPorHora: 250, custoTotal: 130000, periodo: '2024-01', tarefa: 'Desenvolvimento' },
  { id: 4,  colaborador: 'Pedro Costa',      funcao: 'DevOps Engineer',            projeto: 'Portal Web',            programa: 'Desenvolvimento', horas: 450, custoPorHora: 280, custoTotal: 126000, periodo: '2024-01', tarefa: 'Desenvolvimento' },
  { id: 5,  colaborador: 'Carlos Ferreira',  funcao: 'DBA',                        projeto: 'Sistema ERP',           programa: 'Desenvolvimento', horas: 380, custoPorHora: 320, custoTotal: 121600, periodo: '2024-02', tarefa: 'Banco de Dados' },
  { id: 6,  colaborador: 'Roberto Alves',    funcao: 'Especialista em Segurança',  projeto: 'SOC Implementation',   programa: 'Segurança',       horas: 300, custoPorHora: 400, custoTotal: 120000, periodo: '2024-03', tarefa: 'Configuração' },
  { id: 7,  colaborador: 'Beatriz Rocha',    funcao: 'DevOps Engineer',            projeto: 'Migração AWS',          programa: 'Cloud',           horas: 380, custoPorHora: 300, custoTotal: 114000, periodo: '2024-03', tarefa: 'Migração' },
  { id: 8,  colaborador: 'João Silva',       funcao: 'Arquiteto de Soluções',      projeto: 'Data Center Regional',  programa: 'Infraestrutura',  horas: 320, custoPorHora: 350, custoTotal: 112000, periodo: '2024-01', tarefa: 'Arquitetura' },
  { id: 9,  colaborador: 'Fernanda Torres',  funcao: 'Analista de Sistemas',       projeto: 'Sistema ERP',           programa: 'Desenvolvimento', horas: 360, custoPorHora: 290, custoTotal: 104400, periodo: '2024-02', tarefa: 'Desenvolvimento' },
  { id: 10, colaborador: 'Ricardo Souza',    funcao: 'Network Engineer',           projeto: 'Data Center Regional',  programa: 'Infraestrutura',  horas: 340, custoPorHora: 310, custoTotal: 105400, periodo: '2024-01', tarefa: 'Configuração' },
  { id: 11, colaborador: 'Camila Nunes',     funcao: 'UX Designer',                projeto: 'Portal Web',            programa: 'Desenvolvimento', horas: 280, custoPorHora: 260, custoTotal: 72800,  periodo: '2024-01', tarefa: 'Design' },
  { id: 12, colaborador: 'Marcos Pereira',   funcao: 'Analista de Segurança',      projeto: 'SOC Implementation',   programa: 'Segurança',       horas: 260, custoPorHora: 370, custoTotal: 96200,  periodo: '2024-03', tarefa: 'Configuração' },
])

// ─── FILTERS ──────────────────────────────────────────────────────────────────
const filters = ref({ periodo: '', programa: '', projeto: '', colaborador: '', funcao: '', tarefa: '' })

const unique = (key: keyof Row) => [...new Set(rows.value.map(r => r[key]))].sort() as string[]
const uniquePeriodos      = computed(() => unique('periodo'))
const uniqueProgramas     = computed(() => unique('programa'))
const uniqueProjetos      = computed(() => unique('projeto'))
const uniqueColaboradores = computed(() => unique('colaborador'))
const uniqueFuncoes       = computed(() => unique('funcao'))
const uniqueTarefas       = computed(() => unique('tarefa'))

const filteredRows = computed(() => rows.value.filter(r =>
  (!filters.value.periodo     || r.periodo     === filters.value.periodo)     &&
  (!filters.value.programa    || r.programa    === filters.value.programa)    &&
  (!filters.value.projeto     || r.projeto     === filters.value.projeto)     &&
  (!filters.value.colaborador || r.colaborador === filters.value.colaborador) &&
  (!filters.value.funcao      || r.funcao      === filters.value.funcao)      &&
  (!filters.value.tarefa      || r.tarefa      === filters.value.tarefa)
))

// ─── SORT ─────────────────────────────────────────────────────────────────────
const sortKey = ref<keyof Row>('custoTotal')
const sortAsc = ref(false)

const sortBy = (key: keyof Row) => {
  if (sortKey.value === key) { sortAsc.value = !sortAsc.value } else { sortKey.value = key; sortAsc.value = false }
}

const sortedRows = computed(() => [...filteredRows.value].sort((a, b) => {
  const va = a[sortKey.value]; const vb = b[sortKey.value]
  if (typeof va === 'number') return sortAsc.value ? (va as number) - (vb as number) : (vb as number) - (va as number)
  return sortAsc.value ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
}))

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const kpis = computed(() => {
  const total = filteredRows.value.reduce((s, r) => s + r.custoTotal, 0)
  const horas = filteredRows.value.reduce((s, r) => s + r.horas, 0)
  return { custoTotal: total, totalHoras: horas, custoMedio: horas > 0 ? total / horas : 0 }
})

// ─── CHARTS ───────────────────────────────────────────────────────────────────
const horasPorProjeto = computed(() => {
  const map: Record<string, number> = {}
  filteredRows.value.forEach(r => { map[r.projeto] = (map[r.projeto] || 0) + r.horas })
  const max = Math.max(...Object.values(map), 1)
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([projeto, horas]) => ({ projeto, horas, pct: (horas / max) * 100 }))
})

const custoPorProjeto = computed(() => {
  const map: Record<string, number> = {}
  filteredRows.value.forEach(r => { map[r.projeto] = (map[r.projeto] || 0) + r.custoTotal })
  const max = Math.max(...Object.values(map), 1)
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([projeto, custo]) => ({ projeto, custo, pct: (custo / max) * 100 }))
})

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const formatCurrencyShort = (v: number) => {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}k`
  return formatCurrency(v)
}

const tagColors: Record<string, string> = {
  'Arquitetura Cloud': 'tag-blue',
  'Liderança Técnica': 'tag-purple',
  'Desenvolvimento':   'tag-violet',
  'Banco de Dados':    'tag-teal',
  'Configuração':      'tag-orange',
  'Migração':          'tag-green',
  'Arquitetura':       'tag-indigo',
  'Design':            'tag-pink',
}
const tagClass = (t: string) => tagColors[t] || 'tag-gray'

// ─── EXPORT ───────────────────────────────────────────────────────────────────
const exportCSV = () => {
  const headers = ['Collaborator', 'Role', 'Project', 'Program', 'Hours', 'Cost/Hour', 'Total Cost', 'Period', 'Task']
  const lines = [headers.join(','), ...sortedRows.value.map(r =>
    [r.colaborador, r.funcao, r.projeto, r.programa, r.horas, r.custoPorHora, r.custoTotal, r.periodo, r.tarefa].join(',')
  )]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'technical-hours.csv'; a.click()
}
</script>

<style scoped>
.page {
  width: 100%;
  max-width: 100%;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-sizing: border-box;
}

/* ── PAGE HEADER ─────────────────────────────────────────────────────────────*/
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title h1 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 13px;
  color: #8888aa;
  margin: 2px 0 0;
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── KPI GRID ────────────────────────────────────────────────────────────────*/
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.kpi-card {
  background: #181825;
  border: 1px solid #2a2a3e;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: border-color 0.2s;
}
.kpi-card:hover { border-color: #6c63ff55; }

.kpi-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.kpi-icon.green  { background: rgba(34,197,94,.15);  color: #22c55e; }
.kpi-icon.blue   { background: rgba(59,130,246,.15); color: #3b82f6; }
.kpi-icon.purple { background: rgba(168,85,247,.15); color: #a855f7; }
.kpi-icon.orange { background: rgba(249,115,22,.15); color: #f97316; }

.kpi-label { font-size: 12px; color: #8888aa; }
.kpi-value { font-size: 24px; font-weight: 700; color: #e2e2f0; letter-spacing: -0.5px; }

/* ── FILTERS ─────────────────────────────────────────────────────────────────*/
.filters-card {
  background: #181825;
  border: 1px solid #2a2a3e;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 14px;
  color: #e2e2f0;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
}

.filter-select {
  width: 100%;
  background: #1e1e2e;
  border: 1px solid #2a2a3e;
  border-radius: 8px;
  color: #e2e2f0;
  padding: 0.5rem 0.75rem;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.filter-select:focus { outline: none; border-color: #6c63ff; }

.btn-export {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #6c63ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1.25rem;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, transform 0.1s;
}
.btn-export:hover  { background: #5b53e6; }
.btn-export:active { transform: scale(0.97); }

/* ── CHARTS ──────────────────────────────────────────────────────────────────*/
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.chart-card {
  background: #181825;
  border: 1px solid #2a2a3e;
  border-radius: 12px;
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #e2e2f0;
}

.bar-chart { display: flex; flex-direction: column; gap: 1rem; }

.bar-row {
  display: grid;
  grid-template-columns: 180px 1fr 80px;
  align-items: center;
  gap: 1rem;
}

.bar-label {
  font-size: 13px;
  color: #8888aa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  height: 8px;
  background: #2a2a3e;
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}
.blue-bar   { background: #3b82f6; }
.purple-bar { background: #a855f7; }

.bar-val { font-size: 13px; color: #c8c8e0; text-align: right; font-weight: 500; }

/* ── TABLE ───────────────────────────────────────────────────────────────────*/
.table-card {
  background: #181825;
  border: 1px solid #2a2a3e;
  border-radius: 12px;
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.table-title { font-size: 16px; font-weight: 600; color: #e2e2f0; }

.table-wrapper { overflow-x: auto; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.data-table thead th:nth-child(1) { width: 14%; }  /* Colaborador */
.data-table thead th:nth-child(2) { width: 14%; }  /* Função */
.data-table thead th:nth-child(3) { width: 13%; }  /* Projeto */
.data-table thead th:nth-child(4) { width: 10%; }  /* Programa */
.data-table thead th:nth-child(5) { width: 7%;  }  /* Horas */
.data-table thead th:nth-child(6) { width: 10%; }  /* Custo/Hora */
.data-table thead th:nth-child(7) { width: 12%; }  /* Custo Total */
.data-table thead th:nth-child(8) { width: 8%;  }  /* Período */
.data-table thead th:nth-child(9) { width: 12%; }  /* Tarefa */

.data-table thead th {
  text-align: left;
  padding: 0.75rem 1.25rem;
  font-size: 12px;
  font-weight: 600;
  color: #8888aa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #2a2a3e;
  white-space: nowrap;
}

.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: #c8c8e0; }
.sort-icon { font-size: 10px; margin-left: 3px; }

.table-row td {
  padding: 1rem 1.25rem;
  font-size: 14px;
  color: #c8c8e0;
  border-bottom: 1px solid #2a2a3e22;
  transition: background 0.1s;
}

.table-row:hover td { background: #1e1e2e; }
.table-row:last-child td { border-bottom: none; }

.td-bold  { font-weight: 600; color: #e2e2f0; }
.td-muted { color: #8888aa; }

.empty-state { text-align: center; color: #8888aa; padding: 2rem !important; }

/* ── TAGS ────────────────────────────────────────────────────────────────────*/
.tag {
  display: inline-block;
  padding: 0.18rem 0.6rem;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.tag-blue   { background: rgba(59,130,246,.18);  color: #93c5fd; }
.tag-purple { background: rgba(168,85,247,.18);  color: #d8b4fe; }
.tag-violet { background: rgba(124,58,237,.18);  color: #c4b5fd; }
.tag-teal   { background: rgba(20,184,166,.18);  color: #5eead4; }
.tag-orange { background: rgba(249,115,22,.18);  color: #fdba74; }
.tag-green  { background: rgba(34,197,94,.18);   color: #86efac; }
.tag-indigo { background: rgba(99,102,241,.18);  color: #a5b4fc; }
.tag-pink   { background: rgba(236,72,153,.18);  color: #f9a8d4; }
.tag-gray   { background: rgba(107,114,128,.18); color: #d1d5db; }

/* ── RESPONSIVE ──────────────────────────────────────────────────────────────*/
@media (max-width: 1200px) {
  .filters-row { grid-template-columns: repeat(3, 1fr) auto; }
  .bar-row     { grid-template-columns: 140px 1fr 70px; }
}

@media (max-width: 1024px) {
  .kpi-grid    { grid-template-columns: repeat(2, 1fr); }
  .charts-row  { grid-template-columns: 1fr; }
  .filters-row { grid-template-columns: repeat(2, 1fr) auto; }
}

@media (max-width: 640px) {
  .page        { padding: 1rem; }
  .kpi-grid    { grid-template-columns: 1fr 1fr; }
  .filters-row { grid-template-columns: 1fr; }
}
</style>