import { useState, useCallback } from 'react'
import type { Puzzle, CellState } from '@/types'

export function usePuzzle(initialPuzzle: Puzzle | null) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(initialPuzzle)

  const toggleCell = useCallback((row: number, col: number) => {
    setPuzzle(prev => {
      if (!prev) return null

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
    setPuzzle(prev => {
      if (!prev) return null
      return {
        ...prev,
        hintsUsed: prev.hintsUsed + 1
      }
    })
  }, [])

  return {
    puzzle,
    toggleCell,
    incrementHints
  }
}
