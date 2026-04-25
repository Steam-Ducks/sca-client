// src/__tests__/composables/useChartsDashboard.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardRow } from '@/composables/useChartsDashboard'

// ── Mock Chart.js — inclui register como método estático ──────────────────────
vi.mock('chart.js', () => {
  const MockChart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: {
      labels: [] as unknown[],
      datasets: [
        { data: [] as unknown[], backgroundColor: [] as unknown[] },
        { data: [] as unknown[] },
      ],
    },
  }))
  MockChart.register = vi.fn()
  return { Chart: MockChart, registerables: [] }
})

// ── Mock canvas DOM ───────────────────────────────────────────────────────────
const mockCtx = {}
const mockCanvas = { getContext: vi.fn().mockReturnValue(mockCtx) }

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_DATA: DashboardRow[] = [
  { projeto: 'Projeto A', programa: 'Alpha', custoMateriais: 100000, custoHoras: 50000, custoTotal: 150000, periodo: '2024-01' },
  { projeto: 'Projeto B', programa: 'Alpha', custoMateriais: 200000, custoHoras: 80000, custoTotal: 280000, periodo: '2024-02' },
  { projeto: 'Projeto C', programa: 'Beta',  custoMateriais:  50000, custoHoras: 30000, custoTotal:  80000, periodo: '2024-01' },
]

describe('useChartsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(document, 'getElementById').mockReturnValue(mockCanvas as unknown as HTMLElement)
  })

  it('returns buildCharts, updateCharts and destroyCharts', async () => {
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const composable = useChartsDashboard()

    expect(typeof composable.buildCharts).toBe('function')
    expect(typeof composable.updateCharts).toBe('function')
    expect(typeof composable.destroyCharts).toBe('function')
  })

  it('buildCharts creates four Chart instances', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')

    useChartsDashboard().buildCharts(SAMPLE_DATA)

    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('buildCharts queries the four canvas elements by id', async () => {
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')

    useChartsDashboard().buildCharts(SAMPLE_DATA)

    const ids = (document.getElementById as ReturnType<typeof vi.fn>).mock.calls.map((c: string[]) => c[0])
    expect(ids).toContain('chartCustoPrograma')
    expect(ids).toContain('chartComparativo')
    expect(ids).toContain('chartTemporalDash')
    expect(ids).toContain('chartTopProjetos')
  })

  it('buildCharts with empty data still creates charts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')

    useChartsDashboard().buildCharts([])

    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('destroyCharts calls destroy on all active chart instances', async () => {
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { buildCharts, destroyCharts } = useChartsDashboard()

    buildCharts(SAMPLE_DATA)
    const instance = vi.mocked(await import('chart.js')).Chart.mock.results[0].value
    vi.clearAllMocks()

    destroyCharts()

    expect(instance.destroy).toHaveBeenCalled()
  })

  it('buildCharts calls destroyAll before creating new charts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { buildCharts } = useChartsDashboard()

    buildCharts(SAMPLE_DATA)
    const firstInstance = vi.mocked(Chart).mock.results[0].value
    vi.clearAllMocks()

    buildCharts(SAMPLE_DATA)

    expect(firstInstance.destroy).toHaveBeenCalled()
    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('updateCharts updates data on existing chart instances', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { buildCharts, updateCharts } = useChartsDashboard()

    buildCharts(SAMPLE_DATA)
    const instances = vi.mocked(Chart).mock.results.map((r) => r.value)
    vi.clearAllMocks()

    updateCharts([SAMPLE_DATA[0]])

    instances.forEach((inst) => expect(inst.update).toHaveBeenCalled())
  })

  it('updateCharts does not crash when called before buildCharts', async () => {
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { destroyCharts, updateCharts } = useChartsDashboard()

    destroyCharts()

    expect(() => updateCharts(SAMPLE_DATA)).not.toThrow()
  })

  it('buildCharts does not create chart when canvas context is null', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')

    vi.spyOn(document, 'getElementById').mockReturnValue(null)
    useChartsDashboard().buildCharts(SAMPLE_DATA)

    expect(Chart).not.toHaveBeenCalled()
  })
})