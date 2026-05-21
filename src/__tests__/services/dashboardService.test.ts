// src/__tests__/services/dashboardService.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dashboardService } from "@/services/dashboardService";

const KPIS_MOCK = {
  total_consolidated_cost: 750000.0,
  total_materials_cost: 450000.0,
  total_hours_cost: 300000.0,
  total_projects: 8,
  total_programs: 3,
};

describe("dashboardService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetchKPIs calls the correct URL without filters", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(KPIS_MOCK),
      }),
    );
    await dashboardService.fetchKPIs();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/dashboard/kpis/"),
      expect.any(Object),
    );
  });

  it("fetchKPIs returns the five KPI fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(KPIS_MOCK),
      }),
    );
    const result = await dashboardService.fetchKPIs();
    expect(result.total_consolidated_cost).toBe(750000.0);
    expect(result.total_materials_cost).toBe(450000.0);
    expect(result.total_hours_cost).toBe(300000.0);
    expect(result.total_projects).toBe(8);
    expect(result.total_programs).toBe(3);
  });

  it("fetchKPIs includes start_date in query string when provided", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(KPIS_MOCK),
      }),
    );
    await dashboardService.fetchKPIs({ start_date: "2024-01-01" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("start_date=2024-01-01"),
      expect.any(Object),
    );
  });

  it("fetchKPIs includes end_date in query string when provided", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(KPIS_MOCK),
      }),
    );
    await dashboardService.fetchKPIs({ end_date: "2024-12-31" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("end_date=2024-12-31"),
      expect.any(Object),
    );
  });

  it("fetchKPIs includes status in query string when provided", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(KPIS_MOCK),
      }),
    );
    await dashboardService.fetchKPIs({ status: "Em andamento" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("status=Em+andamento"),
      expect.any(Object),
    );
  });

  it("fetchKPIs throws error when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );
    await expect(dashboardService.fetchKPIs()).rejects.toThrow(
      "Error fetching /dashboard/kpis/: 500",
    );
  });

  it("fetchKPIs does not add query string when filters is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(KPIS_MOCK),
      }),
    );
    await dashboardService.fetchKPIs({});
    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url.includes("?")).toBe(false);
  });
});