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

  const { signInEmail, signUpEmail, signInGoogle, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === 'in') await signInEmail(email, password)
    else               await signUpEmail(email, password)
    if (!useAuthStore.getState().error) onClose()
  }

  const handleGoogle = async () => {
    await signInGoogle()
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

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-ink-200 dark:border-ink-700 rounded-lg text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors mb-4 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Mit Google fortfahren
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
        <span className="text-xs text-ink-400">oder</span>
        <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
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
