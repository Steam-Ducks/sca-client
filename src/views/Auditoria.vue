<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">Auditoria e Importação de Dados</h1>

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-title">
          <svg
            class="shield-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Auditoria e Importação de Dados</span>
        </div>
        <p class="header-subtitle">
          Monitoramento de cargas, importação manual de dados e rastreabilidade do sistema
        </p>
      </div>

      <!-- KPI CARDS -->
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-icon-wrap blue">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v5c0 1.7 4 3 9 3s9-1.3 9-3V5" />
              <path d="M3 10v5c0 1.7 4 3 9 3s9-1.3 9-3v-5" />
            </svg>
          </div>
          <p class="metric-label">Total de Cargas</p>
          <p class="metric-value">{{ tableData.length }}</p>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap green">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p class="metric-label">Concluídas</p>
          <p class="metric-value">{{ kpis.concluidas }}</p>
          <p class="metric-sub">{{ pct(kpis.concluidas) }}% do total</p>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap amber">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2" />
            </svg>
          </div>
          <p class="metric-label">Parciais</p>
          <p class="metric-value">{{ kpis.parciais }}</p>
          <p class="metric-sub">{{ pct(kpis.parciais) }}% do total</p>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap red">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p class="metric-label">Falhas</p>
          <p class="metric-value">{{ kpis.falhas }}</p>
          <p class="metric-sub">{{ pct(kpis.falhas) }}% do total</p>
        </div>
      </div>

      <!-- TABS CONTAINER -->
      <div class="tabs-container">
        <!-- Tab Navigation -->
        <div class="tabs-nav">
          <button
            :class="['tab-btn', { active: activeTab === 'importacao' }]"
            @click="activeTab = 'importacao'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Importação de Dados
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'historico' }]"
            @click="activeTab = 'historico'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Histórico de Execuções
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'falhas' }]"
            @click="activeTab = 'falhas'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2" />
            </svg>
            Falhas e Inconsistências
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'rastreabilidade' }]"
            @click="activeTab = 'rastreabilidade'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Rastreabilidade
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tabs-content">

          <!-- ── Importação de Dados ──────────────────────────────────── -->
          <div v-show="activeTab === 'importacao'" class="tab-panel">
            <div class="import-sections">

              <!-- Importação Organizacional -->
              <div class="import-section">
                <div class="section-header">
                  <div class="section-icon blue">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z" />
                      <path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2" />
                      <path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2" />
                      <line x1="10" y1="6" x2="14" y2="6" />
                      <line x1="10" y1="10" x2="14" y2="10" />
                      <line x1="10" y1="14" x2="14" y2="14" />
                      <line x1="10" y1="18" x2="14" y2="18" />
                    </svg>
                  </div>
                  <h3 class="section-title">Importação Organizacional</h3>
                </div>
                <p class="section-desc">
                  Atualização das estruturas organizacionais utilizadas no ambiente analítico
                </p>
                <div class="upload-grid">
                  <div v-for="file in orgFiles" :key="file.key" class="upload-card">
                    <div class="upload-card-header">
                      <div class="file-name-row">
                        <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span class="file-name">{{ file.name }}</span>
                      </div>
                      <span v-if="importStatus[file.key]" :class="importBadgeClass(importStatus[file.key].status)">
                        {{ importBadgeLabel(importStatus[file.key].status) }}
                      </span>
                    </div>
                    <p v-if="importStatus[file.key]?.message" :class="['upload-message', { error: importStatus[file.key].status === 'error' }]">
                      {{ importStatus[file.key].message }}
                      <span v-if="importStatus[file.key].recordsProcessed"> — {{ importStatus[file.key].recordsProcessed }} registros</span>
                    </p>
                    <input :id="`file-input-${file.key}`" type="file" accept=".csv" class="sr-only" @change="handleFileChange(file.key, $event)" />
                    <button :disabled="importStatus[file.key]?.status === 'processing'" class="upload-btn" @click="triggerFileInput(file.key)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {{ importStatus[file.key]?.status === 'processing' ? 'Processando...' : 'Selecionar Arquivo' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Importação de Materiais -->
              <div class="import-section">
                <div class="section-header">
                  <div class="section-icon green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <h3 class="section-title">Importação de Materiais</h3>
                </div>
                <p class="section-desc">
                  Atualização dos dados relacionados a materiais, compras, estoque e fornecedores
                </p>
                <div class="upload-grid">
                  <div v-for="file in materiaisFiles" :key="file.key" class="upload-card">
                    <div class="upload-card-header">
                      <div class="file-name-row">
                        <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span class="file-name">{{ file.name }}</span>
                      </div>
                      <span v-if="importStatus[file.key]" :class="importBadgeClass(importStatus[file.key].status)">
                        {{ importBadgeLabel(importStatus[file.key].status) }}
                      </span>
                    </div>
                    <p v-if="importStatus[file.key]?.message" :class="['upload-message', { error: importStatus[file.key].status === 'error' }]">
                      {{ importStatus[file.key].message }}
                      <span v-if="importStatus[file.key].recordsProcessed"> — {{ importStatus[file.key].recordsProcessed }} registros</span>
                    </p>
                    <input :id="`file-input-${file.key}`" type="file" accept=".csv" class="sr-only" @change="handleFileChange(file.key, $event)" />
                    <button :disabled="importStatus[file.key]?.status === 'processing'" class="upload-btn" @click="triggerFileInput(file.key)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {{ importStatus[file.key]?.status === 'processing' ? 'Processando...' : 'Selecionar Arquivo' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Importação de Horas Técnicas -->
              <div class="import-section">
                <div class="section-header">
                  <div class="section-icon purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <h3 class="section-title">Importação de Horas Técnicas</h3>
                </div>
                <p class="section-desc">
                  Atualização dos dados relacionados às tarefas executadas e horas técnicas registradas
                </p>
                <div class="upload-grid">
                  <div v-for="file in horasFiles" :key="file.key" class="upload-card">
                    <div class="upload-card-header">
                      <div class="file-name-row">
                        <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span class="file-name">{{ file.name }}</span>
                      </div>
                      <span v-if="importStatus[file.key]" :class="importBadgeClass(importStatus[file.key].status)">
                        {{ importBadgeLabel(importStatus[file.key].status) }}
                      </span>
                    </div>
                    <p v-if="importStatus[file.key]?.message" :class="['upload-message', { error: importStatus[file.key].status === 'error' }]">
                      {{ importStatus[file.key].message }}
                      <span v-if="importStatus[file.key].recordsProcessed"> — {{ importStatus[file.key].recordsProcessed }} registros</span>
                    </p>
                    <input :id="`file-input-${file.key}`" type="file" accept=".csv" class="sr-only" @change="handleFileChange(file.key, $event)" />
                    <button :disabled="importStatus[file.key]?.status === 'processing'" class="upload-btn" @click="triggerFileInput(file.key)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {{ importStatus[file.key]?.status === 'processing' ? 'Processando...' : 'Selecionar Arquivo' }}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- ── Histórico de Execuções ─── empty ───────────────────── -->
          <div v-show="activeTab === 'historico'" class="tab-panel" />

          <!-- ── Falhas e Inconsistências ─── empty ────────────────── -->
          <div v-show="activeTab === 'falhas'" class="tab-panel" />

          <!-- ── Rastreabilidade ─── empty ──────────────────────────── -->
          <div v-show="activeTab === 'rastreabilidade'" class="tab-panel" />

        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { CONFIG } from "@/utils/config";

