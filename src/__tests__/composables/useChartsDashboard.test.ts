// src/__tests__/composables/useChartsDashboard.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardRow } from '@/composables/useChartsDashboard'

// ── Mock Chart.js ─────────────────────────────────────────────────────────────
const mockChartInstance = {
  destroy: vi.fn(),
  update: vi.fn(),
  data: {
    labels: [] as unknown[],
    datasets: [
      { data: [] as unknown[], backgroundColor: [] as unknown[] },
      { data: [] as unknown[] },
    ],
  },
}

vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => mockChartInstance),
  registerables: [],
}))

// ── Mock canvas DOM ───────────────────────────────────────────────────────────
const mockCtx = {}
const mockCanvas = { getContext: vi.fn().mockReturnValue(mockCtx) }

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_DATA: DashboardRow[] = [
  { projeto: 'Projeto A', programa: 'Alpha', custoMateriais: 100000, custoHoras: 50000, custoTotal: 150000, periodo: '2024-01' },
  { projeto: 'Projeto B', programa: 'Alpha', custoMateriais: 200000, custoHoras: 80000, custoTotal: 280000, periodo: '2024-02' },
  { projeto: 'Projeto C', programa: 'Beta',  custoMateriais: 50000,  custoHoras: 30000, custoTotal: 80000,  periodo: '2024-01' },
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
    const { buildCharts } = useChartsDashboard()

    buildCharts(SAMPLE_DATA)

    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('buildCharts queries the four canvas elements by id', async () => {
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { buildCharts } = useChartsDashboard()

    buildCharts(SAMPLE_DATA)

    const ids = (document.getElementById as ReturnType<typeof vi.fn>).mock.calls.map((c: string[]) => c[0])
    expect(ids).toContain('chartCustoPrograma')
    expect(ids).toContain('chartComparativo')
    expect(ids).toContain('chartTemporalDash')
    expect(ids).toContain('chartTopProjetos')
  })

  it('buildCharts with empty data still creates charts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { buildCharts } = useChartsDashboard()

    buildCharts([])

    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('destroyCharts calls destroy on all active chart instances', async () => {
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { buildCharts, destroyCharts } = useChartsDashboard()

    buildCharts(SAMPLE_DATA)
    vi.clearAllMocks()
    destroyCharts()

    expect(mockChartInstance.destroy).toHaveBeenCalled()
  })

  it('buildCharts calls destroyAll before creating new charts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { buildCharts } = useChartsDashboard()

    buildCharts(SAMPLE_DATA)
    vi.clearAllMocks()
    buildCharts(SAMPLE_DATA)

    // destroy was called on previously created instance
    expect(mockChartInstance.destroy).toHaveBeenCalled()
    // and 4 new ones were created
    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('updateCharts updates data on existing chart instances', async () => {
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { buildCharts, updateCharts } = useChartsDashboard()

    buildCharts(SAMPLE_DATA)
    vi.clearAllMocks()

    const newData: DashboardRow[] = [
      { projeto: 'Novo', programa: 'Gamma', custoMateriais: 999, custoHoras: 111, custoTotal: 1110, periodo: '2024-03' },
    ]
    updateCharts(newData)

    expect(mockChartInstance.update).toHaveBeenCalled()
  })

  it('updateCharts does not crash when called before buildCharts', async () => {
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { destroyCharts, updateCharts } = useChartsDashboard()

    destroyCharts() // garante estado limpo

    expect(() => updateCharts(SAMPLE_DATA)).not.toThrow()
  })

  it('buildCharts does not create chart when canvas context is null', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsDashboard } = await import('@/composables/useChartsDashboard')
    const { buildCharts } = useChartsDashboard()

    vi.spyOn(document, 'getElementById').mockReturnValue(null)

    buildCharts(SAMPLE_DATA)

    expect(Chart).not.toHaveBeenCalled()
  })
})