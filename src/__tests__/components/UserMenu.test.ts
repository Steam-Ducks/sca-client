import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import UserMenu from '@/components/UserMenu.vue'

vi.mock('@/services/authService', () => ({
  authService: { clearSession: vi.fn() },
}))

import { authService } from '@/services/authService'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: { template: '<div />' } },
    { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
  ],
})

function mountMenu() {
  return mount(UserMenu, { global: { plugins: [router] } })
}

beforeEach(async () => {
  vi.mocked(authService.clearSession).mockClear()
  router.push('/')
  await router.isReady()
})

describe('UserMenu', () => {
  it('exibe o label do usuário', () => {
    expect(mountMenu().find('.nav-user').text()).toContain('Administrador')
  })

  it('exibe o botão de logout', () => {
    expect(mountMenu().find('.nav-logout').exists()).toBe(true)
  })

  it('chama authService.clearSession ao clicar em Sair', async () => {
    await mountMenu().find('.nav-logout').trigger('click')
    expect(authService.clearSession).toHaveBeenCalledTimes(1)
  })

  it('navega para /login ao clicar em Sair', async () => {
    await mountMenu().find('.nav-logout').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/login')
  })
})
