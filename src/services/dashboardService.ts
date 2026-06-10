// src/services/dashboardService.ts
import type {
  CompositionData,
  DashboardFilters,
  DashboardKPIs,
  DashboardSummaryRow,
  TopProjectRow,
  CostEvolutionRow,
  ConsolidatedRow,
} from '@/types/api'
import { CONFIG } from '@/utils/config'
import { apiFetch } from '@/utils/apiFetch'
import { buildQueryString } from '@/utils/queryBuilder'

function buildQuery(filters: DashboardFilters): string {
  return buildQueryString({
    start_date: filters.start_date,
    end_date: filters.end_date,
    program: filters.program,
    project: filters.project,
    status: filters.status,
  })
}

async function get<T>(path: string, filters: DashboardFilters = {}): Promise<T> {
  const response = await apiFetch(`${CONFIG.API_BASE_URL}${path}${buildQuery(filters)}`)
  if (!response.ok) throw new Error(`Error fetching ${path}: ${response.status}`)
  return response.json()
}

export const dashboardService = {
  fetchKPIs(filters: DashboardFilters = {}): Promise<DashboardKPIs> {
    return get<DashboardKPIs>('/dashboard/kpis/', filters)
  },

  fetchComposition(filters: DashboardFilters = {}): Promise<CompositionData> {
    return get<CompositionData>('/dashboard/composition/', filters)
  },

  fetchSummary(filters: DashboardFilters = {}): Promise<DashboardSummaryRow[]> {
    return get<DashboardSummaryRow[]>('/dashboard/summary/', filters)
  },

  fetchTopProjects(filters: DashboardFilters = {}): Promise<TopProjectRow[]> {
    return get<TopProjectRow[]>('/dashboard/top-projects/', filters)
  },

  fetchCostEvolution(filters: DashboardFilters = {}): Promise<CostEvolutionRow[]> {
    return get<CostEvolutionRow[]>('/dashboard/cost-evolution/', filters)
  },

  async fetchConsolidated(filters: DashboardFilters = {}): Promise<ConsolidatedRow[]> {
    const json = await get<{ data: ConsolidatedRow[]; last_updated_at: string }>(
      '/consolidated/',
      filters,
    )
    return json.data ?? []
  },

}
