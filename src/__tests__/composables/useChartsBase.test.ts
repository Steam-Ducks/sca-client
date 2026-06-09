import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  FONT,
  MONO,
  COLORS,
  css,
  fmtCurrency,
  shortName,
  groupBy,
  tooltipBase,
  baseOptions,
  useChartsBase,
} from "@/composables/useChartsBase";

// Mock getComputedStyle para retornar valores CSS de teste
const mockCssValue = (prop: string) => {
  const values: Record<string, string> = {
    "--bg3":    "#1e2030",
    "--border": "#2e3148",
    "--text":   "#e4e4e7",
    "--text2":  "#a1a1aa",
    "--text3":  "#71717a",
  };
  return values[prop] ?? "";
};

beforeEach(() => {
  vi.stubGlobal(
    "getComputedStyle",
    () => ({ getPropertyValue: (v: string) => ` ${mockCssValue(v)}` }),
  );
});

// ─── fmtCurrency ──────────────────────────────────────────────────────────────
describe("fmtCurrency", () => {
  it("formata valores abaixo de 1.000 com localização pt-BR", () => {
    expect(fmtCurrency(500)).toBe("R$ 500");
  });

  it("formata valores entre 1.000 e 999.999 com sufixo K", () => {
    expect(fmtCurrency(1_000)).toBe("R$ 1K");
    expect(fmtCurrency(45_300)).toBe("R$ 45K");
    expect(fmtCurrency(999_999)).toBe("R$ 1000K");
  });

  it("formata valores acima de 1.000.000 com sufixo M e uma casa decimal", () => {
    expect(fmtCurrency(1_000_000)).toBe("R$ 1.0M");
    expect(fmtCurrency(2_500_000)).toBe("R$ 2.5M");
  });
});

// ─── shortName ────────────────────────────────────────────────────────────────
describe("shortName", () => {
  it("retorna as duas primeiras palavras de um nome longo", () => {
    expect(shortName("Parafuso Sextavado M8 Inox")).toBe("Parafuso Sextavado");
  });

  it("retorna o nome completo quando tem apenas uma palavra", () => {
    expect(shortName("Aço")).toBe("Aço");
  });

  it("retorna as duas primeiras palavras quando tem exatamente duas", () => {
    expect(shortName("Chapa Aço")).toBe("Chapa Aço");
  });
});

// ─── groupBy ──────────────────────────────────────────────────────────────────
describe("groupBy", () => {
  const data = [
    { programa: "Alpha", custo: 100 },
    { programa: "Beta",  custo: 300 },
    { programa: "Alpha", custo: 200 },
    { programa: "Beta",  custo: 50  },
  ];

  it("agrupa corretamente somando valores por chave", () => {
    const result = groupBy(data, (r) => r.programa, (r) => r.custo);
    const map = Object.fromEntries(result);
    expect(map["Alpha"]).toBe(300);
    expect(map["Beta"]).toBe(350);
  });

  it("ordena em ordem decrescente por valor", () => {
    const result = groupBy(data, (r) => r.programa, (r) => r.custo);
    expect(result[0][0]).toBe("Beta");
    expect(result[1][0]).toBe("Alpha");
  });

  it("retorna array de tuplas [string, number]", () => {
    const result = groupBy(data, (r) => r.programa, (r) => r.custo);
    expect(Array.isArray(result)).toBe(true);
    result.forEach(([key, val]) => {
      expect(typeof key).toBe("string");
      expect(typeof val).toBe("number");
    });
  });

  it("retorna array vazio para dados vazios", () => {
    expect(groupBy([], (r: { k: string }) => r.k, () => 0)).toEqual([]);
  });
});

// ─── COLORS ───────────────────────────────────────────────────────────────────
describe("COLORS", () => {
  it("possui todas as cores rgba definidas", () => {
    expect(COLORS.blue).toMatch(/^rgba/);
    expect(COLORS.green).toMatch(/^rgba/);
    expect(COLORS.amber).toMatch(/^rgba/);
    expect(COLORS.red).toMatch(/^rgba/);
  });

  it("possui todas as cores sólidas definidas", () => {
    expect(COLORS.blueSolid).toMatch(/^#/);
    expect(COLORS.greenSolid).toMatch(/^#/);
    expect(COLORS.amberSolid).toMatch(/^#/);
    expect(COLORS.purpleSolid).toMatch(/^#/);
  });
});

// ─── tooltipBase ──────────────────────────────────────────────────────────────
describe("tooltipBase", () => {
  it("retorna borderWidth padrão 1", () => {
    const t = tooltipBase();
    expect(t.borderWidth).toBe(1);
  });

  it("aceita borderWidth customizado", () => {
    const t = tooltipBase(0);
    expect(t.borderWidth).toBe(0);
  });

  it("usa --text para titleColor e --text2 para bodyColor", () => {
    const t = tooltipBase();
    expect(t.titleColor).toContain(mockCssValue("--text"));
    expect(t.bodyColor).toContain(mockCssValue("--text2"));
  });

  it("possui todas as propriedades esperadas", () => {
    const t = tooltipBase();
    expect(t).toMatchObject({
      backgroundColor: expect.any(String),
      borderColor:     expect.any(String),
      padding:         10,
      titleFont:       { family: FONT, size: 12 },
      bodyFont:        { family: MONO, size: 12 },
    });
  });
});

// ─── baseOptions ──────────────────────────────────────────────────────────────
describe("baseOptions", () => {
  it("usa indexAxis 'y' como padrão", () => {
    expect(baseOptions().indexAxis).toBe("y");
  });

  it("aceita indexAxis 'x'", () => {
    expect(baseOptions("x").indexAxis).toBe("x");
  });

  it("inclui responsive e maintainAspectRatio corretos", () => {
    const opts = baseOptions();
    expect(opts.responsive).toBe(true);
    expect(opts.maintainAspectRatio).toBe(false);
  });

  it("inclui animação de 500ms com easeOutQuart", () => {
    const opts = baseOptions();
    expect(opts.animation).toEqual({ duration: 500, easing: "easeOutQuart" });
  });

  it("oculta a legenda por padrão", () => {
    expect(baseOptions().plugins.legend.display).toBe(false);
  });

  it("repassa tooltipBorderWidth para o tooltip interno", () => {
    expect(baseOptions("y", 0).plugins.tooltip.borderWidth).toBe(0);
    expect(baseOptions("y", 1).plugins.tooltip.borderWidth).toBe(1);
  });
});

// ─── css ──────────────────────────────────────────────────────────────────────
describe("css", () => {
  it("lê a variável CSS do documentElement e remove espaços", () => {
    const result = css("--text");
    expect(result).toBe(mockCssValue("--text"));
  });
});

// ─── useChartsBase ────────────────────────────────────────────────────────────
describe("useChartsBase", () => {
  it("exporta todas as utilidades esperadas", () => {
    const base = useChartsBase();
    expect(typeof base.css).toBe("function");
    expect(typeof base.fmtCurrency).toBe("function");
    expect(typeof base.shortName).toBe("function");
    expect(typeof base.baseOptions).toBe("function");
    expect(typeof base.tooltipBase).toBe("function");
    expect(typeof base.groupBy).toBe("function");
    expect(base.COLORS).toBeDefined();
  });
});
