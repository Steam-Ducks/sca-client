<template>
  <nav class="nav-tabs">
    <RouterLink
      v-if="canAccessDashboard"
      class="nav-tab"
      to="/dashboard"
    >
      <svg
        class="tab-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
      </svg>
      Dashboard
    </RouterLink>

    <RouterLink
      class="nav-tab"
      to="/materiais"
    >
      <svg
        class="tab-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          d="M12 2L2 7l10 5 10-5-10-5z"
          stroke-linejoin="round"
        />
        <path
          d="M2 17l10 5 10-5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2 12l10 5 10-5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Materiais
    </RouterLink>

    <RouterLink
      v-if="canAccessHoras"
      class="nav-tab"
      to="/horas"
    >
      <svg
        class="tab-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <polyline
          points="12 6 12 12 16 14"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Horas Técnicas
    </RouterLink>

    <RouterLink
      v-if="canAccessConsolidado"
      class="nav-tab"
      to="/consolidado"
    >
      <svg
        class="tab-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke-linejoin="round"
        />
        <polyline
          points="14 2 14 8 20 8"
          stroke-linejoin="round"
        />
        <line
          x1="16"
          y1="13"
          x2="8"
          y2="13"
          stroke-linecap="round"
        />
        <line
          x1="16"
          y1="17"
          x2="8"
          y2="17"
          stroke-linecap="round"
        />
        <polyline
          points="10 9 9 9 8 9"
          stroke-linecap="round"
        />
      </svg>
      Consolidado
    </RouterLink>

    <RouterLink
      v-if="canAccessOrcamento"
      class="nav-tab"
      to="/orcamento"
    >
      <svg
        class="tab-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <polyline
          points="23 6 13.5 15.5 8.5 10.5 1 18"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <polyline
          points="17 6 23 6 23 12"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Orçamento e Saúde Financeira
    </RouterLink>

    <RouterLink
      class="nav-tab"
      to="/auditoria"
    >
      <svg
        class="tab-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      Auditoria
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'

defineOptions({ name: 'NavMenu' })

const { canAccessDashboard, canAccessHoras, canAccessConsolidado, canAccessOrcamento } = usePermissions()
</script>

<style scoped>
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-tabs::-webkit-scrollbar {
  display: none;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
  user-select: none;
}

.tab-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.nav-tab:hover {
  color: var(--text);
  background: var(--nav-hover);
}

.nav-tab.router-link-active {
  background: var(--blue2);
  color: #fff;
}
</style>
