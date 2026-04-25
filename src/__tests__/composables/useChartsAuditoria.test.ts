// src/__tests__/composables/useChartsAuditoria.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuditoriaRow } from '@/composables/useChartsAuditoria'

// ── Mock Chart.js ─────────────────────────────────────────────────────────────
const mockChartInstance = {
  destroy: vi.fn(),
  update: vi.fn(),
  data: {
    labels: [] as unknown[],
    datasets: [
      { data: [] as unknown[], backgroundColor: [] as unknown[] },
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
const SAMPLE_DATA: AuditoriaRow[] = [
  { id: 1, tipo: 'Financeiro', descricao: 'Desc A', projeto: 'Proj A', programa: 'Prog A', responsavel: 'Ana', dataRegistro: '2024-01-10', dataRevisao: '2024-01-20', status: 'Aprovado',   valorImpacto: 5000,  observacao: '' },
  { id: 2, tipo: 'Operacional', descricao: 'Desc B', projeto: 'Proj B', programa: 'Prog B', responsavel: 'Bob', dataRegistro: '2024-02-15', dataRevisao: '2024-02-25', status: 'Pendente',   valorImpacto: 3000,  observacao: '' },
  { id: 3, tipo: 'Financeiro', descricao: 'Desc C', projeto: 'Proj C', programa: 'Prog A', responsavel: 'Ana', dataRegistro: '2024-01-20', dataRevisao: '2024-02-01', status: 'Rejeitado',  valorImpacto: 1500,  observacao: '' },
  { id: 4, tipo: 'Compliance', descricao: 'Desc D', projeto: 'Proj D', programa: 'Prog C', responsavel: 'Carlos', dataRegistro: '2024-03-05', dataRevisao: '2024-03-15', status: 'Em Análise', valorImpacto: 8000, observacao: '' },
]

describe('useChartsAuditoria', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(document, 'getElementById').mockReturnValue(mockCanvas as unknown as HTMLElement)
  })

  it('returns buildCharts, updateCharts and destroyCharts', async () => {
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const composable = useChartsAuditoria()

    expect(typeof composable.buildCharts).toBe('function')
    expect(typeof composable.updateCharts).toBe('function')
    expect(typeof composable.destroyCharts).toBe('function')
  })

  it('buildCharts creates four Chart instances', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { buildCharts } = useChartsAuditoria()

    buildCharts(SAMPLE_DATA)

    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('buildCharts queries the four canvas elements by id', async () => {
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { buildCharts } = useChartsAuditoria()

    buildCharts(SAMPLE_DATA)

    const ids = (document.getElementById as ReturnType<typeof vi.fn>).mock.calls.map((c: string[]) => c[0])
    expect(ids).toContain('chartStatusPeriodo')
    expect(ids).toContain('chartPorTipo')
    expect(ids).toContain('chartPorResponsavel')
    expect(ids).toContain('chartTemporalAud')
  })

  it('buildCharts with empty data still creates charts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { buildCharts } = useChartsAuditoria()

    buildCharts([])

    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('destroyCharts calls destroy on all active chart instances', async () => {
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { buildCharts, destroyCharts } = useChartsAuditoria()

    buildCharts(SAMPLE_DATA)
    vi.clearAllMocks()
    destroyCharts()

    expect(mockChartInstance.destroy).toHaveBeenCalled()
  })

  it('buildCharts calls destroyAll before creating new charts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { buildCharts } = useChartsAuditoria()

    buildCharts(SAMPLE_DATA)
    vi.clearAllMocks()
    buildCharts(SAMPLE_DATA)

    expect(mockChartInstance.destroy).toHaveBeenCalled()
    expect(Chart).toHaveBeenCalledTimes(4)
  })

  it('updateCharts updates data on existing chart instances', async () => {
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { buildCharts, updateCharts } = useChartsAuditoria()

    buildCharts(SAMPLE_DATA)
    vi.clearAllMocks()

    updateCharts([SAMPLE_DATA[0]])

    expect(mockChartInstance.update).toHaveBeenCalled()
  })

  it('updateCharts does not crash when called before buildCharts', async () => {
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { destroyCharts, updateCharts } = useChartsAuditoria()

    destroyCharts()

    expect(() => updateCharts(SAMPLE_DATA)).not.toThrow()
  })

  it('buildCharts does not create chart when canvas context is null', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { buildCharts } = useChartsAuditoria()

    vi.spyOn(document, 'getElementById').mockReturnValue(null)

    buildCharts(SAMPLE_DATA)

    expect(Chart).not.toHaveBeenCalled()
  })

  it('buildCharts groups data by status correctly', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { buildCharts } = useChartsAuditoria()

    buildCharts(SAMPLE_DATA)

    // chartStatusPeriodo is the first chart call — labels should contain statuses
    const firstCallArgs = (Chart as ReturnType<typeof vi.fn>).mock.calls[0]
    const labels = firstCallArgs[1].data.labels as string[]
    expect(labels).toContain('Aprovado')
    expect(labels).toContain('Pendente')
    expect(labels).toContain('Rejeitado')
    expect(labels).toContain('Em Análise')
  })

  it('buildCharts groups data by tipo correctly', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsAuditoria } = await import('@/composables/useChartsAuditoria')
    const { buildCharts } = useChartsAuditoria()

    buildCharts(SAMPLE_DATA)

    // chartPorTipo is the second chart call
    const secondCallArgs = (Chart as ReturnType<typeof vi.fn>).mock.calls[1]
    const labels = secondCallArgs[1].data.labels as string[]
    expect(labels).toContain('Financeiro')
    expect(labels).toContain('Operacional')
    expect(labels).toContain('Compliance')
  })
})