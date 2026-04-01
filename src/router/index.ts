import { createRouter, createWebHistory } from 'vue-router'
import { logger } from '@/utils/logger'
import { trackMetric } from '@/utils/metrics'

let startTime = performance.now()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/technical-hours',        // ← adicionar isso
      name: 'technical-hours',
      component: () => import('@/views/TechnicalHoursView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  startTime = performance.now()
  next()
})

router.afterEach((to) => {
  const duration = performance.now() - startTime
  const correlationId = crypto.randomUUID()

  // LOG
  logger.info('acessed the page', {
    rota: to.path,
    duration,
    correlation_id: correlationId,
  })

  // METRIC - page view
  trackMetric('page_view', 1, {
    page: to.path,
    correlation_id: correlationId,
  })

  // METRIC - response time
  trackMetric('page_load_time', duration, {
    page: to.path,
    correlation_id: correlationId,
  })
})

 //Errors in the router (lazy loading / chunk error)
router.onError((error) => {
  logger.error('Router error', {
    message: error.message,
    stack: error.stack,
  })
})

export default router