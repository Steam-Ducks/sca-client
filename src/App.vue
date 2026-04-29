<template>
  <div class="app-shell">
    <AppHeader />
    <main class="page-container">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()
</script>

<style>
:root,
[data-theme="dark"] {
  --bg: #0d0f14;
  --bg2: #141720;
  --bg3: #1c2030;
  --bg4: #222639;
  --border: #2a2f45;
  --border2: #353c58;
  --text: #e2e6f0;
  --text2: #8b92aa;
  --text3: #555d7a;
  --blue: #4d8fff;
  --blue2: #3a7af5;
  --green: #2dd4a0;
  --amber: #f5a623;
  --red: #f55a5a;
  --purple: #9b7fff;
  --nav-hover: rgba(255, 255, 255, 0.05);
}

[data-theme="light"] {
  --bg: #f5f7fa;
  --bg2: #ffffff;
  --bg3: #eef0f6;
  --bg4: #e4e8f2;
  --border: #dde1ee;
  --border2: #c8cde0;
  --text: #1a1d2e;
  --text2: #5a6180;
  --text3: #9099b8;
  --blue: #4d8fff;
  --blue2: #3a7af5;
  --green: #2dd4a0;
  --amber: #f5a623;
  --red: #f55a5a;
  --purple: #9b7fff;
  --nav-hover: rgba(0, 0, 0, 0.06);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 14px;
}
</style>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--bg);
}

.page-container {
  min-height: calc(100vh - 48px);
}
</style>
