import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
  ],
})

describe('App.vue', () => {
  it('renders the app shell with header and router view', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('.app-shell').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'AppHeader' }).exists()).toBe(true)
    expect(wrapper.find('.page-container').exists()).toBe(true)
  })
})