import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import NavMenu from '@/components/NavMenu.vue'

const mockUsePermissions = vi.fn()

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: (...args: unknown[]) => mockUsePermissions(...args),
}))

function buildPerms(perfil: string) {
  return {
    canAccessDashboard: ref(['super_admin', 'financeiro', 'projetos'].includes(perfil)),
    canAccessHoras: ref(['super_admin', 'financeiro', 'projetos'].includes(perfil)),
    canAccessConsolidado: ref(['super_admin', 'financeiro', 'projetos'].includes(perfil)),
    canAccessOrcamento: ref(['super_admin', 'financeiro'].includes(perfil)),
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
})

function mountMenu(perfil: string) {
  mockUsePermissions.mockReturnValue(buildPerms(perfil))
  return mount(NavMenu, { global: { plugins: [router] } })
}

beforeEach(() => {
  mockUsePermissions.mockReset()
})

describe('NavMenu — links sempre visíveis', () => {
  it.each(['super_admin', 'financeiro', 'projetos', 'compras', 'almoxarifado'])(
    'Materiais está visível para %s',
    async (perfil) => {
      const wrapper = mountMenu(perfil)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.nav-tab[href="/materiais"]').exists()).toBe(true)
    },
  )

  it.each(['super_admin', 'financeiro', 'projetos', 'compras', 'almoxarifado'])(
    'Auditoria está visível para %s',
    async (perfil) => {
      const wrapper = mountMenu(perfil)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.nav-tab[href="/auditoria"]').exists()).toBe(true)
    },
  )
})

describe('NavMenu — super_admin', () => {
  it('vê todos os 6 links de navegação', async () => {
    const wrapper = mountMenu('super_admin')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/materiais"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/auditoria"]').exists()).toBe(true)
  })
})

describe('NavMenu — financeiro', () => {
  it('vê todos os 6 links de navegação', async () => {
    const wrapper = mountMenu('financeiro')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(true)
  })
})

describe('NavMenu — projetos', () => {
  it('não vê Orçamento', async () => {
    const wrapper = mountMenu('projetos')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(true)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(false)
  })
})

describe('NavMenu — compras', () => {
  it('não vê Dashboard, Horas, Consolidado, Orçamento', async () => {
    const wrapper = mountMenu('compras')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(false)
  })
})

describe('NavMenu — almoxarifado', () => {
  it('não vê Dashboard, Horas, Consolidado, Orçamento', async () => {
    const wrapper = mountMenu('almoxarifado')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.nav-tab[href="/dashboard"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/horas"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/consolidado"]').exists()).toBe(false)
    expect(wrapper.find('.nav-tab[href="/orcamento"]').exists()).toBe(false)
  })
})
