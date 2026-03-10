import { describe, it, expect } from 'vitest'
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
})