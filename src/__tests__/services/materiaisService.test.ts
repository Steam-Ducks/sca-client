import { beforeEach, describe, expect, it, vi } from 'vitest'
import { materiaisService, type MaterialsApiRow } from '@/services/materiaisService'
import type { Filters } from '@/types/materiais'

vi.mock('@/utils/config', () => ({
  CONFIG: {
    API_BASE_URL: 'http://localhost:3000/api',
    ENABLE_LOGS: true,
    ENABLE_METRICS: true,
  },
}))

const fetchMock = vi.fn()
globalThis.fetch = fetchMock

const emptyFilters: Filters = {
  periodo: '',
  programa: '',
  projeto: '',
  categoria: '',
  fornecedor: '',
  status: '',
  area: '',
  search: '',
}

describe('materiaisService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchMateriais', () => {
    it('should fetch materials without query params when filters are empty', async () => {
      const mockRows: MaterialsApiRow[] = [
        {
          id: 1,
          material: 'Notebook Dell',
          projeto: 'Projeto A',
          programa: 'Infraestrutura',
          quantidade: 5,
          valor_unitario: 4500,
          valor_total: 22500,
          periodo: '2024-01',
          fornecedor: 'Dell',
          categoria: 'Hardware',
        },
      ]

      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockRows),
      })

      const result = await materiaisService.fetchMateriais(emptyFilters)

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/compras/')
      expect(result).toEqual(mockRows)
    })

    it('should include only filled filters in query params', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      })

      const filters: Filters = {
        ...emptyFilters,
        periodo: '2024-01',
        programa: 'Infraestrutura',
        categoria: 'Hardware',
        fornecedor: 'Dell',
        search: 'notebook gamer',
      }

      await materiaisService.fetchMateriais(filters)

      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/api/compras/?periodo=2024-01&programa=Infraestrutura&categoria=Hardware&fornecedor=Dell&material=notebook+gamer'
      )
    })

    it('should throw a friendly error when the response is not ok', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(materiaisService.fetchMateriais(emptyFilters)).rejects.toThrow(
        /carregar a tabela de materiais/i
      )
    })

    it('should rethrow fetch errors', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'))

      await expect(materiaisService.fetchMateriais(emptyFilters)).rejects.toThrow('Network error')
    })
  })
})
