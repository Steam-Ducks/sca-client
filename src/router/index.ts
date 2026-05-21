import { createRouter, createWebHistory } from "vue-router";
import { authService } from "@/services/authService";
import { logger } from "@/utils/logger";
import { trackMetric } from "@/utils/metrics";

let startTime = performance.now();

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
      meta: { public: true },
    },
    {
      path: "/materiais",
      name: "materiais",
      component: () => import("@/views/GestaoMateriais.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/views/DashboardView.vue"),
    },
    {
      path: "/horas",
      name: "horas",
      component: () => import("@/views/HorasTecnicas.vue"),
    },
    {
      path: "/consolidado",
      name: "consolidado",
      component: () => import("@/views/Consolidado.vue"),
    },
    {
      path: "/orcamento",
      name: "orcamento",
      component: () => import("@/views/OrcamentoSaudeFinanceira.vue"),
    },
    {
      path: "/auditoria",
      name: "auditoria",
      component: () => import("@/views/Auditoria.vue"),
    },
    {
      path: "/monitoramento",
      name: "monitoramento",
      component: () => import("@/views/MonitoramentoView.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  startTime = performance.now();

  if (!to.meta.public && !authService.isAuthenticated()) {
    next("/login");
    return;
  }

  if (to.path === "/login" && authService.isAuthenticated()) {
    next("/materiais");
    return;
  }

  next();
});

router.afterEach((to) => {
  const duration = performance.now() - startTime;
  const correlationId = crypto.randomUUID();

  // LOG
  logger.info("acessed the page", {
    rota: to.path,
    duration,
    correlation_id: correlationId,
  });

  // METRIC - page view
  trackMetric("page_view", 1, {
    page: to.path,
    correlation_id: correlationId,
  });

  // METRIC - response time
  trackMetric("page_load_time", duration, {
    page: to.path,
    correlation_id: correlationId,
  });
});

//Errors in the router (lazy loading / chunk error)
router.onError((error) => {
  logger.error("Router error", {
    message: error.message,
    stack: error.stack,
  });
});

export default router;