type TabType = "importacao" | "historico" | "falhas" | "rastreabilidade";
type ImportStatus = "idle" | "processing" | "success" | "error";

interface FileImportStatus {
  status: ImportStatus;
  message?: string;
  recordsProcessed?: number;
}

interface ApiRow {
  id: number;
  operation: string;
  status: string;
  table_schema: string | null;
  table_name: string | null;
  affected_rows: number | null;
  started_at: string;
  finalized_at: string | null;
  operation_metadata: Record<string, unknown> | null;
}

interface DataRow {
  id: number;
  status: string;
}

const STATUS_MAP: Record<string, string> = {
  SUCCESS: "Aprovado",
  FAILED:  "Rejeitado",
  PARTIAL: "Parcial",
};

// ─── Endpoint map ────────────────────────────────────────────────────────────
const IMPORT_ENDPOINTS: Record<string, string> = {
  programas:                 "/import/programas/",
  projetos:                  "/import/projetos/",
  materiais:                 "/import/materiais/",
  empenho_materiais:         "/import/empenho-materiais/",
  estoque_materiais_projeto: "/import/estoque-materiais-projeto/",
  fornecedores:              "/import/fornecedores/",
  pedidos_compras:           "/import/pedidos-compra/",
  solicitacoes_compra:       "/import/solicitacoes-compra/",
  compras_projeto:           "/import/compras-projeto/",
  tarefa_projeto:            "/import/tarefas-projeto/",
  tempo_tarefas:             "/import/tempo-tarefas/",
};

