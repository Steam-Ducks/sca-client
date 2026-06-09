import { beforeEach, describe, expect, it, vi } from "vitest";
import { budgetService } from "@/services/budgetService";
import type { BudgetApiRow } from "@/types/api";

vi.mock("@/utils/config", () => ({
  CONFIG: { API_BASE_URL: "http://localhost:8000/api" },
}));

const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

const mockApiRow: BudgetApiRow = {
  id: 1,
  projeto: "Data Center Regional",
  programa: "Infraestrutura",
  budget: 500000,
  custoMateriais: 200000,
  custoHoras: 150000,
  custoReal: 350000,
  desvioPercent: 5,
  saude: "Saudável",
  projecaoEstouro: null,
  periodo: "2024-01",
  status: "Em andamento",
};

function okResponse(data: unknown, headers: Record<string, string | null> = {}) {
  return {
    ok: true,
    headers: { get: (key: string) => headers[key] ?? null },
    json: vi.fn().mockResolvedValue(data),
  };
}

describe("budgetService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchBudgetIndicators", () => {
    const indicatorsPayload = {
      data: {
        budgetTotal: "1000000",
        custoRealTotal: "850000",
        desvioPercentMedio: "15.5",
        projetosSaudaveis: 5,
        projetosAtencao: 3,
        projetosCriticos: 1,
      },
      last_updated_at: "2024-06-01T12:00:00Z",
    };

    it("calls /budget/indicators/ endpoint", async () => {
      fetchMock.mockResolvedValue(okResponse(indicatorsPayload));
      await budgetService.fetchBudgetIndicators();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/budget/indicators/"),
        expect.any(Object),
      );
    });

    it("coerces all indicator fields to Number", async () => {
      fetchMock.mockResolvedValue(okResponse(indicatorsPayload));
      const { indicators } = await budgetService.fetchBudgetIndicators();
      expect(indicators.budgetTotal).toBe(1000000);
      expect(indicators.custoRealTotal).toBe(850000);
      expect(indicators.desvioPercentMedio).toBe(15.5);
      expect(indicators.projetosSaudaveis).toBe(5);
      expect(indicators.projetosAtencao).toBe(3);
      expect(indicators.projetosCriticos).toBe(1);
    });

    it("returns lastUpdatedAt from payload", async () => {
      fetchMock.mockResolvedValue(okResponse(indicatorsPayload));
      const result = await budgetService.fetchBudgetIndicators();
      expect(result.lastUpdatedAt).toBe("2024-06-01T12:00:00Z");
    });

    it("returns null lastUpdatedAt when payload date is invalid", async () => {
      fetchMock.mockResolvedValue(okResponse({ ...indicatorsPayload, last_updated_at: "not-a-date" }));
      const result = await budgetService.fetchBudgetIndicators();
      expect(result.lastUpdatedAt).toBeNull();
    });

    it("appends periodo and saude filters to query string", async () => {
      fetchMock.mockResolvedValue(okResponse(indicatorsPayload));
      await budgetService.fetchBudgetIndicators({ periodo: "2024-01", saude: "Crítico" });
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("periodo=2024-01");
      expect(url).toContain("saude=");
    });

    it("omits query string when filters are empty", async () => {
      fetchMock.mockResolvedValue(okResponse(indicatorsPayload));
      await budgetService.fetchBudgetIndicators({});
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).not.toContain("?");
    });

    it("throws when response is not ok", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 503 });
      await expect(budgetService.fetchBudgetIndicators()).rejects.toThrow(
        "Erro ao buscar indicadores de orçamento",
      );
    });
  });

  describe("fetchBudgetSnapshot", () => {
    it("calls /budget/ endpoint", async () => {
      fetchMock.mockResolvedValue(okResponse([mockApiRow]));
      await budgetService.fetchBudgetSnapshot();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/budget/"),
        expect.any(Object),
      );
    });

    it("coerces string numeric fields to Number", async () => {
      const rawRow = { ...mockApiRow, budget: "500000", custoReal: "350000", desvioPercent: "5" };
      fetchMock.mockResolvedValue(okResponse([rawRow]));
      const { rows } = await budgetService.fetchBudgetSnapshot();
      expect(rows[0].budget).toBe(500000);
      expect(rows[0].custoReal).toBe(350000);
      expect(rows[0].desvioPercent).toBe(5);
    });

    it("extracts rows from a response envelope with .data", async () => {
      fetchMock.mockResolvedValue(okResponse({ data: [mockApiRow], last_updated_at: null }));
      const { rows } = await budgetService.fetchBudgetSnapshot();
      expect(rows).toHaveLength(1);
      expect(rows[0].projeto).toBe("Data Center Regional");
    });

    it("fills 'Sem programa' when programa is null", async () => {
      fetchMock.mockResolvedValue(okResponse([{ ...mockApiRow, programa: null }]));
      const { rows } = await budgetService.fetchBudgetSnapshot();
      expect(rows[0].programa).toBe("Sem programa");
    });

    it("fills 'Sem periodo' when periodo is null", async () => {
      fetchMock.mockResolvedValue(okResponse([{ ...mockApiRow, periodo: null }]));
      const { rows } = await budgetService.fetchBudgetSnapshot();
      expect(rows[0].periodo).toBe("Sem periodo");
    });

    it("fills 'Sem status' when status is null", async () => {
      fetchMock.mockResolvedValue(okResponse([{ ...mockApiRow, status: null }]));
      const { rows } = await budgetService.fetchBudgetSnapshot();
      expect(rows[0].status).toBe("Sem status");
    });

    it("keeps projecaoEstouro as null when absent", async () => {
      fetchMock.mockResolvedValue(okResponse([{ ...mockApiRow, projecaoEstouro: null }]));
      const { rows } = await budgetService.fetchBudgetSnapshot();
      expect(rows[0].projecaoEstouro).toBeNull();
    });

    it("coerces string projecaoEstouro to number", async () => {
      fetchMock.mockResolvedValue(okResponse([{ ...mockApiRow, projecaoEstouro: "30000" }]));
      const { rows } = await budgetService.fetchBudgetSnapshot();
      expect(rows[0].projecaoEstouro).toBe(30000);
    });

    it("reads lastUpdatedAt from response body envelope", async () => {
      fetchMock.mockResolvedValue(
        okResponse({ data: [mockApiRow], last_updated_at: "2024-05-10T08:00:00Z" }),
      );
      const result = await budgetService.fetchBudgetSnapshot();
      expect(result.lastUpdatedAt).toBe("2024-05-10T08:00:00Z");
    });

    it("falls back to x-last-updated header when body has no timestamp", async () => {
      fetchMock.mockResolvedValue(
        okResponse([mockApiRow], { "x-last-updated": "2024-03-15T00:00:00Z" }),
      );
      const result = await budgetService.fetchBudgetSnapshot();
      expect(result.lastUpdatedAt).toBe("2024-03-15T00:00:00Z");
    });

    it("returns null lastUpdatedAt when no valid date exists", async () => {
      fetchMock.mockResolvedValue(okResponse([mockApiRow]));
      const result = await budgetService.fetchBudgetSnapshot();
      expect(result.lastUpdatedAt).toBeNull();
    });

    it("appends filters to query string", async () => {
      fetchMock.mockResolvedValue(okResponse([]));
      await budgetService.fetchBudgetSnapshot({ periodo: "2024-03", programa: "Cloud" });
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("periodo=2024-03");
      expect(url).toContain("programa=Cloud");
    });

    it("returns empty rows when API responds with []", async () => {
      fetchMock.mockResolvedValue(okResponse([]));
      const { rows } = await budgetService.fetchBudgetSnapshot();
      expect(rows).toEqual([]);
    });

    it("throws when response is not ok", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404 });
      await expect(budgetService.fetchBudgetSnapshot()).rejects.toThrow(
        "Erro ao buscar orçamento por projeto",
      );
    });
  });
});
