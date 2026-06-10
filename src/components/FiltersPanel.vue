<template>
  <div
    class="filters-card"
    :data-testid="dataTestid"
  >
    <!-- Header -->
    <div class="filters-title">
      <svg
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          d="M3 4h18M7 10h10M11 16h2"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      Filtros
    </div>

    <!-- Controls row -->
    <div class="filters-row">
      <!-- Select dropdowns -->
      <select
        v-for="field in selectFields"
        :key="field.key"
        :value="modelValue[field.key]"
        class="filter-select"
        :disabled="field.disabled"
        :data-testid="field.testid"
        @change="onFieldChange(field.key, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">
          {{ field.placeholder }}
        </option>
        <option
          v-for="opt in field.options"
          :key="optionValue(opt)"
          :value="optionValue(opt)"
        >
          {{ optionLabel(opt) }}
        </option>
      </select>

      <!-- Date inputs -->
      <input
        v-for="field in dateFields"
        :key="field.key"
        :value="modelValue[field.key]"
        type="date"
        class="filter-input"
        :data-testid="field.testid"
        @change="onFieldChange(field.key, ($event.target as HTMLInputElement).value)"
      >

      <!-- Text inputs -->
      <input
        v-for="field in textFields"
        :key="field.key"
        :value="modelValue[field.key]"
        type="text"
        class="filter-input"
        :placeholder="field.placeholder"
        :data-testid="field.testid"
        @input="onFieldChange(field.key, ($event.target as HTMLInputElement).value)"
      >

      <!-- Limpar filtros -->
      <button
        v-if="hasActiveFilters"
        class="clear-btn"
        @click="emit('clear')"
      >
        Limpar filtros
      </button>

      <!-- Slot para botões de exportação, page-size, etc. -->
      <slot name="actions" />
    </div>

    <!-- Chips de filtros ativos -->
    <div
      v-if="hasActiveFilters"
      class="active-filters"
    >
      <span class="active-filters-label">Filtros ativos</span>
      <span
        v-for="entry in activeFilterEntries"
        :key="entry.key"
        class="filter-chip"
      >
        {{ entry.label }}: {{ entry.value }}
        <button
          class="chip-remove"
          :aria-label="`Remover filtro ${entry.label}`"
          @click="onFieldChange(entry.key, '')"
        >×</button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SelectFieldDef, DateFieldDef, TextFieldDef, SelectOption } from '@/types/filters'

function optionValue(opt: SelectOption): string {
  return typeof opt === 'string' ? opt : opt.value
}

function optionLabel(opt: SelectOption): string {
  return typeof opt === 'string' ? opt : opt.label
}

const props = withDefaults(
  defineProps<{
    modelValue: Record<string, string>
    selectFields?: SelectFieldDef[]
    dateFields?: DateFieldDef[]
    textFields?: TextFieldDef[]
    dataTestid?: string
  }>(),
  {
    selectFields: () => [],
    dateFields: () => [],
    textFields: () => [],
    dataTestid: 'filters-section',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
  'field-change': [key: string, value: string]
  'clear': []
}>()

const allFieldDefs = computed(() => [
  ...props.selectFields,
  ...props.dateFields,
  ...props.textFields,
])

const activeFilterEntries = computed(() =>
  allFieldDefs.value
    .map((f) => ({ key: f.key, label: f.label, value: props.modelValue[f.key] ?? '' }))
    .filter((e) => Boolean(e.value)),
)

const hasActiveFilters = computed(() => activeFilterEntries.value.length > 0)

function onFieldChange(key: string, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
  emit('field-change', key, value)
}
</script>

<style scoped>
.filters-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 20px;
  animation: fadeIn 0.35s ease both;
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 14px;
  color: var(--text2);
}

.filters-title svg {
  width: 14px;
  height: 14px;
  color: var(--text3);
}

.filters-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 7px;
  padding: 7px 30px 7px 10px;
  font-size: 12px;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  min-width: 155px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238b92aa'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: var(--blue2);
}

.filter-select:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.filter-input {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 7px;
  padding: 7px 10px;
  font-size: 12px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.filter-input:focus {
  outline: none;
  border-color: var(--blue2);
}

.filter-input[type="date"] {
  min-width: 130px;
}

.clear-btn {
  background: transparent;
  border: 1px solid var(--border2);
  color: var(--text2);
  border-radius: 7px;
  padding: 7px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: var(--text);
  border-color: var(--blue2);
}

.active-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 12px;
}

.active-filters-label {
  font-size: 11px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg3);
  border: 1px solid var(--border2);
  color: var(--text);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
}

.chip-remove {
  background: none;
  border: none;
  color: var(--text3);
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  padding: 0 1px;
  display: flex;
  align-items: center;
  opacity: 0.5;
  transition: opacity 0.15s, color 0.15s;
}

.chip-remove:hover {
  opacity: 1;
  color: #e05252;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: none; }
}
</style>