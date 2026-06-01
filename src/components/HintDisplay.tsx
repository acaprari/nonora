import type { Hint } from '@/types'
import { renderMarkdown } from '@/lib/markdown'
import { Icon } from './Icon'

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
        style={{ background: 'rgba(255, 255, 255, 0.92)' }}
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
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Dismiss error"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            <p className="text-white mb-4">{error}</p>
          </>
        )}

        {hint && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Icon name={hint.type === 'guidance' ? 'lightbulb' : 'target'} size={24} />
                {hint.type === 'guidance' ? 'Hint' : 'Specific Hint'}
              </h3>
              <button
                onClick={onDismiss}
                className="text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Dismiss hint"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            <div className="space-y-3">
              <div
                className="text-gray-800 text-lg prose prose-slate max-w-none"
                data-testid="hint-message"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(hint.message) }}
              />

              {hint.cell && (
                <div className="bg-white/60 rounded-lg p-3 text-center border border-gray-300">
                  <p className="text-gray-600 text-sm mb-1">Suggested Cell</p>
                  <p className="text-gray-900 font-bold text-lg">
                    Row {hint.cell.row + 1}, Column {hint.cell.col + 1}
                  </p>
                </div>
              )}

              {hint.type === 'guidance' && (
                <p className="text-gray-600 text-sm italic">
                  Request another hint within 2 minutes for a specific cell suggestion.
                </p>
              )}
            </div>

            <button
              onClick={onDismiss}
              className="mt-6 w-full bg-gray-800 hover:bg-gray-900 py-3 px-6 rounded-lg text-white font-semibold transition-all shadow-lg"
            >
              Got it!
            </button>
          </>
        )}
      </div>
    </div>
  )
}
