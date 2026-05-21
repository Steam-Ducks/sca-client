import { CONFIG } from "@/utils/config";
import { apiFetch } from "@/utils/apiFetch";

export interface ServiceStatus {
  status: "ok" | "error" | "degraded" | "unavailable";
  response_time_ms?: number;
  error?: string;
}

export interface ProcessEntry {
  run_id: string;
  operation: string;
  status: string;
  table: string | null;
  affected_rows: number | null;
  started_at: string | null;
  finalized_at: string | null;
  duration_seconds: number | null;
  error?: string;
}

export interface Alert {
  level: "error" | "warning";
  source: string;
  operation: string;
  table: string;
  timestamp: string | null;
  run_id: string | null;
  message: string | null;
}

export interface DataIntegrity {
  status: "ok" | "issues_found";
  inconsistencies: string[];
  counts: Record<string, number>;
}

export interface DbConnections {
  total: number;
  active: number;
  idle: number;
  waiting_lock: number;
  error?: string;
}

export interface TableSize {
  schemaname: string;
  tablename: string;
  total_size: string;
  total_bytes: number;
  row_estimate: number;
}

export interface SlowQuery {
  query_snippet: string;
  calls: number;
  total_ms: number;
  mean_ms: number;
  max_ms: number;
  rows: number;
}

export interface DbStats {
  connections: DbConnections;
  table_sizes: TableSize[];
  slow_queries: SlowQuery[];
}

export interface StatusResponse {
  status: "ok" | "warning" | "degraded";
  timestamp: string;
  environment: string;
  uptime_seconds: number;
  services: Record<string, ServiceStatus>;
  processes: ProcessEntry[];
  last_updates: Record<string, string | null>;
  alerts: Alert[];
  data_integrity: DataIntegrity;
  db_stats: DbStats;
}

export const statusService = {
  async fetch(): Promise<StatusResponse | null> {
    try {
      const response = await apiFetch(`${CONFIG.API_BASE_URL}/status/`);
      if (!response.ok) return null;
      return (await response.json()) as StatusResponse;
    } catch {
      return null;
    }
  },
};
