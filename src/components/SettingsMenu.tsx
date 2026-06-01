import { useState } from 'react'
import { Icon } from './Icon'

export interface SettingsMenuProps {
  onNewPrompt: () => void
  onChangeApiKey: () => void
  hasActivePuzzle: boolean
}

/**
 * SettingsMenu - Dropdown menu for game settings
 *
 * Provides options to:
 * - Start a new prompt (clear current puzzle)
 * - Change API key
 * - Reset game state
 */
export function SettingsMenu({ onNewPrompt, onChangeApiKey, hasActivePuzzle }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNewPrompt = () => {
    if (hasActivePuzzle) {
      if (confirm('Are you sure? Your current puzzle progress will be lost.')) {
        onNewPrompt()
        setIsOpen(false)
      }
    } else {
      onNewPrompt()
      setIsOpen(false)
    }
  }

  const handleChangeApiKey = () => {
    if (confirm('Are you sure? This will reset your game.')) {
      onChangeApiKey()
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass p-2 rounded-lg text-white hover:bg-white/20 transition-all"
        aria-label="Settings"
        data-testid="settings-button"
      >
        <Icon name="settings" size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-2xl z-50"
            data-testid="settings-menu"
          >
            <div className="py-2">
              <button
                onClick={handleNewPrompt}
                className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                data-testid="new-prompt-option"
              >
                <Icon name="refresh" size={20} />
                <span>New Prompt</span>
              </button>

              <button
                onClick={handleChangeApiKey}
                className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                data-testid="change-api-key-option"
              >
                <Icon name="key" size={20} />
                <span>Change API Key</span>
              </button>

              <div className="border-t border-white/10 my-2" />

              <div className="px-4 py-2 text-white/60 text-xs">
                Settings
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
