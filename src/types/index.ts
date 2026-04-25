export interface Column {
  id: string
  label: string
  content: string
  isDefault: boolean
  order: number
  color: ColumnColor
}

export type ColumnColor =
  | 'gold'
  | 'blue'
  | 'purple'
  | 'green'
  | 'red'
  | 'teal'
  | 'orange'
  | 'pink'

export interface Topic {
  id: string
  user_id: string
  title: string
  description: string
  is_public: boolean
  columns: Column[]
  created_at: string
  updated_at: string
}

export type TranslationLang = 'ru' | 'en' | 'uk' | 'pl' | 'fr' | 'es'

export interface AppSettings {
  translationLang: TranslationLang
  autosaveEnabled: boolean
  autosaveInterval: number
}

export type Theme = 'light' | 'dark'

export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    name?: string
  }
}
