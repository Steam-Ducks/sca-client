import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OrcamentoSaudeFinanceira from '@/views/OrcamentoSaudeFinanceira.vue'

vi.mock('chart.js', () => {
  const ChartMock = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: {
      labels: [],
      datasets: [
        { data: [], backgroundColor: [] },
        { data: [] },
      ],
    },
  }))
  Object.assign(ChartMock, { register: vi.fn() })
  return { Chart: ChartMock, registerables: [] }
})

describe('OrcamentoSaudeFinanceira.vue', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the main layout', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    expect(wrapper.find('.main').exists()).toBe(true)
  })

  it('displays all KPI metric cards', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    const text = wrapper.text()
    expect(text).toContain('Budget Total')
    expect(text).toContain('Custo Real Total')
    expect(text).toContain('Desvio % Médio')
    expect(text).toContain('Projetos Saudáveis')
    expect(text).toContain('Projetos em Atenção')
    expect(text).toContain('Projetos Críticos')
    expect(text).toContain('Projeção de Estouro')
    expect(text).toContain('Última Atualização')
  })

  it('renders the filters section with all dropdowns', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    expect(wrapper.find('[data-testid="filters-section"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-periodo"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-programa"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-projeto"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-saude"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="btn-limpar"]').exists()).toBe(true)
  })

  it('renders project health cards section', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    expect(wrapper.find('[data-testid="project-cards-section"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Saúde Financeira dos Projetos')
  })

  it('renders the analytical table with all columns', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    expect(wrapper.find('[data-testid="table-section"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="data-table"]').exists()).toBe(true)
    const text = wrapper.text()
    expect(text).toContain('Programa')
    expect(text).toContain('Projeto')
    expect(text).toContain('Budget')
    expect(text).toContain('Custo Real')
    expect(text).toContain('Desvio %')
    expect(text).toContain('Saúde')
  })

  it('shows all 8 projects initially', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    const rows = wrapper.findAll('[data-testid^="row-"]')
    expect(rows.length).toBe(8)
  })

  it('shows health badges with correct colors', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    expect(wrapper.find('.badge-green').exists()).toBe(true)
    expect(wrapper.find('.badge-amber').exists()).toBe(true)
    expect(wrapper.find('.badge-red').exists()).toBe(true)
  })

  it('filters by saude status — Saudável', async () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    await wrapper.find('[data-testid="filter-saude"]').setValue('Saudável')
    const rows = wrapper.findAll('[data-testid^="row-"]')
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach(row => {
      expect(row.find('.saude-badge').text()).toBe('Saudável')
    })
  })

  it('filters by saude status — Crítico', async () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    await wrapper.find('[data-testid="filter-saude"]').setValue('Crítico')
    const rows = wrapper.findAll('[data-testid^="row-"]')
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach(row => {
      expect(row.find('.saude-badge').text()).toBe('Crítico')
    })
  })

  it('filters by programa', async () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    await wrapper.find('[data-testid="filter-programa"]').setValue('Programa Alpha')
    const rows = wrapper.findAll('[data-testid^="row-"]')
    expect(rows.length).toBe(2)
    rows.forEach(row => {
      expect(row.text()).toContain('Programa Alpha')
    })
  })

  it('clears filters and restores all rows', async () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    await wrapper.find('[data-testid="filter-saude"]').setValue('Crítico')
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBeLessThan(8)

    await wrapper.find('[data-testid="btn-limpar"]').trigger('click')
    expect(wrapper.findAll('[data-testid^="row-"]').length).toBe(8)
  })

  it('sorts table by clicking a column header', async () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    const sortableHeaders = wrapper.findAll('.sort-col')
    const budgetHeader = sortableHeaders.find(h => h.text().includes('Budget'))
    expect(budgetHeader).toBeDefined()

    await budgetHeader!.trigger('click')
    expect(budgetHeader!.text()).toContain('↑')

    await budgetHeader!.trigger('click')
    expect(budgetHeader!.text()).toContain('↓')
  })

  it('shows no records message when filter combination matches nothing', async () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    // Programa Alpha has only Saudável (A) and Crítico (B) — no Atenção projects
    await wrapper.find('[data-testid="filter-programa"]').setValue('Programa Alpha')
    await wrapper.find('[data-testid="filter-saude"]').setValue('Atenção')
    expect(wrapper.text()).toContain('Nenhum registro encontrado.')
  })

  it('renders export button', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    expect(wrapper.find('[data-testid="btn-export"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="btn-export"]').text()).toBe('Exportar')
  })

  it('renders chart canvas elements', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    expect(wrapper.find('#chartBudgetVsCusto').exists()).toBe(true)
    expect(wrapper.find('#chartDesvioPercentual').exists()).toBe(true)
    expect(wrapper.find('#chartDistribuicao').exists()).toBe(true)
  })

  it('project cards show budget, custo real and desvio', () => {
    const wrapper = mount(OrcamentoSaudeFinanceira)
    const projectCards = wrapper.findAll('[data-testid^="project-card-"]')
    expect(projectCards.length).toBe(8)
    const firstCard = projectCards[0]
    expect(firstCard.text()).toContain('Budget:')
    expect(firstCard.text()).toContain('Custo Real:')
    expect(firstCard.text()).toContain('Desvio:')
  })
})
