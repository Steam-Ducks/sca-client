import type {
  BudgetApiResponse,
  BudgetApiRow,
  BudgetProjectRow,
  BudgetSnapshot,
} from "@/types/api";
import { CONFIG } from "@/utils/config";
import { apiFetch } from "@/utils/apiFetch";

export type BudgetFilters = {
  periodo?: string;
  programa?: string;
  projeto?: string;
  saude?: string;
};

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function normalizeRow(row: BudgetApiRow): BudgetProjectRow {
  return {
    id: row.id,
    projeto: row.projeto,
    programa: row.programa ?? "Sem programa",
    budget: Number(row.budget ?? 0),
    custoMateriais: Number(row.custoMateriais ?? 0),
    custoHoras: Number(row.custoHoras ?? 0),
    custoReal: Number(row.custoReal ?? 0),
    desvioPercent: Number(row.desvioPercent ?? 0),
    saude: row.saude,
    projecaoEstouro:
      row.projecaoEstouro === null || row.projecaoEstouro === undefined
        ? null
        : Number(row.projecaoEstouro),
    periodo: row.periodo ?? "Sem periodo",
    status: row.status ?? "Sem status",
  };
}

function extractRows(payload: BudgetApiResponse | BudgetApiRow[]): BudgetApiRow[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function extractLastUpdatedAt(
  payload: BudgetApiResponse | BudgetApiRow[],
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

export const budgetService = {
  async fetchBudgetSnapshot(filters: BudgetFilters = {}): Promise<BudgetSnapshot> {
    const params = new URLSearchParams();
    if (filters.periodo) params.set("periodo", filters.periodo);
    if (filters.programa) params.set("programa", filters.programa);
    if (filters.projeto) params.set("projeto", filters.projeto);
    if (filters.saude) params.set("saude", filters.saude);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiFetch(`${CONFIG.API_BASE_URL}/budget/${query}`);
    if (!response.ok) throw new Error("Erro ao buscar orçamento por projeto");

    const payload = (await response.json()) as BudgetApiResponse | BudgetApiRow[];

    return {
      rows: extractRows(payload).map(normalizeRow),
      lastUpdatedAt: extractLastUpdatedAt(payload, response),
    };
  },
};
