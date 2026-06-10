import * as XLSX from 'xlsx'

type ExportRow = Record<string, unknown>

function toCsvValue(value: unknown): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function downloadFile(href: string, filename: string, cleanup?: () => void): void {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  cleanup?.()
}

export function useExport() {
  function exportCSV(rows: ExportRow[], filename: string): void {
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const dataRows = rows.map(r => headers.map(h => toCsvValue(r[h])).join(','))
    const csv = [headers.join(','), ...dataRows].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    downloadFile(url, filename.endsWith('.csv') ? filename : `${filename}.csv`, () => URL.revokeObjectURL(url))
  }

  function exportExcel(rows: ExportRow[], filename: string, sheetName: string): void {
    if (!rows.length) return
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
  }

  return { exportCSV, exportExcel }
}
