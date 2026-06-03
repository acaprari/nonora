import { useState, useEffect } from 'react'
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

  // Debounced validation: only debounce errors, show valid states immediately
  const [showErrors, setShowErrors] = useState(true)

  useEffect(() => {
    // Hide errors immediately when grid changes
    setShowErrors(false)

    // Show errors after 1.5 second delay
    const timer = setTimeout(() => {
      setShowErrors(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [puzzle.currentGrid])

  // Helper to debounce only error states, show valid immediately
  const getValidationState = (state: 'valid' | 'error' | 'in-progress'): 'valid' | 'error' | 'in-progress' => {
    if (state === 'valid') return 'valid' // Show green immediately
    if (state === 'error') return showErrors ? 'error' : 'in-progress' // Debounce red
    return 'in-progress' // Keep in-progress as is
  }

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

  // Timer - update every second (stops on completion)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    // If puzzle has endTime, use it (frozen completion time)
    // This prevents timer inflation when refreshing a completed puzzle
    const endTime = puzzle.endTime || (validationResult.isComplete ? Date.now() : null)

    if (endTime) {
      const finalElapsed = Math.floor((endTime - puzzle.startTime) / 1000)
      setElapsedTime(finalElapsed)
      return
    }

    // Puzzle in progress - update timer every second
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - puzzle.startTime) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [puzzle.startTime, puzzle.endTime, validationResult.isComplete])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
            <div className="glass px-3 py-1 rounded-lg">
              <span className="text-white font-semibold text-sm" data-testid="elapsed-timer">
                {formatTime(elapsedTime)}
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
                  <div key={colIdx} className="min-w-[28px]">
                    <Clues
                      clues={clues}
                      orientation="column"
                      validationState={getValidationState(validationResult.columns[colIdx])}
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
                    validationState={getValidationState(validationResult.rows[rowIdx])}
                  />
                </div>
                <div className="grid gap-1 flex-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                  {row.map((cellState, colIdx) => (
                    <Cell
                      key={`${rowIdx}-${colIdx}`}
                      state={cellState}
                      validationState={getValidationState(validationResult.rows[rowIdx])}
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
