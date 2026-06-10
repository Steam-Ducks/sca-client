<script setup lang="ts">
import { computed, useSlots } from "vue";

const props = defineProps<{
  label: string;
  value: string | number;
  color?: "blue" | "green" | "amber" | "red" | "date";
  sub?: string;
  size?: "sm";
}>();

const slots = useSlots();
const hasIcon = computed(() => !!slots.icon);
</script>

<template>
  <div class="metric-card" :class="{ 'metric-card--icon': hasIcon }">
    <div v-if="hasIcon" class="metric-icon-wrap" :class="color">
      <slot name="icon" />
    </div>
    <div class="metric-label">{{ label }}</div>
    <div class="metric-value" :class="[color, size === 'sm' ? 'size-sm' : '']">
      {{ value }}
    </div>
    <div v-if="sub" class="metric-sub">{{ sub }}</div>
  </div>
</template>

<style scoped>
.metric-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 22px;
  transition: border-color 0.2s;
  animation: fadeIn 0.35s ease both;
}
.metric-card:hover {
  border-color: var(--border2);
}
.metric-card--icon {
  padding: 20px 22px;
}

.metric-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  margin-bottom: 14px;
}
.metric-icon-wrap :deep(svg) {
  width: 18px;
  height: 18px;
}
.metric-icon-wrap.blue  { background: rgba(77, 143, 255, 0.12); color: var(--blue); }
.metric-icon-wrap.green { background: rgba(45, 212, 160, 0.12); color: var(--green); }
.metric-icon-wrap.amber { background: rgba(245, 166, 35, 0.12); color: var(--amber); }
.metric-icon-wrap.red   { background: rgba(245, 90, 90, 0.12);  color: var(--red); }

.metric-label {
  font-size: 11px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.metric-card--icon .metric-label {
  font-size: 12px;
  color: var(--text2);
  text-transform: none;
  letter-spacing: 0;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 26px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: -0.5px;
  color: var(--text);
}
.metric-value.size-sm {
  font-size: 22px;
}
.metric-card--icon .metric-value {
  font-size: 30px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1;
  margin-bottom: 4px;
}
.metric-value.blue  { color: var(--blue); }
.metric-value.green { color: var(--green); }
.metric-value.amber { color: var(--amber); }
.metric-value.red   { color: var(--red); }
.metric-value.date  { font-size: 14px; }

.metric-sub {
  font-size: 10px;
  color: var(--text3);
  margin-top: 4px;
}
.metric-card--icon .metric-sub {
  font-size: 11px;
  margin: 0;
}
</style>
