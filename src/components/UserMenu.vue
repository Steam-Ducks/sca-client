<template>
  <div class="nav-user">
    Administrador
  </div>
  <button
    class="nav-logout"
    type="button"
    @click="handleLogout"
  >
    Sair
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'

defineOptions({ name: 'UserMenu' })

const router = useRouter()

function handleLogout() {
  authService.clearSession()
  router.push('/login')
}
</script>

<style scoped>
.nav-user {
  font-size: 12px;
  color: var(--text2);
  padding: 5px 8px;
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
