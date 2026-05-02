import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import App from "@/App.vue";
import { createRouter, createWebHistory } from "vue-router";

import HomeView from "@/views/HomeView.vue";
import DashboardView from "@/views/DashboardView.vue";
import AboutView from "@/views/AboutView.vue";
import GestaoMateriais from "@/views/GestaoMateriais.vue";
import HorasTecnicas from "@/views/HorasTecnicas.vue";
import Consolidado from "@/views/Consolidado.vue";
import OrcamentoSaudeFinanceira from "@/views/OrcamentoSaudeFinanceira.vue";
import Auditoria from "@/views/Auditoria.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
    {
      path: "/materiais",
      name: "materiais",
      component: GestaoMateriais,
    },
    {
      path: "/horas",
      name: "horas",
      component: HorasTecnicas,
    },
    {
      path: "/consolidado",
      name: "consolidado",
      component: Consolidado,
    },
    {
      path: "/orcamento",
      name: "orcamento",
      component: OrcamentoSaudeFinanceira,
    },
    {
      path: "/auditoria",
      name: "auditoria",
      component: Auditoria,
    },
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

    expect(wrapper.find(".app-shell").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "AppHeader" }).exists()).toBe(true);
    expect(wrapper.find(".page-container").exists()).toBe(true);
  });

  it("renders without crashing", async () => {
    router.push("/");
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
