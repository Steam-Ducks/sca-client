// src/services/dashboardService.ts
import type {
  CompositionData,
  DashboardFilters,
  DashboardKPIs,
  DashboardSummaryRow,
  TopProjectRow,
} from '@/types/api'
import { CONFIG } from '@/utils/config'

function buildQuery(filters: DashboardFilters): string {
  const params = new URLSearchParams()
  if (filters.start_date) params.append('start_date', filters.start_date)
  if (filters.end_date) params.append('end_date', filters.end_date)
  if (filters.program) params.append('program', filters.program)
  if (filters.project) params.append('project', filters.project)
  if (filters.status) params.append('status', filters.status)
  return params.toString() ? `?${params.toString()}` : ''
}

async function get<T>(path: string, filters: DashboardFilters = {}): Promise<T> {
  const response = await fetch(`${CONFIG.API_BASE_URL}${path}${buildQuery(filters)}`)
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
}