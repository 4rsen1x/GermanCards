import type { Topic, AppSettings } from '../types'

const KEYS = {
  topics:   'gc_topics',
  dirty:    'gc_dirty',
  settings: 'gc_settings',
}

const DEFAULT_SETTINGS: AppSettings = {
  translationLang: 'ru',
  autosaveEnabled: true,
  autosaveInterval: 30,
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded — silently ignore
  }
}

export const storage = {
  getTopics:    ()             => read<Topic[]>   (KEYS.topics,   []),
  saveTopics:   (t: Topic[])   => write(KEYS.topics, t),

  getDirtyIds:  ()             => new Set<string>(read<string[]>(KEYS.dirty, [])),
  saveDirtyIds: (ids: Set<string>) => write(KEYS.dirty, [...ids]),

  getSettings:  ()              => ({ ...DEFAULT_SETTINGS, ...read<Partial<AppSettings>>(KEYS.settings, {}) }),
  saveSettings: (s: AppSettings) => write(KEYS.settings, s),
}
