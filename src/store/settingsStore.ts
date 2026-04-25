import { create } from 'zustand'
import { storage } from '../lib/storage'
import type { AppSettings } from '../types'

interface SettingsState extends AppSettings {
  set: (patch: Partial<AppSettings>) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...storage.getSettings(),
  set: (patch) => {
    set((s) => {
      const next = { ...s, ...patch }
      storage.saveSettings(next)
      return next
    })
  },
}))
