import { useState, useRef, useEffect } from 'react'
import { LogOut, Download, Settings } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useTopicsStore } from '../../store/topicsStore'
import { exportAllJSON } from '../../lib/export'

interface Props { onOpenSettings: () => void }

export function UserMenu({ onOpenSettings }: Props) {
  const [open, setOpen] = useState(false)
  const ref  = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuthStore()
  const topics = useTopicsStore(s => s.topics)

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  if (!user) return null

  const name   = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'Nutzer'
  const avatar = user.user_metadata?.avatar_url
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative" data-no-translate>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
      >
        {avatar
          ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover ring-2 ring-gold-500/40" />
          : (
            <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-600 dark:text-gold-400 text-xs font-bold font-mono">
              {initials}
            </div>
          )
        }
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 rounded-xl shadow-xl animate-scale-in z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-700">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">{name}</p>
            <p className="text-xs text-ink-400 truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <MenuItem icon={<Settings size={15}/>} onClick={() => { setOpen(false); onOpenSettings() }}>Einstellungen</MenuItem>
            <MenuItem icon={<Download size={15}/>} onClick={() => { exportAllJSON(topics); setOpen(false) }}>Alle exportieren (JSON)</MenuItem>
            <div className="h-px bg-ink-100 dark:bg-ink-700 my-1" />
            <MenuItem icon={<LogOut size={15}/>} onClick={() => { signOut(); setOpen(false) }} danger>Abmelden</MenuItem>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, onClick, children, danger = false }: {
  icon: React.ReactNode; onClick: () => void; children: React.ReactNode; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
        danger
          ? 'text-crimson-500 hover:bg-crimson-500/10'
          : 'text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-700'
      }`}
    >
      {icon}{children}
    </button>
  )
}
