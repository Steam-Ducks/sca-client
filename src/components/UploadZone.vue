<template>
  <div class="upload-grid">
    <slot />
  </div>
</template>

<style scoped>
.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
</style>
