import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutView from '@/views/AboutView.vue'

describe('AboutView.vue', () => {
  it('renders the about page with list', () => {
    const wrapper = mount(AboutView)

    expect(wrapper.find('h2').text()).toBe('Sobre')
    expect(wrapper.text()).toContain('Esta página existe')

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(4)
    expect(listItems[0].text()).toBe('Vue 3 com Composition API')
    expect(listItems[1].text()).toBe('TypeScript')
    expect(listItems[2].text()).toBe('Vue Router')
    expect(listItems[3].text()).toBe('Vite')
  })
})