// ─── File definitions ─────────────────────────────────────────────────────────
const orgFiles = [
  { key: "programas", name: "programas.csv" },
  { key: "projetos",  name: "projetos.csv" },
];
const materiaisFiles = [
  { key: "materiais",                 name: "materiais.csv" },
  { key: "empenho_materiais",         name: "empenho_materiais.csv" },
  { key: "estoque_materiais_projeto", name: "estoque_materiais_projeto.csv" },
  { key: "fornecedores",              name: "fornecedores.csv" },
  { key: "pedidos_compras",           name: "pedidos_compras.csv" },
  { key: "solicitacoes_compra",       name: "solicitacoes_compra.csv" },
  { key: "compras_projeto",           name: "compras_projeto.csv" },
];
const horasFiles = [
  { key: "tarefa_projeto", name: "tarefa_projeto.csv" },
  { key: "tempo_tarefas",  name: "tempo_tarefas.csv" },
];

// ─── State ────────────────────────────────────────────────────────────────────
const activeTab    = ref<TabType>("importacao");
const importStatus = ref<Record<string, FileImportStatus>>({});
const tableData    = ref<DataRow[]>([]);

// ─── KPIs from API data ───────────────────────────────────────────────────────
const kpis = computed(() => ({
  concluidas: tableData.value.filter((r) => r.status === "Aprovado").length,
  parciais:   tableData.value.filter((r) => r.status === "Parcial").length,
  falhas:     tableData.value.filter((r) => r.status === "Rejeitado").length,
}));

const pct = (v: number) =>
  tableData.value.length > 0 ? ((v / tableData.value.length) * 100).toFixed(1) : "0.0";

// ─── API fetch ────────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/audit/`);
    if (!res.ok) return;
    const raw: ApiRow[] = await res.json();
    tableData.value = raw.map((r) => ({
      id: r.id,
      status: STATUS_MAP[r.status] ?? r.status,
    }));
  } catch {
    // keep existing data on error
  }
}

onMounted(() => { void loadData(); });

// ─── File import ──────────────────────────────────────────────────────────────
function triggerFileInput(fileKey: string) {
  const el = document.getElementById(`file-input-${fileKey}`) as HTMLInputElement | null;
  el?.click();
}

async function handleFileChange(fileKey: string, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!file.name.endsWith(".csv")) {
    importStatus.value = {
      ...importStatus.value,
      [fileKey]: { status: "error", message: "Arquivo deve ser do tipo CSV" },
    };
    return;
  }

  importStatus.value = {
    ...importStatus.value,
    [fileKey]: { status: "processing", message: "Processando arquivo..." },
  };

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${CONFIG.API_BASE_URL}${IMPORT_ENDPOINTS[fileKey]}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      const detail = data.colunas_ausentes?.length
        ? `Colunas ausentes: ${(data.colunas_ausentes as string[]).join(", ")}`
        : (data.error ?? "Erro ao importar arquivo");
      importStatus.value = {
        ...importStatus.value,
        [fileKey]: { status: "error", message: detail },
      };
      return;
    }

    importStatus.value = {
      ...importStatus.value,
      [fileKey]: {
        status: "success",
        message: "Importação concluída com sucesso",
        recordsProcessed: data.linhas_recebidas ?? 0,
      },
    };
  } catch {
    importStatus.value = {
      ...importStatus.value,
      [fileKey]: { status: "error", message: "Erro de conexão com o servidor" },
    };
  }
}

function importBadgeClass(status: ImportStatus) {
  const map: Record<ImportStatus, string> = {
    idle:       "import-badge idle",
    processing: "import-badge processing",
    success:    "import-badge success",
    error:      "import-badge error",
  };
  return map[status];
}

function importBadgeLabel(status: ImportStatus) {
  const map: Record<ImportStatus, string> = {
    idle:       "Aguardando",
    processing: "Processando",
    success:    "Concluído",
    error:      "Erro",
  };
  return map[status];
}
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

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg2); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

