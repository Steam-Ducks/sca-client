import { describe, expect, it } from 'vitest'
import {
  fmtBRL,
  fmtCurrency,
  fmtPercent,
  fmtHours,
  fmtDateTime,
  fmtISODate,
  fmtDuration,
} from '@/utils/format'

describe('fmtBRL', () => {
  it('formats integer with two decimal places', () => {
    expect(fmtBRL(1000)).toBe('R$ 1.000,00')
  })

  it('formats decimal value', () => {
    expect(fmtBRL(1234.56)).toBe('R$ 1.234,56')
  })

  it('formats zero', () => {
    expect(fmtBRL(0)).toBe('R$ 0,00')
  })

  it('formats large value with thousand separator', () => {
    expect(fmtBRL(1234567.89)).toBe('R$ 1.234.567,89')
  })
})

describe('fmtCurrency', () => {
  it('abbreviates millions', () => {
    expect(fmtCurrency(1_500_000)).toBe('R$ 1.5M')
  })

  it('abbreviates thousands', () => {
    expect(fmtCurrency(950_000)).toBe('R$ 950K')
  })

  it('formats values below 1000 with toLocaleString', () => {
    expect(fmtCurrency(800)).toBe('R$ 800')
  })

  it('uses M threshold at exactly 1_000_000', () => {
    expect(fmtCurrency(1_000_000)).toBe('R$ 1.0M')
  })

  it('uses K threshold at exactly 1_000', () => {
    expect(fmtCurrency(1_000)).toBe('R$ 1K')
  })
})

describe('fmtPercent', () => {
  it('formats with 1 decimal place by default', () => {
    expect(fmtPercent(12.5)).toBe('12.5%')
  })

  it('rounds to specified decimal places', () => {
    expect(fmtPercent(12.567, 2)).toBe('12.57%')
  })

  it('formats zero', () => {
    expect(fmtPercent(0)).toBe('0.0%')
  })

  it('formats 100', () => {
    expect(fmtPercent(100)).toBe('100.0%')
  })

  it('respects zero decimals', () => {
    expect(fmtPercent(33.7, 0)).toBe('34%')
  })
})

describe('fmtHours', () => {
  it('formats with two decimal places and h suffix', () => {
    expect(fmtHours(8.5)).toBe('8.50h')
  })

  it('formats zero', () => {
    expect(fmtHours(0)).toBe('0.00h')
  })

  it('formats whole number', () => {
    expect(fmtHours(40)).toBe('40.00h')
  })
})

describe('fmtDateTime', () => {
  it('formats ISO date as pt-BR short date and time', () => {
    const result = fmtDateTime('2026-06-09T13:45:00')
    expect(result).toMatch(/09\/06\/2026/)
    expect(result).toMatch(/13:45/)
  })
})

describe('fmtISODate', () => {
  it('replaces T separator with space and slices to 19 chars', () => {
    expect(fmtISODate('2026-06-09T13:45:30.000Z')).toBe('2026-06-09 13:45:30')
  })

  it('returns "—" for empty string', () => {
    expect(fmtISODate('')).toBe('—')
  })
})

describe('fmtDuration', () => {
  it('returns "—" for null', () => {
    expect(fmtDuration(null)).toBe('—')
  })

  it('formats seconds below 60', () => {
    expect(fmtDuration(30)).toBe('30s')
  })

  it('formats minutes and seconds', () => {
    expect(fmtDuration(185)).toBe('3m 5s')
  })

  it('formats exactly 60 seconds as 1m 0s', () => {
    expect(fmtDuration(60)).toBe('1m 0s')
  })

  it('formats zero seconds', () => {
    expect(fmtDuration(0)).toBe('0s')
  })
})
