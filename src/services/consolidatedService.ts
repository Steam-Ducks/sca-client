import type {
  ConsolidatedApiResponse,
  ConsolidatedApiRow,
  ConsolidatedSnapshot,
  ConsolidadoRow,
} from "@/types/api";
import { CONFIG } from "@/utils/config";

const apiBaseUrl = CONFIG.API_BASE_URL;

const projectPeriods: Record<string, string> = {
  "Data Center Regional": "2024-01",
  "Storage Upgrade": "2024-01",
  "Migracao AWS": "2024-01",
  "Migração AWS": "2024-01",
  "SOC Implementation": "2024-03",
  "Modernizacao de Rede": "2024-03",
  "Modernização de Rede": "2024-03",
  "Sistema ERP": "2024-02",
  "Portal Web": "2024-01",
  "Container Platform": "2024-02",
  "App Mobile": "2024-02",
  "DevOps Pipeline": "2024-03",
  "Firewall Corporativo": "2024-02",
  "CRM Customizado": "2024-03",
};

function inferPeriodo(row: ConsolidatedApiRow): string {
  return projectPeriods[row.nome_projeto] ?? "Sem periodo";
}

function normalizeRow(row: ConsolidatedApiRow): ConsolidadoRow {
  return {
    id: row.id,
    projeto: row.nome_projeto,
    programa: row.programa ?? "Sem programa",
    custoMateriais: Number(row.custo_materiais ?? 0),
    custoHoras: Number(row.custo_horas ?? 0),
    custoTotal: Number(row.custo_total ?? 0),
    qtdMateriais: Number(row.qtd_materiais ?? 0),
    totalHoras: Number(row.total_horas ?? 0),
    periodo: inferPeriodo(row),
    status: row.status || "Sem status",
  };
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function extractRows(
  payload: ConsolidatedApiRow[] | ConsolidatedApiResponse,
): ConsolidatedApiRow[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function extractLastUpdatedAt(
  payload: ConsolidatedApiRow[] | ConsolidatedApiResponse,
  response: Response,
): string | null {
  if (!Array.isArray(payload)) {
    const candidates = [
      payload.last_updated_at,
      payload.lastUpdate,
      payload.updated_at,
      payload.imported_at,
      payload.ultima_atualizacao,
      payload.ultimaAtualizacao,
    ];

    const bodyTimestamp = candidates.find(isValidDate);
    if (bodyTimestamp) return bodyTimestamp;
  }

  const headerTimestamp = [
    response.headers.get("x-last-updated"),
    response.headers.get("last-modified"),
  ].find(isValidDate);

  return headerTimestamp ?? null;
}

export const consolidatedService = {
  async fetchConsolidated(): Promise<ConsolidadoRow[]> {
    const snapshot = await this.fetchConsolidatedSnapshot();
    return snapshot.rows;
  },

  async fetchConsolidatedSnapshot(): Promise<ConsolidatedSnapshot> {
    const response = await fetch(`${apiBaseUrl}/consolidated/`);
    if (!response.ok) throw new Error("Erro ao buscar dados consolidados");

    const payload = (await response.json()) as
      | ConsolidatedApiRow[]
      | ConsolidatedApiResponse;

    return {
      rows: extractRows(payload).map(normalizeRow),
      lastUpdatedAt: extractLastUpdatedAt(payload, response),
    };
  },
};
