import type { HorasTecnicasRow, HoraRow } from '@/types/api'
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

function normalizeRow(r: HorasTecnicasRow): HoraRow {
  return {
    id:          r.id,
    colaborador: r.colaborador,
    projeto:     r.projeto,
    programa:    r.programa,
    horas:       r.horas_trabalhadas,
    custoPorHora: r.custo_por_hora,
    custoTotal:  r.custo_total,
    periodo:     r.periodo ?? "",
    tarefa:      r.tarefa,
  }
}

export const horasTecnicasService = {
  async fetchAll(filters: HorasTecnicasFilters = {}): Promise<HoraRow[]> {
    const response = await apiFetch(
      `${CONFIG.API_BASE_URL}/horas-tecnicas/${buildQuery(filters)}`,
    )
    if (!response.ok) throw new Error(`Erro ao buscar horas técnicas: ${response.status}`)
    const json = await response.json()
    const raw: HorasTecnicasRow[] = Array.isArray(json) ? json : (json.data ?? [])
    return raw.map(normalizeRow)
  },
}