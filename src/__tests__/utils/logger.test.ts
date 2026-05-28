import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@/utils/logger";

// Mock apiFetch
vi.mock("@/utils/apiFetch", () => ({
  apiFetch: vi.fn(),
}));
import { apiFetch } from "@/utils/apiFetch";
const mockedApiFetch = vi.mocked(apiFetch);

// Mock CONFIG
vi.mock("@/utils/config", () => ({
  CONFIG: {
    ENABLE_LOGS: true,
    API_BASE_URL: "http://localhost:3000/api",
  },
}));

// Mock crypto.randomUUID
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid-123"),
  },
});

describe("logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("info", () => {
    it("should send info log with correct payload", async () => {
      mockedApiFetch.mockResolvedValue(new Response(null, { status: 200 }));

      await logger.info("Test message", { userId: 123 });

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/logs/",
        {
          method: "POST",
          body: JSON.stringify({
            level: "INFO",
            message: "Test message",
            context: { userId: 123 },
            timestamp: "2024-01-01T12:00:00.000Z",
            correlation_id: "test-uuid-123",
          }),
        },
      );
    });

    it("should send info log without context", async () => {
      mockedApiFetch.mockResolvedValue(new Response(null, { status: 200 }));

      await logger.info("Simple message");

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/logs/",
        {
          method: "POST",
          body: JSON.stringify({
            level: "INFO",
            message: "Simple message",
            timestamp: "2024-01-01T12:00:00.000Z",
            correlation_id: "test-uuid-123",
          }),
        },
      );
    });

    it("should handle apiFetch error gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockedApiFetch.mockRejectedValue(new Error("Network error"));

      await expect(logger.info("Test message")).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error while sending log",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("error", () => {
    it("should send error log with correct payload", async () => {
      mockedApiFetch.mockResolvedValue(new Response(null, { status: 200 }));

      await logger.error("Error message", { error: "Test error" });

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/logs/",
        {
          method: "POST",
          body: JSON.stringify({
            level: "ERROR",
            message: "Error message",
            context: { error: "Test error" },
            timestamp: "2024-01-01T12:00:00.000Z",
            correlation_id: "test-uuid-123",
          }),
        },
      );
    });
  });

  describe("warn", () => {
    it("should send warn log with correct payload", async () => {
      mockedApiFetch.mockResolvedValue(new Response(null, { status: 200 }));

      await logger.warn("Warning message", { warning: "Test warning" });

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/logs/",
        {
          method: "POST",
          body: JSON.stringify({
            level: "WARN",
            message: "Warning message",
            context: { warning: "Test warning" },
            timestamp: "2024-01-01T12:00:00.000Z",
            correlation_id: "test-uuid-123",
          }),
        },
      );
    });
  });

  describe("when logs are disabled", () => {
    beforeEach(() => {
      vi.resetModules();
      vi.doMock("@/utils/config", () => ({
        CONFIG: {
          ENABLE_LOGS: false,
          API_BASE_URL: "http://localhost:3000/api",
        },
      }));
    });

    it("should not send logs when ENABLE_LOGS is false", async () => {
      vi.clearAllMocks();

      const { logger: disabledLogger } = await import("@/utils/logger");

      await disabledLogger.info("This should not be sent");

      expect(mockedApiFetch).not.toHaveBeenCalled();
    });
  });
});
