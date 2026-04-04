export type Categoria = 'Hardware' | 'Storage' | 'Cloud' | 'Segurança' | 'Software' | 'Rede'

export type Status = 'Ativo' | 'Inativo' | 'Pendente'

export interface Material {
  id: number
  material: string
  projeto: string
  programa: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  periodo: string
  fornecedor: string
  categoria: Categoria
  status: Status
  area: string
}

export interface Filters {
  periodo: string
  programa: string
  projeto: string
  categoria: string
  status: string
  area: string
  search: string
}

export type SortKey = keyof Material
export type SortDir = 1 | -1
