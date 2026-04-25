import { useState } from 'react'
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react'
import { Modal } from '../UI/Modal'
import { Button } from '../UI/Button'
import { useAuthStore } from '../../store/authStore'
import { isSupabaseConfigured } from '../../lib/supabase'

interface Props { isOpen: boolean; onClose: () => void }

export function AuthModal({ isOpen, onClose }: Props) {
  const [tab,      setTab]      = useState<'in' | 'up'>('in')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const { signInEmail, signUpEmail, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === 'in') await signInEmail(email, password)
    else               await signUpEmail(email, password)
    if (!useAuthStore.getState().error) onClose()
  }

  const switchTab = (t: 'in' | 'up') => {
    setTab(t); clearError()
  }

  if (!isSupabaseConfigured) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Offline-Modus">
        <p className="text-ink-600 dark:text-ink-300 text-sm leading-relaxed">
          Supabase ist nicht konfiguriert. Die App läuft im lokalen Modus — deine Themen werden im Browser gespeichert.
        </p>
        <p className="mt-3 text-xs text-ink-400 dark:text-ink-500">
          Kopiere <code className="font-mono bg-ink-100 dark:bg-ink-800 px-1 rounded">.env.example</code> zu <code className="font-mono bg-ink-100 dark:bg-ink-800 px-1 rounded">.env</code> und trage deine Supabase-Zugangsdaten ein.
        </p>
        <Button onClick={onClose} className="mt-5 w-full">Verstanden</Button>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tab === 'in' ? 'Anmelden' : 'Registrieren'}>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-ink-100 dark:bg-ink-800 rounded-lg">
        {(['in', 'up'] as const).map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-all ${
              tab === t
                ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-ink-100 shadow-sm'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
            }`}
          >
            {t === 'in' ? 'Anmelden' : 'Registrieren'}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-Mail-Adresse"
            required
            className="w-full pl-10 pr-4 py-2.5 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Passwort"
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-2.5 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-colors"
          />
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-crimson-500/10 border border-crimson-500/30 rounded-lg text-sm text-crimson-500">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" loading={isLoading} className="w-full mt-2" size="md">
          <LogIn size={16} />
          {tab === 'in' ? 'Anmelden' : 'Konto erstellen'}
        </Button>
      </form>
    </Modal>
  )
}
