import { fmtCurrency } from "@/utils/format";
export { fmtCurrency };

export const FONT = "Nunito";
export const MONO = "Nunito";

export const css = (v: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export const shortName = (name: string) => name.split(" ").slice(0, 2).join(" ");

export const COLORS = {
  blue:        "rgba(77,143,255,0.85)",
  green:       "rgba(45,212,160,0.85)",
  amber:       "rgba(245,166,35,0.85)",
  red:         "rgba(245,90,90,0.85)",
  blueSolid:   "#4d8fff",
  greenSolid:  "#2dd4a0",
  amberSolid:  "#f59e0b",
  purpleSolid: "#9b7fff",
} as const;

export function tooltipBase(borderWidth = 1) {
  return {
    backgroundColor: css("--bg3"),
    borderColor:     css("--border"),
    borderWidth,
    titleColor:      css("--text"),
    bodyColor:       css("--text2"),
    titleFont:       { family: FONT, size: 12 },
    bodyFont:        { family: MONO, size: 12 },
    padding:         10,
  };
}

export function baseOptions(indexAxis: "x" | "y" = "y", tooltipBorderWidth = 1) {
  return {
    indexAxis,
    responsive:           true,
    maintainAspectRatio:  false,
    animation:            { duration: 500, easing: "easeOutQuart" as const },
    plugins: {
      legend:  { display: false as const },
      tooltip: tooltipBase(tooltipBorderWidth),
    },
  };
}

export function groupBy<T>(
  data: T[],
  keyFn: (r: T) => string,
  valFn: (r: T) => number,
): [string, number][] {
  const map: Record<string, number> = {};
  data.forEach((r) => {
    const k = keyFn(r);
    map[k] = (map[k] || 0) + valFn(r);
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export function useChartsBase() {
  return { css, fmtCurrency, shortName, baseOptions, tooltipBase, groupBy, COLORS };
}
