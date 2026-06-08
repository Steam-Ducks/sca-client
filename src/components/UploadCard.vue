<template>
  <div class="upload-card">
    <div class="upload-card-header">
      <div class="file-name-row">
        <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span class="file-name">{{ file.name }}</span>
      </div>
      <span v-if="status" :class="badgeClass">{{ badgeLabel }}</span>
    </div>

    <p v-if="status?.message" :class="['upload-message', { error: status.status === 'error' }]">
      {{ status.message }}
      <span v-if="status.recordsProcessed"> — {{ status.recordsProcessed }} registros</span>
    </p>

    <input
      :id="`file-input-${file.key}`"
      type="file"
      accept=".csv"
      class="sr-only"
      @change="$emit('change', $event)"
    />

    <button
      :disabled="status?.status === 'processing'"
      class="upload-btn"
      @click="$emit('trigger')"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {{ status?.status === 'processing' ? 'Processando...' : 'Selecionar Arquivo' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { FileDefinition } from "@/services/auditService";
import type { FileImportStatus } from "@/composables/useFileUpload";

defineProps<{
  file: FileDefinition;
  status?: FileImportStatus;
  badgeClass: string;
  badgeLabel: string;
}>();

defineEmits<{
  trigger: [];
  change: [event: Event];
}>();
</script>

<style scoped>
.upload-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  transition: border-color 0.2s;
}
.upload-card:hover { border-color: var(--blue2); }

.upload-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.file-name-row { display: flex; align-items: center; gap: 7px; min-width: 0; }
.file-icon     { width: 14px; height: 14px; color: var(--text3); flex-shrink: 0; }
.file-name     { font-size: 13px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.upload-message       { font-size: 11px; color: var(--text2); margin: 0 0 10px 0; }
.upload-message.error { color: var(--red); }

.upload-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 8px 14px;
  background: var(--blue2); color: #fff;
  border: none; border-radius: 7px;
  font-size: 12px; font-family: inherit; font-weight: 500;
  cursor: pointer; transition: background 0.2s;
}
.upload-btn:hover    { background: var(--blue); }
.upload-btn:disabled { background: var(--border2); color: var(--text3); cursor: not-allowed; }
.upload-btn svg      { width: 13px; height: 13px; }

/* Badge classes injected from parent via :class binding */
:deep(.import-badge) {
  flex-shrink: 0; padding: 2px 8px; border-radius: 999px;
  font-size: 10px; border: 1px solid transparent; white-space: nowrap;
}
:deep(.import-badge.idle)       { background: rgba(139,146,170,0.1); color: var(--text3);  border-color: var(--border); }
:deep(.import-badge.processing) { background: rgba(77,143,255,0.1);  color: var(--blue);   border-color: rgba(77,143,255,0.2); }
:deep(.import-badge.success)    { background: rgba(45,212,160,0.1);  color: var(--green);  border-color: rgba(45,212,160,0.2); }
:deep(.import-badge.error)      { background: rgba(245,90,90,0.1);   color: var(--red);    border-color: rgba(245,90,90,0.2); }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
</style>