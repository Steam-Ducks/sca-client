import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

describe('HomeView.vue', () => {
  it('renders the home page with cards', () => {
    const wrapper = mount(HomeView)

    expect(wrapper.find('h2').text()).toBe('Home')
    expect(wrapper.text()).toContain('Projeto base em Vue 3')

    const cards = wrapper.findAllComponents({ name: 'BaseCard' })
    expect(cards.length).toBe(3)
    expect(cards[0].props().title).toBe('Componentização')
    expect(cards[1].props().title).toBe('Rotas')
    expect(cards[2].props().title).toBe('Escalabilidade')
  })
})