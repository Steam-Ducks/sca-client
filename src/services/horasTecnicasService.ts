import type { HorasTecnicasRow } from '@/types/api'
import { CONFIG } from '@/utils/config'
import { apiFetch } from '@/utils/apiFetch'

interface HorasTecnicasFilters {
  periodo?: string
  programa?: string
  projeto?: string
}

function buildQuery(filters: HorasTecnicasFilters): string {
  const params = new URLSearchParams()
  if (filters.periodo) params.append('periodo', filters.periodo)
  if (filters.programa) params.append('programa', filters.programa)
  if (filters.projeto) params.append('projeto', filters.projeto)
  return params.toString() ? `?${params.toString()}` : ''
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