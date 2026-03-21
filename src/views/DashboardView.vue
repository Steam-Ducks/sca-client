<script setup lang="ts">
import { ref } from 'vue'

const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)

function fetchData() {
  console.log('filter:', startDate.value, endDate.value)
}

function applyFilter() {
  fetchData()
}

function clearFilter() {
  startDate.value = null
  endDate.value = null
}
</script>

<template>
  <section>
    <h2>Dashboard</h2>

    <!-- FILTER -->
    <div class="filter">
      <input
        type="date"
        v-model="startDate"
        name="startDate"
      />

      <input
        type="date"
        v-model="endDate"
        name="endDate"
      />

      <button data-test="apply-filter" @click="applyFilter">
        Aplicar
      </button>

      <button data-test="clear-filter" @click="clearFilter">
        Limpar
      </button>
    </div>

    <!-- FILTER ACTIVE -->
    <div class="active-filter" v-if="startDate && endDate">
      {{ startDate }} - {{ endDate }}
    </div>

    <div class="stats">
      <div class="stat-box">
        <span>Usuários</span>
        <strong>128</strong>
      </div>
      <div class="stat-box">
        <span>Pedidos</span>
        <strong>54</strong>
      </div>
      <div class="stat-box">
        <span>Alertas</span>
        <strong>3</strong>
      </div>
    </div>
  </section>
</template>
