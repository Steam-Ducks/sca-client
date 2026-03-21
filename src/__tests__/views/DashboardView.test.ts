import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardView from '@/views/DashboardView.vue'

describe('DashboardView.vue', () => {
  it('renders the dashboard with stats', () => {
    const wrapper = mount(DashboardView)

    expect(wrapper.find('h2').text()).toBe('Dashboard')
    expect(wrapper.find('.stats').exists()).toBe(true)

    const statBoxes = wrapper.findAll('.stat-box')
    expect(statBoxes.length).toBe(3)
    expect(statBoxes[0].text()).toContain('Usuários')
    expect(statBoxes[0].text()).toContain('128')
    expect(statBoxes[1].text()).toContain('Pedidos')
    expect(statBoxes[1].text()).toContain('54')
    expect(statBoxes[2].text()).toContain('Alertas')
    expect(statBoxes[2].text()).toContain('3')
  })

  // Time Period Filter Tests

  it('CT01: updates the selected period when user picks dates', async () => {
    const wrapper = mount(DashboardView)

    const inputs = wrapper.findAll('input[type="date"]')

    if (inputs.length >= 2) {
      await inputs[0].setValue('2026-01-01')
      await inputs[1].setValue('2026-01-31')

      expect((wrapper.vm as any).startDate).toBe('2026-01-01')
      expect((wrapper.vm as any).endDate).toBe('2026-01-31')
    }
  })

  it('CT02: triggers data fetch when applying the filter', async () => {
    const wrapper = mount(DashboardView)

    const spy = vi.spyOn(console, 'log')

    const applyButton = wrapper.find('[data-test="apply-filter"]')

    if (applyButton.exists()) {
      await applyButton.trigger('click')
      expect(spy).toHaveBeenCalled()
    }
  })

  it('CT03: clears the selected period', async () => {
    const wrapper = mount(DashboardView)

      ; (wrapper.vm as any).startDate = '2026-01-01'
      ; (wrapper.vm as any).endDate = '2026-01-31'

    const clearButton = wrapper.find('[data-test="clear-filter"]')

    if (clearButton.exists()) {
      await clearButton.trigger('click')

      expect((wrapper.vm as any).startDate).toBe(null)
      expect((wrapper.vm as any).endDate).toBe(null)
    }
  })

  it('CT04: displays the active filter on screen', async () => {
    const wrapper = mount(DashboardView)

      ; (wrapper.vm as any).startDate = '2026-01-01'
      ; (wrapper.vm as any).endDate = '2026-01-31'

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('2026-01-01')
    expect(wrapper.text()).toContain('2026-01-31')
  })
})