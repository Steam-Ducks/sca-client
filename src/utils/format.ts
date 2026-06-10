// ─── Currency ─────────────────────────────────────────────────────────────────

/** Full BRL format: "R$ 1.234,56" — for tables and cards. */
export function fmtBRL(v: number): string {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

/** Abbreviated BRL for chart axes/tooltips: "R$ 1.2M", "R$ 950K", "R$ 800". */
export function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`
  return 'R$ ' + v.toLocaleString('pt-BR')
}

// ─── Percentage ───────────────────────────────────────────────────────────────

/** Format a number as a percentage string: "12.5%" */
export function fmtPercent(v: number, decimals = 1): string {
  return `${v.toFixed(decimals)}%`
}

// ─── Hours ────────────────────────────────────────────────────────────────────

/** Format hours with two decimal places and "h" suffix: "8.50h" */
export function fmtHours(v: number): string {
  return `${v.toFixed(2)}h`
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/** Format an ISO date string as pt-BR short date + time: "09/06/2026 13:45" */
export function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

/** Truncate an ISO datetime string to "YYYY-MM-DD HH:MM:SS", or "—" if empty. */
export function fmtISODate(iso: string): string {
  return iso ? iso.replace('T', ' ').slice(0, 19) : '—'
}

// ─── Duration ─────────────────────────────────────────────────────────────────

/** Format a duration in seconds: "3m 45s", "30s", or "—" for null. */
export function fmtDuration(seconds: number | null): string {
  if (seconds === null) return '—'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}
