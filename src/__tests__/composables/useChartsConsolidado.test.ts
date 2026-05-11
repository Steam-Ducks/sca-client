// src/__tests__/composables/useChartsConsolidado.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConsolidadoRow } from '@/composables/useChartsConsolidado'

// ── Mock Chart.js — inclui register como método estático ──────────────────────
vi.mock('chart.js', () => {
  const MockChart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: {
      labels: [] as unknown[],
      datasets: [{ data: [] as unknown[] }, { data: [] as unknown[] }],
    },
  }))
  MockChart.register = vi.fn()
  return { Chart: MockChart, registerables: [] }
})

// ── Mock canvas DOM ───────────────────────────────────────────────────────────
const mockCtx = {}
const mockCanvas = { getContext: vi.fn().mockReturnValue(mockCtx) }

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_DATA: ConsolidadoRow[] = [
  { id: 1, projeto: 'Projeto Alpha', programa: 'Infraestrutura', custoMateriais: 150000, custoHoras:  80000, custoTotal: 230000, qtdMateriais: 10, totalHoras: 200, periodo: '2024-01', status: 'Em andamento' },
  { id: 2, projeto: 'Projeto Beta',  programa: 'Cloud',          custoMateriais:  90000, custoHoras:  60000, custoTotal: 150000, qtdMateriais:  5, totalHoras: 150, periodo: '2024-02', status: 'Concluído'    },
  { id: 3, projeto: 'Projeto Gamma', programa: 'Infraestrutura', custoMateriais: 200000, custoHoras:  40000, custoTotal: 240000, qtdMateriais: 15, totalHoras: 100, periodo: '2024-01', status: 'Em andamento' },
  { id: 4, projeto: 'Projeto Delta', programa: 'Segurança',      custoMateriais:  70000, custoHoras:  90000, custoTotal: 160000, qtdMateriais:  8, totalHoras: 220, periodo: '2024-03', status: 'Planejado'    },
]

describe('useChartsConsolidado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(document, 'getElementById').mockReturnValue(mockCanvas as unknown as HTMLElement)
  })

  it('returns buildCharts, updateCharts and destroyCharts', async () => {
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')
    const composable = useChartsConsolidado()

    expect(typeof composable.buildCharts).toBe('function')
    expect(typeof composable.updateCharts).toBe('function')
    expect(typeof composable.destroyCharts).toBe('function')
  })

  it('buildCharts creates four Chart instances', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')

    useChartsConsolidado().buildCharts(SAMPLE_DATA)

    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('buildCharts queries the four canvas elements by id', async () => {
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')

    useChartsConsolidado().buildCharts(SAMPLE_DATA)

    const ids = (document.getElementById as ReturnType<typeof vi.fn>).mock.calls.map((c: string[]) => c[0])
    expect(ids).toContain('chartDistribuicao')
    expect(ids).toContain('chartPorPrograma')
    expect(ids).toContain('chartTemporalCons')
    expect(ids).toContain('chartTopCustos')
  })

  it('buildCharts with empty data still creates charts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')

    useChartsConsolidado().buildCharts([])

    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('destroyCharts calls destroy on all active chart instances', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')
    const { buildCharts, destroyCharts } = useChartsConsolidado()

    buildCharts(SAMPLE_DATA)
    const instances = vi.mocked(Chart).mock.results.map((r) => r.value)
    vi.clearAllMocks()

    destroyCharts()

    instances.forEach((inst) => expect(inst.destroy).toHaveBeenCalled())
  })

  it('buildCharts calls destroyAll before creating new charts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')
    const { buildCharts } = useChartsConsolidado()

    buildCharts(SAMPLE_DATA)
    const firstInstance = vi.mocked(Chart).mock.results[0].value
    vi.clearAllMocks()

    buildCharts(SAMPLE_DATA)

    expect(firstInstance.destroy).toHaveBeenCalled()
    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('updateCharts updates data on existing chart instances', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')
    const { buildCharts, updateCharts } = useChartsConsolidado()

    buildCharts(SAMPLE_DATA)
    const instances = vi.mocked(Chart).mock.results.map((r) => r.value)
    vi.clearAllMocks()

    updateCharts([SAMPLE_DATA[0]])

    instances.forEach((inst) => expect(inst.update).toHaveBeenCalled())
  })

  it('updateCharts does not crash when called before buildCharts', async () => {
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')
    const { destroyCharts, updateCharts } = useChartsConsolidado()

    destroyCharts()

    expect(() => updateCharts(SAMPLE_DATA)).not.toThrow()
  })

  it('buildCharts does not create chart when canvas context is null', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')

    vi.spyOn(document, 'getElementById').mockReturnValue(null)
    useChartsConsolidado().buildCharts(SAMPLE_DATA)

    expect(Chart).not.toHaveBeenCalled()
  })

  it('buildCharts groups cost by programa correctly', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')

    useChartsConsolidado().buildCharts(SAMPLE_DATA)

    // chartPorPrograma é o segundo chart criado (índice 1)
    const labels = vi.mocked(Chart).mock.calls[1][1].data.labels as string[]
    expect(labels).toContain('Infraestrutura')
    expect(labels).toContain('Cloud')
    expect(labels).toContain('Segurança')
  })

  it('buildCharts top costs chart lists projects sorted by total cost descending', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsConsolidado } = await import('@/composables/useChartsConsolidado')

    useChartsConsolidado().buildCharts(SAMPLE_DATA)

    // chartTopCustos é o quarto chart criado (índice 3)
    const labels = vi.mocked(Chart).mock.calls[3][1].data.labels as string[]
    // Projeto Gamma (240000) deve aparecer antes de Projeto Alpha (230000)
    expect(labels.indexOf('Projeto Gamma')).toBeLessThan(labels.indexOf('Projeto Alpha'))
  })
})