import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Auditoria from "@/views/Auditoria.vue";

// ── Fixtures ──────────────────────────────────────────────────────────────────
const EXECUCOES_RESPONSE = {
  count: 4,
  results: [
    {
      id: 1, run_id: "uuid-1", fonte: "csv_upload", tabela: "materiais",
      tipo_processo: "COMPLETA", status: "SUCCESS",
      linhas_processadas: 150, duracao_segundos: 42, erros: 0, avisos: 0,
      detalhes_falha: null,
      iniciado_em: "2026-03-11T23:00:00", finalizado_em: "2026-03-11T23:45:00",
    },
    {
      id: 2, run_id: "uuid-2", fonte: "csv_upload", tabela: "horas",
      tipo_processo: "COMPLETA", status: "SUCCESS",
      linhas_processadas: 80, duracao_segundos: 38, erros: 0, avisos: 0,
      detalhes_falha: null,
      iniciado_em: "2026-03-10T23:00:00", finalizado_em: "2026-03-10T23:42:00",
    },
    {
      id: 3, run_id: "uuid-3", fonte: "csv_upload", tabela: "fornecedores",
      tipo_processo: "COMPLETA", status: "PARTIAL",
      linhas_processadas: 5, duracao_segundos: 10, erros: 5, avisos: 12,
      detalhes_falha: "5 registros com inconsistência",
      iniciado_em: "2026-03-09T23:00:00", finalizado_em: "2026-03-09T23:38:00",
    },
    {
      id: 4, run_id: "uuid-4", fonte: "csv_upload", tabela: "programas",
      tipo_processo: "COMPLETA", status: "FAILED",
      linhas_processadas: 0, duracao_segundos: null, erros: 1, avisos: 0,
      detalhes_falha: "Erro durante processamento dos dados",
      iniciado_em: "2026-03-06T23:00:00", finalizado_em: "2026-03-06T23:05:00",
    },
  ],
};

const EMPTY_EXECUCOES = { count: 0, results: [] };

