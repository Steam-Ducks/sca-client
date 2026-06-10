import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn().mockReturnValue({}),
    book_new: vi.fn().mockReturnValue({}),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}))

import * as XLSX from 'xlsx'
import { useExport } from '@/composables/useExport'

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsText(blob)
  })
}

const mockUrl = 'blob:mock-url'
const revokeMock = vi.fn()
const appendMock = vi.fn()
const removeMock = vi.fn()
const clickMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  const anchor = { href: '', download: '', click: clickMock } as unknown as HTMLAnchorElement
  vi.spyOn(document, 'createElement').mockReturnValue(anchor)
  vi.spyOn(document.body, 'appendChild').mockImplementation(appendMock)
  vi.spyOn(document.body, 'removeChild').mockImplementation(removeMock)

  globalThis.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl)
  globalThis.URL.revokeObjectURL = revokeMock
})

describe('useExport', () => {
  describe('exportCSV', () => {
    it('does nothing when rows is empty', () => {
      const { exportCSV } = useExport()
      exportCSV([], 'test')
      expect(clickMock).not.toHaveBeenCalled()
    })

    it('triggers download with .csv extension when not provided', () => {
      const { exportCSV } = useExport()
      const anchor = document.createElement('a') as unknown as { download: string }
      exportCSV([{ Nome: 'João' }], 'relatorio')
      expect(anchor.download).toBe('relatorio.csv')
      expect(clickMock).toHaveBeenCalled()
    })

    it('keeps .csv extension when already provided', () => {
      const { exportCSV } = useExport()
      const anchor = document.createElement('a') as unknown as { download: string }
      exportCSV([{ Nome: 'João' }], 'relatorio.csv')
      expect(anchor.download).toBe('relatorio.csv')
    })

    it('revokes object URL after download', () => {
      const { exportCSV } = useExport()
      exportCSV([{ Nome: 'João' }], 'relatorio')
      expect(revokeMock).toHaveBeenCalledWith(mockUrl)
    })

    it('uses object keys as CSV headers', () => {
      const { exportCSV } = useExport()
      exportCSV([{ Projeto: 'P1', Programa: 'A' }], 'test')
      const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob
      expect(blob).toBeInstanceOf(Blob)
    })

    it('escapes values containing commas', async () => {
      const { exportCSV } = useExport()
      exportCSV([{ Nome: 'João, Silva' }], 'test')
      const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob
      const text = await readBlob(blob)
      expect(text).toContain('"João, Silva"')
    })

    it('escapes values containing double quotes', async () => {
      const { exportCSV } = useExport()
      exportCSV([{ Nome: 'diz "olá"' }], 'test')
      const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob
      const text = await readBlob(blob)
      expect(text).toContain('"diz ""olá"""')
    })

    it('handles null and undefined values as empty string', async () => {
      const { exportCSV } = useExport()
      exportCSV([{ A: null, B: undefined, C: 'ok' }], 'test')
      const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob
      const text = await readBlob(blob)
      expect(text).toContain(',,ok')
    })
  })

  describe('exportExcel', () => {
    it('does nothing when rows is empty', () => {
      const { exportExcel } = useExport()
      exportExcel([], 'test', 'Sheet')
      expect(XLSX.utils.json_to_sheet).not.toHaveBeenCalled()
    })

    it('calls XLSX utilities with correct arguments', () => {
      const { exportExcel } = useExport()
      const rows = [{ Projeto: 'P1' }]
      exportExcel(rows, 'relatorio', 'Minha Planilha')
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(rows)
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(expect.anything(), expect.anything(), 'Minha Planilha')
    })

    it('adds .xlsx extension when not provided', () => {
      const { exportExcel } = useExport()
      exportExcel([{ A: 1 }], 'relatorio', 'Sheet')
      expect(XLSX.writeFile).toHaveBeenCalledWith(expect.anything(), 'relatorio.xlsx')
    })

    it('keeps .xlsx extension when already provided', () => {
      const { exportExcel } = useExport()
      exportExcel([{ A: 1 }], 'relatorio.xlsx', 'Sheet')
      expect(XLSX.writeFile).toHaveBeenCalledWith(expect.anything(), 'relatorio.xlsx')
    })
  })
})
