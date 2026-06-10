import { CONFIG } from "@/utils/config";
import { apiFetch } from "@/utils/apiFetch";
import { buildQueryString } from "@/utils/queryBuilder";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExecucaoRow {
  id: number;
  run_id: string;
  fonte: string;
  tabela: string;
  tipo_processo: string;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  linhas_processadas: number;
  duracao_segundos: number | null;
  erros: number;
  avisos: number;
  detalhes_falha: string | null;
  iniciado_em: string;
  finalizado_em: string | null;
}

export interface ExecucoesResponse {
  count: number;
  results: ExecucaoRow[];
}

export interface ExecucoesFilters {
  status?: string;
  tabela?: string;
  fonte?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface ImportResponse {
  linhas_recebidas?: number;
  error?: string;
  tipo_esperado?: string;
  colunas_ausentes?: string[];
}

export interface ImportResult {
  ok: boolean;
  recordsProcessed?: number;
  errorMessage?: string;
}

// ─── Endpoint map ─────────────────────────────────────────────────────────────

export const IMPORT_ENDPOINTS: Record<string, string> = {
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

export interface FileDefinition {
  key: string;
  name: string;
}

export const ORG_FILES: FileDefinition[] = [
  { key: "programas", name: "programas.csv" },
  { key: "projetos",  name: "projetos.csv" },
];

export const MATERIAIS_FILES: FileDefinition[] = [
  { key: "materiais",                 name: "materiais.csv" },
  { key: "empenho_materiais",         name: "empenho_materiais.csv" },
  { key: "estoque_materiais_projeto", name: "estoque_materiais_projeto.csv" },
  { key: "fornecedores",              name: "fornecedores.csv" },
  { key: "pedidos_compras",           name: "pedidos_compras.csv" },
  { key: "solicitacoes_compra",       name: "solicitacoes_compra.csv" },
  { key: "compras_projeto",           name: "compras_projeto.csv" },
];

export const HORAS_FILES: FileDefinition[] = [
  { key: "tarefa_projeto", name: "tarefa_projeto.csv" },
  { key: "tempo_tarefas",  name: "tempo_tarefas.csv" },
];

// ─── Permission map ───────────────────────────────────────────────────────────

/**
 * Maps user profiles to the set of file keys they are allowed to import.
 * `null` means unrestricted (super admin).
 */
export const ALLOWED_IMPORT_KEYS_BY_PROFILE: Record<string, Set<string> | null> = {
  super_admin:  null,
  financeiro:   new Set(["programas", "projetos", "tarefa_projeto", "tempo_tarefas"]),
  compras:      new Set(["fornecedores", "pedidos_compras", "solicitacoes_compra", "compras_projeto"]),
  almoxarifado: new Set(["materiais", "empenho_materiais", "estoque_materiais_projeto"]),
  projetos:     new Set(["projetos", "tarefa_projeto", "tempo_tarefas"]),
};

/**
 * Returns the set of allowed import keys for a given profile,
 * or `null` if the profile has unrestricted access.
 */
export function getAllowedKeysForProfile(profile: string | null | undefined): Set<string> | null {
  if (!profile || !(profile in ALLOWED_IMPORT_KEYS_BY_PROFILE)) return null;
  return ALLOWED_IMPORT_KEYS_BY_PROFILE[profile];
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Uploads a CSV file to the appropriate import endpoint.
 * Returns a normalised ImportResult regardless of HTTP outcome.
 */
export async function uploadImportFile(fileKey: string, file: File): Promise<ImportResult> {
  const endpoint = IMPORT_ENDPOINTS[fileKey];
  if (!endpoint) {
    return { ok: false, errorMessage: `Endpoint não encontrado para a chave: ${fileKey}` };
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  const data: ImportResponse = await res.json();

  if (!res.ok) {
    const errorMessage = buildImportErrorMessage(data);
    return { ok: false, errorMessage };
  }

  return { ok: true, recordsProcessed: data.linhas_recebidas ?? 0 };
}

/**
 * Builds a user-facing error message from the API error payload.
 */
function buildImportErrorMessage(data: ImportResponse): string {
  if (data.tipo_esperado) {
    let detail = `Arquivo incorreto. Este campo espera: ${data.tipo_esperado}.csv`;
    if (data.colunas_ausentes?.length) {
      detail += `. Colunas ausentes: ${data.colunas_ausentes.join(", ")}`;
    }
    return detail;
  }

  if (data.colunas_ausentes?.length) {
    return `Colunas ausentes: ${data.colunas_ausentes.join(", ")}`;
  }

  return data.error ?? "Erro ao importar arquivo";
}

/**
 * Fetches the list of import executions from the monitoring endpoint,
 * applying optional filters.
 */
export async function fetchExecucoes(filters: ExecucoesFilters = {}): Promise<ExecucoesResponse> {
  const query = buildQueryString({
    status:      filters.status,
    tabela:      filters.tabela,
    fonte:       filters.fonte,
    data_inicio: filters.data_inicio,
    data_fim:    filters.data_fim,
  });
  const res = await apiFetch(`${CONFIG.API_BASE_URL}/monitoring/execucoes/${query}`);

  if (!res.ok) {
    throw new Error("Erro ao carregar registros.");
  }

  return res.json() as Promise<ExecucoesResponse>;
}