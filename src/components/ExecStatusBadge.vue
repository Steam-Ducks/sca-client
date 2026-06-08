<template>
  <span :class="badgeClass">
    <!-- Partial -->
    <svg v-if="status === 'PARTIAL'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
    <!-- Failed -->
    <svg v-else-if="status === 'FAILED'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
    <!-- Success -->
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ status: string }>();

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  SUCCESS: { cls: "exec-badge exec-badge--success", label: "Sucesso" },
  PARTIAL: { cls: "exec-badge exec-badge--partial", label: "Parcial" },
  FAILED:  { cls: "exec-badge exec-badge--failed",  label: "Falha"   },
};

const resolved   = computed(() => STATUS_MAP[props.status] ?? { cls: "exec-badge", label: props.status });
const badgeClass = computed(() => resolved.value.cls);
const label      = computed(() => resolved.value.label);
</script>

<style scoped>
.exec-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 999px;
  font-size: 11px; font-weight: 500; border: 1px solid transparent;
}
.exec-badge svg          { width: 12px; height: 12px; flex-shrink: 0; }
.exec-badge--success { background: rgba(45,212,160,0.1);  color: var(--green);  border-color: rgba(45,212,160,0.2); }
.exec-badge--partial { background: rgba(245,166,35,0.1);  color: var(--amber);  border-color: rgba(245,166,35,0.2); }
.exec-badge--failed  { background: rgba(245,90,90,0.1);   color: var(--red);    border-color: rgba(245,90,90,0.2); }
</style>