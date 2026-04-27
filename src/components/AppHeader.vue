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
      <svg
        class="nav-user-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          cx="12"
          cy="7"
          r="4"
        />
      </svg>
      <div class="nav-user">
        Administrador
      </div>
      <button
        class="nav-icon-btn"
        type="button"
        title="Configurações"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle
            cx="12"
            cy="12"
            r="3"
          />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
      </button>
      <button
        class="nav-logout"
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <polyline
            points="16 17 21 12 16 7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <line
            x1="21"
            y1="12"
            x2="9"
            y2="12"
            stroke-linecap="round"
          />
        </svg>
        Sair
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
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
  background: rgba(255, 255, 255, 0.05);
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
</style>
