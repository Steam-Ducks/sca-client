import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import App from '@/App.vue'
import AppHeader from '@/components/AppHeader.vue'
import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from "@/views/DashboardView.vue";
import GestaoMateriais from "@/views/GestaoMateriais.vue";
import HorasTecnicas from "@/views/HorasTecnicas.vue";
import Consolidado from "@/views/Consolidado.vue";
import OrcamentoSaudeFinanceira from "@/views/OrcamentoSaudeFinanceira.vue";

const mockToggle = vi.fn()
const mockTheme = ref<'light' | 'dark'>('light')

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({ theme: mockTheme, toggle: mockToggle }),
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/materiais', name: 'materiais', component: GestaoMateriais },
    { path: '/horas', name: 'horas', component: HorasTecnicas },
    { path: '/consolidado', name: 'consolidado', component: Consolidado },
    { path: '/orcamento', name: 'orcamento', component: OrcamentoSaudeFinanceira },
  ],
});

describe("App.vue", () => {
  it("renders the app shell with header and router view", async () => {
    router.push("/");
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find('.app-shell').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'AppHeader' }).exists()).toBe(true)
    expect(wrapper.find('.page-container').exists()).toBe(true)
  })
})

describe('AppHeader - theme toggle button', () => {
  beforeEach(() => {
    mockToggle.mockClear()
    mockTheme.value = 'light'
  })

  function mountHeader() {
    return mount(AppHeader, { global: { plugins: [router] } })
  }

  it('renders the theme toggle button', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.nav-theme').exists()).toBe(true)
  })

  it('shows moon icon (title "Tema escuro") when theme is light', () => {
    const wrapper = mountHeader()
    const btn = wrapper.find('.nav-theme')
    expect(btn.attributes('title')).toBe('Tema escuro')
  })

  it('shows sun icon (title "Tema claro") when theme is dark', async () => {
    mockTheme.value = 'dark'
    const wrapper = mountHeader()
    await wrapper.vm.$nextTick()
    const btn = wrapper.find('.nav-theme')
    expect(btn.attributes('title')).toBe('Tema claro')
  })

  it('calls toggle when the theme button is clicked', async () => {
    const wrapper = mountHeader()
    await wrapper.find('.nav-theme').trigger('click')
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })
})
