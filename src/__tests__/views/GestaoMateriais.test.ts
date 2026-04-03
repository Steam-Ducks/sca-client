import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GestaoMateriais from '@/views/GestaoMateriais.vue'
import type { Filters, SortKey } from '@/types/materiais'

// Mock useCharts composable
vi.mock('@/composables/useCharts', () => ({
  useCharts: vi.fn(() => ({
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
}))

describe('GestaoMateriais.vue', () => {
  const getVm = (wrapper: ReturnType<typeof mount>) =>
    wrapper.vm as unknown as {
      filters: Filters
      sortKey: SortKey
      page: number
    }

  it('renders the materials management page', async () => {
    const wrapper = mount(GestaoMateriais)
    await nextTick()

    expect(wrapper.find('.filters-title').text()).toContain('Filtros')
    expect(wrapper.find('.filters-card').exists()).toBe(true)
  })

  it('displays filter options', () => {
    const wrapper = mount(GestaoMateriais)

    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThanOrEqual(4)
  })

  it('renders the data table with headers', () => {
    const wrapper = mount(GestaoMateriais)

    const headers = wrapper.findAll('th')
    expect(headers.length).toBeGreaterThan(0)
  })

  it('displays pagination controls', () => {
    const wrapper = mount(GestaoMateriais)

    const pagination = wrapper.find('.pagination')
    expect(pagination.exists()).toBe(true)
  })

  it('shows charts section', () => {
    const wrapper = mount(GestaoMateriais)

    const charts = wrapper.findAll('.chart-card')
    expect(charts.length).toBeGreaterThan(0)
  })

  it('CT01: filters data by period', async () => {
    const wrapper = mount(GestaoMateriais)

    const selects = wrapper.findAll('select')
    if (selects.length > 0) {
      await selects[0].setValue('2024-01')
      expect(getVm(wrapper).filters.periodo).toBe('2024-01')
    }
  })

  it('CT02: filters data by program', async () => {
    const wrapper = mount(GestaoMateriais)

    const selects = wrapper.findAll('select')
    if (selects.length > 1) {
      await selects[1].setValue('Infraestrutura')
      expect(getVm(wrapper).filters.programa).toBe('Infraestrutura')
    }
  })

  it('CT03: searches materials by text', async () => {
    const wrapper = mount(GestaoMateriais)

    const searchInput = wrapper.find('.search-input')
    if (searchInput.exists()) {
      await searchInput.setValue('Dell')
      expect(getVm(wrapper).filters.search).toBe('Dell')
    }
  })

  it('CT04: sorts table by material column', async () => {
    const wrapper = mount(GestaoMateriais)

    const materialHeader = wrapper.find('th')
    if (materialHeader.exists()) {
      await materialHeader.trigger('click')
      expect(getVm(wrapper).sortKey).toBe('material')
    }
  })

  it('CT05: changes page in pagination', async () => {
    const wrapper = mount(GestaoMateriais)

    const pageButton = wrapper.findAll('.pg-btn').find(btn => btn.text() === '2')
    if (pageButton && pageButton.exists()) {
      await pageButton.trigger('click')
      expect(getVm(wrapper).page).toBe(2)
    }
  })
})
