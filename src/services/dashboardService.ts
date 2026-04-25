// src/services/dashboardService.ts
import type { DashboardKPIs, DashboardFilters } from '@/types/api'
import { CONFIG } from '@/utils/config'

export const dashboardService = {
  async fetchKPIs(filters: DashboardFilters = {}): Promise<DashboardKPIs> {
    const params = new URLSearchParams()

    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.program) params.append('program', filters.program)
    if (filters.project) params.append('project', filters.project)
    if (filters.status) params.append('status', filters.status)

    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await fetch(`${CONFIG.API_BASE_URL}/dashboard/kpis/${query}`)

    if (!response.ok) throw new Error(`Error fetching KPIs: ${response.status}`)

    return response.json()
  },
}