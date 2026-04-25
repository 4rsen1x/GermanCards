import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { Modal } from '../UI/Modal'
import { Button } from '../UI/Button'
import { useTopicsStore } from '../../store/topicsStore'
import { useAuthStore } from '../../store/authStore'
import { GUEST_USER_ID } from '../../lib/constants'

interface Props { isOpen: boolean; onClose: () => void }

export function CreateTopicModal({ isOpen, onClose }: Props) {
  const [title, setTitle] = useState('')
  const create = useTopicsStore(s => s.create)
  const user   = useAuthStore(s => s.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await create(title.trim(), user?.id ?? GUEST_USER_ID)
    setTitle('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Neues Thema erstellen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
            Thema (Thema-Titel)
          </label>
          <div className="relative">
            <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Die Klimawandel, Das Gesundheitssystem…"
              className="w-full pl-10 pr-4 py-2.5 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-colors"
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            Wird automatisch mit 7 Standardspalten angelegt.
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Abbrechen</Button>
          <Button type="submit" disabled={!title.trim()} className="flex-1">Erstellen</Button>
        </div>
      </form>
    </Modal>
  )
}
