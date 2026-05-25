/**
 * usePuzzle Hook - Manages puzzle state and operations
 *
 * This hook provides state management for the current puzzle including:
 * - Puzzle data (grid, solution, clues)
 * - Loading and error states
 * - Cell update operations (fill, mark, clear)
 * - Puzzle generation
 * - Reset functionality
 */

import { useState } from 'react'
import type { Puzzle, CellState } from '@/types'
import { ApiClient } from '@/lib/api'
import { generatePuzzle } from '@/lib/puzzleGenerator'

/**
 * Return type for the usePuzzle hook
 */
export interface UsePuzzleReturn {
  puzzle: Puzzle | null
  loading: boolean
  error: string | null
  generateNewPuzzle: (apiKey: string, prompt: string, difficulty: number) => Promise<void>
  updateCell: (row: number, col: number, newState: CellState) => void
  resetPuzzle: () => void
}

/**
 * Custom hook for managing puzzle state and operations.
 *
 * Provides complete puzzle lifecycle management:
 * - Generating new puzzles from prompts
 * - Updating cell states during gameplay
 * - Resetting puzzles to initial state
 *
 * @returns Object containing puzzle state and control functions
 *
 * @example
 * ```tsx
 * function PuzzleGame() {
 *   const { puzzle, loading, error, generateNewPuzzle, updateCell, resetPuzzle } = usePuzzle()
 *
 *   const handleGenerate = async () => {
 *     await generateNewPuzzle('api-key', 'heart', 5)
 *   }
 *
 *   const handleCellClick = (row: number, col: number) => {
 *     updateCell(row, col, 'filled')
 *   }
 *
 *   return (
 *     <div>
 *       {loading && <p>Generating puzzle...</p>}
 *       {error && <p>Error: {error}</p>}
 *       {puzzle && <PuzzleGrid puzzle={puzzle} onCellClick={handleCellClick} />}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePuzzle(): UsePuzzleReturn {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Generates a new puzzle from a text prompt.
   *
   * This async function:
   * 1. Sets loading state
   * 2. Clears any previous errors
   * 3. Creates an API client with the provided key
   * 4. Calls the puzzle generator
   * 5. Updates puzzle state on success or error state on failure
   * 6. Clears loading state
   *
   * @param apiKey - Anthropic API key for generating the puzzle
   * @param prompt - Text description of desired pixel art (e.g., "heart", "cat")
   * @param difficulty - Difficulty level from 1-10
   */
  const generateNewPuzzle = async (
    apiKey: string,
    prompt: string,
    difficulty: number
  ): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Create API client with provided key
      const client = new ApiClient(apiKey)

      // Generate puzzle using puzzle generator
      const newPuzzle = await generatePuzzle(client, prompt, difficulty)

      // Update state with new puzzle
      setPuzzle(newPuzzle)
    } catch (err) {
      // Set error message from caught error
      setError((err as Error).message)
    } finally {
      // Always clear loading state
      setLoading(false)
    }
  }

  /**
   * Updates a single cell in the current puzzle grid.
   *
   * This function:
   * 1. Checks if a puzzle exists (no-op if null)
   * 2. Creates a new grid with the updated cell (immutable update)
   * 3. Updates the puzzle with the new grid
   *
   * All updates are immutable - the original grid is never mutated.
   *
   * @param row - Row index of the cell to update
   * @param col - Column index of the cell to update
   * @param newState - New state for the cell ('empty', 'filled', or 'marked')
   */
  const updateCell = (row: number, col: number, newState: CellState): void => {
    if (!puzzle) return

    // Create new grid with immutable update
    const newGrid = puzzle.currentGrid.map((r, i) =>
      i === row ? r.map((c, j) => (j === col ? newState : c)) : [...r]
    )

    // Update puzzle with new grid
    setPuzzle({ ...puzzle, currentGrid: newGrid })
  }

  /**
   * Resets the current puzzle to its initial state.
   *
   * This function:
   * 1. Checks if a puzzle exists (no-op if null)
   * 2. Creates a new empty grid matching the solution dimensions
   * 3. Resets startTime to current timestamp
   * 4. Resets hintsUsed and errors counters to 0
   * 5. Preserves the solution, clues, and other metadata
   */
  const resetPuzzle = (): void => {
    if (!puzzle) return

    // Create fresh empty grid matching solution dimensions
    const emptyGrid = puzzle.solution.map(row => row.map(() => 'empty' as CellState))

    // Reset puzzle with new grid and reset metadata
    setPuzzle({
      ...puzzle,
      currentGrid: emptyGrid,
      startTime: Date.now(),
      hintsUsed: 0,
      errors: 0
    })
  }

  return {
    puzzle,
    loading,
    error,
    generateNewPuzzle,
    updateCell,
    resetPuzzle
  }
}
