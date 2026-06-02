import { ValidationState } from '../types'

export interface CluesProps {
  clues: number[]
  orientation: 'row' | 'column'
  validationState?: ValidationState
}

export function Clues({ clues, orientation, validationState = 'in-progress' }: CluesProps) {
  const isEmpty = clues.length === 0
  const displayClues = isEmpty ? ['0'] : clues.map(String)

  // Enhanced contrast for valid state: darker green background with white text
  const stateStyles = validationState === 'error' ? 'text-error' :
                      validationState === 'valid' ? 'bg-green-700 text-white px-1 rounded' :
                      'text-gray-700'

  const flexDirection = orientation === 'column' ? 'flex-col' : 'flex-row'

  return (
    <div className={`flex ${flexDirection} gap-0.5 items-center justify-center p-0.5`}>
      {displayClues.map((clue, idx) => (
        <span
          key={idx}
          className={`${stateStyles} font-semibold text-xs`}
        >
          {clue}
        </span>
      ))}
    </div>
  )
}
