import { useState } from 'react'
import { Moon, Sun, Menu, LogIn, Wifi, WifiOff, Settings } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { useAuthStore } from '../../store/authStore'
import { useTopicsStore } from '../../store/topicsStore'
import { AuthModal } from '../Auth/AuthModal'
import { UserMenu } from '../Auth/UserMenu'
import { SettingsModal } from './SettingsModal'
import { isSupabaseConfigured } from '../../lib/supabase'

interface Props {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: Props) {
  const [authOpen,     setAuthOpen]     = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { theme, toggle } = useThemeStore()
  const user    = useAuthStore(s => s.user)
  const isSaving  = useTopicsStore(s => s.isSaving)
  const dirtySize = useTopicsStore(s => s.dirtyIds.size)
  const isOnline  = useTopicsStore(s => s.isOnline)

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-ink-200 dark:border-ink-800 bg-white/95 dark:bg-ink-900/95 backdrop-blur-sm sticky top-0 z-30 print:hidden">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-ink-500 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            aria-label="Menü"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            {/* Wordmark */}
            <span className="font-display text-xl font-bold tracking-tight">
              <span className="text-gold-500">German</span>
              <span className="text-ink-900 dark:text-ink-50">Cards</span>
            </span>
            {/* Beta badge */}
            <span className="hidden sm:inline-flex px-1.5 py-0.5 bg-gold-500/15 border border-gold-500/30 rounded text-gold-600 dark:text-gold-400 text-[10px] font-mono font-medium tracking-wide">
              BETA
            </span>
          </div>
        </div>

        {/* Right: status + controls */}
        <div className="flex items-center gap-2">
          {/* Sync status */}
          {isSupabaseConfigured && user && (
            <span className={`hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all ${
              isSaving
                ? 'text-gold-500 bg-gold-500/10'
                : dirtySize > 0
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-forest-500 bg-forest-500/10'
            }`}>
              {isSaving ? '↑ Wird gespeichert…' : dirtySize > 0 ? `${dirtySize} ungespeichert` : '✓ Synchronisiert'}
            </span>
          )}

          {/* Online indicator */}
          <span className={`${isOnline ? 'text-forest-500' : 'text-crimson-400'}`} title={isOnline ? 'Online' : 'Offline'}>
            {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
          </span>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            title="Einstellungen"
          >
            <Settings size={17} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            title="Design wechseln"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Auth */}
          {isSupabaseConfigured && (
            user
              ? <UserMenu onOpenSettings={() => setSettingsOpen(true)} />
              : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-ink-900 rounded-lg text-sm font-semibold transition-colors"
                >
                  <LogIn size={15} /> Anmelden
                </button>
              )
          )}
        </div>
      </header>

      <AuthModal    isOpen={authOpen}     onClose={() => setAuthOpen(false)}     />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
