import { ValidationState } from '../types'

export interface CluesProps {
  clues: number[]
  orientation: 'row' | 'column'
  validationState?: ValidationState
}

export function Clues({ clues, orientation, validationState = 'in-progress' }: CluesProps) {
  const isEmpty = clues.length === 0
  const displayClues = isEmpty ? ['0'] : clues.map(String)

  const stateColor = validationState === 'error' ? 'text-error' :
                     validationState === 'valid' ? 'text-success' :
                     'text-gray-700'

  const flexDirection = orientation === 'column' ? 'flex-col' : 'flex-row'

  return (
    <div className={`flex ${flexDirection} gap-0.5 items-center justify-center p-0.5`}>
      {displayClues.map((clue, idx) => (
        <span
          key={idx}
          className={`${stateColor} font-semibold text-xs`}
        >
          {clue}
        </span>
      ))}
    </div>
  )
}
