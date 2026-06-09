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

  it("fetchKPIs includes program filter in query string", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(KPIS_MOCK) }),
    );
    await dashboardService.fetchKPIs({ program: "Infraestrutura" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("program=Infraestrutura"),
      expect.any(Object),
    );
  });

  it("fetchKPIs includes project filter in query string", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(KPIS_MOCK) }),
    );
    await dashboardService.fetchKPIs({ project: "Data Center Regional" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("project="),
      expect.any(Object),
    );
  });

  describe("fetchComposition", () => {
    const COMPOSITION_MOCK = {
      custo_materiais: 450000,
      custo_horas: 300000,
      custo_total: 750000,
      pct_materiais: 60,
      pct_horas: 40,
    };

    it("calls /dashboard/composition/ endpoint", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) }),
      );
      await dashboardService.fetchComposition();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard/composition/"),
        expect.any(Object),
      );
    });

    it("returns all composition fields", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(COMPOSITION_MOCK) }),
      );
      const result = await dashboardService.fetchComposition();
      expect(result.custo_materiais).toBe(450000);
      expect(result.custo_horas).toBe(300000);
      expect(result.custo_total).toBe(750000);
      expect(result.pct_materiais).toBe(60);
      expect(result.pct_horas).toBe(40);
    });

    it("throws when response is not ok", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
      await expect(dashboardService.fetchComposition()).rejects.toThrow(
        "Error fetching /dashboard/composition/: 500",
      );
    });
  });

  describe("fetchSummary", () => {
    const SUMMARY_MOCK = [
      { programa: "Infraestrutura", qtd_projetos: 3, custo_materiais: 200000, custo_horas: 150000, custo_total: 350000 },
      { programa: "Cloud", qtd_projetos: 2, custo_materiais: 100000, custo_horas: 80000, custo_total: 180000 },
    ];

    it("calls /dashboard/summary/ endpoint", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(SUMMARY_MOCK) }),
      );
      await dashboardService.fetchSummary();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard/summary/"),
        expect.any(Object),
      );
    });

    it("returns summary rows with correct fields", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(SUMMARY_MOCK) }),
      );
      const result = await dashboardService.fetchSummary();
      expect(result).toHaveLength(2);
      expect(result[0].programa).toBe("Infraestrutura");
      expect(result[0].qtd_projetos).toBe(3);
      expect(result[0].custo_total).toBe(350000);
    });

    it("includes program filter in query string", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(SUMMARY_MOCK) }),
      );
      await dashboardService.fetchSummary({ program: "Infraestrutura" });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("program=Infraestrutura"),
        expect.any(Object),
      );
    });
  });

  describe("fetchTopProjects", () => {
    const TOP_PROJECTS_MOCK = [
      { project_name: "Data Center Regional", total_cost: 350000 },
      { project_name: "Migração AWS", total_cost: 280000 },
    ];

    it("calls /dashboard/top-projects/ endpoint", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(TOP_PROJECTS_MOCK) }),
      );
      await dashboardService.fetchTopProjects();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard/top-projects/"),
        expect.any(Object),
      );
    });

    it("returns top project rows", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(TOP_PROJECTS_MOCK) }),
      );
      const result = await dashboardService.fetchTopProjects();
      expect(result).toHaveLength(2);
      expect(result[0].project_name).toBe("Data Center Regional");
      expect(result[0].total_cost).toBe(350000);
    });

    it("throws when response is not ok", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
      await expect(dashboardService.fetchTopProjects()).rejects.toThrow(
        "Error fetching /dashboard/top-projects/: 404",
      );
    });
  });

  describe("fetchCostEvolution", () => {
    const COST_EVOLUTION_MOCK = [
      { period: "2024-01", materials_cost: 150000, hours_cost: 100000, total_cost: 250000 },
      { period: "2024-02", materials_cost: 180000, hours_cost: 120000, total_cost: 300000 },
    ];

    it("calls /dashboard/cost-evolution/ endpoint", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(COST_EVOLUTION_MOCK) }),
      );
      await dashboardService.fetchCostEvolution();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard/cost-evolution/"),
        expect.any(Object),
      );
    });

    it("returns evolution rows with period and cost breakdown", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(COST_EVOLUTION_MOCK) }),
      );
      const result = await dashboardService.fetchCostEvolution();
      expect(result).toHaveLength(2);
      expect(result[0].period).toBe("2024-01");
      expect(result[0].materials_cost).toBe(150000);
      expect(result[1].total_cost).toBe(300000);
    });

    it("includes date range filters in query string", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(COST_EVOLUTION_MOCK) }),
      );
      await dashboardService.fetchCostEvolution({ start_date: "2024-01-01", end_date: "2024-06-30" });
      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain("start_date=2024-01-01");
      expect(url).toContain("end_date=2024-06-30");
    });
  });

  describe("fetchConsolidated", () => {
    const CONSOLIDATED_DATA = [
      { nome_projeto: "Data Center Regional", programa: "Infraestrutura", custo_materiais: 200000, custo_horas: 150000, custo_total: 350000, status: "Em andamento" },
    ];

    it("calls /consolidated/ endpoint", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: CONSOLIDATED_DATA, last_updated_at: null }),
        }),
      );
      await dashboardService.fetchConsolidated();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/consolidated/"),
        expect.any(Object),
      );
    });

    it("returns the data array from the envelope", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: CONSOLIDATED_DATA, last_updated_at: null }),
        }),
      );
      const result = await dashboardService.fetchConsolidated();
      expect(result).toHaveLength(1);
      expect(result[0].nome_projeto).toBe("Data Center Regional");
    });

    it("returns empty array when data field is absent from envelope", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ last_updated_at: null }),
        }),
      );
      const result = await dashboardService.fetchConsolidated();
      expect(result).toEqual([]);
    });

    it("includes project filter in query string", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [], last_updated_at: null }),
        }),
      );
      await dashboardService.fetchConsolidated({ project: "Data Center Regional" });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("project="),
        expect.any(Object),
      );
    });
  });
});