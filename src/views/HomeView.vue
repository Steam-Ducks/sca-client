<template>
  <section>
    <h2>Home</h2>
    <p class="lead">
      Projeto base em Vue 3 + TypeScript + Vue Router, organizado por componentes e views.
    </p>

    <div class="grid">
      <BaseCard
        title="Componentização"
        description="Estrutura pronta para separar UI em componentes reutilizáveis."
      />
      <BaseCard
        title="Rotas"
        description="Vue Router configurado para múltiplas páginas."
      />
      <BaseCard
        title="Escalabilidade"
        description="Base simples para crescer com módulos, layouts e services."
      />
    </div>

    <div class="api-test">
      <h3>Teste de Conexão com API</h3>

      <button
        :disabled="loading"
        @click="testHealth"
      >
        Testar Health Check
      </button>

      <button
        :disabled="loading"
        @click="loadUsers"
      >
        Carregar Usuários
      </button>

      <p v-if="healthStatus !== null">
        Health Check: {{ healthStatus ? 'OK' : 'Erro' }}
      </p>

      <div v-if="users.length > 0">
        <h4>Usuários:</h4>
        <ul>
          <li
            v-for="user in users"
            :key="user.id"
          >
            {{ user.full_name }} ({{ user.email }})
          </li>
        </ul>
      </div>

      <p v-if="error">
        {{ error }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import { useApi } from '@/composables/useApi'
import type { User } from '@/types/api'
import '@/assets/styles/views/HomeView.css'

const { fetchUsers, healthCheck } = useApi()
const users = ref<User[]>([])
const healthStatus = ref<boolean | null>(null)
const loading = ref(false)
const error = ref('')

const testHealth = async () => {
  loading.value = true
  error.value = ''

  try {
    healthStatus.value = await healthCheck()
  } catch {
    error.value = 'Erro no health check'
    healthStatus.value = false
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    users.value = await fetchUsers()
  } catch {
    error.value = 'Erro ao carregar usuários'
  } finally {
    loading.value = false
  }
}
</script>