import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Auditoria from "@/views/Auditoria.vue";

// ── API fixture ───────────────────────────────────────────────────────────────
const API_ROWS = [
  {
    id: 1, operation: "INGEST", status: "SUCCESS",
    table_schema: "bronze", table_name: "materiais",
    affected_rows: 150, started_at: "2026-03-11T23:00:00Z",
    finalized_at: "2026-03-11T23:45:00Z", operation_metadata: {},
  },
  {
    id: 2, operation: "TRANSFORM", status: "SUCCESS",
    table_schema: "silver", table_name: "horas",
    affected_rows: 80, started_at: "2026-03-10T23:00:00Z",
    finalized_at: "2026-03-10T23:42:00Z", operation_metadata: {},
  },
  {
    id: 3, operation: "INGEST", status: "PARTIAL",
    table_schema: "bronze", table_name: "fornecedores",
    affected_rows: 5, started_at: "2026-03-09T23:00:00Z",
    finalized_at: "2026-03-09T23:38:00Z", operation_metadata: {},
  },
  {
    id: 4, operation: "EXPORT", status: "FAILED",
    table_schema: null, table_name: null,
    affected_rows: 0, started_at: "2026-03-06T23:00:00Z",
    finalized_at: "2026-03-06T23:05:00Z", operation_metadata: {},
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
interface VmType {
  activeTab: string;
  importStatus: Record<string, { status: string; message?: string; recordsProcessed?: number }>;
  tableData: { id: number; status: string }[];
  kpis: { concluidas: number; parciais: number; falhas: number };
  handleFileChange: (key: string, event: Event) => Promise<void>;
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

function mockFetch(status: number, body: object) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => body }),
  );
}

