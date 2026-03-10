import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from '@/components/BaseCard.vue'

describe('BaseCard.vue', () => {
  it('renders the card with title and description', () => {
    const wrapper = mount(BaseCard, {
      props: {
        title: 'Test Title',
        description: 'Test Description',
      },
    })

    expect(wrapper.find('.card').exists()).toBe(true)
    expect(wrapper.find('h3').text()).toBe('Test Title')
    expect(wrapper.find('p').text()).toBe('Test Description')
  })
})