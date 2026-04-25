import type { ConsolidatedApiRow, ConsolidadoRow } from "@/types/api";
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

export const consolidatedService = {
  async fetchConsolidated(): Promise<ConsolidadoRow[]> {
    const response = await fetch(`${apiBaseUrl}/consolidated/`);
    if (!response.ok) throw new Error("Erro ao buscar dados consolidados");

    const data = (await response.json()) as ConsolidatedApiRow[];
    return data.map(normalizeRow);
  },
};
