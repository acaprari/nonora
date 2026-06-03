export interface IconProps {
  name: 'settings' | 'refresh' | 'key' | 'close' | 'lightbulb' | 'target' | 'celebration' | 'sparkle'
  className?: string
  size?: number
  'aria-label'?: string
}

/**
 * Icon component - Renders SVG icons from the icons.svg sprite
 *
 * Uses the SVG symbol/use pattern for optimal performance:
 * - Icons are defined once in public/icons.svg
 * - Each instance references the symbol via <use>
 * - Automatic color inheritance via currentColor
 *
 * Features:
 * - Flat, monochrome design
 * - Scales to any size
 * - Adapts to text color automatically
 * - Accessible with aria-label support
 *
 * @example
 * <Icon name="settings" size={24} aria-label="Settings" />
 * <Icon name="close" className="text-red-500" />
 */
export function Icon({ name, className = '', size = 24, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      className={`inline-block ${className}`}
      width={size}
      height={size}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-hidden={!ariaLabel}
    >
      <use href={`/nonogen/icons.svg#${name}`} />
    </svg>
  )
}
