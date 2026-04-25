import { Modal } from '../UI/Modal'
import { useSettingsStore } from '../../store/settingsStore'
import { TRANSLATION_LANGS } from '../../lib/constants'

interface Props { isOpen: boolean; onClose: () => void }

export function SettingsModal({ isOpen, onClose }: Props) {
  const settings = useSettingsStore()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Einstellungen">
      <div className="space-y-5" data-no-translate>
        {/* Translation language */}
        <div>
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">
            Übersetzungssprache
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {TRANSLATION_LANGS.map(l => (
              <button
                key={l.value}
                onClick={() => settings.set({ translationLang: l.value })}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  settings.translationLang === l.value
                    ? 'bg-gold-500/15 border-gold-500/40 text-gold-600 dark:text-gold-400 font-medium'
                    : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            Gilt für die Übersetzung von markiertem Text.
          </p>
        </div>

        {/* Autosave */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-ink-700 dark:text-ink-200">Automatisches Speichern</label>
            <button
              onClick={() => settings.set({ autosaveEnabled: !settings.autosaveEnabled })}
              className={`relative w-10 h-5 rounded-full transition-colors ${settings.autosaveEnabled ? 'bg-gold-500' : 'bg-ink-300 dark:bg-ink-600'}`}
              role="switch"
              aria-checked={settings.autosaveEnabled}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.autosaveEnabled ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          {settings.autosaveEnabled && (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={15}
                max={120}
                step={15}
                value={settings.autosaveInterval}
                onChange={e => settings.set({ autosaveInterval: Number(e.target.value) })}
                className="flex-1 accent-gold-500"
              />
              <span className="text-sm text-ink-500 w-16 text-right">alle {settings.autosaveInterval} Sek.</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-ink-100 dark:border-ink-700">
          <p className="text-xs text-ink-400">
            Markiere Text in den Spalten — eine Übersetzung erscheint automatisch als schwebendes Fenster.
          </p>
        </div>
      </div>
    </Modal>
  )
}
