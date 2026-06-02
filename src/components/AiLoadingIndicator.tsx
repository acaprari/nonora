import { Icon } from './Icon'

export interface AiLoadingIndicatorProps {
  size?: 'small' | 'large'
  className?: string
}

export function AiLoadingIndicator({
  size = 'large',
  className = ''
}: AiLoadingIndicatorProps) {
  const iconSize = size === 'small' ? 16 : 32
  const gapClass = size === 'small' ? 'gap-1.5' : 'gap-3'

  return (
    <div
      className={`flex items-center justify-center ${gapClass} ${className}`}
      role="status"
      aria-label="AI is thinking"
      aria-live="polite"
    >
      <span className="inline-block animate-ai-pulse text-white">
        <Icon name="sparkle" size={iconSize} />
      </span>
      <span className="inline-block animate-ai-pulse animation-delay-200 text-white">
        <Icon name="sparkle" size={iconSize} />
      </span>
      <span className="inline-block animate-ai-pulse animation-delay-400 text-white">
        <Icon name="sparkle" size={iconSize} />
      </span>
    </div>
  )
}
