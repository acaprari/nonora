import { CellState, ValidationState } from '../types'

export interface CellProps {
  state: CellState
  validationState?: ValidationState
  onClick: () => void
  row: number
  col: number
}

export function Cell({ state, validationState = 'in-progress', onClick }: CellProps) {
  const bgColor = state === 'filled' ? 'bg-cell-filled' :
                  state === 'marked' ? 'bg-white' :
                  'bg-white'

  const borderColor = validationState === 'error' ? 'border-error' :
                      validationState === 'valid' ? 'border-success' :
                      'border-cell-border'

  return (
    <button
      onClick={onClick}
      className={`
        ${bgColor} ${borderColor}
        w-full aspect-square
        min-w-[28px] min-h-[28px]
        border rounded
        flex items-center justify-center
        cursor-pointer
        transition-colors duration-200
        hover:opacity-80
        touch-manipulation
        overflow-hidden
      `}
      aria-label={`Cell ${state}`}
    >
      {state === 'marked' && (
        <span className="font-bold text-gray-600 text-lg leading-none select-none">×</span>
      )}
    </button>
  )
}
