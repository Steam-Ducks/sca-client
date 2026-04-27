<template>
  <section class="home-view">
    <h2>Home</h2>
    <p class="lead">
      Projeto base em Vue 3 com páginas simples para evoluir a aplicação.
    </p>

    <div class="cards">
      <BaseCard
        v-for="card in cards"
        :key="card.title"
        :title="card.title"
        :description="card.description"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import BaseCard from "@/components/BaseCard.vue";

const cards = [
  {
    title: "Componentização",
    description: "Organize a interface em blocos pequenos e reutilizáveis.",
  },
  {
    title: "Rotas",
    description: "Navegue entre telas mantendo a aplicação previsível.",
  },
  {
    title: "Escalabilidade",
    description: "Estruture o projeto para crescer sem perder clareza.",
  },
];
</script>

<style scoped>
.home-view {
  padding: 24px;
}

.lead {
  margin: 12px 0 20px;
}

.cards {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
</style>
