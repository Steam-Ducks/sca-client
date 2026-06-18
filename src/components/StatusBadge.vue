<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  value: string;
}>();

const CLASS_MAP: Record<string, string> = {
  Concluído:     "badge-st",
  "Em Andamento": "badge-hw",
  Planejado:     "badge-sg",
  Cancelado:     "badge-rd",
  Hardware:      "badge-hw",
  Storage:       "badge-st",
  Cloud:         "badge-cl",
  Segurança:     "badge-sg",
  Software:      "badge-sw",
  Rede:          "badge-rd",
};

const badgeClass = computed(() => CLASS_MAP[props.value] ?? "badge-hw");
</script>

<template>
  <span class="badge" :class="badgeClass">{{ value }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
}
.badge-hw { background: rgba(77, 143, 255, 0.15); color: var(--blue); }
.badge-st { background: rgba(45, 212, 160, 0.12); color: var(--green); }
.badge-cl { background: rgba(155, 127, 255, 0.12); color: var(--purple); }
.badge-sg { background: rgba(245, 166, 35, 0.12);  color: var(--amber); }
.badge-sw { background: rgba(245, 166, 35, 0.12);  color: var(--amber); }
.badge-rd { background: rgba(245, 90, 90, 0.12);   color: var(--red); }
</style>
