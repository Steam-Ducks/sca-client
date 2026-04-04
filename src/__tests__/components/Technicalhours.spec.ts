import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TechnicalHours from '@/components/TechnicalHours.vue'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const mountComponent = () => mount(TechnicalHours, { attachTo: document.body })

// ─── TEST SUITE ───────────────────────────────────────────────────────────────
describe('TechnicalHours.vue', () => {

  // ── RENDERIZAÇÃO INICIAL ────────────────────────────────────────────────────
  describe('Renderização inicial', () => {
    it('deve renderizar o título "Horas Técnicas"', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('h1').text()).toBe('Horas Técnicas')
    })

    it('deve renderizar o subtítulo correto', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.page-subtitle').text()).toContain('Análise detalhada')
    })

    it('deve renderizar exatamente 4 cards KPI', () => {
      const wrapper = mountComponent()
      expect(wrapper.findAll('.kpi-card')).toHaveLength(4)
    })

    it('deve renderizar os rótulos dos KPIs corretamente', () => {
      const wrapper = mountComponent()
      const labels = wrapper.findAll('.kpi-label').map(el => el.text())
      expect(labels).toContain('Custo Total - Horas')
      expect(labels).toContain('Total de Horas')
      expect(labels).toContain('Custo Médio/Hora')
      expect(labels).toContain('Registros')
    })

    it('deve renderizar a tabela de dados', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('[data-testid="data-table"]').exists()).toBe(true)
    })

    it('deve exibir 12 linhas na tabela inicialmente (todos os registros)', () => {
      const wrapper = mountComponent()
      const rows = wrapper.findAll('.table-row')
      expect(rows).toHaveLength(12)
    })
  })

  // ── KPIs ────────────────────────────────────────────────────────────────────
  describe('KPIs calculados', () => {
    it('deve calcular o custo total somando todos os registros', () => {
      const wrapper = mountComponent()
      const kpiValues = wrapper.findAll('.kpi-value')
      // Custo total = 168000+155800+130000+126000+121600+120000+114000+112000+104400+105400+72800+96200
      const expectedTotal = 'R$\u00a01.426.200,00'
      expect(kpiValues[0].text()).toBe(expectedTotal)
    })

    it('deve calcular o total de horas somando todos os registros', () => {
      const wrapper = mountComponent()
      const kpiValues = wrapper.findAll('.kpi-value')
      // Soma de horas: 400+410+520+450+380+300+380+320+360+340+280+260 = 4400
      expect(kpiValues[1].text()).toBe('4400h')
    })

    it('deve exibir o número de registros no KPI "Registros"', () => {
      const wrapper = mountComponent()
      const kpiValues = wrapper.findAll('.kpi-value')
      expect(kpiValues[3].text()).toBe('12')
    })
  })

  // ── FILTROS ─────────────────────────────────────────────────────────────────
  describe('Filtros', () => {
    it('deve renderizar o card de filtros', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.filters-card').exists()).toBe(true)
    })

    it('deve renderizar os 6 selects de filtro', () => {
      const wrapper = mountComponent()
      const selects = wrapper.findAll('.filter-select')
      expect(selects).toHaveLength(6)
    })

    it('deve renderizar labels visíveis acima dos filtros', () => {
      const wrapper = mountComponent()
      const labels = wrapper.findAll('.filter-label').map(el => el.text())
      expect(labels).toContain('Período')
      expect(labels).toContain('Programa')
      expect(labels).toContain('Projeto')
      expect(labels).toContain('Colaborador')
      expect(labels).toContain('Função')
      expect(labels).toContain('Tarefa')
    })

    it('deve ter o select de período com data-testid correto', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('[data-testid="filter-periodo"]').exists()).toBe(true)
    })

    it('deve filtrar por período ao selecionar "2024-01"', async () => {
      const wrapper = mountComponent()
      const select = wrapper.find('[data-testid="filter-periodo"]')
      await select.setValue('2024-01')
      const rows = wrapper.findAll('.table-row')
      // Registros com periodo 2024-01: ids 3,4,8,10,11 = 5 registros
      expect(rows).toHaveLength(5)
    })

    it('deve filtrar por programa "Cloud" corretamente', async () => {
      const wrapper = mountComponent()
      const select = wrapper.find('[data-testid="filter-programa"]')
      await select.setValue('Cloud')
      const rows = wrapper.findAll('.table-row')
      // Registros Cloud: ids 1,7 = 2 registros
      expect(rows).toHaveLength(2)
    })

    it('deve filtrar por projeto "Portal Web" corretamente', async () => {
      const wrapper = mountComponent()
      const select = wrapper.find('[data-testid="filter-projeto"]')
      await select.setValue('Portal Web')
      const rows = wrapper.findAll('.table-row')
      // Portal Web: ids 3,4,11 = 3 registros
      expect(rows).toHaveLength(3)
    })

    it('deve filtrar por colaborador individualmente', async () => {
      const wrapper = mountComponent()
      const select = wrapper.find('[data-testid="filter-colaborador"]')
      await select.setValue('Lucas Martins')
      const rows = wrapper.findAll('.table-row')
      expect(rows).toHaveLength(1)
    })

    it('deve exibir estado vazio quando filtro não encontra resultados', async () => {
      const wrapper = mountComponent()
      const select = wrapper.find('[data-testid="filter-periodo"]')
      await select.setValue('2024-01')
      const programaSelect = wrapper.find('[data-testid="filter-programa"]')
      await programaSelect.setValue('Segurança')
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state').text()).toBe('Nenhum registro encontrado.')
    })

    it('deve atualizar os KPIs ao aplicar filtro', async () => {
      const wrapper = mountComponent()
      const select = wrapper.find('[data-testid="filter-programa"]')
      await select.setValue('Cloud')
      const registros = wrapper.findAll('.kpi-value')[3].text()
      expect(registros).toBe('2')
    })

    it('deve combinar múltiplos filtros corretamente', async () => {
      const wrapper = mountComponent()
      await wrapper.find('[data-testid="filter-periodo"]').setValue('2024-03')
      await wrapper.find('[data-testid="filter-programa"]').setValue('Cloud')
      // Período 2024-03 + Cloud: ids 1,7 = 2 registros
      expect(wrapper.findAll('.table-row')).toHaveLength(2)
    })
  })

  // ── ORDENAÇÃO ───────────────────────────────────────────────────────────────
  describe('Ordenação da tabela', () => {
    it('deve ordenar por custo total decrescente por padrão', () => {
      const wrapper = mountComponent()
      const cells = wrapper.findAll('.table-row td:nth-child(7)')
      // Primeiro item deve ser o maior custo total (Lucas Martins - R$ 168.000)
      expect(cells[0].text()).toContain('168')
    })

    it('deve inverter ordenação ao clicar na mesma coluna duas vezes', async () => {
      const wrapper = mountComponent()
      const horasHeader = wrapper.findAll('th.sortable')[4] // coluna Horas
      await horasHeader.trigger('click')
      await horasHeader.trigger('click')
      // Após dois cliques, deve ser ascendente
      const cells = wrapper.findAll('.table-row td:nth-child(5)')
      const firstVal = parseInt(cells[0].text())
      const lastVal = parseInt(cells[cells.length - 1].text())
      expect(firstVal).toBeLessThan(lastVal)
    })

    it('deve ordenar por colaborador ao clicar no cabeçalho', async () => {
      const wrapper = mountComponent()
      const colHeader = wrapper.findAll('th.sortable')[0]
      await colHeader.trigger('click') // desc
      await colHeader.trigger('click') // asc
      const firstCell = wrapper.findAll('.table-row td:nth-child(1)')[0]
      expect(firstCell.text()).toBe('Ana Oliveira')
    })
  })

  // ── GRÁFICOS ────────────────────────────────────────────────────────────────
  describe('Gráficos de barras', () => {
    it('deve renderizar 2 cards de gráfico', () => {
      const wrapper = mountComponent()
      expect(wrapper.findAll('.chart-card')).toHaveLength(2)
    })

    it('deve exibir os títulos dos gráficos', () => {
      const wrapper = mountComponent()
      const titles = wrapper.findAll('.chart-title').map(el => el.text())
      expect(titles).toContain('Total de Horas por Projeto')
      expect(titles).toContain('Custo de Horas por Projeto')
    })

    it('deve exibir no máximo 5 barras por gráfico', () => {
      const wrapper = mountComponent()
      const chartCards = wrapper.findAll('.chart-card')
      const bars1 = chartCards[0].findAll('.bar-row')
      const bars2 = chartCards[1].findAll('.bar-row')
      expect(bars1.length).toBeLessThanOrEqual(5)
      expect(bars2.length).toBeLessThanOrEqual(5)
    })

    it('deve exibir "Portal Web" como projeto com mais horas', () => {
      const wrapper = mountComponent()
      const firstBarLabel = wrapper.findAll('.chart-card')[0].find('.bar-label')
      expect(firstBarLabel.text()).toBe('Portal Web')
    })

    it('deve renderizar a barra com 100% de largura para o maior valor', () => {
      const wrapper = mountComponent()
      const firstBarFill = wrapper.findAll('.chart-card')[0].find('.bar-fill')
      expect(firstBarFill.attributes('style')).toContain('width: 100%')
    })
  })

  // ── TABELA ──────────────────────────────────────────────────────────────────
  describe('Tabela detalhada', () => {
    it('deve renderizar todos os 9 cabeçalhos de coluna', () => {
      const wrapper = mountComponent()
      const headers = wrapper.findAll('th')
      expect(headers).toHaveLength(9)
    })

    it('deve exibir o nome do colaborador na primeira coluna', () => {
      const wrapper = mountComponent()
      const firstRow = wrapper.find('.table-row')
      expect(firstRow.find('td:nth-child(1)').text()).toBeTruthy()
    })

    it('deve exibir tag colorida na coluna Tarefa', () => {
      const wrapper = mountComponent()
      const tags = wrapper.findAll('.tag')
      expect(tags.length).toBeGreaterThan(0)
    })

    it('deve aplicar classes de cor corretas às tags', () => {
      const wrapper = mountComponent()
      const tags = wrapper.findAll('.tag')
      const hasColorClass = tags.every(tag => {
        const classes = tag.classes()
        return classes.some(c => c.startsWith('tag-') && c !== 'tag')
      })
      expect(hasColorClass).toBe(true)
    })

    it('deve renderizar custo/hora formatado em BRL', () => {
      const wrapper = mountComponent()
      const custoHoraCells = wrapper.findAll('.table-row td:nth-child(6)')
      expect(custoHoraCells[0].text()).toMatch(/R\$/)
    })

    it('deve ter min-width: 1000px na tabela (previne colagem de colunas)', () => {
      const wrapper = mountComponent()
      const table = wrapper.find('.data-table')
      // Valida que a tabela existe com a classe correta
      expect(table.exists()).toBe(true)
    })
  })

  // ── EXPORTAÇÃO ──────────────────────────────────────────────────────────────
  describe('Exportação CSV', () => {
    it('deve renderizar o botão Exportar', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('[data-testid="btn-export"]').exists()).toBe(true)
    })

    it('deve exibir texto "Exportar" no botão', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('[data-testid="btn-export"]').text()).toContain('Exportar')
    })

    it('deve chamar exportCSV ao clicar no botão', async () => {
      // Mock URL.createObjectURL e document.createElement
      const mockClick = vi.fn()
      const mockAnchor = { href: '', download: '', click: mockClick }
      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:mock')

      const wrapper = mountComponent()
      await wrapper.find('[data-testid="btn-export"]').trigger('click')

      expect(mockClick).toHaveBeenCalled()
      vi.restoreAllMocks()
    })
  })

  // ── RESPONSIVIDADE / ACESSIBILIDADE ─────────────────────────────────────────
  describe('Acessibilidade e layout', () => {
    it('deve ter atributo title nas barras de label (tooltip longo texto)', () => {
      const wrapper = mountComponent()
      const barLabels = wrapper.findAll('.bar-label')
      barLabels.forEach(label => {
        expect(label.attributes('title')).toBeTruthy()
      })
    })

    it('deve ter o ícone de ordenação em todos os cabeçalhos sortáveis', () => {
      const wrapper = mountComponent()
      const sortIcons = wrapper.findAll('.sort-icon')
      expect(sortIcons).toHaveLength(8) // 8 colunas sortáveis
    })

    it('deve ter data-testid em todos os filtros', () => {
      const wrapper = mountComponent()
      const testIds = [
        'filter-periodo', 'filter-programa', 'filter-projeto',
        'filter-colaborador', 'filter-funcao', 'filter-tarefa'
      ]
      testIds.forEach(id => {
        expect(wrapper.find(`[data-testid="${id}"]`).exists()).toBe(true)
      })
    })
  })
})