// ── Suite ─────────────────────────────────────────────────────────────────────
describe("Auditoria.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => API_ROWS }),
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

    it("renderiza as 4 abas de navegação", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      const tabs = wrapper.findAll(".tab-btn");
      expect(tabs.length).toBe(4);
      expect(tabs[0].text()).toContain("Importação de Dados");
      expect(tabs[1].text()).toContain("Histórico de Execuções");
      expect(tabs[2].text()).toContain("Falhas e Inconsistências");
      expect(tabs[3].text()).toContain("Rastreabilidade");
    });

    it("abre na aba Importação de Dados por padrão", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(getVm(wrapper).activeTab).toBe("importacao");
      expect(wrapper.find(".tab-btn.active").text()).toContain("Importação de Dados");
    });
  });

  // ── KPIs via API ────────────────────────────────────────────────────────────
  describe("KPIs carregados da API", () => {
    it("busca dados da API no mount", async () => {
      mount(Auditoria);
      await flushPromises();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/audit/"));
    });

    it("computa concluídas a partir dos registros SUCCESS", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      expect(getVm(wrapper).kpis.concluidas).toBe(2);
    });

    it("computa parciais a partir dos registros PARTIAL", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      expect(getVm(wrapper).kpis.parciais).toBe(1);
    });

    it("computa falhas a partir dos registros FAILED", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      expect(getVm(wrapper).kpis.falhas).toBe(1);
    });

    it("exibe total de cargas igual ao total de registros da API", async () => {
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      expect(getVm(wrapper).tableData.length).toBe(4);
    });

    it("mantém dados existentes se a API falhar", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      expect(getVm(wrapper).tableData.length).toBe(0);
    });

    it("não atualiza tableData se /audit/ retornar status não-ok", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
      );
      const wrapper = mount(Auditoria);
      await flushPromises();
      await nextTick();

      expect(getVm(wrapper).tableData.length).toBe(0);
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

    it("troca para Rastreabilidade ao clicar na aba", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      await wrapper.findAll(".tab-btn")[3].trigger("click");

      expect(getVm(wrapper).activeTab).toBe("rastreabilidade");
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

    it("renderiza card para programas.csv", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(wrapper.text()).toContain("programas.csv");
    });

    it("renderiza todos os 11 cards de upload", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      expect(wrapper.findAll(".upload-card").length).toBe(11);
    });

    it("todos os botões de upload exibem 'Selecionar Arquivo' inicialmente", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      const btns = wrapper.findAll(".upload-btn");
      btns.forEach((btn) => expect(btn.text()).toContain("Selecionar Arquivo"));
    });

    it("todos os inputs aceitam apenas .csv", async () => {
      const wrapper = mount(Auditoria);
      await nextTick();

      const inputs = wrapper.findAll("input[type='file']");
      inputs.forEach((input) => expect(input.attributes("accept")).toBe(".csv"));
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
      let resolveResponse!: (v: unknown) => void;
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockReturnValueOnce(new Promise((r) => { resolveResponse = r; })),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await nextTick();

      expect(getVm(wrapper).importStatus["programas"].status).toBe("processing");

      resolveResponse({ ok: true, json: async () => ({ run_id: "x", tabela: "programas", linhas_recebidas: 10 }) });
    });

    it("desativa o botão de upload enquanto está processando", async () => {
      let resolveResponse!: (v: unknown) => void;
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockReturnValueOnce(new Promise((r) => { resolveResponse = r; })),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await nextTick();

      const card = wrapper.findAll(".upload-card")
        .find((c) => c.text().includes("programas.csv"));
      expect(card?.find(".upload-btn").attributes("disabled")).toBeDefined();

      resolveResponse({ ok: true, json: async () => ({ run_id: "x", tabela: "programas", linhas_recebidas: 10 }) });
    });
  });

  // ── handleFileChange – resposta 200 ─────────────────────────────────────────
  describe("handleFileChange – sucesso (HTTP 200)", () => {
    it("exibe status success após resposta 200", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "abc", tabela: "programas", linhas_recebidas: 320 }) }),
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
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "abc", tabela: "programas", linhas_recebidas: 320 }) }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("programas", csvFileEvent());
      await flushPromises();

      expect(getVm(wrapper).importStatus["programas"].recordsProcessed).toBe(320);
    });

    it("exibe mensagem de sucesso", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "abc", tabela: "projetos", linhas_recebidas: 50 }) }),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("projetos", csvFileEvent());
      await flushPromises();

      expect(getVm(wrapper).importStatus["projetos"].message).toContain("sucesso");
    });
  });

  // ── handleFileChange – erros HTTP ───────────────────────────────────────────
  describe("handleFileChange – erros HTTP", () => {
    it("exibe colunas_ausentes quando a API retorna 400 com esse campo", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockResolvedValueOnce({
            ok: false, status: 400,
            json: async () => ({ error: "Arquivo inválido", colunas_ausentes: ["programa_id", "nome"] }),
          }),
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

    it("exibe mensagem de error genérico em resposta 400 sem colunas_ausentes", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockResolvedValueOnce({
            ok: false, status: 400,
            json: async () => ({ error: "Arquivo muito grande" }),
          }),
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
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockResolvedValueOnce({
            ok: false, status: 500,
            json: async () => ({ error: "Erro interno de ingestão" }),
          }),
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
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockRejectedValueOnce(new Error("network error")),
      );

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("tempo_tarefas", csvFileEvent());
      await flushPromises();

      expect(getVm(wrapper).importStatus["tempo_tarefas"].status).toBe("error");
      expect(getVm(wrapper).importStatus["tempo_tarefas"].message).toContain("conexão");
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
          .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "x", tabela: key, linhas_recebidas: 1 }) });
        vi.stubGlobal("fetch", fetchMock);

        const wrapper = mount(Auditoria);
        await flushPromises();

        await getVm(wrapper).handleFileChange(key, csvFileEvent());
        await flushPromises();

        const uploadCall = fetchMock.mock.calls[1];
        expect(uploadCall[0]).toContain(endpoint);
      });
    });

    it("envia o arquivo via FormData com campo 'file'", async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => API_ROWS })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "x", tabela: "programas", linhas_recebidas: 5 }) });
      vi.stubGlobal("fetch", fetchMock);

      const wrapper = mount(Auditoria);
      await flushPromises();

      await getVm(wrapper).handleFileChange("programas", csvFileEvent("programas.csv"));
      await flushPromises();

      const [, options] = fetchMock.mock.calls[1] as [string, RequestInit];
      expect(options.method).toBe("POST");
      expect(options.body).toBeInstanceOf(FormData);
      expect((options.body as FormData).get("file")).toBeInstanceOf(File);
    });
  });
});
