import { ref } from "vue";
import { uploadImportFile } from "@/services/auditService";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImportStatus = "idle" | "processing" | "success" | "error";

export interface FileImportStatus {
  status: ImportStatus;
  message?: string;
  recordsProcessed?: number;
}

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * Manages per-file upload state and exposes helpers consumed by the view.
 * Emits a `refreshData` callback after each upload attempt so the caller
 * can reload monitoring data without coupling this composable to data fetching.
 */
export function useFileUpload(onUploadSettled?: () => void) {
  const importStatus = ref<Record<string, FileImportStatus>>({});

  // ── Private helpers ─────────────────────────────────────────────────────────

  function setStatus(fileKey: string, patch: FileImportStatus) {
    importStatus.value = { ...importStatus.value, [fileKey]: patch };
  }

  function validateFile(file: File): string | null {
    if (!file.name.endsWith(".csv")) {
      return "Arquivo deve ser do tipo CSV";
    }
    return null;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Programmatically clicks the hidden <input type="file"> associated with
   * a given file key so the upload card button can trigger the file picker.
   */
  function triggerFileInput(fileKey: string): void {
    const el = document.getElementById(`file-input-${fileKey}`) as HTMLInputElement | null;
    el?.click();
  }

  /**
   * Handles the native `change` event from a file input.
   * Validates, sets loading state, calls the service, and updates status.
   */
  async function handleFileChange(fileKey: string, event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setStatus(fileKey, { status: "error", message: validationError });
      return;
    }

    setStatus(fileKey, { status: "processing", message: "Processando arquivo..." });

    try {
      const result = await uploadImportFile(fileKey, file);

      if (!result.ok) {
        setStatus(fileKey, { status: "error", message: result.errorMessage });
      } else {
        setStatus(fileKey, {
          status: "success",
          message: "Importação concluída com sucesso",
          recordsProcessed: result.recordsProcessed,
        });
      }
    } catch {
      setStatus(fileKey, { status: "error", message: "Erro de conexão com o servidor" });
    } finally {
      onUploadSettled?.();
    }
  }

  // ── Badge helpers (pure presentation mappers kept here so the view stays
  //    free of switch/map logic while not polluting the service layer) ────────

  function importBadgeClass(status: ImportStatus): string {
    const map: Record<ImportStatus, string> = {
      idle:       "import-badge idle",
      processing: "import-badge processing",
      success:    "import-badge success",
      error:      "import-badge error",
    };
    return map[status];
  }

  function importBadgeLabel(status: ImportStatus): string {
    const map: Record<ImportStatus, string> = {
      idle:       "Aguardando",
      processing: "Processando",
      success:    "Concluído",
      error:      "Erro",
    };
    return map[status];
  }

  return {
    importStatus,
    triggerFileInput,
    handleFileChange,
    importBadgeClass,
    importBadgeLabel,
  };
}