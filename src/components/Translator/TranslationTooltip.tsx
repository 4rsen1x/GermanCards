import { useEffect, useRef } from 'react'
import { X, Languages } from 'lucide-react'
import { Spinner } from '../UI/Spinner'

interface Props {
  text:        string
  translated:  string | null
  isLoading:   boolean
  error:       string | null
  x:           number
  y:           number
  onClose:     () => void
}

export function TranslationTooltip({ text, translated, isLoading, error, x, y, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const vw = window.innerWidth
    const vh = window.innerHeight
    const rect = el.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    // Horizontal clamp
    let left = x - rect.width / 2
    if (left < 8) left = 8
    if (left + rect.width > vw - 8) left = vw - rect.width - 8
    el.style.left = `${left + scrollX}px`

    // Vertical: prefer above selection; if not enough room, show below
    const topAbove = y - rect.height - 12
    if (topAbove + scrollY > scrollY + 8) {
      el.style.top = `${topAbove + scrollY}px`
    } else {
      el.style.top = `${y + 28 + scrollY}px`
    }

    // Clamp bottom
    if (parseFloat(el.style.top) + rect.height > vh + scrollY - 8) {
      el.style.top = `${vh + scrollY - rect.height - 8}px`
    }
  })

  return (
    <div
      ref={ref}
      data-no-translate
      className="fixed z-[100] w-72 max-w-[calc(100vw-16px)] bg-ink-900 dark:bg-ink-950 border border-gold-500/30 rounded-xl shadow-2xl shadow-black/40 animate-slide-up overflow-hidden"
      style={{ top: 0, left: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gold-500/10 border-b border-gold-500/20">
        <div className="flex items-center gap-1.5 text-gold-500 text-xs font-medium">
          <Languages size={13} />
          <span className="text-ink-300 font-mono truncate max-w-[180px]">{text.length > 40 ? text.slice(0, 40) + '…' : text}</span>
        </div>
        <button
          onClick={onClose}
          className="text-ink-500 hover:text-ink-200 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-3 min-h-[48px] flex items-center">
        {isLoading && (
          <div className="flex items-center gap-2 text-ink-400 text-sm">
            <Spinner size="xs" />
            <span>Wird übersetzt…</span>
          </div>
        )}
        {!isLoading && error && (
          <p className="text-crimson-400 text-xs">{error}</p>
        )}
        {!isLoading && !error && translated && (
          <p className="text-ink-100 text-sm leading-relaxed">{translated}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-2 text-right">
        <span className="text-xs text-ink-600">MyMemory</span>
      </div>
    </div>
  )
}
