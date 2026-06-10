import type { BudgetHealthStatus } from "@/types/api";

export interface ProjetoFinanceiro {
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
}

export const PROJETOS_FINANCEIROS: ProjetoFinanceiro[] = [
  {
    id: 1,
    projeto: "Projeto A",
    programa: "Programa Alpha",
    budget: 500000,
    custoMateriais: 180000,
    custoHoras: 120000,
    custoReal: 300000,
    desvioPercent: 60,
    saude: "Saudável",
    projecaoEstouro: null,
    periodo: "2026-Q1",
  },
  {
    id: 2,
    projeto: "Projeto B",
    programa: "Programa Alpha",
    budget: 750000,
    custoMateriais: 450000,
    custoHoras: 280000,
    custoReal: 730000,
    desvioPercent: 97.3,
    saude: "Crítico",
    projecaoEstouro: null,
    periodo: "2026-Q1",
  },
  {
    id: 3,
    projeto: "Projeto C",
    programa: "Programa Beta",
    budget: 300000,
    custoMateriais: 85000,
    custoHoras: 65000,
    custoReal: 150000,
    desvioPercent: 50,
    saude: "Saudável",
    projecaoEstouro: null,
    periodo: "2026-Q1",
  },
  {
    id: 4,
    projeto: "Projeto D",
    programa: "Programa Beta",
    budget: 900000,
    custoMateriais: 520000,
    custoHoras: 360000,
    custoReal: 880000,
    desvioPercent: 97.8,
    saude: "Crítico",
    projecaoEstouro: null,
    periodo: "2026-Q1",
  },
  {
    id: 5,
    projeto: "Projeto E",
    programa: "Programa Gamma",
    budget: 450000,
    custoMateriais: 210000,
    custoHoras: 180000,
    custoReal: 390000,
    desvioPercent: 86.7,
    saude: "Atenção",
    projecaoEstouro: null,
    periodo: "2026-Q1",
  },
  {
    id: 6,
    projeto: "Projeto F",
    programa: "Programa Gamma",
    budget: 600000,
    custoMateriais: 280000,
    custoHoras: 220000,
    custoReal: 500000,
    desvioPercent: 83.3,
    saude: "Atenção",
    projecaoEstouro: null,
    periodo: "2026-Q1",
  },
  {
    id: 7,
    projeto: "Projeto G",
    programa: "Programa Delta",
    budget: 800000,
    custoMateriais: 420000,
    custoHoras: 350000,
    custoReal: 770000,
    desvioPercent: 96.3,
    saude: "Crítico",
    projecaoEstouro: null,
    periodo: "2026-Q1",
  },
  {
    id: 8,
    projeto: "Projeto H",
    programa: "Programa Delta",
    budget: 350000,
    custoMateriais: 150000,
    custoHoras: 95000,
    custoReal: 245000,
    desvioPercent: 70,
    saude: "Atenção",
    projecaoEstouro: null,
    periodo: "2026-Q1",
  },
];
