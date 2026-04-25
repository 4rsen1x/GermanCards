import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  isOpen:    boolean
  onClose:   () => void
  title?:    string
  children:  ReactNode
  maxWidth?: string
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-no-translate>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 rounded-xl shadow-2xl animate-scale-in overflow-hidden`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 dark:border-ink-700">
            <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
