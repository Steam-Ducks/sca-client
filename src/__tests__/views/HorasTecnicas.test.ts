import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HorasTecnicas from '@/views/HorasTecnicas.vue'

describe('HorasTecnicas.vue', () => {
  it('renders the technical hours page', () => {
    const wrapper = mount(HorasTecnicas)

    expect(wrapper.find('h1').text()).toBe('Horas Técnicas')
    expect(wrapper.find('.page-content').exists()).toBe(true)
  })

  it('displays development message', () => {
    const wrapper = mount(HorasTecnicas)

    expect(wrapper.text()).toContain('Horas Técnicas')
    expect(wrapper.text()).toContain('desenvolvimento')
  })
})