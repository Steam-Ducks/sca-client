import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trackMetric } from "@/utils/metrics";

// Mock apiFetch
vi.mock("@/utils/apiFetch", () => ({
  apiFetch: vi.fn(),
}));
import { apiFetch } from "@/utils/apiFetch";
const mockedApiFetch = vi.mocked(apiFetch);

// Mock CONFIG
vi.mock("@/utils/config", () => ({
  CONFIG: {
    ENABLE_METRICS: true,
    API_BASE_URL: "http://localhost:3000/api",
  },
}));

// Mock crypto.randomUUID
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: vi.fn(() => "metric-uuid-456"),
  },
});

describe("trackMetric", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should send metric with default value", async () => {
    mockedApiFetch.mockResolvedValue(new Response(null, { status: 200 }));

    await trackMetric("page_view", undefined, { page: "/home" });

    expect(mockedApiFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/metrics/",
      {
        method: "POST",
        body: JSON.stringify({
          name: "page_view",
          value: 1,
          labels: { page: "/home" },
          timestamp: "2024-01-01T12:00:00.000Z",
          correlation_id: "metric-uuid-456",
        }),
      },
    );
  });

  it("should send metric with custom value", async () => {
    mockedApiFetch.mockResolvedValue(new Response(null, { status: 200 }));

    await trackMetric("response_time", 150.5, { endpoint: "/api/users" });

    expect(mockedApiFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/metrics/",
      {
        method: "POST",
        body: JSON.stringify({
          name: "response_time",
          value: 150.5,
          labels: { endpoint: "/api/users" },
          timestamp: "2024-01-01T12:00:00.000Z",
          correlation_id: "metric-uuid-456",
        }),
      },
    );
  });

  it("should send metric without labels", async () => {
    mockedApiFetch.mockResolvedValue(new Response(null, { status: 200 }));

    await trackMetric("button_click", 1);

    expect(mockedApiFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/metrics/",
      {
        method: "POST",
        body: JSON.stringify({
          name: "button_click",
          value: 1,
          labels: {},
          timestamp: "2024-01-01T12:00:00.000Z",
          correlation_id: "metric-uuid-456",
        }),
      },
    );
  });

  it("should handle apiFetch error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockedApiFetch.mockRejectedValue(new Error("Network error"));

    await expect(trackMetric("error_metric", 1)).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error while sending metric",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  describe("when metrics are disabled", () => {
    beforeEach(() => {
      vi.resetModules();
      vi.doMock("@/utils/config", () => ({
        CONFIG: {
          ENABLE_METRICS: false,
          API_BASE_URL: "http://localhost:3000/api",
        },
      }));
    });

    it("should not send metrics when ENABLE_METRICS is false", async () => {
      vi.clearAllMocks();

      const { trackMetric: disabledTrackMetric } =
        await import("@/utils/metrics");

      await disabledTrackMetric("disabled_metric", 1);

      expect(mockedApiFetch).not.toHaveBeenCalled();
    });
  });

  it("should handle labels with different types", async () => {
    mockedApiFetch.mockResolvedValue(new Response(null, { status: 200 }));

    await trackMetric("mixed_labels", 42, {
      string: "text",
      number: 123,
      page: "/dashboard",
      user_id: 789,
    });

    expect(mockedApiFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/metrics/",
      {
        method: "POST",
        body: JSON.stringify({
          name: "mixed_labels",
          value: 42,
          labels: {
            string: "text",
            number: 123,
            page: "/dashboard",
            user_id: 789,
          },
          timestamp: "2024-01-01T12:00:00.000Z",
          correlation_id: "metric-uuid-456",
        }),
      },
    );
  });
});
