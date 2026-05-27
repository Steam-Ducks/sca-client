import { apiFetch } from "./apiFetch";
import { CONFIG } from "./config";

type MetricLabels = Record<string, string | number>;

interface MetricPayload {
  name: string;
  value: number;
  labels?: MetricLabels;
  timestamp: string;
  correlation_id?: string;
}

export const trackMetric = async (
  name: string,
  value: number = 1,
  labels: MetricLabels = {},
) => {
  if (!CONFIG.ENABLE_METRICS) return;

  const payload: MetricPayload = {
    name,
    value,
    labels,
    timestamp: new Date().toISOString(),
    correlation_id: crypto.randomUUID(),
  };

  try {
    await apiFetch(`${CONFIG.API_BASE_URL}/metrics/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error while sending metric", error);
  }
};
