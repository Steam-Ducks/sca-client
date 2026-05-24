// src/types/api.ts

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthUser {
  id: number
  username: string
  name: string
  perfil: string | null
}

export interface AuthResponse {
  access: string
  refresh: string
  user: AuthUser
}

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

export interface ConsolidatedApiResponse {
  data?: ConsolidatedApiRow[];
  results?: ConsolidatedApiRow[];
  items?: ConsolidatedApiRow[];
  last_updated_at?: string | null;
  lastUpdate?: string | null;
  updated_at?: string | null;
  imported_at?: string | null;
  ultima_atualizacao?: string | null;
  ultimaAtualizacao?: string | null;
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

export interface ConsolidatedSnapshot {
  rows: ConsolidadoRow[];
  lastUpdatedAt: string | null;
}

export interface DashboardKPIs {
  total_consolidated_cost: number;
  total_materials_cost: number;
  total_hours_cost: number;
  total_projects: number;
  total_programs: number;
}

export interface DashboardFilters {
  start_date?: string;
  end_date?: string;
  program?: string;
  project?: string;
  status?: string;
}

export interface CompositionData {
  custo_materiais: number;
  custo_horas: number;
  custo_total: number;
  pct_materiais: number;
  pct_horas: number;
}

export type BudgetHealthStatus = "Saudável" | "Atenção" | "Crítico";

export interface BudgetApiRow {
  id: number;
  projeto: string;
  programa: string | null;
  budget: number;
  custoMateriais: number;
  custoHoras: number;
  custoReal: number;
  desvioPercent: number;
  saude: BudgetHealthStatus;
  projecaoEstouro: number | null;
  periodo: string;
  status: string | null;
}

export interface BudgetApiResponse {
  data?: BudgetApiRow[];
  last_updated_at?: string | null;
  lastUpdate?: string | null;
  updated_at?: string | null;
  imported_at?: string | null;
  ultima_atualizacao?: string | null;
  ultimaAtualizacao?: string | null;
}

export interface BudgetProjectRow {
  id: number;
  projeto: string;
  programa: string;
  budget: number;
  custoMateriais: number;
  custoHoras: number;
  custoReal: number;
  desvioPercent: number;
  saude: BudgetHealthStatus;
  projecaoEstouro: number | null;
  periodo: string;
  status: string;
}

export interface BudgetSnapshot {
  rows: BudgetProjectRow[];
  lastUpdatedAt: string | null;
}

export interface BudgetIndicators {
  budgetTotal: number;
  custoRealTotal: number;
  desvioPercentMedio: number;
  projetosSaudaveis: number;
  projetosAtencao: number;
  projetosCriticos: number;
}

export interface BudgetIndicatorsSnapshot {
  indicators: BudgetIndicators;
  lastUpdatedAt: string | null;
}

export interface DashboardProjectRow {
  id: number
  nome_projeto: string
  status: string
}

export interface DashboardSummaryRow {
  programa: string
  qtd_projetos: number
  custo_materiais: number
  custo_horas: number
  custo_total: number
}

export interface TopProjectRow {
  project_name: string
  total_cost: number
}

export interface CostEvolutionRow {
  period: string
  materials_cost: number
  hours_cost: number
  total_cost: number
}

export type ConsolidatedRow = {
  nome_projeto: string
  programa: string | null
  custo_materiais: number
  custo_horas: number
  custo_total: number
  status: string | null
}