import { useState } from 'react'
import { Modal } from '../UI/Modal'
import { Button } from '../UI/Button'
import { useTopicsStore } from '../../store/topicsStore'
import { COLUMN_COLORS, COLUMN_COLOR_NAMES } from '../../lib/constants'
import type { ColumnColor } from '../../types'

interface Props { isOpen: boolean; onClose: () => void; topicId: string }

const COLOR_LIST = Object.keys(COLUMN_COLORS) as ColumnColor[]

export function AddColumnModal({ isOpen, onClose, topicId }: Props) {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState<ColumnColor>('pink')
  const addColumn = useTopicsStore(s => s.addColumn)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    addColumn(topicId, {
      id:        crypto.randomUUID(),
      label:     label.trim(),
      content:   '',
      isDefault: false,
      order:     999,
      color,
    })
    setLabel('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Spalte hinzufügen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Spaltenname</label>
          <input
            autoFocus
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="z.B. Grammatik, Vokabular…"
            className="w-full px-3 py-2.5 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Farbe</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_LIST.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                title={COLUMN_COLOR_NAMES[c]}
                className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-ink-850 ring-gold-500 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: COLUMN_COLORS[c] }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Abbrechen</Button>
          <Button type="submit" disabled={!label.trim()} className="flex-1">Hinzufügen</Button>
        </div>
      </form>
    </Modal>
  )
}
