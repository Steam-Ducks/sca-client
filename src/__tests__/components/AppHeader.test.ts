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

// ── usePermissions mock ───────────────────────────────────────────────────────
const mockUsePermissions = vi.fn()

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: (...args: unknown[]) => mockUsePermissions(...args),
}))

function buildPerms(perfil: string) {
  return {
    userProfile: ref<string | null>(perfil),
    isSuperAdmin: ref(perfil === 'super_admin'),
    isFinanceiro: ref(perfil === 'financeiro'),
    isCompras: ref(perfil === 'compras'),
    isAlmoxarifado: ref(perfil === 'almoxarifado'),
    isProjetos: ref(perfil === 'projetos'),
    canSeeCosts: ref(['super_admin', 'financeiro'].includes(perfil)),
    isMaterialsLimitedProfile: ref(['compras', 'almoxarifado', 'projetos'].includes(perfil)),
    canAccessDashboard: ref(['super_admin', 'financeiro', 'projetos'].includes(perfil)),
    canAccessHoras: ref(['super_admin', 'financeiro', 'projetos'].includes(perfil)),
    canAccessConsolidado: ref(['super_admin', 'financeiro', 'projetos'].includes(perfil)),
    canAccessOrcamento: ref(['super_admin', 'financeiro'].includes(perfil)),
  }
}

function setPermProfile(perfil: string) {
  mockUsePermissions.mockReturnValue(buildPerms(perfil))
}

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
    mockUsePermissions.mockReturnValue(buildPerms('super_admin'))
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
    mockUsePermissions.mockReturnValue(buildPerms('super_admin'))
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

// ── Menu visibility per profile ───────────────────────────────────────────────
describe('AppHeader - visibilidade do menu por perfil', () => {
  function mountHeader() {
    return mount(AppHeader, { global: { plugins: [router] } })
  }

  beforeEach(() => {
    setPermProfile('super_admin')
  })

  it('super_admin vê todos os 6 itens de navegação', async () => {
    setPermProfile('super_admin')
    const wrapper = mountHeader()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/materiais"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/auditoria"]').exists()).toBe(true)
  })

  it('financeiro vê todos os 6 itens de navegação', async () => {
    setPermProfile('financeiro')
    const wrapper = mountHeader()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(true)
  })

  it('projetos não vê Orçamento', async () => {
    setPermProfile('projetos')
    const wrapper = mountHeader()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/auditoria"]').exists()).toBe(true)
  })

  it('compras não vê Dashboard, Horas, Consolidado nem Orçamento', async () => {
    setPermProfile('compras')
    const wrapper = mountHeader()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/materiais"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/auditoria"]').exists()).toBe(true)
  })

  it('almoxarifado não vê Dashboard, Horas, Consolidado nem Orçamento', async () => {
    setPermProfile('almoxarifado')
    const wrapper = mountHeader()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/materiais"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/auditoria"]').exists()).toBe(true)
  })
})
