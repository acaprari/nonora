export interface AiLoadingIndicatorProps {
  size?: 'small' | 'large'
  className?: string
}

export function AiLoadingIndicator({
  size = 'large',
  className = ''
}: AiLoadingIndicatorProps) {
  const sizeClasses = size === 'small'
    ? 'text-base gap-1.5'   // 16px font, 6px gap
    : 'text-4xl gap-3'       // 36px font, 12px gap

  return (
    <div
      className={`flex items-center justify-center ${sizeClasses} ${className}`}
      role="status"
      aria-label="AI is thinking"
      aria-live="polite"
    >
      <span className="inline-block animate-ai-pulse">✨</span>
      <span className="inline-block animate-ai-pulse animation-delay-200">✨</span>
      <span className="inline-block animate-ai-pulse animation-delay-400">✨</span>
    </div>
  )
}
