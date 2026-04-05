<template>
  <header class="navbar">
    <div class="nav-logo">
      <svg class="nav-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke-width="1.5" />
      </svg>
      <span class="nav-logo-text">Sistema de Gestão de Custos</span>
    </div>

    <nav class="nav-tabs">
      <RouterLink class="nav-tab" to="/dashboard">Dashboard</RouterLink>
      <RouterLink class="nav-tab" to="/materiais">Materiais</RouterLink>
      <RouterLink class="nav-tab" to="/horas">Horas Técnicas</RouterLink>
      <RouterLink class="nav-tab" to="/consolidado">Consolidado</RouterLink>
      <RouterLink class="nav-tab" to="/auditoria">Auditoria</RouterLink>
    </nav>

    <div class="nav-right">
      <div class="nav-user">Administrador</div>
      <button class="nav-logout" type="button">Sair</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
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
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
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
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
  text-decoration: none;
  transition: all .15s;
  white-space: nowrap;
  user-select: none;
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
  gap: 4px;
  margin-left: auto;
}

.nav-user {
  font-size: 12px;
  color: var(--text2);
  padding: 5px 10px;
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
  transition: all .15s;
}

.nav-logout:hover {
  color: var(--red);
  background: rgba(245, 90, 90, 0.08);
}
</style>
