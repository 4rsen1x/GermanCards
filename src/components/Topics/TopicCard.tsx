import { formatDistanceToNow } from '../utils/date'
import { Globe, Lock } from 'lucide-react'
import { COLUMN_COLORS } from '../../lib/constants'
import type { Topic } from '../../types'

interface Props {
  topic:    Topic
  onClick:  () => void
}

export function TopicCard({ topic, onClick }: Props) {
  const preview = topic.columns
    .filter(c => c.content.trim())
    .slice(0, 3)

  const totalFilled = topic.columns.filter(c => c.content.trim()).length
  const totalCols   = topic.columns.length
  const pct         = totalCols > 0 ? Math.round((totalFilled / totalCols) * 100) : 0

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 rounded-xl p-5 hover:shadow-lg dark:hover:shadow-black/40 hover:border-gold-400/60 dark:hover:border-gold-500/40 transition-all duration-200 animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-50 leading-tight group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-2">
          {topic.title}
        </h3>
        <span className="shrink-0 mt-0.5 text-ink-300 dark:text-ink-600">
          {topic.is_public ? <Globe size={14} /> : <Lock size={14} />}
        </span>
      </div>

      {/* Column dot strip */}
      <div className="flex gap-1 mb-3">
        {topic.columns.map(col => (
          <div
            key={col.id}
            className="h-1.5 flex-1 rounded-full transition-opacity"
            style={{
              backgroundColor: COLUMN_COLORS[col.color] ?? COLUMN_COLORS.gold,
              opacity: col.content.trim() ? 1 : 0.2,
            }}
            title={col.label}
          />
        ))}
      </div>

      {/* Content previews */}
      {preview.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {preview.map(col => (
            <p key={col.id} className="text-xs text-ink-500 dark:text-ink-400 line-clamp-1 leading-relaxed">
              <span className="font-medium" style={{ color: COLUMN_COLORS[col.color] }}>{col.label}:</span>{' '}
              {col.content.slice(0, 100)}
            </p>
          ))}
        </div>
      )}

      {preview.length === 0 && (
        <p className="text-xs text-ink-300 dark:text-ink-600 italic mb-3">Noch keine Inhalte…</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-ink-400">
        <span>{pct}% ausgefüllt ({totalFilled}/{totalCols})</span>
        <span>{formatDistanceToNow(topic.updated_at)}</span>
      </div>
    </button>
  )
}
