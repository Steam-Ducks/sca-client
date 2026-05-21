import type { Filters } from "@/types/materiais";
import { CONFIG } from "@/utils/config";
import { apiFetch } from "@/utils/apiFetch";

export interface FilterOptions {
  periodos: string[];
  programas: string[];
  projetos: { nome: string; programa: string | null }[];
  categorias: string[];
  fornecedores: string[];
}

export interface MaterialsApiRow {
  id: number;
  material: string;
  projeto: string;
  programa: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  periodo: string | null;
  fornecedor: string;
  categoria: string;
}

export interface TopMaterial {
  material: string;
  total_cost: number;
}

export interface CostByProject {
  projeto: string;
  total_cost: number;
}

function buildQueryParams(filters: Filters): string {
  const params = new URLSearchParams();

  if (filters.periodo) params.set("periodo", filters.periodo);
  if (filters.programa) params.set("programa", filters.programa);
  if (filters.projeto) params.set("projeto", filters.projeto);
  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.fornecedor) params.set("fornecedor", filters.fornecedor);
  if (filters.search) params.set("material", filters.search);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const materiaisService = {
  async fetchMateriais(filters: Filters): Promise<MaterialsApiRow[]> {
    const qs = buildQueryParams(filters);
    const response = await apiFetch(`${CONFIG.API_BASE_URL}/compras/${qs}`)


    if (!response.ok) {
      throw new Error("Não foi possível carregar a tabela de materiais.");
    }

    return response.json() as Promise<MaterialsApiRow[]>;
  },

  async fetchTopMaterials(filters: Filters): Promise<TopMaterial[]> {
    const qs = buildQueryParams(filters);

    const response = await apiFetch(
      `${CONFIG.API_BASE_URL}/top-materials/${qs}`
    );

    if (!response.ok) {
      throw new Error("Não foi possível carregar o ranking de materiais.");
    }

    return response.json() as Promise<TopMaterial[]>;
  },

  async fetchCostByProject(filters: Filters): Promise<CostByProject[]> {
    const qs = buildQueryParams(filters);

    const response = await apiFetch(
      `${CONFIG.API_BASE_URL}/cost-by-project/${qs}`
    );

    if (!response.ok) {
      throw new Error("Não foi possível carregar o custo por projeto.");
    }

    return response.json() as Promise<CostByProject[]>;
  },

  async fetchFilterOptions(): Promise<FilterOptions> {
    const response = await fetch(`${CONFIG.API_BASE_URL}/materials/filter-options/`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar as opções de filtro.");
    }

    return response.json() as Promise<FilterOptions>;
  },
};