import { beforeEach, describe, expect, it, vi } from "vitest";
import { consolidatedService } from "@/services/consolidatedService";
import type { ConsolidatedApiRow } from "@/types/api";

vi.mock("@/utils/config", () => ({
  CONFIG: { API_BASE_URL: "http://localhost:8000/api" },
}));

const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

const mockApiRow: ConsolidatedApiRow = {
  id: 1,
  nome_projeto: "Data Center Regional",
  programa: "Infraestrutura",
  custo_materiais: 200000,
  custo_horas: 150000,
  custo_total: 350000,
  qtd_materiais: 25,
  total_horas: 300,
  status: "Em andamento",
};

function okResponse(data: unknown, headers: Record<string, string | null> = {}) {
  return {
    ok: true,
    headers: { get: (key: string) => headers[key] ?? null },
    json: vi.fn().mockResolvedValue(data),
  };
}

describe("consolidatedService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchConsolidatedSnapshot", () => {
    it("calls /consolidated/ endpoint", async () => {
      fetchMock.mockResolvedValue(okResponse([mockApiRow]));
      await consolidatedService.fetchConsolidatedSnapshot();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/consolidated/"),
        expect.any(Object),
      );
    });

    it("maps nome_projeto to projeto", async () => {
      fetchMock.mockResolvedValue(okResponse([mockApiRow]));
      const { rows } = await consolidatedService.fetchConsolidatedSnapshot();
      expect(rows[0].projeto).toBe("Data Center Regional");
    });

    it("coerces numeric fields to Number", async () => {
      const rawRow = { ...mockApiRow, custo_materiais: "200000", custo_horas: "150000", custo_total: "350000" };
      fetchMock.mockResolvedValue(okResponse([rawRow]));
      const { rows } = await consolidatedService.fetchConsolidatedSnapshot();
      expect(rows[0].custoMateriais).toBe(200000);
      expect(rows[0].custoHoras).toBe(150000);
      expect(rows[0].custoTotal).toBe(350000);
    });

    it("infers periodo from a known project name", async () => {
      fetchMock.mockResolvedValue(okResponse([mockApiRow])); // "Data Center Regional" → "2024-01"
      const { rows } = await consolidatedService.fetchConsolidatedSnapshot();
      expect(rows[0].periodo).toBe("2024-01");
    });

    it("assigns 'Sem periodo' for an unknown project name", async () => {
      fetchMock.mockResolvedValue(okResponse([{ ...mockApiRow, nome_projeto: "Projeto Desconhecido" }]));
      const { rows } = await consolidatedService.fetchConsolidatedSnapshot();
      expect(rows[0].periodo).toBe("Sem periodo");
    });

    it("fills 'Sem programa' when programa is null", async () => {
      fetchMock.mockResolvedValue(okResponse([{ ...mockApiRow, programa: null }]));
      const { rows } = await consolidatedService.fetchConsolidatedSnapshot();
      expect(rows[0].programa).toBe("Sem programa");
    });

    it("fills 'Sem status' when status is an empty string", async () => {
      fetchMock.mockResolvedValue(okResponse([{ ...mockApiRow, status: "" }]));
      const { rows } = await consolidatedService.fetchConsolidatedSnapshot();
      expect(rows[0].status).toBe("Sem status");
    });

    it("extracts rows from envelope with .data", async () => {
      fetchMock.mockResolvedValue(okResponse({ data: [mockApiRow], last_updated_at: null }));
      const { rows } = await consolidatedService.fetchConsolidatedSnapshot();
      expect(rows).toHaveLength(1);
    });

    it("extracts rows from envelope with .results", async () => {
      fetchMock.mockResolvedValue(okResponse({ results: [mockApiRow] }));
      const { rows } = await consolidatedService.fetchConsolidatedSnapshot();
      expect(rows).toHaveLength(1);
    });

    it("extracts rows from envelope with .items", async () => {
      fetchMock.mockResolvedValue(okResponse({ items: [mockApiRow] }));
      const { rows } = await consolidatedService.fetchConsolidatedSnapshot();
      expect(rows).toHaveLength(1);
    });

    it("reads lastUpdatedAt from last_updated_at body field", async () => {
      fetchMock.mockResolvedValue(
        okResponse({ data: [mockApiRow], last_updated_at: "2024-05-10T08:00:00Z" }),
      );
      const result = await consolidatedService.fetchConsolidatedSnapshot();
      expect(result.lastUpdatedAt).toBe("2024-05-10T08:00:00Z");
    });

    it("reads lastUpdatedAt from ultimaAtualizacao body field", async () => {
      fetchMock.mockResolvedValue(
        okResponse({ data: [mockApiRow], ultimaAtualizacao: "2024-04-20T10:00:00Z" }),
      );
      const result = await consolidatedService.fetchConsolidatedSnapshot();
      expect(result.lastUpdatedAt).toBe("2024-04-20T10:00:00Z");
    });

    it("falls back to x-last-updated header when body has no timestamp", async () => {
      fetchMock.mockResolvedValue(
        okResponse([mockApiRow], { "x-last-updated": "2024-03-01T00:00:00Z" }),
      );
      const result = await consolidatedService.fetchConsolidatedSnapshot();
      expect(result.lastUpdatedAt).toBe("2024-03-01T00:00:00Z");
    });

    it("returns null lastUpdatedAt when no valid date exists", async () => {
      fetchMock.mockResolvedValue(okResponse([mockApiRow]));
      const result = await consolidatedService.fetchConsolidatedSnapshot();
      expect(result.lastUpdatedAt).toBeNull();
    });

    it("appends filters to query string", async () => {
      fetchMock.mockResolvedValue(okResponse([]));
      await consolidatedService.fetchConsolidatedSnapshot({ periodo: "2024-02", status: "Concluído" });
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("periodo=2024-02");
      expect(url).toContain("status=");
    });

    it("omits query string when filters are empty", async () => {
      fetchMock.mockResolvedValue(okResponse([]));
      await consolidatedService.fetchConsolidatedSnapshot({});
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).not.toContain("?");
    });

    it("throws when response is not ok", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 });
      await expect(consolidatedService.fetchConsolidatedSnapshot()).rejects.toThrow(
        "Erro ao buscar dados consolidados",
      );
    });
  });

  describe("fetchConsolidated", () => {
    it("returns the normalized rows", async () => {
      fetchMock.mockResolvedValue(okResponse([mockApiRow]));
      const rows = await consolidatedService.fetchConsolidated();
      expect(rows).toHaveLength(1);
      expect(rows[0].projeto).toBe("Data Center Regional");
    });

    it("passes filters through to the API", async () => {
      fetchMock.mockResolvedValue(okResponse([]));
      await consolidatedService.fetchConsolidated({ programa: "Cloud" });
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("programa=Cloud");
    });
  });
});
