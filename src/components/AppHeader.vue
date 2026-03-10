<template>
  <header class="header">
    <div>
      <p class="eyebrow">
        Frontend Base
      </p>
      <h1>API Front</h1>
    </div>

    <nav class="nav">
      <RouterLink to="/">
        Home
      </RouterLink>
      <RouterLink to="/dashboard">
        Dashboard
      </RouterLink>
      <RouterLink to="/about">
        Sobre
      </RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
