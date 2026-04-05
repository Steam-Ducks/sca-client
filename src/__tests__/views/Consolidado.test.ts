import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Consolidado from '@/views/Consolidado.vue'

// Mock useChartsConsolidado composable
vi.mock('@/composables/useChartsConsolidado', () => ({
  useChartsConsolidado: vi.fn(() => ({
    buildCharts: vi.fn(),
    updateCharts: vi.fn(),
    destroyCharts: vi.fn(),
  })),
}))

// Mock Chart.js to prevent canvas errors
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
  })),
  registerables: [],
}))

describe('Consolidado.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const getVm = (wrapper: ReturnType<typeof mount>) =>
    wrapper.vm as unknown as {
      filters: { periodo: string; programa: string; projeto: string; status: string }
      sortKey: string
      page: number
    }

  it('renders the consolidado page with metrics', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()
    await nextTick()

    expect(wrapper.find('.metrics').exists()).toBe(true)
    const metricCards = wrapper.findAll('.metric-card')
    expect(metricCards.length).toBe(4)
  })

  it('displays correct metric labels', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()

    expect(wrapper.text()).toContain('Custo Total Consolidado')
    expect(wrapper.text()).toContain('Custo Materiais')
    expect(wrapper.text()).toContain('Custo Horas Técnicas')
    expect(wrapper.text()).toContain('Total de Projetos')
  })

  it('displays filters card with correct options', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()

    expect(wrapper.find('.filters-card').exists()).toBe(true)
    expect(wrapper.find('.filters-title').text()).toContain('Filtros')

    const selects = wrapper.findAll('select')
    expect(selects.length).toBe(4)
  })

  it('renders the data table with correct headers', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()

    expect(wrapper.find('.table-card').exists()).toBe(true)
    expect(wrapper.find('.table-header h2').text()).toBe('Tabela Consolidada por Projeto')

    const headers = wrapper.findAll('th')
    expect(headers.length).toBe(9)
  })

  it('displays pagination controls', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()

    const pagination = wrapper.find('.pagination')
    expect(pagination.exists()).toBe(true)
  })

  it('shows charts section', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()

    const charts = wrapper.findAll('.chart-card')
    expect(charts.length).toBe(4)
  })

  it('displays status badges in table', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()
    await nextTick()

    const badges = wrapper.findAll('.badge')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('CT01: filters data by period', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()
    await nextTick()

    const selects = wrapper.findAll('select')
    if (selects.length > 0) {
      await selects[0].setValue('2024-01')
      expect(getVm(wrapper).filters.periodo).toBe('2024-01')
    }
  })

  it('CT02: filters data by program', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()
    await nextTick()

    const selects = wrapper.findAll('select')
    if (selects.length > 1) {
      await selects[1].setValue('Cloud')
      expect(getVm(wrapper).filters.programa).toBe('Cloud')
    }
  })

  it('CT03: filters data by status', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()
    await nextTick()

    const selects = wrapper.findAll('select')
    if (selects.length > 3) {
      await selects[3].setValue('Concluído')
      expect(getVm(wrapper).filters.status).toBe('Concluído')
    }
  })

  it('CT04: sorts table by custoTotal column', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()

    const headers = wrapper.findAll('th.sort-col')
    const custoTotalHeader = headers.find(h => h.text().includes('Custo Total'))
    if (custoTotalHeader) {
      await custoTotalHeader.trigger('click')
      expect(getVm(wrapper).sortKey).toBe('custoTotal')
    }
  })

  it('CT05: has export button', async () => {
    const wrapper = mount(Consolidado)
    await nextTick()

    const exportBtn = wrapper.find('.export-btn')
    expect(exportBtn.exists()).toBe(true)
    expect(exportBtn.text()).toContain('Exportar')
  })
})