.main {
  padding: 24px 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Page Header ──────────────────────────────────────────────────────────── */
.page-header { animation: fadeIn 0.3s ease both; }

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 22px;
  font-weight: 400;
  color: var(--text);
}
.shield-icon {
  width: 22px;
  height: 22px;
  color: #f5793a;
  flex-shrink: 0;
}
.header-subtitle {
  font-size: 13px;
  color: var(--text2);
  margin: 0;
}

/* ── KPI Cards ────────────────────────────────────────────────────────────── */
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.metric-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px 22px;
  transition: border-color 0.2s;
  animation: fadeIn 0.35s ease both;
}
.metric-card:nth-child(2) { animation-delay: 0.06s; }
.metric-card:nth-child(3) { animation-delay: 0.12s; }
.metric-card:nth-child(4) { animation-delay: 0.18s; }
.metric-card:hover { border-color: var(--border2); }

.metric-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  margin-bottom: 14px;
}
.metric-icon-wrap svg { width: 18px; height: 18px; }
.metric-icon-wrap.blue  { background: rgba(77, 143, 255, 0.12); color: var(--blue); }
.metric-icon-wrap.green { background: rgba(45, 212, 160, 0.12); color: var(--green); }
.metric-icon-wrap.amber { background: rgba(245, 166, 35, 0.12); color: var(--amber); }
.metric-icon-wrap.red   { background: rgba(245, 90, 90, 0.12);  color: var(--red); }

.metric-label {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 6px;
}
.metric-value {
  font-size: 30px;
  font-weight: 400;
  font-family: "IBM Plex Mono", monospace;
  color: var(--text);
  line-height: 1;
  margin-bottom: 4px;
}
.metric-sub {
  font-size: 11px;
  color: var(--text3);
  margin: 0;
}

/* ── Tabs Container ───────────────────────────────────────────────────────── */
.tabs-container {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  animation: fadeIn 0.35s ease both;
  animation-delay: 0.1s;
}

.tabs-nav {
  display: flex;
  border-bottom: 1px solid var(--border);
}
.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: var(--text2);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.tab-btn svg { width: 15px; height: 15px; flex-shrink: 0; }
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--blue); border-bottom-color: var(--blue); }

.tabs-content { padding: 24px; }
.tab-panel { min-height: 40px; }

/* ── Import Sections ──────────────────────────────────────────────────────── */
.import-sections { display: flex; flex-direction: column; gap: 28px; }

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}
.section-icon svg { width: 15px; height: 15px; }
.section-icon.blue   { background: rgba(77, 143, 255, 0.12);  color: var(--blue); }
.section-icon.green  { background: rgba(45, 212, 160, 0.12);  color: var(--green); }
.section-icon.purple { background: rgba(155, 127, 255, 0.12); color: var(--purple); }

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  margin: 0;
}
.section-desc {
  font-size: 12px;
  color: var(--text2);
  margin: 0 0 14px 0;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.upload-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  transition: border-color 0.2s;
}
.upload-card:hover { border-color: var(--blue2); }

.upload-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.file-name-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.file-icon { width: 14px; height: 14px; color: var(--text3); flex-shrink: 0; }
.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.upload-message {
  font-size: 11px;
  color: var(--text2);
  margin: 0 0 10px 0;
}
.upload-message.error { color: var(--red); }

.upload-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 14px;
  background: var(--blue2);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.upload-btn:hover { background: var(--blue); }
.upload-btn:disabled {
  background: var(--border2);
  color: var(--text3);
  cursor: not-allowed;
}
.upload-btn svg { width: 13px; height: 13px; }

.import-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  border: 1px solid transparent;
  white-space: nowrap;
}
.import-badge.idle       { background: rgba(139,146,170,0.1); color: var(--text3);  border-color: var(--border); }
.import-badge.processing { background: rgba(77,143,255,0.1);  color: var(--blue);   border-color: rgba(77,143,255,0.2); }
.import-badge.success    { background: rgba(45,212,160,0.1);  color: var(--green);  border-color: rgba(45,212,160,0.2); }
.import-badge.error      { background: rgba(245,90,90,0.1);   color: var(--red);    border-color: rgba(245,90,90,0.2); }

/* ── Utilities ────────────────────────────────────────────────────────────── */
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
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
</style>
