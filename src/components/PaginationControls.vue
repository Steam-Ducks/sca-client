<template>
  <div class="pg-btns">
    <button class="pg-btn" :disabled="currentPage === 1"          @click="$emit('update:page', 1)">«</button>
    <button class="pg-btn" :disabled="currentPage === 1"          @click="$emit('update:page', currentPage - 1)">‹</button>
    <button
      v-for="p in visiblePages"
      :key="p"
      class="pg-btn"
      :class="{ active: p === currentPage }"
      @click="$emit('update:page', p)"
    >{{ p }}</button>
    <button class="pg-btn" :disabled="currentPage === totalPages" @click="$emit('update:page', currentPage + 1)">›</button>
    <button class="pg-btn" :disabled="currentPage === totalPages" @click="$emit('update:page', totalPages)">»</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number;
  totalPages: number;
  visiblePages: number[];
}>();

defineEmits<{ "update:page": [page: number] }>();
</script>

<style scoped>
.pg-btns { display: flex; gap: 4px; }
.pg-btn {
  background: var(--bg3); border: 1px solid var(--border); color: var(--text2);
  border-radius: 5px; padding: 5px 10px; cursor: pointer; font-size: 12px; transition: all 0.15s;
}
.pg-btn:hover    { border-color: var(--blue2); color: var(--blue); }
.pg-btn.active   { background: var(--blue2); border-color: var(--blue2); color: #fff; }
.pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>