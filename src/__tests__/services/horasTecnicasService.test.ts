import { beforeEach, describe, expect, it, vi } from "vitest";
import { horasTecnicasService } from "@/services/horasTecnicasService";
import type { HorasTecnicasRow } from "@/types/api";

vi.mock("@/utils/config", () => ({
  CONFIG: { API_BASE_URL: "http://localhost:8000/api" },
}));

const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

const mockRow: HorasTecnicasRow = {
  id: 1,
  colaborador: "João Silva",
  projeto: "Data Center Regional",
  programa: "Infraestrutura",
  horas_trabalhadas: 40,
  custo_por_hora: 150,
  custo_total: 6000,
  periodo: "2024-01",
  tarefa: "Instalação de servidores",
};

describe("horasTecnicasService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAll", () => {
    it("calls /horas-tecnicas/ endpoint", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([mockRow]),
      });
      await horasTecnicasService.fetchAll();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/horas-tecnicas/"),
        expect.any(Object),
      );
    });

    it("returns rows directly when API responds with an array", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([mockRow]),
      });
      const result = await horasTecnicasService.fetchAll();
      expect(result).toHaveLength(1);
      expect(result[0].colaborador).toBe("João Silva");
      expect(result[0].custo_total).toBe(6000);
    });

    it("extracts .data when API responds with an object envelope", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ data: [mockRow, mockRow] }),
      });
      const result = await horasTecnicasService.fetchAll();
      expect(result).toHaveLength(2);
    });

    it("returns empty array when object envelope has no .data", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ other_field: "something" }),
      });
      const result = await horasTecnicasService.fetchAll();
      expect(result).toEqual([]);
    });

    it("appends periodo filter to query string", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      });
      await horasTecnicasService.fetchAll({ periodo: "2024-01" });
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("periodo=2024-01"),
        expect.any(Object),
      );
    });

    it("appends multiple filters to query string", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      });
      await horasTecnicasService.fetchAll({ periodo: "2024-02", programa: "Cloud", projeto: "Migracao AWS" });
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("periodo=2024-02");
      expect(url).toContain("programa=Cloud");
      expect(url).toContain("projeto=Migracao+AWS");
    });

    it("omits query string when filters are empty", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      });
      await horasTecnicasService.fetchAll({});
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).not.toContain("?");
    });

    it("throws with status code when response is not ok", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 403 });
      await expect(horasTecnicasService.fetchAll()).rejects.toThrow(
        "Erro ao buscar horas técnicas: 403",
      );
    });
  });
});
