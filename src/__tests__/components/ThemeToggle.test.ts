import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const mockToggle = vi.fn()
const mockTheme = ref<'light' | 'dark'>('light')

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({ theme: mockTheme, toggle: mockToggle }),
}))

function mountToggle() {
  return mount(ThemeToggle)
}

beforeEach(() => {
  mockToggle.mockClear()
  mockTheme.value = 'light'
})

describe('ThemeToggle', () => {
  it('renderiza o botão com classe nav-theme', () => {
    expect(mountToggle().find('.nav-theme').exists()).toBe(true)
  })

  it('exibe title "Tema escuro" quando o tema é light', () => {
    expect(mountToggle().find('.nav-theme').attributes('title')).toBe('Tema escuro')
  })

  it('exibe title "Tema claro" quando o tema é dark', async () => {
    mockTheme.value = 'dark'
    const wrapper = mountToggle()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-theme').attributes('title')).toBe('Tema claro')
  })

  it('chama toggle ao clicar no botão', async () => {
    await mountToggle().find('.nav-theme').trigger('click')
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })
})
