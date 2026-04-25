import { useEffect, useState, useCallback, useRef } from 'react'
import { ChevronLeft, Globe, Lock, Save, Users, Check, Pencil } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { ColumnCard } from './ColumnCard'
import { Spinner } from '../UI/Spinner'
import { Button } from '../UI/Button'
import { COLUMN_COLORS } from '../../lib/constants'
import type { Topic } from '../../types'
import toast from 'react-hot-toast'

interface Props {
  topicId: string
  onBack:  () => void
}

export function PublicTopicView({ topicId, onBack }: Props) {
  const user = useAuthStore(s => s.user)

  const [topic,    setTopic]    = useState<Topic | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [isDirty,  setIsDirty]  = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [liveCount, setLiveCount] = useState(0)

  const savingRef   = useRef(false)
  const isOwner     = !!user && !!topic && user.id === topic.user_id
  const canEdit     = !!user && !!topic

  // ── Load topic ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase nicht konfiguriert.')
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

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    const channel = supabase
      .channel(`public_topic_${topicId}`)
      // Track how many clients are subscribed (presence)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setLiveCount(Object.keys(state).length)
      })
      // Listen for row updates from other clients
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'topics', filter: `id=eq.${topicId}` },
        (payload) => {
          // Ignore echo from own save
          if (!savingRef.current) {
            setTopic(payload.new as Topic)
            setIsDirty(false)
          }
        },
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && supabase) {
          await channel.track({ user_id: user?.id ?? 'anon' })
        }
      })

    return () => { supabase?.removeChannel(channel) }
  }, [topicId, user?.id])

  // ── Autosave (30s) ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDirty || !canEdit) return
    const id = window.setTimeout(() => { save() }, 30_000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, topic])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const updateColumn = useCallback((columnId: string, content: string) => {
    setTopic(prev => {
      if (!prev) return prev
      return {
        ...prev,
        columns: prev.columns.map(c => c.id === columnId ? { ...c, content } : c),
        updated_at: new Date().toISOString(),
      }
    })
    setIsDirty(true)
  }, [])

  const updateTitle = useCallback((title: string) => {
    setTopic(prev => prev ? { ...prev, title } : prev)
    setIsDirty(true)
  }, [])

  const save = useCallback(async () => {
    if (!supabase || !topic || !user) return
    setIsSaving(true)
    savingRef.current = true

    const patch = isOwner
      ? { title: topic.title, columns: topic.columns, updated_at: topic.updated_at }
      : { columns: topic.columns, updated_at: topic.updated_at }

    const { error: err } = await supabase
      .from('topics')
      .update(patch)
      .eq('id', topicId)

    if (err) toast.error('Fehler beim Speichern')
    else     { setIsDirty(false); toast.success('Gespeichert') }

    savingRef.current = false
    setIsSaving(false)
  }, [topic, user, isOwner, topicId])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-200 dark:border-ink-700 bg-white/80 dark:bg-ink-900/80 backdrop-blur-sm sticky top-0 z-10 print:hidden">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {loading
            ? <div className="h-5 w-48 bg-ink-200 dark:bg-ink-700 rounded animate-pulse" />
            : isOwner
              ? (
                <input
                  value={topic?.title ?? ''}
                  onChange={e => updateTitle(e.target.value)}
                  className="font-display text-lg font-semibold bg-transparent border-b border-transparent hover:border-gold-500/50 focus:border-gold-500 text-ink-900 dark:text-ink-50 focus:outline-none w-full transition-colors"
                />
              )
              : (
                <h1 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-50 truncate">
                  {topic?.title ?? '—'}
                </h1>
              )
          }
        </div>

        {/* Live indicator */}
        {liveCount > 1 && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-forest-500/10 text-forest-500">
            <Users size={12} />
            {liveCount} online
          </span>
        )}

        {/* Save status */}
        {canEdit && (
          <span className={`hidden sm:flex items-center gap-1 text-xs transition-all ${
            isDirty ? 'text-amber-500 animate-pulse-dot' : 'text-forest-500'
          }`}>
            {isDirty ? '• ungespeichert' : <><Check size={12} /> gespeichert</>}
          </span>
        )}

        {/* Badges */}
        {topic && (
          <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-forest-500/10 text-forest-500 shrink-0">
            <Globe size={12} /> Öffentlich
          </span>
        )}

        {/* Edit badge for collaborators */}
        {canEdit && !isOwner && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-sapphire-500/10 text-sapphire-500 shrink-0">
            <Pencil size={11} /> Mitarbeiter
          </span>
        )}

        {/* Save button */}
        {canEdit && (
          <Button
            size="sm"
            onClick={save}
            loading={isSaving}
            disabled={!isDirty}
            variant={isDirty ? 'primary' : 'secondary'}
          >
            <Save size={14} />
            <span className="hidden sm:inline">Speichern</span>
          </Button>
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
                  className="h-1.5 flex-1 rounded-full transition-opacity"
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
                    printMode={!canEdit}
                    onChange={content => updateColumn(col.id, content)}
                  />
                ))
              }
            </div>

            {/* Login prompt for anonymous users */}
            {!user && (
              <div className="mt-8 p-4 border border-ink-200 dark:border-ink-700 rounded-xl text-center bg-white/50 dark:bg-ink-850/50">
                <p className="text-sm text-ink-500 dark:text-ink-400">
                  Melde dich an, um diese Thema gemeinsam zu bearbeiten.
                </p>
              </div>
            )}

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
