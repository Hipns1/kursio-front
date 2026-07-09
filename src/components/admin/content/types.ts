export type EditableBlock =
  | { t: 'p'; v: string }
  | { t: 'code'; v: string; lang?: string }
  | { t: 'cmp'; ts: string; cs: string }
  | { t: 'tip'; v: string }
  | { t: 'list'; items: string[] }

export interface ExForm {
  exerciseType?: string
  question?: string
  code?: string
  options?: string[]
  correct?: number
  keywords?: string[]
  blanks?: string[]
  explanation?: string
}
