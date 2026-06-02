import { Puzzle, ValidationResult } from '../types'
import type { ApiClient } from '@/lib/api'
import { Cell } from './Cell'
import { Clues } from './Clues'
import { HintDisplay } from './HintDisplay'
import { useHints } from '@/hooks/useHints'
import { AiLoadingIndicator } from './AiLoadingIndicator'
import { Icon } from './Icon'

export interface GameBoardProps {
  puzzle: Puzzle
  validationResult: ValidationResult
  onCellClick: (row: number, col: number) => void
  apiClient: ApiClient | null
  onHintUsed: () => void
  currentLevel: number
  currentGridSize: number
}

export function GameBoard({ puzzle, validationResult, onCellClick, apiClient, onHintUsed, currentLevel, currentGridSize }: GameBoardProps) {
  const gridSize = puzzle.solution.length

  // Hints hook
  const {
    currentHint,
    isOnCooldown,
    cooldownRemaining,
    isLoading,
    requestHint,
    dismissHint,
    error: hintError
  } = useHints(
    apiClient,
    puzzle.currentGrid,
    puzzle.rowClues,
    puzzle.columnClues,
    puzzle.solution,
    onHintUsed
  )

  const formatCooldown = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  return (
    <>
      <div className="glass-card rounded-2xl p-3 shadow-2xl max-w-2xl mx-auto">
        {/* Header with difficulty info and hint button */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="glass px-3 py-1 rounded-lg">
              <span className="text-white font-semibold text-sm">
                Level {currentLevel}
              </span>
              <span className="text-white/60 text-xs ml-2">
                {currentGridSize}×{currentGridSize}
              </span>
            </div>
            <div className="text-white font-medium text-sm max-w-[120px] sm:max-w-[250px] truncate" title={puzzle.prompt}>
              {puzzle.prompt || 'Puzzle'}
            </div>
          </div>
          <button
            onClick={requestHint}
            disabled={isOnCooldown || isLoading}
            className={`glass py-2 px-4 rounded-lg font-semibold transition-all ${
              isOnCooldown
                ? 'opacity-50 cursor-not-allowed text-white/50'
                : isLoading
                ? 'cursor-not-allowed'
                : 'text-white hover:bg-white/20'
            }`}
            data-testid="hint-button"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-white">
                <Icon name="lightbulb" size={20} />
                <AiLoadingIndicator size="small" />
              </span>
            ) : isOnCooldown ? (
              <span className="flex items-center gap-2">
                <Icon name="lightbulb" size={20} />
                {formatCooldown(cooldownRemaining)}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icon name="lightbulb" size={20} />
                Get Hint
              </span>
            )}
          </button>
        </div>

        {/* Grid container with mobile scroll support */}
        <div className="overflow-auto max-h-[70vh] sm:overflow-visible sm:max-h-none">
          <div className="flex flex-col gap-1">
            {/* Column clues */}
            <div className="flex gap-1">
              <div className="w-16 flex-shrink-0" /> {/* Spacer for row clues */}
              <div className="grid gap-1 flex-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {puzzle.columnClues.map((clues, colIdx) => (
                  <div key={colIdx}>
                    <Clues
                      clues={clues}
                      orientation="column"
                      validationState={validationResult.columns[colIdx]}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Grid rows with row clues */}
            {puzzle.currentGrid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1 items-center">
                <div className="w-16 flex-shrink-0">
                  <Clues
                    clues={puzzle.rowClues[rowIdx]}
                    orientation="row"
                    validationState={validationResult.rows[rowIdx]}
                  />
                </div>
                <div className="grid gap-1 flex-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                  {row.map((cellState, colIdx) => (
                    <Cell
                      key={`${rowIdx}-${colIdx}`}
                      state={cellState}
                      validationState={validationResult.rows[rowIdx]}
                      onClick={() => onCellClick(rowIdx, colIdx)}
                      row={rowIdx}
                      col={colIdx}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hint Display Modal */}
      <HintDisplay hint={currentHint} onDismiss={dismissHint} error={hintError} />
    </>
  )
}
