<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">
        Monitoramento do Sistema
      </h1>

      <!-- STATUS HEADER -->
      <div :class="['status-header', statusData?.status ?? 'loading']">
        <div class="status-badge-main">
          <span class="status-dot" />
          {{ statusLabel }}
        </div>
        <div class="status-meta">
          <span class="meta-tag">{{ statusData?.environment ?? '—' }}</span>
          <span class="meta-tag">Uptime: {{ formatUptime(statusData?.uptime_seconds) }}</span>
          <span class="meta-tag">{{ formatTimestamp(statusData?.timestamp) }}</span>
          <button
            class="refresh-btn"
            :disabled="loading"
            @click="load"
          >
            ↻ Atualizar
          </button>
        </div>
      </div>

      <!-- KPI CARDS -->
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-label">
            Banco de Dados
          </div>
          <div :class="['metric-value', serviceColor(statusData?.services?.database?.status)]">
            {{ statusData?.services?.database?.status ?? '—' }}
          </div>
          <div
            v-if="statusData?.services?.database?.response_time_ms != null"
            class="metric-sub"
          >
            {{ statusData.services.database.response_time_ms }}ms
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Conexões DB
          </div>
          <div :class="['metric-value', connectionsColor]">
            {{ statusData?.db_stats?.connections?.total ?? '—' }}
          </div>
          <div
            v-if="statusData?.db_stats?.connections?.active != null"
            class="metric-sub"
          >
            {{ statusData.db_stats.connections.active }} ativas · {{ statusData.db_stats.connections.waiting_lock }} em lock
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Processos Recentes
          </div>
          <div class="metric-value blue">
            {{ statusData?.processes?.filter(p => !p.error)?.length ?? '—' }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Alertas Ativos
          </div>
          <div :class="['metric-value', alertsColor]">
            {{ statusData?.alerts?.length ?? '—' }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Inconsistências
          </div>
          <div :class="['metric-value', integrityColor]">
            {{ statusData?.data_integrity?.inconsistencies?.length ?? '—' }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">
            Queries Lentas
          </div>
          <div :class="['metric-value', slowQueriesColor]">
            {{ statusData?.db_stats?.slow_queries?.length ?? '—' }}
          </div>
          <div class="metric-sub">
            média &gt; 300ms
          </div>
        </div>
      </div>

      <!-- LAST UPDATES -->
      <div class="section-card">
        <div class="section-title">
          Última Atualização dos Dados
        </div>
        <div
          v-if="!statusData?.last_updates"
          class="empty-state"
        >
          Carregando...
        </div>
        <div
          v-else
          class="updates-grid"
        >
          <div
            v-for="(ts, key) in statusData.last_updates"
            :key="key"
            class="update-item"
          >
            <span class="update-key">{{ formatKey(String(key)) }}</span>
            <span :class="['update-ts', ts ? '' : 'null-ts']">
              {{ ts ? formatTimestamp(ts) : 'Sem dados' }}
            </span>
          </div>
        </div>
      </div>

      <!-- PROCESSES -->
      <div class="section-card">
        <div class="section-title">
          Processos Recentes (ETL)
        </div>
        <div
          v-if="!statusData?.processes?.length"
          class="empty-state"
        >
          Nenhum processo registrado
        </div>
        <div
          v-else
          class="table-container"
        >
          <table class="table">
            <thead>
              <tr>
                <th>Operação</th>
                <th>Tabela</th>
                <th>Status</th>
                <th>Início</th>
                <th>Duração</th>
                <th>Linhas</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in statusData.processes"
                :key="p.run_id"
              >
                <td>{{ p.operation }}</td>
                <td>{{ p.table ?? '—' }}</td>
                <td>
                  <span :class="['process-status', processColor(p.status)]">{{ p.status }}</span>
                </td>
                <td>{{ formatTimestamp(p.started_at) }}</td>
                <td>{{ p.duration_seconds != null ? `${p.duration_seconds}s` : '—' }}</td>
                <td>{{ p.affected_rows ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ALERTS -->
      <div class="section-card">
        <div class="section-title">
          Alertas e Falhas
        </div>
        <div
          v-if="!statusData?.alerts?.length"
          class="empty-state ok-state"
        >
          Nenhum alerta ativo
        </div>
        <div
          v-else
          class="alert-list"
        >
          <div
            v-for="(a, i) in statusData.alerts"
            :key="a.run_id ?? `${a.source}-${i}`"
            :class="['alert-item', a.level === 'warning' ? 'alert-warning' : 'alert-error']"
          >
            <span :class="['alert-level', a.level === 'warning' ? 'level-warning' : 'level-error']">
              {{ a.level.toUpperCase() }}
            </span>
            <span class="alert-msg">
              {{ a.message ?? `${a.operation} — ${a.table}` }}
            </span>
            <span class="alert-time">{{ formatTimestamp(a.timestamp) }}</span>
          </div>
        </div>
      </div>

      <!-- DATA INTEGRITY -->
      <div class="section-card">
        <div class="section-title">
          Integridade dos Dados
        </div>
        <div
          v-if="!statusData?.data_integrity?.inconsistencies?.length"
          class="empty-state ok-state"
        >
          Nenhuma inconsistência detectada
        </div>
        <div
          v-else
          class="integrity-issues"
        >
          <div
            v-for="(issue, i) in statusData.data_integrity.inconsistencies"
            :key="i"
            class="issue-item"
          >
            {{ issue }}
          </div>
        </div>
        <div
          v-if="statusData?.data_integrity?.counts && Object.keys(statusData.data_integrity.counts).length"
          class="counts-grid"
        >
          <div
            v-for="(val, key) in statusData.data_integrity.counts"
            :key="key"
            class="count-item"
          >
            <span class="count-key">{{ formatKey(String(key)) }}</span>
            <span class="count-val">{{ val }}</span>
          </div>
        </div>
      </div>

      <!-- TABLE SIZES -->
      <div class="section-card">
        <div class="section-title">
          Tamanho das Tabelas
        </div>
        <div
          v-if="!statusData?.db_stats?.table_sizes?.length"
          class="empty-state"
        >
          Sem dados
        </div>
        <div
          v-else
          class="table-container"
        >
          <table class="table">
            <thead>
              <tr>
                <th>Schema</th>
                <th>Tabela</th>
                <th>Tamanho</th>
                <th>Linhas (estimativa)</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in statusData.db_stats.table_sizes"
                :key="`${t.schemaname}.${t.tablename}`"
              >
                <td class="schema-tag">
                  {{ t.schemaname }}
                </td>
                <td>{{ t.tablename }}</td>
                <td class="size-val">
                  {{ t.total_size }}
                </td>
                <td>{{ t.row_estimate.toLocaleString('pt-BR') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SLOW QUERIES -->
      <div class="section-card">
        <div class="section-title">
          Queries Lentas (média &gt; 300ms)
        </div>
        <div
          v-if="!statusData?.db_stats?.slow_queries?.length"
          class="empty-state ok-state"
        >
          Nenhuma query lenta detectada
        </div>
        <div
          v-else
          class="table-container"
        >
          <table class="table">
            <thead>
              <tr>
                <th>Query</th>
                <th>Chamadas</th>
                <th>Média (ms)</th>
                <th>Máx (ms)</th>
                <th>Total (ms)</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(q, i) in statusData.db_stats.slow_queries"
                :key="i"
              >
                <td class="query-snippet">
                  {{ q.query_snippet }}
                </td>
                <td>{{ q.calls.toLocaleString('pt-BR') }}</td>
                <td :class="['mean-ms', q.mean_ms > 1000 ? 'ms-red' : 'ms-amber']">
                  {{ q.mean_ms }}
                </td>
                <td>{{ q.max_ms }}</td>
                <td>{{ q.total_ms.toLocaleString('pt-BR') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { statusService, type StatusResponse } from "@/services/statusService";
import type { DbConnections } from "@/services/statusService";

const statusData = ref<StatusResponse | null>(null);
const loading = ref(false);

async function load() {
  loading.value = true;
  statusData.value = await statusService.fetch();
  loading.value = false;
}

let interval: ReturnType<typeof setInterval>;

onMounted(() => {
  load();
  interval = setInterval(load, 30_000);
});

onUnmounted(() => clearInterval(interval));

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    ok: "Operacional",
    warning: "Atenção",
    degraded: "Degradado",
    loading: "Carregando...",
  };
  return statusData.value ? (map[statusData.value.status] ?? statusData.value.status) : "Carregando...";
});

const alertsColor = computed(() => {
  const n = statusData.value?.alerts?.length ?? 0;
  return n === 0 ? "green" : "red";
});

const integrityColor = computed(() => {
  const n = statusData.value?.data_integrity?.inconsistencies?.length ?? 0;
  return n === 0 ? "green" : "amber";
});

const connectionsColor = computed(() => {
  const c = statusData.value?.db_stats?.connections as DbConnections | undefined;
  if (!c || c.error) return "amber";
  if (c.waiting_lock > 0) return "red";
  if (c.total > 80) return "amber";
  return "green";
});

const slowQueriesColor = computed(() => {
  const n = statusData.value?.db_stats?.slow_queries?.length ?? 0;
  return n === 0 ? "green" : n > 3 ? "red" : "amber";
});

function serviceColor(s?: string): string {
  if (s === "ok") return "green";
  if (s === "degraded") return "amber";
  if (s === "error") return "red";
  return "blue";
}

function processColor(s: string): string {
  if (s === "success") return "proc-success";
  if (s === "failed") return "proc-failed";
  return "proc-running";
}

function formatTimestamp(ts?: string | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("pt-BR");
}

function formatUptime(s?: number): string {
  if (s == null) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f8fafc;
}

.main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* STATUS HEADER */
.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.status-header.ok {
  border-left: 4px solid #22c55e;
}

.status-header.warning {
  border-left: 4px solid #f59e0b;
}

.status-header.degraded {
  border-left: 4px solid #ef4444;
}

.status-header.loading {
  border-left: 4px solid #94a3b8;
}

.status-badge-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  display: inline-block;
}

.ok .status-dot { background: #22c55e; }
.warning .status-dot { background: #f59e0b; }
.degraded .status-dot { background: #ef4444; }

.status-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 0.8rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.2rem 0.6rem;
  border-radius: 0.375rem;
}

.refresh-btn {
  font-size: 0.8rem;
  color: #3b82f6;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.375rem;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
}

.refresh-btn:hover:not(:disabled) {
  background: #dbeafe;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* METRIC CARDS */
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.metric-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.4rem;
  font-weight: 700;
}

.metric-value.blue   { color: #3b82f6; }
.metric-value.green  { color: #22c55e; }
.metric-value.amber  { color: #f59e0b; }
.metric-value.red    { color: #ef4444; }

.metric-sub {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* SECTIONS */
.section-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.empty-state {
  font-size: 0.875rem;
  color: #94a3b8;
  padding: 0.5rem 0;
}

.ok-state {
  color: #22c55e;
}

/* LAST UPDATES GRID */
.updates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
}

.update-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.6rem 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.update-key {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.update-ts {
  font-size: 0.8rem;
  color: #1e293b;
}

.null-ts {
  color: #94a3b8;
  font-style: italic;
}

/* TABLE */
.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.table th {
  text-align: left;
  padding: 0.6rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.table td {
  padding: 0.7rem 1rem;
  color: #374151;
  border-bottom: 1px solid #f1f5f9;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.process-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.proc-success {
  background: #dcfce7;
  color: #166534;
}

.proc-failed {
  background: #fee2e2;
  color: #991b1b;
}

.proc-running {
  background: #dbeafe;
  color: #1d4ed8;
}

/* ALERTS */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
}

.alert-error {
  background: #fff1f1;
  border: 1px solid #fca5a5;
}

.alert-warning {
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.alert-level {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.level-error {
  background: #fee2e2;
  color: #991b1b;
}

.level-warning {
  background: #fef3c7;
  color: #92400e;
}

.alert-msg {
  flex: 1;
  color: #374151;
}

.alert-time {
  font-size: 0.75rem;
  color: #94a3b8;
  flex-shrink: 0;
}

/* DATA INTEGRITY */
.integrity-issues {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.issue-item {
  font-size: 0.85rem;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.counts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.count-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.75rem;
  background: #f8fafc;
  border-radius: 0.375rem;
  font-size: 0.8rem;
}

.count-key {
  color: #64748b;
}

.count-val {
  font-weight: 600;
  color: #1e293b;
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

/* TABLE SIZES */
.schema-tag {
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
}

.size-val {
  font-weight: 600;
  color: #1e293b;
}

/* SLOW QUERIES */
.query-snippet {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  color: #374151;
  max-width: 480px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mean-ms {
  font-weight: 700;
}

.ms-amber { color: #d97706; }
.ms-red   { color: #dc2626; }
</style>
