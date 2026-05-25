import { useState, useCallback } from 'react'
import type { Puzzle, CellState } from '@/types'

export function usePuzzle(initialPuzzle: Puzzle) {
  const [puzzle, setPuzzle] = useState<Puzzle>(initialPuzzle)

  const toggleCell = useCallback((row: number, col: number) => {
    setPuzzle(prev => {
      const newGrid = prev.currentGrid.map(r => [...r])
      const current = newGrid[row][col]

      const nextState: CellState =
        current === 'empty' ? 'filled' :
        current === 'filled' ? 'marked' :
        'empty'

      newGrid[row][col] = nextState

      return {
        ...prev,
        currentGrid: newGrid
      }
    })
  }, [])

  const incrementHints = useCallback(() => {
    setPuzzle(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }))
  }, [])

  const incrementErrors = useCallback(() => {
    setPuzzle(prev => ({
      ...prev,
      errors: prev.errors + 1
    }))
  }, [])

  return {
    puzzle,
    toggleCell,
    incrementHints,
    incrementErrors
  }
}
