import type { Column, ColumnColor, TranslationLang } from '../types'

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'thema',           label: 'Thema',                          content: '', isDefault: true, order: 0, color: 'gold'   },
  { id: 'beispiele',       label: 'Beispiele, Fälle, Situationen',  content: '', isDefault: true, order: 1, color: 'blue'   },
  { id: 'gruende',         label: 'Gründe / Ursachen',              content: '', isDefault: true, order: 2, color: 'purple' },
  { id: 'vorteile',        label: 'Vorteile / Argumente dafür',     content: '', isDefault: true, order: 3, color: 'green'  },
  { id: 'nachteile',       label: 'Nachteile / Argumente dagegen',  content: '', isDefault: true, order: 4, color: 'red'    },
  { id: 'andere_aspekte',  label: 'Andere Aspekte des Themas',      content: '', isDefault: true, order: 5, color: 'teal'   },
  { id: 'mein_standpunkt', label: 'Mein Standpunkt',                content: '', isDefault: true, order: 6, color: 'orange' },
]

export const COLUMN_COLORS: Record<ColumnColor, string> = {
  gold:   '#d4a853',
  blue:   '#4a90d9',
  purple: '#9b59b6',
  green:  '#27ae60',
  red:    '#e74c3c',
  teal:   '#1abc9c',
  orange: '#e67e22',
  pink:   '#e91e8c',
}

export const COLUMN_COLOR_NAMES: Record<ColumnColor, string> = {
  gold:   'Gold',
  blue:   'Blau',
  purple: 'Lila',
  green:  'Grün',
  red:    'Rot',
  teal:   'Türkis',
  orange: 'Orange',
  pink:   'Rosa',
}

export const TRANSLATION_LANGS: { value: TranslationLang; label: string }[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
]

export const GUEST_USER_ID = 'guest'
