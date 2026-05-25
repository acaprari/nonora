/**
 * Puzzle Generator - Orchestrates puzzle creation from AI-generated solutions
 *
 * This module coordinates the puzzle generation process:
 * 1. Calls API to generate puzzle matrix from prompt
 * 2. Calculates row and column clues from the matrix
 * 3. Initializes empty current grid (all 'empty' cells)
 * 4. Creates complete Puzzle object with metadata
 */

import type { ApiClient } from '@/lib/api'
import type { Puzzle, CellState } from '@/types'
import { calculateRowClues, calculateColumnClues } from '@/lib/clueCalculator'

/**
 * Generates a complete puzzle from an AI-generated solution.
 *
 * @param apiClient - API client instance for generating puzzle solutions
 * @param prompt - User's text prompt describing desired pixel art (e.g., "a cat")
 * @param difficulty - Difficulty level from 1-10 (1=very simple, 10=expert)
 * @param size - Size of the puzzle grid (default: 10 for 10x10)
 * @returns Promise resolving to a complete Puzzle object ready to play
 * @throws Error if API call fails or puzzle generation encounters errors
 */
export async function generatePuzzle(
  apiClient: ApiClient,
  prompt: string,
  difficulty: number,
  size: number = 10
): Promise<Puzzle> {
  // 1. Generate solution from API
  const solution = await apiClient.generatePuzzle(prompt, difficulty, size)

  // 2. Calculate clues from solution
  const rowClues = calculateRowClues(solution)
  const columnClues = calculateColumnClues(solution)

  // 3. Create initial empty grid
  const currentGrid: CellState[][] = solution.map(row =>
    row.map(() => 'empty' as CellState)
  )

  // 4. Generate unique puzzle ID
  // Using crypto.randomUUID() for browser-compatible unique IDs
  const id = crypto.randomUUID()

  // 5. Return complete puzzle object
  return {
    id,
    prompt,
    solution,
    rowClues,
    columnClues,
    currentGrid,
    startTime: Date.now(),
    hintsUsed: 0,
    errors: 0
  }
}
