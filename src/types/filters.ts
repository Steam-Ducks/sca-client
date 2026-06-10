export type SelectOption = string | { value: string; label: string }

export interface SelectFieldDef {
  key: string
  label: string
  placeholder: string
  options: SelectOption[]
  testid?: string
  disabled?: boolean
}

export interface DateFieldDef {
  key: string
  label: string
  testid?: string
}

export interface TextFieldDef {
  key: string
  label: string
  placeholder: string
  testid?: string
}