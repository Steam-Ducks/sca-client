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

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({ theme: ref<'light' | 'dark'>('light'), toggle: vi.fn() }),
}))

const mockUsePermissions = vi.fn()

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: (...args: unknown[]) => mockUsePermissions(...args),
}))

vi.mock('@/services/authService', () => ({
  authService: { clearSession: vi.fn(), getToken: vi.fn(), getUser: vi.fn() },
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

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/materiais', name: 'materiais', component: GestaoMateriais },
    { path: '/horas', name: 'horas', component: HorasTecnicas },
    { path: '/consolidado', name: 'consolidado', component: Consolidado },
    { path: '/orcamento', name: 'orcamento', component: OrcamentoSaudeFinanceira },
    { path: '/login', component: { template: '<div />' } },
  ],
})

beforeEach(() => {
  mockUsePermissions.mockReturnValue(buildPerms('super_admin'))
})

// ── App.vue ───────────────────────────────────────────────────────────────────

describe('App.vue', () => {
  it('renderiza o shell da aplicação com header e router view', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })

    expect(wrapper.find('.app-shell').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'AppHeader' }).exists()).toBe(true)
    expect(wrapper.find('.page-container').exists()).toBe(true)
  })
})

// ── AppHeader — integração dos sub-componentes ────────────────────────────────

describe('AppHeader — composição', () => {
  function mountHeader() {
    return mount(AppHeader, { global: { plugins: [router] } })
  }

  it('renderiza o logo com link para /dashboard', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('a.nav-logo[href="/dashboard"]').exists()).toBe(true)
  })

  it('renderiza o NavMenu', () => {
    const wrapper = mountHeader()
    expect(wrapper.findComponent({ name: 'NavMenu' }).exists()).toBe(true)
  })

  it('renderiza o ThemeToggle', () => {
    const wrapper = mountHeader()
    expect(wrapper.findComponent({ name: 'ThemeToggle' }).exists()).toBe(true)
  })

  it('renderiza o UserMenu', () => {
    const wrapper = mountHeader()
    expect(wrapper.findComponent({ name: 'UserMenu' }).exists()).toBe(true)
  })
})
