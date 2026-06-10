import type { HorasTecnicasRow } from '@/types/api'
import { CONFIG } from '@/utils/config'
import { apiFetch } from '@/utils/apiFetch'
import { buildQueryString } from '@/utils/queryBuilder'

interface HorasTecnicasFilters {
  periodo?: string
  programa?: string
  projeto?: string
}

function buildQuery(filters: HorasTecnicasFilters): string {
  return buildQueryString({
    periodo: filters.periodo,
    programa: filters.programa,
    projeto: filters.projeto,
  })
}

export const horasTecnicasService = {
  async fetchAll(filters: HorasTecnicasFilters = {}): Promise<HorasTecnicasRow[]> {
    const response = await apiFetch(
      `${CONFIG.API_BASE_URL}/horas-tecnicas/${buildQuery(filters)}`,
    )
    if (!response.ok) throw new Error(`Erro ao buscar horas técnicas: ${response.status}`)
    const json = await response.json()
    return Array.isArray(json) ? json : (json.data ?? [])
  },
}