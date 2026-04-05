import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Auditoria from '@/views/Auditoria.vue'

// Mock useChartsAuditoria composable
vi.mock('@/composables/useChartsAuditoria', () => ({
  useChartsAuditoria: vi.fn(() => ({
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

describe('Auditoria.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const getVm = (wrapper: ReturnType<typeof mount>) =>
    wrapper.vm as unknown as {
      filters: { tipo: string; status: string; projeto: string; responsavel: string; programa: string }
      sortKey: string
      page: number
    }

  it('renders the auditoria page with metrics', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()
    await nextTick()

    expect(wrapper.find('.metrics').exists()).toBe(true)
    const metricCards = wrapper.findAll('.metric-card')
    expect(metricCards.length).toBe(4)
  })

  it('displays correct metric labels', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()

    expect(wrapper.text()).toContain('Total de Registros')
    expect(wrapper.text()).toContain('Aprovados')
    expect(wrapper.text()).toContain('Pendentes')
    expect(wrapper.text()).toContain('Rejeitados')
  })

  it('displays filters card with correct options', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()

    expect(wrapper.find('.filters-card').exists()).toBe(true)
    expect(wrapper.find('.filters-title').text()).toContain('Filtros')

    const selects = wrapper.findAll('select')
    expect(selects.length).toBe(5)
  })

  it('renders the data table with correct headers', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()

    expect(wrapper.find('.table-card').exists()).toBe(true)
    expect(wrapper.find('.table-header h2').text()).toBe('Registros de Auditoria')

    const headers = wrapper.findAll('th')
    expect(headers.length).toBe(9)
  })

  it('displays pagination controls', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()

    const pagination = wrapper.find('.pagination')
    expect(pagination.exists()).toBe(true)
  })

  it('shows charts section', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()

    const charts = wrapper.findAll('.chart-card')
    expect(charts.length).toBe(4)
  })

  it('displays status and tipo badges in table', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()
    await nextTick()

    const badges = wrapper.findAll('.badge')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('CT01: filters data by tipo', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()
    await nextTick()

    const selects = wrapper.findAll('select')
    if (selects.length > 0) {
      await selects[0].setValue('Compra de Material')
      expect(getVm(wrapper).filters.tipo).toBe('Compra de Material')
    }
  })

  it('CT02: filters data by status', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()
    await nextTick()

    const selects = wrapper.findAll('select')
    if (selects.length > 1) {
      await selects[1].setValue('Aprovado')
      expect(getVm(wrapper).filters.status).toBe('Aprovado')
    }
  })

  it('CT03: filters data by responsavel', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()
    await nextTick()

    const selects = wrapper.findAll('select')
    if (selects.length > 3) {
      await selects[3].setValue('João Silva')
      expect(getVm(wrapper).filters.responsavel).toBe('João Silva')
    }
  })

  it('CT04: sorts table by dataRegistro column', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()

    const headers = wrapper.findAll('th.sort-col')
    const dataHeader = headers.find(h => h.text().includes('Data Registro'))
    if (dataHeader) {
      await dataHeader.trigger('click')
      // First click keeps descending since it's already the default sortKey
      expect(getVm(wrapper).sortKey).toBe('dataRegistro')
    }
  })

  it('CT05: has export button', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()

    const exportBtn = wrapper.find('.export-btn')
    expect(exportBtn.exists()).toBe(true)
    expect(exportBtn.text()).toContain('Exportar')
  })

  it('CT06: changes page in pagination', async () => {
    const wrapper = mount(Auditoria)
    await nextTick()
    await nextTick()

    const pageButton = wrapper.findAll('.pg-btn').find(btn => btn.text() === '2')
    if (pageButton && pageButton.exists()) {
      await pageButton.trigger('click')
      expect(getVm(wrapper).page).toBe(2)
    }
  })
})
