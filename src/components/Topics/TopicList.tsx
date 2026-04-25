import { useState } from 'react'
import { Search, BookOpen, Plus } from 'lucide-react'
import { useTopicsStore } from '../../store/topicsStore'
import { TopicCard } from './TopicCard'
import { Button } from '../UI/Button'
import { Spinner } from '../UI/Spinner'

interface Props { onNewTopic: () => void }

export function TopicList({ onNewTopic }: Props) {
  const [query, setQuery] = useState('')

  const topics     = useTopicsStore(s => s.topics)
  const isLoading  = useTopicsStore(s => s.isLoading)
  const setCurrentId = useTopicsStore(s => s.setCurrentId)

  const filtered = query
    ? topics.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.columns.some(c => c.content.toLowerCase().includes(query.toLowerCase()))
      )
    : topics

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gold-500/20 flex items-center justify-center">
            <BookOpen size={18} className="text-gold-600 dark:text-gold-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
            Meine Themen
          </h2>
        </div>
        <p className="text-sm text-ink-400 ml-12">
          {topics.length > 0
            ? `${topics.length} Thema${topics.length === 1 ? '' : 's'} — analysiere und erweitere dein Deutsch`
            : 'Erstelle dein erstes Thema und beginne mit der Analyse'
          }
        </p>
      </div>

      {/* Search + New */}
      {topics.length > 0 && (
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Themen durchsuchen…"
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 rounded-lg text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-colors"
            />
          </div>
          <Button onClick={onNewTopic} size="md">
            <Plus size={16} /> Neues Thema
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16 text-ink-400">
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && topics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-dot-grid-dark dark:bg-dot-grid-dark bg-dots border border-ink-200 dark:border-ink-700 flex items-center justify-center mb-5">
            <BookOpen size={32} className="text-gold-500 opacity-70" />
          </div>
          <h3 className="font-display text-xl font-semibold text-ink-700 dark:text-ink-200 mb-2">
            Noch keine Themen
          </h3>
          <p className="text-sm text-ink-400 max-w-xs mb-6">
            Erstelle dein erstes Thema und analysiere es mit den vorbereiteten Kategorien.
          </p>
          <Button onClick={onNewTopic} size="lg">
            <Plus size={18} /> Erstes Thema erstellen
          </Button>
        </div>
      )}

      {/* No results */}
      {!isLoading && topics.length > 0 && filtered.length === 0 && (
        <p className="text-center py-12 text-ink-400 text-sm">
          Keine Themen für „{query}" gefunden.
        </p>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={() => setCurrentId(topic.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
