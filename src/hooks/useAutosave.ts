import { useEffect } from 'react'
import { useTopicsStore } from '../store/topicsStore'
import { useSettingsStore } from '../store/settingsStore'

export function useAutosave() {
  const saveAllDirty = useTopicsStore(s => s.saveAllDirty)
  const dirtySize    = useTopicsStore(s => s.dirtyIds.size)
  const { autosaveEnabled, autosaveInterval } = useSettingsStore()

  useEffect(() => {
    if (!autosaveEnabled) return
    const ms = autosaveInterval * 1000
    const id = window.setInterval(() => {
      if (dirtySize > 0) saveAllDirty()
    }, ms)
    return () => clearInterval(id)
  }, [saveAllDirty, dirtySize, autosaveEnabled, autosaveInterval])
}
