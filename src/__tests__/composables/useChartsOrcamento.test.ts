// src/__tests__/composables/useChartsOrcamento.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BudgetProjectRow, BudgetHealthStatus } from '@/types/api'

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
    options: {
      scales: {
        y: { max: 100 },
      },
    },
  }))
  MockChart.register = vi.fn()
  return { Chart: MockChart, registerables: [] }
})

// ── Mock canvas DOM ───────────────────────────────────────────────────────────
const mockCtx = {}
const mockCanvas = { getContext: vi.fn().mockReturnValue(mockCtx) }

// ── Helper para montar uma linha de projeto ───────────────────────────────────
function makeRow(
  projeto: string,
  budget: number,
  custoReal: number,
  saude: BudgetHealthStatus,
): BudgetProjectRow {
  const desvioPercent = budget > 0 ? ((custoReal - budget) / budget) * 100 : 0
  return { projeto, budget, custoReal, desvioPercent, saude }
}

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_DATA: BudgetProjectRow[] = [
  makeRow('Projeto Alpha', 500_000, 520_000, 'Atenção'),
  makeRow('Projeto Beta',  300_000, 280_000, 'Saudável'),
  makeRow('Projeto Gamma', 800_000, 960_000, 'Crítico'),
  makeRow('Projeto Delta', 450_000, 455_000, 'Saudável'),
]

