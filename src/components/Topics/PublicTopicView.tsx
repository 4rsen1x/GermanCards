import { useEffect, useState } from 'react'
import { ChevronLeft, Globe, Lock } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { ColumnCard } from './ColumnCard'
import { Spinner } from '../UI/Spinner'
import { COLUMN_COLORS } from '../../lib/constants'
import type { Topic } from '../../types'

interface Props {
  topicId: string
  onBack:  () => void
}

export function PublicTopicView({ topicId, onBack }: Props) {
  const [topic,   setTopic]   = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase не настроен — публичные темы недоступны.')
      setLoading(false)
      return
    }

    supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .eq('is_public', true)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) setError('Тема не найдена или не является публичной.')
        else setTopic(data as Topic)
        setLoading(false)
      })
  }, [topicId])

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-200 dark:border-ink-700 bg-white/80 dark:bg-ink-900/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          {loading
            ? <div className="h-5 w-48 bg-ink-200 dark:bg-ink-700 rounded animate-pulse" />
            : (
              <h1 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-50 truncate">
                {topic?.title ?? '—'}
              </h1>
            )
          }
        </div>

        {topic && (
          <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-forest-500/10 text-forest-500">
            <Globe size={12} /> Öffentlich
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" className="text-gold-500" />
          </div>
        )}

        {!loading && error && (
          <div className="max-w-sm mx-auto text-center py-20">
            <Lock size={36} className="mx-auto mb-4 text-ink-300" />
            <p className="text-ink-500 dark:text-ink-400">{error}</p>
            <button onClick={onBack} className="mt-4 text-sm text-gold-500 hover:underline">
              Zurück zur App
            </button>
          </div>
        )}

        {!loading && topic && (
          <>
            {/* Column dot strip */}
            <div className="flex gap-1 mb-6 max-w-xs">
              {topic.columns.map(col => (
                <div
                  key={col.id}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ backgroundColor: COLUMN_COLORS[col.color], opacity: col.content.trim() ? 1 : 0.2 }}
                  title={col.label}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...topic.columns]
                .sort((a, b) => a.order - b.order)
                .map(col => (
                  <ColumnCard
                    key={col.id}
                    column={col}
                    printMode
                    onChange={() => {}}
                  />
                ))
              }
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-ink-200 dark:border-ink-700 text-center">
              <p className="text-sm text-ink-400 mb-3">
                Erstellt mit <span className="font-display font-semibold text-gold-500">GermanCards</span>
              </p>
              <button
                onClick={onBack}
                className="text-sm text-ink-500 hover:text-gold-500 transition-colors"
              >
                Eigene Themen analysieren →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
