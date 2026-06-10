import { describe, expect, it } from 'vitest'
import { buildQueryString } from '@/utils/queryBuilder'

describe('buildQueryString', () => {
  it('returns empty string for empty object', () => {
    expect(buildQueryString({})).toBe('')
  })

  it('returns empty string when all values are undefined', () => {
    expect(buildQueryString({ periodo: undefined, programa: undefined })).toBe('')
  })

  it('returns empty string when all values are null', () => {
    expect(buildQueryString({ periodo: null, programa: null })).toBe('')
  })

  it('returns empty string when all values are empty string', () => {
    expect(buildQueryString({ periodo: '', programa: '' })).toBe('')
  })

  it('builds query string with a single param', () => {
    expect(buildQueryString({ periodo: '2024-01' })).toBe('?periodo=2024-01')
  })

  it('builds query string with multiple params', () => {
    const result = buildQueryString({ periodo: '2024-01', programa: 'PROG-A' })
    expect(result).toBe('?periodo=2024-01&programa=PROG-A')
  })

  it('skips undefined values and includes defined ones', () => {
    const result = buildQueryString({ periodo: '2024-01', programa: undefined, projeto: 'P1' })
    expect(result).toBe('?periodo=2024-01&projeto=P1')
  })

  it('skips null values and includes defined ones', () => {
    const result = buildQueryString({ periodo: null, programa: 'PROG-B' })
    expect(result).toBe('?programa=PROG-B')
  })

  it('skips empty string values and includes defined ones', () => {
    const result = buildQueryString({ periodo: '', programa: 'PROG-C' })
    expect(result).toBe('?programa=PROG-C')
  })

  it('encodes special characters in values', () => {
    const result = buildQueryString({ search: 'cabo & fio' })
    expect(result).toBe('?search=cabo+%26+fio')
  })

  it('supports all filter keys used across services', () => {
    const result = buildQueryString({
      periodo: '2024-01',
      programa: 'PROG-A',
      projeto: 'P1',
      categoria: 'CAT-1',
      fornecedor: 'Fornecedor X',
      status: 'ativo',
    })
    expect(result).toContain('periodo=2024-01')
    expect(result).toContain('programa=PROG-A')
    expect(result).toContain('projeto=P1')
    expect(result).toContain('categoria=CAT-1')
    expect(result).toContain('fornecedor=Fornecedor+X')
    expect(result).toContain('status=ativo')
    expect(result.startsWith('?')).toBe(true)
  })
})