// Shorthand: two EXECUCOES_RESPONSE responses (one for loadFalhas, one for loadHistorico on mount)
const mountMocks = () => [
  { ok: true, json: async () => EXECUCOES_RESPONSE },
  { ok: true, json: async () => EXECUCOES_RESPONSE },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
interface VmType {
  activeTab: string;
  importStatus: Record<string, { status: string; message?: string; recordsProcessed?: number }>;
  falhasRows: typeof EXECUCOES_RESPONSE.results;
  falhasTotal: number;
  falhasLoading: boolean;
  falhasError: string | null;
  falhasPage: number;
  falhasTotalPages: number;
  falhasFilters: { status: string; data_inicio: string; data_fim: string };
  historicoRows: typeof EXECUCOES_RESPONSE.results;
  historicoTotal: number;
  historicoLoading: boolean;
  historicoError: string | null;
  historicoPage: number;
  historicoTotalPages: number;
  historicoFilters: { status: string; tabela: string; fonte: string; data_inicio: string; data_fim: string };
  kpis: { concluidas: number; parciais: number; falhas: number };
  handleFileChange: (key: string, event: Event) => Promise<void>;
  loadFalhas: () => Promise<void>;
  loadHistorico: () => Promise<void>;
}

const getVm = (wrapper: ReturnType<typeof mount>) =>
  wrapper.vm as unknown as VmType;

function csvFileEvent(fileName = "dados.csv"): Event {
  const file = new File(["col1,col2\nval1,val2"], fileName, { type: "text/csv" });
  return { target: { files: [file] } } as unknown as Event;
}

function nonCsvFileEvent(): Event {
  const file = new File(["data"], "dados.xlsx", { type: "application/vnd.ms-excel" });
  return { target: { files: [file] } } as unknown as Event;
}

// ── Suite ─────────────────────────────────────────────────────────────────────
describe("Auditoria.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => EXECUCOES_RESPONSE }),
    );
  });

  // ── Estrutura ───────────────────────────────────────────────────────────────
  describe("Estrutura da página", () => {
    it("renderiza o cabeçalho com título e subtítulo", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(wrapper.text()).toContain("Auditoria e Importação de Dados");
      expect(wrapper.text()).toContain("Monitoramento de cargas");
    });

    it("renderiza 4 cards de KPI", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(wrapper.findAll(".metric-card").length).toBe(4);
    });

    it("exibe os labels corretos nos KPIs", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(wrapper.text()).toContain("Total de Cargas");
      expect(wrapper.text()).toContain("Concluídas");
      expect(wrapper.text()).toContain("Parciais");
      expect(wrapper.text()).toContain("Falhas");
    });

    it("renderiza 3 abas de navegação", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      const tabs = wrapper.findAll(".tab-btn");
      expect(tabs.length).toBe(3);
      expect(tabs[0].text()).toContain("Importação de Dados");
      expect(tabs[1].text()).toContain("Histórico de Execuções");
      expect(tabs[2].text()).toContain("Falhas e Inconsistências");
    });

    it("não exibe aba Rastreabilidade", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(wrapper.text()).not.toContain("Rastreabilidade");
    });

    it("abre na aba Importação de Dados por padrão", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(getVm(wrapper).activeTab).toBe("importacao");
      expect(wrapper.find(".tab-btn.active").text()).toContain("Importação de Dados");
    });
  });

  // ── KPIs via /monitoring/execucoes/ ─────────────────────────────────────────
  describe("KPIs carregados da API", () => {
    it("busca dados de /monitoring/execucoes/ no mount", async () => {
      mount(Auditoria);
      await flushPromises();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/monitoring/execucoes/"),
        expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) }),
      );
    });

    it("computa concluídas a partir dos registros SUCCESS", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      expect(getVm(wrapper).kpis.concluidas).toBe(2);
    });

    it("computa parciais a partir dos registros PARTIAL", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      expect(getVm(wrapper).kpis.parciais).toBe(1);
    });

    it("computa falhas a partir dos registros FAILED", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      expect(getVm(wrapper).kpis.falhas).toBe(1);
    });

    it("exibe total de cargas igual ao count da API", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      expect(getVm(wrapper).falhasTotal).toBe(4);
    });

    it("mantém KPIs em zero se a API falhar", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
      const wrapper = mount(Auditoria);
      await flushPromises();

      expect(getVm(wrapper).kpis.concluidas).toBe(0);
      expect(getVm(wrapper).kpis.parciais).toBe(0);
      expect(getVm(wrapper).kpis.falhas).toBe(0);
    });

    it("não atualiza dados se /monitoring/execucoes/ retornar status não-ok", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
      );
      const wrapper = mount(Auditoria);
      await flushPromises();

      expect(getVm(wrapper).falhasRows.length).toBe(0);
    });
  });

  // ── Navegação de abas ───────────────────────────────────────────────────────
  describe("Navegação de abas", () => {
    it("troca para Histórico ao clicar na aba", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      await wrapper.findAll(".tab-btn")[1].trigger("click");

      expect(getVm(wrapper).activeTab).toBe("historico");
      expect(wrapper.find(".tab-btn.active").text()).toContain("Histórico");
    });

    it("troca para Falhas ao clicar na aba", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      await wrapper.findAll(".tab-btn")[2].trigger("click");

      expect(getVm(wrapper).activeTab).toBe("falhas");
    });
  });

  // ── Aba de Importação – estrutura ───────────────────────────────────────────
  describe("Aba Importação de Dados – estrutura", () => {
    it("exibe as 3 seções de importação", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(wrapper.text()).toContain("Importação Organizacional");
      expect(wrapper.text()).toContain("Importação de Materiais");
      expect(wrapper.text()).toContain("Importação de Horas Técnicas");
    });

    it("renderiza todos os 11 cards de upload", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(wrapper.findAll(".upload-card").length).toBe(11);
    });

    it("todos os botões de upload exibem 'Selecionar Arquivo' inicialmente", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      wrapper.findAll(".upload-btn").forEach((btn) =>
        expect(btn.text()).toContain("Selecionar Arquivo"),
      );
    });

    it("todos os inputs aceitam apenas .csv", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      wrapper.findAll("input[type='file']").forEach((input) =>
        expect(input.attributes("accept")).toBe(".csv"),
      );
    });
  });

  // ── handleFileChange – validação ────────────────────────────────────────────
  describe("handleFileChange – validação de arquivo", () => {
    it("rejeita arquivo não-CSV e exibe erro", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("programas", nonCsvFileEvent());
      await nextTick();

      expect(getVm(wrapper).importStatus["programas"].status).toBe("error");
      expect(getVm(wrapper).importStatus["programas"].message).toContain("CSV");
    });

    it("exibe status 'processing' antes da resposta da API", async () => {
      let resolveImport!: (v: unknown) => void;
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }) // loadFalhas mount
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }) // loadHistorico mount
          .mockReturnValueOnce(new Promise((r) => { resolveImport = r; })),           // import (pending)
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await nextTick();

      expect(getVm(wrapper).importStatus["programas"].status).toBe("processing");

      resolveImport({ ok: true, json: async () => ({ run_id: "x", linhas_recebidas: 10 }) });
    });

    it("desativa o botão de upload enquanto está processando", async () => {
      let resolveImport!: (v: unknown) => void;
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }) // loadFalhas mount
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }) // loadHistorico mount
          .mockReturnValueOnce(new Promise((r) => { resolveImport = r; })),           // import (pending)
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await nextTick();

      const card = wrapper.findAll(".upload-card").find((c) => c.text().includes("programas.csv"));
      expect(card?.find(".upload-btn").attributes("disabled")).toBeDefined();

      resolveImport({ ok: true, json: async () => ({ run_id: "x", linhas_recebidas: 10 }) });
    });
  });

  // ── handleFileChange – tipo_esperado ────────────────────────────────────────
  describe("handleFileChange – erro tipo_esperado do backend", () => {
    it("exibe nome do arquivo esperado quando backend retorna tipo_esperado", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })  // loadFalhas mount
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })  // loadHistorico mount
          .mockResolvedValueOnce({
            ok: false, status: 400,
            json: async () => ({ error: "Arquivo incompatível", tipo_esperado: "materiais" }),
          })                                                                           // import
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })  // loadFalhas refresh
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }), // loadHistorico refresh
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("materiais", csvFileEvent("projetos.csv"));
      await flushPromises();

      const msg = getVm(wrapper).importStatus["materiais"].message ?? "";
      expect(msg).toContain("materiais.csv");
      expect(getVm(wrapper).importStatus["materiais"].status).toBe("error");
    });

    it("inclui colunas_ausentes na mensagem quando presentes junto com tipo_esperado", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({
            ok: false, status: 400,
            json: async () => ({
              error: "Arquivo incompatível",
              tipo_esperado: "materiais",
              colunas_ausentes: ["material_id", "descricao"],
            }),
          })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("materiais", csvFileEvent());
      await flushPromises();

      const msg = getVm(wrapper).importStatus["materiais"].message ?? "";
      expect(msg).toContain("materiais.csv");
      expect(msg).toContain("material_id");
      expect(msg).toContain("descricao");
    });
  });

  // ── handleFileChange – sucesso ───────────────────────────────────────────────
  describe("handleFileChange – sucesso (HTTP 200)", () => {
    it("exibe status success após resposta 200", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "abc", linhas_recebidas: 320 }) })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await flushPromises();

      expect(getVm(wrapper).importStatus["programas"].status).toBe("success");
    });

    it("exibe linhas_recebidas como recordsProcessed", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "abc", linhas_recebidas: 320 }) })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await flushPromises();

      expect(getVm(wrapper).importStatus["programas"].recordsProcessed).toBe(320);
    });

    it("chama loadFalhas após import bem-sucedido", async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "abc", linhas_recebidas: 10 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await flushPromises();

      const monitoringCalls = fetchMock.mock.calls.filter(([url]: [string]) =>
        String(url).includes("/monitoring/execucoes/"),
      );
      expect(monitoringCalls.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── handleFileChange – erros HTTP ───────────────────────────────────────────
  describe("handleFileChange – erros HTTP", () => {
    it("exibe colunas_ausentes quando a API retorna 400 com esse campo", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({
            ok: false, status: 400,
            json: async () => ({ error: "Arquivo inválido", colunas_ausentes: ["programa_id", "nome"] }),
          })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("materiais", csvFileEvent());
      await flushPromises();

      const msg = getVm(wrapper).importStatus["materiais"].message ?? "";
      expect(msg).toContain("programa_id");
      expect(msg).toContain("nome");
      expect(getVm(wrapper).importStatus["materiais"].status).toBe("error");
    });

    it("exibe mensagem genérica em resposta 400 sem colunas_ausentes", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({
            ok: false, status: 400,
            json: async () => ({ error: "Arquivo muito grande" }),
          })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("fornecedores", csvFileEvent());
      await flushPromises();

      expect(getVm(wrapper).importStatus["fornecedores"].status).toBe("error");
      expect(getVm(wrapper).importStatus["fornecedores"].message).toContain("grande");
    });

    it("exibe mensagem de erro em resposta 500", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({
            ok: false, status: 500,
            json: async () => ({ error: "Erro interno de ingestão" }),
          })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("pedidos_compras", csvFileEvent());
      await flushPromises();

      expect(getVm(wrapper).importStatus["pedidos_compras"].status).toBe("error");
      expect(getVm(wrapper).importStatus["pedidos_compras"].message).toContain("ingestão");
    });

    it("exibe erro de conexão em falha de rede", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockRejectedValueOnce(new Error("network error"))
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("tempo_tarefas", csvFileEvent());
      await flushPromises();

      expect(getVm(wrapper).importStatus["tempo_tarefas"].status).toBe("error");
      expect(getVm(wrapper).importStatus["tempo_tarefas"].message).toContain("conexão");
    });

    it("chama loadFalhas após erro HTTP", async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
        .mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: "Inválido" }) })
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await flushPromises();

      const monitoringCalls = fetchMock.mock.calls.filter(([url]: [string]) =>
        String(url).includes("/monitoring/execucoes/"),
      );
      expect(monitoringCalls.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── handleFileChange – endpoints corretos ───────────────────────────────────
  describe("handleFileChange – envia para o endpoint correto", () => {
    const cases: [string, string][] = [
      ["programas",                 "/import/programas/"],
      ["projetos",                  "/import/projetos/"],
      ["materiais",                 "/import/materiais/"],
      ["empenho_materiais",         "/import/empenho-materiais/"],
      ["estoque_materiais_projeto", "/import/estoque-materiais-projeto/"],
      ["fornecedores",              "/import/fornecedores/"],
      ["pedidos_compras",           "/import/pedidos-compra/"],
      ["solicitacoes_compra",       "/import/solicitacoes-compra/"],
      ["compras_projeto",           "/import/compras-projeto/"],
      ["tarefa_projeto",            "/import/tarefas-projeto/"],
      ["tempo_tarefas",             "/import/tempo-tarefas/"],
    ];

    cases.forEach(([key, endpoint]) => {
      it(`chama o endpoint correto para ${key}`, async () => {
        const fetchMock = vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "x", linhas_recebidas: 1 }) })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
          .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE });
        vi.stubGlobal("fetch", fetchMock);

        const wrapper = mount(Auditoria);
        await flushPromises();

        await getVm(wrapper).handleFileChange(key, csvFileEvent());
        await flushPromises();

        const importCall = fetchMock.mock.calls.find(([url]: [string]) =>
          String(url).includes(endpoint),
        );
        expect(importCall).toBeDefined();
      });
    });

    it("envia o arquivo via FormData com campo 'file'", async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "x", linhas_recebidas: 5 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE })
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("programas", csvFileEvent("programas.csv"));
      await flushPromises();

      const importCall = fetchMock.mock.calls.find(([url]: [string]) =>
        String(url).includes("/import/programas/"),
      ) as [string, RequestInit];
      expect(importCall[1].method).toBe("POST");
      expect(importCall[1].body).toBeInstanceOf(FormData);
      expect((importCall[1].body as FormData).get("file")).toBeInstanceOf(File);
    });
  });

  // ── Aba Falhas e Inconsistências ─────────────────────────────────────────────
  describe("Aba Falhas e Inconsistências", () => {
    it("exibe subtítulo da aba", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      expect(wrapper.text()).toContain("Identificação de falhas");
    });

    it("exibe cabeçalho 'Falhas Detectadas'", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      expect(wrapper.text()).toContain("Falhas Detectadas");
    });

    it("exibe colunas corretas na tabela", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      const text = wrapper.text();
      expect(text).toContain("Data/Hora");
      expect(text).toContain("Tabela");
      expect(text).toContain("Mensagem de Falha");
      expect(text).toContain("Erros");
      expect(text).toContain("Avisos");
      expect(text).toContain("Status");
    });

    it("exibe registros retornados pela API", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      expect(wrapper.text()).toContain("materiais");
      expect(wrapper.text()).toContain("fornecedores");
    });

    it("exibe badges de status corretos", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      expect(wrapper.text()).toContain("Sucesso");
      expect(wrapper.text()).toContain("Parcial");
      expect(wrapper.text()).toContain("Falha");
    });

    it("exibe estado vazio quando API retorna lista vazia", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: async () => EMPTY_EXECUCOES }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      expect(wrapper.text()).toContain("Nenhum registro encontrado");
    });

    it("exibe mensagem de erro quando API falha", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      expect(getVm(wrapper).falhasError).not.toBeNull();
    });

    it("exibe mensagem de erro em falha de rede", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      expect(getVm(wrapper).falhasError).toContain("conexão");
    });

    it("envia query param ?status= ao filtrar por status", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => EXECUCOES_RESPONSE });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).falhasFilters.status = "FAILED";
      await getVm(wrapper).loadFalhas();
      await flushPromises();

      const calls = fetchMock.mock.calls.map(([url]: [string]) => String(url));
      expect(calls.some((url) => url.includes("status=FAILED"))).toBe(true);
    });

    it("envia query params de data ao filtrar por período", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => EXECUCOES_RESPONSE });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).falhasFilters.data_inicio = "2026-01-01";
      getVm(wrapper).falhasFilters.data_fim    = "2026-12-31";
      await getVm(wrapper).loadFalhas();
      await flushPromises();

      const calls = fetchMock.mock.calls.map(([url]: [string]) => String(url));
      expect(calls.some((url) => url.includes("data_inicio=2026-01-01"))).toBe(true);
      expect(calls.some((url) => url.includes("data_fim=2026-12-31"))).toBe(true);
    });

    it("reseta para página 1 ao carregar novos dados", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).falhasPage = 3;
      await getVm(wrapper).loadFalhas();
      await flushPromises();

      expect(getVm(wrapper).falhasPage).toBe(1);
    });

    it("reseta para página 1 ao ordenar", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).falhasPage = 2;
      await nextTick();

      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      const sortHeader = wrapper.find(".falhas-table th.sort-col");
      await sortHeader.trigger("click");

      expect(getVm(wrapper).falhasPage).toBe(1);
    });

    it("mostra paginação com total de registros", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      expect(wrapper.text()).toContain("4 registros");
    });

    it("não mostra mais de 10 linhas por página", async () => {
      const manyResults = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1, run_id: `uuid-${i}`, fonte: "csv_upload", tabela: "materiais",
        tipo_processo: "COMPLETA", status: "SUCCESS" as const, linhas_processadas: 10,
        duracao_segundos: 5, erros: 0, avisos: 0,
        detalhes_falha: null,
        iniciado_em: "2026-01-01T00:00:00", finalizado_em: "2026-01-01T00:01:00",
      }));
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 15, results: manyResults }) }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[2].trigger("click");
      await nextTick();

      expect(wrapper.findAll(".falhas-table tbody tr").length).toBe(10);
    });
  });

  // ── Aba Histórico de Execuções ───────────────────────────────────────────────
  describe("Aba Histórico de Execuções", () => {
    it("exibe subtítulo da aba", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      expect(wrapper.text()).toContain("Histórico completo de execuções");
    });

    it("exibe título do card 'Execuções'", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      expect(wrapper.find(".hist-card-title").text()).toContain("Execuções");
    });

    it("exibe colunas corretas na tabela", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      const text = wrapper.find(".hist-table").text();
      expect(text).toContain("Data/Hora");
      expect(text).toContain("Tabela");
      expect(text).toContain("Tipo");
      expect(text).toContain("Fonte");
      expect(text).toContain("Duração");
      expect(text).toContain("Registros");
      expect(text).toContain("Status");
    });

    it("exibe registros retornados pela API", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      const text = wrapper.find(".hist-table").text();
      expect(text).toContain("materiais");
      expect(text).toContain("horas");
    });

    it("exibe badge 'Completa' para tipo_processo COMPLETA", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      expect(wrapper.find(".hist-table").text()).toContain("Completa");
    });

    it("exibe badge 'Incremental' para tipo_processo INCREMENTAL", async () => {
      const incResult = { ...EXECUCOES_RESPONSE.results[0], tipo_processo: "INCREMENTAL" };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 1, results: [incResult] }) }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      expect(wrapper.find(".hist-table").text()).toContain("Incremental");
    });

    it("formata duração em segundos abaixo de 60 como Xs", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      // row id=1 has duracao_segundos: 42
      expect(wrapper.find(".hist-table").text()).toContain("42s");
    });

    it("formata duração >= 60s como Xm Ys", async () => {
      const longRow = { ...EXECUCOES_RESPONSE.results[0], duracao_segundos: 90 };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 1, results: [longRow] }) }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      expect(wrapper.find(".hist-table").text()).toContain("1m 30s");
    });

    it("exibe badges de status corretos", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      const text = wrapper.find(".hist-table").text();
      expect(text).toContain("Sucesso");
      expect(text).toContain("Parcial");
      expect(text).toContain("Falha");
    });

    it("popula historicoRows com dados da API", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      expect(getVm(wrapper).historicoRows.length).toBe(4);
    });

    it("define historicoError em resposta não-ok", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      expect(getVm(wrapper).historicoError).not.toBeNull();
    });

    it("define historicoError em falha de rede", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

      const wrapper = mount(Auditoria);
      await flushPromises();

      expect(getVm(wrapper).historicoError).toContain("conexão");
    });

    it("envia query param ?status= ao filtrar por status", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => EXECUCOES_RESPONSE });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).historicoFilters.status = "FAILED";
      await getVm(wrapper).loadHistorico();
      await flushPromises();

      const calls = fetchMock.mock.calls.map(([url]: [string]) => String(url));
      expect(calls.some((url) => url.includes("status=FAILED"))).toBe(true);
    });

    it("envia query param ?tabela= ao filtrar por tabela", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => EXECUCOES_RESPONSE });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).historicoFilters.tabela = "materiais";
      await getVm(wrapper).loadHistorico();
      await flushPromises();

      const calls = fetchMock.mock.calls.map(([url]: [string]) => String(url));
      expect(calls.some((url) => url.includes("tabela=materiais"))).toBe(true);
    });

    it("envia query param ?fonte= ao filtrar por fonte", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => EXECUCOES_RESPONSE });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).historicoFilters.fonte = "csv_upload";
      await getVm(wrapper).loadHistorico();
      await flushPromises();

      const calls = fetchMock.mock.calls.map(([url]: [string]) => String(url));
      expect(calls.some((url) => url.includes("fonte=csv_upload"))).toBe(true);
    });

    it("envia query params de data ao filtrar por período", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => EXECUCOES_RESPONSE });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).historicoFilters.data_inicio = "2026-01-01";
      getVm(wrapper).historicoFilters.data_fim    = "2026-12-31";
      await getVm(wrapper).loadHistorico();
      await flushPromises();

      const calls = fetchMock.mock.calls.map(([url]: [string]) => String(url));
      expect(calls.some((url) => url.includes("data_inicio=2026-01-01"))).toBe(true);
      expect(calls.some((url) => url.includes("data_fim=2026-12-31"))).toBe(true);
    });

    it("reseta para página 1 ao carregar novos dados", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).historicoPage = 3;
      await getVm(wrapper).loadHistorico();
      await flushPromises();

      expect(getVm(wrapper).historicoPage).toBe(1);
    });

    it("reseta para página 1 ao ordenar", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).historicoPage = 2;
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      await wrapper.find(".hist-table th.sort-col").trigger("click");

      expect(getVm(wrapper).historicoPage).toBe(1);
    });

    it("mostra total de registros no card header", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      expect(wrapper.find(".hist-count").text()).toContain("4 registros");
    });

    it("exibe paginação mesmo quando há apenas 1 página", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      expect(wrapper.find(".hist-pagination").exists()).toBe(true);
    });

    it("exibe info de página na paginação", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      expect(wrapper.find(".hist-pagination").text()).toContain("página 1 de 1");
    });

    it("desativa botões de navegação quando há apenas 1 página", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      const btns = wrapper.find(".hist-pagination").findAll(".pg-btn");
      // First («), prev (‹), next (›), last (») are disabled; numbered page btn has .active
      const navBtns = [btns[0], btns[1], btns[btns.length - 2], btns[btns.length - 1]];
      navBtns.forEach((btn) => expect(btn.attributes("disabled")).toBeDefined());
      expect(btns.find((b) => b.text() === "1")?.classes()).toContain("active");
    });

    it("não mostra mais de 10 linhas por página", async () => {
      const manyResults = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1, run_id: `uuid-${i}`, fonte: "csv_upload", tabela: "materiais",
        tipo_processo: "COMPLETA", status: "SUCCESS" as const,
        linhas_processadas: 10, duracao_segundos: 5, erros: 0, avisos: 0,
        detalhes_falha: null,
        iniciado_em: "2026-01-01T00:00:00", finalizado_em: "2026-01-01T00:01:00",
      }));
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 15, results: manyResults }) }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();
      await wrapper.findAll(".tab-btn")[1].trigger("click");
      await nextTick();

      expect(wrapper.findAll(".hist-table tbody tr").length).toBe(10);
    });

    it("chama loadHistorico após import bem-sucedido", async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }) // loadFalhas mount
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }) // loadHistorico mount
        .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "abc", linhas_recebidas: 10 }) }) // import
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }) // loadFalhas refresh
        .mockResolvedValueOnce({ ok: true, json: async () => EXECUCOES_RESPONSE }); // loadHistorico refresh
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await flushPromises();

      const monitoringCalls = fetchMock.mock.calls.filter(([url]: [string]) =>
        String(url).includes("/monitoring/execucoes/"),
      );
      expect(monitoringCalls.length).toBeGreaterThanOrEqual(4);
    });
  });
});
