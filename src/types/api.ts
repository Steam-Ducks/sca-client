export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface ConsolidatedApiRow {
  id: number;
  nome_projeto: string;
  programa: string | null;
  custo_materiais: number;
  custo_horas: number;
  custo_total: number;
  qtd_materiais: number;
  total_horas: number;
  status: string;
}

export interface ConsolidadoRow {
  id: number;
  projeto: string;
  programa: string;
  custoMateriais: number;
  custoHoras: number;
  custoTotal: number;
  qtdMateriais: number;
  totalHoras: number;
  periodo: string;
  status: string;
}
