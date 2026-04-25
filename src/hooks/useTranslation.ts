import { useState, useCallback, useEffect, useRef } from 'react'
import { translate } from '../lib/translator'
import { useSettingsStore } from '../store/settingsStore'

export interface SelectionInfo { text: string; x: number; y: number }

export interface TranslationState {
  selection:       SelectionInfo | null
  result:          string | null
  isLoading:       boolean
  error:           string | null
  hideTranslation: () => void
}

export function useTranslation(): TranslationState {
  const lang = useSettingsStore(s => s.translationLang)

  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const [result,    setResult]    = useState<string | null>(null)
  const [isLoading, setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const pendingRef = useRef<string>('')

  const hideTranslation = useCallback(() => {
    setSelection(null); setResult(null); setError(null)
    pendingRef.current = ''
  }, [])

  const doTranslate = useCallback(async (text: string) => {
    pendingRef.current = text
    setLoading(true); setResult(null); setError(null)
    try {
      const out = await translate(text, 'de', lang)
      if (pendingRef.current === text) setResult(out)
    } catch (e) {
      if (pendingRef.current === text)
        setError(e instanceof Error ? e.message : 'Translation failed')
    } finally {
      if (pendingRef.current === text) setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('[data-no-translate]')) return

      setTimeout(() => {
        const sel  = window.getSelection()
        const text = sel?.toString().trim() ?? ''
        if (!text || text.length > 400 || text.length < 2) return

        const range = sel?.getRangeAt(0)
        const rect  = range?.getBoundingClientRect()
        if (!rect) return

        const x = rect.left + rect.width / 2 + window.scrollX
        const y = rect.top + window.scrollY
        setSelection({ text, x, y })
        doTranslate(text)
      }, 20)
    }

    document.addEventListener('mouseup', onMouseUp)
    return () => document.removeEventListener('mouseup', onMouseUp)
  }, [doTranslate])

  // Re-translate if target language changes while tooltip is open
  useEffect(() => {
    if (selection) doTranslate(selection.text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  return { selection, result, isLoading, error, hideTranslation }
}
