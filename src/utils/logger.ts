import { apiFetch } from "./apiFetch";
import { CONFIG } from "./config";

type LogLevel = "INFO" | "ERROR" | "WARN";
type LogContext = Record<string, unknown>;

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  correlation_id?: string;
}

const sendLog = async (payload: LogPayload) => {
  if (!CONFIG.ENABLE_LOGS) return;

  try {
    await apiFetch(`${CONFIG.API_BASE_URL}/logs/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error while sending log", error);
  }
};

export const logger = {
  info: (message: string, context?: LogContext) =>
    sendLog({
      level: "INFO",
      message,
      context,
      timestamp: new Date().toISOString(),
      correlation_id: crypto.randomUUID(),
    }),

  error: (message: string, context?: LogContext) =>
    sendLog({
      level: "ERROR",
      message,
      context,
      timestamp: new Date().toISOString(),
      correlation_id: crypto.randomUUID(),
    }),

  warn: (message: string, context?: LogContext) =>
    sendLog({
      level: "WARN",
      message,
      context,
      timestamp: new Date().toISOString(),
      correlation_id: crypto.randomUUID(),
    }),
};
