import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '../types'

interface ThemeState {
  theme: Theme
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark' as Theme,
      toggle: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'gc-theme' },
  ),
)
