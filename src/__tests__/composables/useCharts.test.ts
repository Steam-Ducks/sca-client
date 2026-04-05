import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Chart } from 'chart.js'
import { useCharts } from '@/composables/useCharts'

// Mock Chart.js
vi.mock('chart.js', () => {
  const ChartMock = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
  }))

  Object.assign(ChartMock, {
    register: vi.fn(),
  })

  return {
    Chart: ChartMock,
    BarController: vi.fn(),
    LineController: vi.fn(),
    BarElement: vi.fn(),
    LineElement: vi.fn(),
    PointElement: vi.fn(),
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    Tooltip: vi.fn(),
    Filler: vi.fn(),
  }
})

describe('useCharts', () => {
  let useChartsInstance: ReturnType<typeof useCharts>

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
    useChartsInstance = useCharts()
  })

  it('should initialize charts composable', () => {
    expect(useChartsInstance).toBeDefined()
    expect(typeof useChartsInstance.buildCharts).toBe('function')
  })

  it('should build charts with data', () => {
    // Create canvas elements
    const canvas1 = document.createElement('canvas')
    canvas1.id = 'chartCusto'
    document.body.appendChild(canvas1)

    const canvas2 = document.createElement('canvas')
    canvas2.id = 'chartQtd'
    document.body.appendChild(canvas2)

    const canvas3 = document.createElement('canvas')
    canvas3.id = 'chartProjeto'
    document.body.appendChild(canvas3)

    const canvas4 = document.createElement('canvas')
    canvas4.id = 'chartTemporal'
    document.body.appendChild(canvas4)

    const mockData = [
      {
        id: 1,
        material: 'Test Material',
        projeto: 'Test Project',
        programa: 'Test Program',
        quantidade: 10,
        valorUnitario: 1000,
        valorTotal: 10000,
        periodo: '2024-01',
        fornecedor: 'Test Supplier',
        categoria: 'Hardware' as const,
        status: 'Ativo' as const,
        area: 'TI',
      },
    ]

    useChartsInstance.buildCharts(mockData)

    // Chart constructor should have been called
    expect(vi.mocked(Chart)).toHaveBeenCalled()
  })

  it('should handle empty data', () => {
    // Create canvas elements
    const canvas1 = document.createElement('canvas')
    canvas1.id = 'chartCusto'
    document.body.appendChild(canvas1)

    const canvas2 = document.createElement('canvas')
    canvas2.id = 'chartQtd'
    document.body.appendChild(canvas2)

    const canvas3 = document.createElement('canvas')
    canvas3.id = 'chartProjeto'
    document.body.appendChild(canvas3)

    const canvas4 = document.createElement('canvas')
    canvas4.id = 'chartTemporal'
    document.body.appendChild(canvas4)

    useChartsInstance.buildCharts([])

    // Chart constructor should have been called even with empty data
    expect(vi.mocked(Chart)).toHaveBeenCalled()
  })

  it('should handle missing canvas elements gracefully', () => {
    const mockData = [
      {
        id: 1,
        material: 'Test Material',
        projeto: 'Test Project',
        programa: 'Test Program',
        quantidade: 10,
        valorUnitario: 1000,
        valorTotal: 10000,
        periodo: '2024-01',
        fornecedor: 'Test Supplier',
        categoria: 'Hardware' as const,
        status: 'Ativo' as const,
        area: 'TI',
      },
    ]

    // Should not throw error when canvas elements don't exist
    expect(() => useChartsInstance.buildCharts(mockData)).not.toThrow()
  })
})
