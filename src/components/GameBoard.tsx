import { Puzzle, ValidationResult } from '../types'
import type { ApiClient } from '@/lib/api'
import { Cell } from './Cell'
import { Clues } from './Clues'
import { HintDisplay } from './HintDisplay'
import { useHints } from '@/hooks/useHints'
import { AiLoadingIndicator } from './AiLoadingIndicator'

export interface GameBoardProps {
  puzzle: Puzzle
  validationResult: ValidationResult
  onCellClick: (row: number, col: number) => void
  apiClient: ApiClient | null
  onHintUsed: () => void
}

export function GameBoard({ puzzle, validationResult, onCellClick, apiClient, onHintUsed }: GameBoardProps) {
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
      <div className="glass-card rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
        {/* Header with hint button */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-white/80 text-sm">
            Level {puzzle.prompt ? puzzle.prompt.substring(0, 20) : 'Puzzle'}
            {puzzle.prompt && puzzle.prompt.length > 20 && '...'}
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
                💡 <AiLoadingIndicator size="small" />
              </span>
            ) : isOnCooldown ? (
              `💡 ${formatCooldown(cooldownRemaining)}`
            ) : (
              '💡 Get Hint'
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2">
      {/* Column clues */}
      <div className="flex">
        <div className="w-16" /> {/* Spacer for row clues */}
        <div className="flex flex-1">
          {puzzle.columnClues.map((clues, colIdx) => (
            <div key={colIdx} className="flex-1">
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
        <div key={rowIdx} className="flex gap-2">
          <div className="w-16">
            <Clues
              clues={puzzle.rowClues[rowIdx]}
              orientation="row"
              validationState={validationResult.rows[rowIdx]}
            />
          </div>
          <div className={`grid gap-1 flex-1`} style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
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

      {/* Hint Display Modal */}
      <HintDisplay hint={currentHint} onDismiss={dismissHint} error={hintError} />
    </>
  )
}
