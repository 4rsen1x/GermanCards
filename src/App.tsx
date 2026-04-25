import { useState, useEffect, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/Layout/Header'
import { Sidebar } from './components/Layout/Sidebar'
import { TopicList } from './components/Topics/TopicList'
import { TopicAnalyzer } from './components/Topics/TopicAnalyzer'
import { PublicTopicView } from './components/Topics/PublicTopicView'
import { TranslationTooltip } from './components/Translator/TranslationTooltip'
import { CreateTopicModal } from './components/Topics/CreateTopicModal'
import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'
import { useTopicsStore } from './store/topicsStore'
import { useAutosave } from './hooks/useAutosave'
import { useTranslation } from './hooks/useTranslation'
import { GUEST_USER_ID } from './lib/constants'

function parsePublicHash(hash: string): string | null {
  const m = hash.match(/^#\/public\/([0-9a-f-]{36})$/i)
  return m ? m[1] : null
}

export default function App() {
  const [sidebarOpen,    setSidebarOpen]    = useState(false)
  const [newTopicOpen,   setNewTopicOpen]   = useState(false)
  const [publicTopicId,  setPublicTopicId]  = useState<string | null>(
    () => parsePublicHash(window.location.hash)
  )

  const theme   = useThemeStore(s => s.theme)
  const user    = useAuthStore(s => s.user)
  const init    = useAuthStore(s => s.init)
  const load              = useTopicsStore(s => s.load)
  const subscribeRealtime = useTopicsStore(s => s.subscribeRealtime)
  const unsubscribe       = useTopicsStore(s => s.unsubscribe)
  const setOnline         = useTopicsStore(s => s.setOnline)
  const currentId         = useTopicsStore(s => s.currentId)

  const translation = useTranslation()

  useAutosave()

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Boot auth
  useEffect(() => { init() }, [init])

  // Load topics when auth resolves
  useEffect(() => {
    const userId = user?.id ?? GUEST_USER_ID
    load(userId)
    if (user) {
      subscribeRealtime(user.id)
      return () => unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Online/offline
  useEffect(() => {
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [setOnline])

  // Hash-based routing for public topic links
  useEffect(() => {
    const onHashChange = () => setPublicTopicId(parsePublicHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const handleNewTopic = useCallback(() => {
    setSidebarOpen(false)
    setNewTopicOpen(true)
  }, [])

  const handleClosePublic = useCallback(() => {
    history.pushState(null, '', window.location.pathname)
    setPublicTopicId(null)
  }, [])

  return (
    <div className="min-h-screen font-sans">
      <Header onMenuToggle={() => setSidebarOpen(v => !v)} />

      <div className="flex h-[calc(100vh-56px)] print:h-auto">
        {!publicTopicId && (
          <Sidebar
            isOpen={sidebarOpen}
            onNewTopic={handleNewTopic}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-dots-light dark:bg-dots-dark opacity-60 pointer-events-none" />

          <div className="relative z-10 h-full">
            {publicTopicId
              ? <PublicTopicView topicId={publicTopicId} onBack={handleClosePublic} />
              : currentId
                ? <TopicAnalyzer topicId={currentId} />
                : <TopicList onNewTopic={handleNewTopic} />
            }
          </div>
        </main>
      </div>

      {translation.selection && (
        <TranslationTooltip
          text={translation.selection.text}
          translated={translation.result}
          isLoading={translation.isLoading}
          error={translation.error}
          x={translation.selection.x}
          y={translation.selection.y}
          onClose={translation.hideTranslation}
        />
      )}

      <CreateTopicModal isOpen={newTopicOpen} onClose={() => setNewTopicOpen(false)} />

      <Toaster position="bottom-right" toastOptions={{ duration: 2500 }} />
    </div>
  )
}
