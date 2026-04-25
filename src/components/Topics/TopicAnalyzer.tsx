import { useState, useCallback } from 'react'
import {
  Save, Plus, Trash2, Globe, Download,
  ChevronLeft, Eye, EyeOff, Check, CloudOff, Link,
} from 'lucide-react'
import { useTopicsStore } from '../../store/topicsStore'
import { ColumnCard } from './ColumnCard'
import { AddColumnModal } from './AddColumnModal'
import { Button } from '../UI/Button'
import { exportTopicJSON, printTopic } from '../../lib/export'
import { isSupabaseConfigured } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface Props { topicId: string }

export function TopicAnalyzer({ topicId }: Props) {
  const [addColOpen, setAddColOpen] = useState(false)
  const [delConfirm, setDelConfirm] = useState(false)
  const [titleEdit,  setTitleEdit]  = useState(false)
  const [printMode,  setPrintMode]  = useState(false)

  const topic        = useTopicsStore(s => s.topics.find(t => t.id === topicId))
  const isSaving     = useTopicsStore(s => s.isSaving)
  const isDirty      = useTopicsStore(s => s.dirtyIds.has(topicId))
  const isOnline     = useTopicsStore(s => s.isOnline)
  const updateColumn = useTopicsStore(s => s.updateColumn)
  const removeColumn = useTopicsStore(s => s.removeColumn)
  const update       = useTopicsStore(s => s.update)
  const save         = useTopicsStore(s => s.save)
  const remove       = useTopicsStore(s => s.remove)
  const setCurrentId = useTopicsStore(s => s.setCurrentId)

  const handleSave = useCallback(async () => {
    await save(topicId)
    toast.success('Gespeichert')
  }, [save, topicId])

  const handleDelete = useCallback(async () => {
    await remove(topicId)
    toast.success('Thema gelöscht')
  }, [remove, topicId])

  const handleTogglePublic = useCallback(() => {
    if (!topic) return
    update(topicId, { is_public: !topic.is_public })
    toast.success(topic.is_public ? 'Privat' : 'Öffentlich')
  }, [topic, update, topicId])

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#/public/${topicId}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link kopiert!'))
  }, [topicId])

  if (!topic) return null

  const sortedColumns = [...topic.columns].sort((a, b) => a.order - b.order)

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-200 dark:border-ink-700 bg-white/80 dark:bg-ink-900/80 backdrop-blur-sm sticky top-0 z-10 print:hidden">
        <button
          onClick={() => setCurrentId(null)}
          className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          title="Zurück"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {titleEdit
            ? (
              <input
                autoFocus
                value={topic.title}
                onChange={e => update(topicId, { title: e.target.value })}
                onBlur={() => setTitleEdit(false)}
                onKeyDown={e => { if (e.key === 'Enter') setTitleEdit(false) }}
                className="font-display text-lg font-semibold bg-transparent border-b border-gold-500 text-ink-900 dark:text-ink-50 focus:outline-none w-full"
              />
            )
            : (
              <h1
                onClick={() => setTitleEdit(true)}
                className="font-display text-lg font-semibold text-ink-900 dark:text-ink-50 truncate cursor-text hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                title="Klicken zum Bearbeiten"
              >
                {topic.title}
              </h1>
            )
          }
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 shrink-0">
          {!isOnline && (
            <span className="flex items-center gap-1 text-xs text-amber-500 mr-1" title="Offline">
              <CloudOff size={13} /> Offline
            </span>
          )}
          {isDirty && isSupabaseConfigured && (
            <span className="text-xs text-ink-400 animate-pulse-dot">• ungespeichert</span>
          )}
          {!isDirty && isSupabaseConfigured && (
            <span className="flex items-center gap-0.5 text-xs text-forest-500">
              <Check size={12} /> gespeichert
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePublic}
            className={`p-1.5 rounded-lg transition-colors text-sm ${topic.is_public ? 'text-forest-500 bg-forest-500/10' : 'text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800'}`}
            title={topic.is_public ? 'Öffentlich — klicken zum Privatstellen' : 'Privat — klicken zum Veröffentlichen'}
          >
            {topic.is_public ? <Globe size={16} /> : <EyeOff size={16} />}
          </button>
          {topic.is_public && (
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-forest-500 hover:bg-forest-500/10 transition-colors"
              title="Link kopieren"
            >
              <Link size={16} />
            </button>
          )}
          <button
            onClick={() => setPrintMode(v => !v)}
            className={`p-1.5 rounded-lg transition-colors ${printMode ? 'text-gold-500 bg-gold-500/10' : 'text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800'}`}
            title="Druckansicht"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => exportTopicJSON(topic)}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            title="Als JSON exportieren"
          >
            <Download size={16} />
          </button>
          {isSupabaseConfigured && (
            <Button
              size="sm"
              onClick={handleSave}
              loading={isSaving}
              disabled={!isDirty}
              variant={isDirty ? 'primary' : 'secondary'}
            >
              <Save size={14} />
              <span className="hidden sm:inline">Speichern</span>
            </Button>
          )}
        </div>
      </div>

      {/* Print title */}
      <div className="hidden print:block px-6 pt-6 pb-2">
        <h1 className="font-display text-3xl font-bold text-ink-900">{topic.title}</h1>
        <p className="text-sm text-ink-500 mt-1">{new Date(topic.updated_at).toLocaleDateString('de-DE', { dateStyle: 'long' })}</p>
      </div>

      {/* Columns grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:grid-cols-2 print:gap-4">
          {sortedColumns.map(col => (
            <ColumnCard
              key={col.id}
              column={col}
              printMode={printMode}
              onChange={content => updateColumn(topicId, col.id, content)}
              onRemove={col.isDefault ? undefined : () => removeColumn(topicId, col.id)}
            />
          ))}

          {/* Add column button */}
          {!printMode && (
            <button
              onClick={() => setAddColOpen(true)}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl py-8 text-ink-400 dark:text-ink-500 hover:border-gold-500/60 hover:text-gold-500 transition-all group min-h-[120px] print:hidden"
            >
              <Plus size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">Spalte hinzufügen</span>
            </button>
          )}
        </div>

        {/* Footer actions */}
        {!printMode && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <button
              onClick={printTopic}
              className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 transition-colors"
            >
              <Download size={14} /> Drucken / PDF
            </button>

            {!delConfirm
              ? (
                <button
                  onClick={() => setDelConfirm(true)}
                  className="flex items-center gap-1.5 text-sm text-crimson-500/70 hover:text-crimson-500 transition-colors"
                >
                  <Trash2 size={14} /> Thema löschen
                </button>
              )
              : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-crimson-500">Wirklich löschen?</span>
                  <Button size="sm" variant="danger" onClick={handleDelete}>Ja, löschen</Button>
                  <Button size="sm" variant="secondary" onClick={() => setDelConfirm(false)}>Abbrechen</Button>
                </div>
              )
            }
          </div>
        )}
      </div>

      <AddColumnModal isOpen={addColOpen} onClose={() => setAddColOpen(false)} topicId={topicId} />
    </div>
  )
}
