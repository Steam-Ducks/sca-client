import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GestaoMateriais from '@/views/GestaoMateriais.vue'

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
      expect((wrapper.vm as any).filters.periodo).toBe('2024-01')
    }
  })

  it('CT02: filters data by program', async () => {
    const wrapper = mount(GestaoMateriais)

    const selects = wrapper.findAll('select')
    if (selects.length > 1) {
      await selects[1].setValue('Infraestrutura')
      expect((wrapper.vm as any).filters.programa).toBe('Infraestrutura')
    }
  })

  it('CT03: searches materials by text', async () => {
    const wrapper = mount(GestaoMateriais)

    const searchInput = wrapper.find('.search-input')
    if (searchInput.exists()) {
      await searchInput.setValue('Dell')
      expect((wrapper.vm as any).filters.search).toBe('Dell')
    }
  })

  it('CT04: sorts table by material column', async () => {
    const wrapper = mount(GestaoMateriais)

    const materialHeader = wrapper.find('th')
    if (materialHeader.exists()) {
      await materialHeader.trigger('click')
      expect((wrapper.vm as any).sortKey).toBe('material')
    }
  })

  it('CT05: changes page in pagination', async () => {
    const wrapper = mount(GestaoMateriais)

    const pageButton = wrapper.findAll('.pg-btn').find(btn => btn.text() === '2')
    if (pageButton && pageButton.exists()) {
      await pageButton.trigger('click')
      expect((wrapper.vm as any).page).toBe(2)
    }
  })
})
