import { useState } from 'react'
import { Plus, BookOpen, Search, ChevronRight } from 'lucide-react'
import { useTopicsStore } from '../../store/topicsStore'
import { COLUMN_COLORS } from '../../lib/constants'
import { formatDistanceToNow } from '../utils/date'

interface Props {
  isOpen:     boolean
  onNewTopic: () => void
  onClose:    () => void
}

export function Sidebar({ isOpen, onNewTopic, onClose }: Props) {
  const [query, setQuery] = useState('')

  const topics     = useTopicsStore(s => s.topics)
  const currentId  = useTopicsStore(s => s.currentId)
  const setCurrentId = useTopicsStore(s => s.setCurrentId)

  const filtered = query
    ? topics.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    : topics

  const handleSelect = (id: string) => {
    setCurrentId(id)
    onClose()
  }

  const body = (
    <aside className="w-72 shrink-0 flex flex-col h-full bg-ink-50 dark:bg-ink-900 border-r border-ink-200 dark:border-ink-800">
      {/* Sidebar header */}
      <div className="px-4 pt-4 pb-3 border-b border-ink-200 dark:border-ink-800">
        <button
          onClick={onNewTopic}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-gold-500 hover:bg-gold-400 active:bg-gold-600 rounded-lg text-ink-900 font-semibold text-sm transition-colors"
        >
          <Plus size={16} />
          Neues Thema
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-ink-200 dark:border-ink-800">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Themen filtern…"
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg text-xs text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Topic list */}
      <nav className="flex-1 overflow-y-auto py-1">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center text-ink-400">
            <BookOpen size={28} className="mb-2 opacity-40" />
            <p className="text-xs">{query ? 'Keine Treffer' : 'Noch keine Themen'}</p>
          </div>
        )}
        {filtered.map(topic => {
          const active = topic.id === currentId
          return (
            <button
              key={topic.id}
              onClick={() => handleSelect(topic.id)}
              className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 transition-colors group ${
                active
                  ? 'bg-gold-500/10 dark:bg-gold-500/10'
                  : 'hover:bg-white dark:hover:bg-ink-800'
              }`}
            >
              {/* Color strip */}
              <div className="flex flex-col gap-0.5 pt-1 shrink-0">
                {topic.columns.slice(0, 4).map(c => (
                  <div
                    key={c.id}
                    className="w-1 h-2 rounded-full"
                    style={{ backgroundColor: COLUMN_COLORS[c.color], opacity: c.content ? 1 : 0.25 }}
                  />
                ))}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate leading-tight mb-0.5 ${active ? 'text-gold-600 dark:text-gold-400' : 'text-ink-800 dark:text-ink-100'}`}>
                  {topic.title}
                </p>
                <p className="text-xs text-ink-400 truncate">
                  {formatDistanceToNow(topic.updated_at)}
                </p>
              </div>

              {active && <ChevronRight size={14} className="text-gold-500 shrink-0 mt-0.5" />}
            </button>
          )
        })}
      </nav>

      {/* Count */}
      {topics.length > 0 && (
        <div className="px-4 py-2 border-t border-ink-200 dark:border-ink-800 text-xs text-ink-400 text-right">
          {topics.length} Thema{topics.length === 1 ? '' : 's'}
        </div>
      )}
    </aside>
  )

  // Desktop: always visible; Mobile: drawer overlay
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex">{body}</div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <div className="relative animate-slide-up w-72">
            {body}
          </div>
        </div>
      )}
    </>
  )
}