describe('useChartsOrcamento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(document, 'getElementById').mockReturnValue(mockCanvas as unknown as HTMLElement)
  })

  // ── Contrato da API pública ───────────────────────────────────────────────
  it('returns buildChartsOrcamento, updateChartsOrcamento and destroyChartsOrcamento', async () => {
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')
    const composable = useChartsOrcamento()

    expect(typeof composable.buildChartsOrcamento).toBe('function')
    expect(typeof composable.updateChartsOrcamento).toBe('function')
    expect(typeof composable.destroyChartsOrcamento).toBe('function')
  })

  // ── buildChartsOrcamento: criação dos charts ──────────────────────────────
  it('buildChartsOrcamento creates three Chart instances', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    expect(Chart).toHaveBeenCalledTimes(3)
  })

  it('buildChartsOrcamento queries the three canvas elements by id', async () => {
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const ids = (document.getElementById as ReturnType<typeof vi.fn>).mock.calls.map((c: string[]) => c[0])
    expect(ids).toContain('chartBudgetVsCusto')
    expect(ids).toContain('chartDesvioPercentual')
    expect(ids).toContain('chartDistribuicao')
  })

  it('buildChartsOrcamento with empty data still creates charts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento([], [])

    expect(Chart).toHaveBeenCalledTimes(3)
  })

  // ── destroyChartsOrcamento ────────────────────────────────────────────────
  it('destroyChartsOrcamento calls destroy on all active chart instances', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')
    const { buildChartsOrcamento, destroyChartsOrcamento } = useChartsOrcamento()

    buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)
    const instances = vi.mocked(Chart).mock.results.map((r) => r.value)
    vi.clearAllMocks()

    destroyChartsOrcamento()

    instances.forEach((inst) => expect(inst.destroy).toHaveBeenCalled())
  })

  it('buildChartsOrcamento destroys previous charts before creating new ones', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')
    const { buildChartsOrcamento } = useChartsOrcamento()

    buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)
    const firstInstances = vi.mocked(Chart).mock.results.map((r) => r.value)
    vi.clearAllMocks()

    buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    firstInstances.forEach((inst) => expect(inst.destroy).toHaveBeenCalled())
    expect(Chart).toHaveBeenCalledTimes(3)
  })

  // ── updateChartsOrcamento ─────────────────────────────────────────────────
  it('updateChartsOrcamento updates data on all existing chart instances', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')
    const { buildChartsOrcamento, updateChartsOrcamento } = useChartsOrcamento()

    buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)
    const instances = vi.mocked(Chart).mock.results.map((r) => r.value)
    vi.clearAllMocks()

    updateChartsOrcamento([SAMPLE_DATA[0]], SAMPLE_DATA)

    instances.forEach((inst) => expect(inst.update).toHaveBeenCalled())
  })

  it('updateChartsOrcamento does not crash when called before buildChartsOrcamento', async () => {
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')
    const { destroyChartsOrcamento, updateChartsOrcamento } = useChartsOrcamento()

    destroyChartsOrcamento()

    expect(() => updateChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)).not.toThrow()
  })

  // ── canvas ausente ────────────────────────────────────────────────────────
  it('buildChartsOrcamento does not create charts when canvas context is null', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    vi.spyOn(document, 'getElementById').mockReturnValue(null)
    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    expect(Chart).not.toHaveBeenCalled()
  })

  // ── chartBudgetVsCusto (índice 0) ─────────────────────────────────────────
  it('chartBudgetVsCusto is a bar chart with two datasets', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const [_el, config] = vi.mocked(Chart).mock.calls[0]
    expect(config.type).toBe('bar')
    expect(config.data.datasets).toHaveLength(2)
  })

  it('chartBudgetVsCusto labels match the paged project names', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const labels = vi.mocked(Chart).mock.calls[0][1].data.labels as string[]
    expect(labels).toEqual(SAMPLE_DATA.map((p) => p.projeto))
  })

  it('chartBudgetVsCusto first dataset contains budget values', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const dataset0 = vi.mocked(Chart).mock.calls[0][1].data.datasets[0]
    expect(dataset0.data).toEqual(SAMPLE_DATA.map((p) => p.budget))
  })

  it('chartBudgetVsCusto second dataset contains real cost values', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const dataset1 = vi.mocked(Chart).mock.calls[0][1].data.datasets[1]
    expect(dataset1.data).toEqual(SAMPLE_DATA.map((p) => p.custoReal))
  })

  // ── chartDesvioPercentual (índice 1) ──────────────────────────────────────
  it('chartDesvioPercentual is a bar chart with a single dataset', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const config = vi.mocked(Chart).mock.calls[1][1]
    expect(config.type).toBe('bar')
    expect(config.data.datasets).toHaveLength(1)
  })

  it('chartDesvioPercentual dataset contains desvioPercent values', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const dataset = vi.mocked(Chart).mock.calls[1][1].data.datasets[0]
    expect(dataset.data).toEqual(SAMPLE_DATA.map((p) => p.desvioPercent))
  })

  it('chartDesvioPercentual colors each bar according to saude status', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const bgColors = vi.mocked(Chart).mock.calls[1][1].data.datasets[0].backgroundColor as string[]
    // Atenção → laranja, Saudável → verde, Crítico → vermelho
    expect(bgColors[0]).toMatch(/245,166,35/)   // Projeto Alpha: Atenção
    expect(bgColors[1]).toMatch(/45,212,160/)    // Projeto Beta: Saudável
    expect(bgColors[2]).toMatch(/245,90,90/)     // Projeto Gamma: Crítico
    expect(bgColors[3]).toMatch(/45,212,160/)    // Projeto Delta: Saudável
  })

  // ── chartDistribuicao (índice 2) ──────────────────────────────────────────
  it('chartDistribuicao is a doughnut chart', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const config = vi.mocked(Chart).mock.calls[2][1]
    expect(config.type).toBe('doughnut')
  })

  it('chartDistribuicao counts Saudável, Atenção and Crítico from fullData', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const [saudavel, atencao, critico] =
      vi.mocked(Chart).mock.calls[2][1].data.datasets[0].data as number[]

    // SAMPLE_DATA: 2 Saudável, 1 Atenção, 1 Crítico
    expect(saudavel).toBe(2)
    expect(atencao).toBe(1)
    expect(critico).toBe(1)
  })

  it('chartDistribuicao uses fullData (not pagedData) for counts', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    // pagedData contém só 1 projeto; fullData contém todos os 4
    const pagedData = [SAMPLE_DATA[0]] // 1 Atenção
    useChartsOrcamento().buildChartsOrcamento(pagedData, SAMPLE_DATA)

    const [saudavel, atencao, critico] =
      vi.mocked(Chart).mock.calls[2][1].data.datasets[0].data as number[]

    // Deve refletir fullData (4 projetos), não pagedData (1 projeto)
    expect(saudavel).toBe(2)
    expect(atencao).toBe(1)
    expect(critico).toBe(1)
  })

  it('chartDistribuicao labels include count for each health status', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')

    useChartsOrcamento().buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)

    const labels = vi.mocked(Chart).mock.calls[2][1].data.labels as string[]
    expect(labels.some((l) => l.startsWith('Saudável:'))).toBe(true)
    expect(labels.some((l) => l.startsWith('Atenção:'))).toBe(true)
    expect(labels.some((l) => l.startsWith('Crítico:'))).toBe(true)
  })

  // ── updateChartsOrcamento: reflecte dados paginados ───────────────────────
  it('updateChartsOrcamento reflects only paged projects in budget chart labels', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')
    const { buildChartsOrcamento, updateChartsOrcamento } = useChartsOrcamento()

    buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)
    const budgetChart = vi.mocked(Chart).mock.results[0].value

    const subset = [SAMPLE_DATA[1], SAMPLE_DATA[3]] // Beta, Delta
    updateChartsOrcamento(subset, SAMPLE_DATA)

    expect(budgetChart.data.labels).toEqual(['Projeto Beta', 'Projeto Delta'])
  })

  it('updateChartsOrcamento keeps fullData counts in distribuicao chart', async () => {
    const { Chart } = await import('chart.js')
    const { useChartsOrcamento } = await import('@/composables/useChartsOrcamento')
    const { buildChartsOrcamento, updateChartsOrcamento } = useChartsOrcamento()

    buildChartsOrcamento(SAMPLE_DATA, SAMPLE_DATA)
    const distChart = vi.mocked(Chart).mock.results[2].value

    updateChartsOrcamento([SAMPLE_DATA[0]], SAMPLE_DATA)

    // fullData ainda tem 2 Saudável, 1 Atenção, 1 Crítico
    expect(distChart.data.datasets[0].data).toEqual([2, 1, 1])
  })
})