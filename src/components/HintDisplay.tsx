import type { Hint } from '@/types'

export interface HintDisplayProps {
  hint: Hint | null
  onDismiss: () => void
  error: string | null
}

/**
 * HintDisplay - Modal overlay for displaying AI hints
 *
 * - Guidance hints: Show strategic advice without exact coordinates
 * - Specific hints: Show exact cell coordinates with reasoning
 * - Error display: Show API errors in red
 */
export function HintDisplay({ hint, onDismiss, error }: HintDisplayProps) {
  if (!hint && !error) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onDismiss}
      data-testid="hint-overlay"
    >
      <div
        className="glass-card rounded-2xl p-6 shadow-2xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
        data-testid="hint-modal"
      >
        {error && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-300">
                Error
              </h3>
              <button
                onClick={onDismiss}
                className="text-white hover:text-gray-200 font-bold text-2xl"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
            <p className="text-white mb-4">{error}</p>
          </>
        )}

        {hint && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {hint.type === 'guidance' ? '💡 Hint' : '🎯 Specific Hint'}
              </h3>
              <button
                onClick={onDismiss}
                className="text-white hover:text-gray-200 font-bold text-2xl"
                aria-label="Dismiss hint"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-white/90 text-lg" data-testid="hint-message">
                {hint.message}
              </p>

              {hint.cell && (
                <div className="glass rounded-lg p-3 text-center">
                  <p className="text-white/80 text-sm mb-1">Suggested Cell</p>
                  <p className="text-white font-bold text-lg">
                    Row {hint.cell.row + 1}, Column {hint.cell.col + 1}
                  </p>
                </div>
              )}

              {hint.type === 'guidance' && (
                <p className="text-white/60 text-sm italic">
                  Request another hint within 2 minutes for a specific cell suggestion.
                </p>
              )}
            </div>

            <button
              onClick={onDismiss}
              className="mt-6 w-full glass py-3 px-6 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
            >
              Got it!
            </button>
          </>
        )}
      </div>
    </div>
  )
}
