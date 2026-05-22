<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <AppLogo class="login-logo" />
        <p class="login-subtitle">
          Faça login para acessar o dashboard
        </p>
      </div>

      <div class="login-card">
        <form
          novalidate
          @submit.prevent="handleSubmit"
        >
          <div class="field-group">
            <label
              class="field-label"
              for="username"
            >Usuário</label>
            <div
              class="input-wrapper"
              :class="{ 'input-error': errors.username }"
            >
              <svg
                class="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="field-input"
                placeholder="Digite seu usuário"
                autocomplete="username"
                @blur="validateUsername"
              >
            </div>
            <span
              v-if="errors.username"
              class="error-msg"
            >{{ errors.username }}</span>
          </div>

          <div class="field-group">
            <label
              class="field-label"
              for="password"
            >Senha</label>
            <div
              class="input-wrapper"
              :class="{ 'input-error': errors.password }"
            >
              <svg
                class="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                placeholder="Digite sua senha"
                autocomplete="current-password"
                @blur="validatePassword"
              >
              <button
                type="button"
                class="toggle-password"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              </button>
            </div>
            <span
              v-if="errors.password"
              class="error-msg"
            >{{ errors.password }}</span>
          </div>

          <span
            v-if="errors.general"
            class="error-msg error-general"
          >{{ errors.general }}</span>

          <button
            type="submit"
            class="btn-entrar"
            :disabled="loading"
          >
            <span
              v-if="loading"
              class="btn-spinner"
            />
            <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import AppLogo from '@/components/AppLogo.vue'

const router = useRouter()

const form = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '', general: '' })
const loading = ref(false)
const showPassword = ref(false)

function validateUsername() {
  errors.username = form.username.trim() ? '' : 'O usuário é obrigatório.'
}

function validatePassword() {
  errors.password = form.password ? '' : 'A senha é obrigatória.'
}

function validateAll(): boolean {
  validateUsername()
  validatePassword()
  return !errors.username && !errors.password
}

async function handleSubmit() {
  errors.general = ''
  if (!validateAll()) return
  loading.value = true
  try {
    const response = await authService.login({ username: form.username, password: form.password })
    authService.saveSession(response)
    router.push('/materiais')
  } catch (err) {
    errors.general = err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 2rem 1rem;
}

.login-container {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  width: 100%;
}

.login-logo {
  width: 80%;
  max-width: 320px;
  height: auto;
  color: var(--text);
}

.login-subtitle {
  font-size: 0.9rem;
  color: var(--text2);
  margin: 0;
}

.login-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
  padding-left: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 0.875rem;
  transition: border-color 0.15s;
}

.input-wrapper:focus-within {
  border-color: var(--blue);
}

.input-wrapper.input-error {
  border-color: var(--red);
}

.input-icon {
  width: 18px;
  height: 18px;
  color: #9099b8;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #1a1d2e;
  font-family: inherit;
  font-size: 0.9rem;
  padding: 0.7rem 0 0.7rem 0.375rem;
}

.toggle-password {
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: #9099b8;
  flex-shrink: 0;
  transition: color 0.15s;
}

.toggle-password:hover {
  color: #5a6180;
}

.toggle-password svg {
  width: 18px;
  height: 18px;
}

.field-input::placeholder {
  color: #9099b8;
}

.error-msg {
  font-size: 0.78rem;
  color: var(--red);
}

.error-general {
  display: block;
  text-align: center;
  margin-bottom: 0.75rem;
}

.btn-entrar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  margin-top: 0.25rem;
}

.btn-entrar:hover:not(:disabled) {
  background: var(--blue2);
}

.btn-entrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
