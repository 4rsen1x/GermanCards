import { useRef, useEffect, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { COLUMN_COLORS } from '../../lib/constants'
import type { Column } from '../../types'

interface Props {
  column:      Column
  onChange:    (content: string) => void
  onRemove?:   () => void
  printMode?:  boolean
}

export function ColumnCard({ column, onChange, onRemove, printMode }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.max(ta.scrollHeight, 120)}px`
  }, [])

  useEffect(resize, [column.content, resize])

  const accentColor = COLUMN_COLORS[column.color] ?? COLUMN_COLORS.gold

  return (
    <div
      className="group relative flex flex-col bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 rounded-xl overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-black/30 print:shadow-none print:border-ink-300"
      style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-700/60">
        <h3
          className="font-display text-base font-semibold leading-tight"
          style={{ color: accentColor }}
        >
          {column.label}
        </h3>
        {!column.isDefault && !printMode && onRemove && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-ink-300 hover:text-crimson-500 hover:bg-crimson-500/10 transition-all"
            title="Spalte löschen"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Content */}
      {printMode
        ? (
          <div className="px-4 py-3 text-base text-ink-800 dark:text-ink-100 whitespace-pre-wrap min-h-[80px] leading-relaxed">
            {column.content || <span className="text-ink-300 italic">—</span>}
          </div>
        )
        : (
          <textarea
            ref={taRef}
            value={column.content}
            onChange={e => { onChange(e.target.value); resize() }}
            onInput={resize}
            placeholder={`${column.label} …`}
            className="flex-1 px-4 py-3 text-base text-ink-800 dark:text-ink-100 bg-transparent resize-none focus:outline-none placeholder-ink-300 dark:placeholder-ink-600 leading-relaxed min-h-[120px]"
            style={{ height: 'auto' }}
          />
        )
      }
    </div>
  )
}
