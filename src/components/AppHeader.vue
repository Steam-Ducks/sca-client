<template>
  <header class="navbar">
    <div class="nav-logo">
      <svg
        class="nav-logo-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke-width="1.5"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke-width="1.5"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
          stroke-width="1.5"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
          stroke-width="1.5"
        />
      </svg>
      <span class="nav-logo-text">SCAR</span>
    </div>

    <nav class="nav-tabs">
      <RouterLink
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
        >
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke-linejoin="round"
          />
        </svg>
        Auditoria
      </RouterLink>
    </nav>

    <div class="nav-right">
      <button class="nav-theme" type="button" :title="theme === 'light' ? 'Tema escuro' : 'Tema claro'" @click="toggle">
        <svg v-if="theme === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>
      <div class="nav-user">Administrador</div>
      <button class="nav-logout" type="button">Sair</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<style scoped>
.navbar {
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  flex-shrink: 0;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.nav-logo-icon {
  width: 16px;
  height: 16px;
  color: var(--text3);
}

.nav-logo-text {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  letter-spacing: 0.04em;
}

.nav-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
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

.nav-right {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.nav-user-icon {
  width: 14px;
  height: 14px;
  color: var(--text3);
  margin-right: 2px;
}

.nav-user {
  font-size: 12px;
  color: var(--text2);
  padding: 5px 8px;
}

.nav-icon-btn {
  background: transparent;
  border: none;
  color: var(--text3);
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.nav-icon-btn svg {
  width: 14px;
  height: 14px;
}

.nav-icon-btn:hover {
  color: var(--text2);
  background: rgba(255, 255, 255, 0.05);
}

.nav-logout {
  background: transparent;
  border: none;
  color: var(--text3);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-logout svg {
  width: 13px;
  height: 13px;
}

.nav-logout:hover {
  color: var(--red);
  background: rgba(245, 90, 90, 0.08);
}

.nav-theme {
  background: transparent;
  border: none;
  color: var(--text3);
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
}

.nav-theme:hover {
  color: var(--text);
  background: var(--nav-hover);
}

.nav-theme svg {
  width: 15px;
  height: 15px;
}
</style>
