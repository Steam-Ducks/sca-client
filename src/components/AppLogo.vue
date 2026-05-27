<template>
  <img
    :src="logoUrl"
    :class="['app-logo-img', theme === 'dark' ? 'logo-dark' : 'logo-light']"
    alt="SCAR"
  >
</template>

<script setup lang="ts">
import logoUrl from '@/assets/logo.png'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()
</script>

<style scoped>
.app-logo-img {
  display: block;
  width: 100%;
  height: auto;
}

.logo-dark {
  filter: none;
}

.logo-light {
  filter: invert(1);
  mix-blend-mode: multiply;
}
</style>
