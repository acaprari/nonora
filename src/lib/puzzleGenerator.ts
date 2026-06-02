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
 * Validates an AI-generated puzzle matrix.
 *
 * @param matrix - The boolean matrix to validate
 * @param expectedSize - Expected dimensions (n x n)
 * @returns true if matrix is valid, false otherwise
 */
export function validateMatrix(matrix: boolean[][], expectedSize: number): boolean {
  // Check dimensions
  if (matrix.length !== expectedSize) return false
  if (matrix.some(row => row.length !== expectedSize)) return false

  // Check no entirely empty rows
  const hasEmptyRow = matrix.some(row => row.every(cell => !cell))
  if (hasEmptyRow) return false

  // Check no entirely empty columns
  for (let col = 0; col < expectedSize; col++) {
    const isEmpty = matrix.every(row => !row[col])
    if (isEmpty) return false
  }

  return true
}

/**
 * Generates a complete puzzle from an AI-generated solution.
 *
 * @param apiClient - API client instance for generating puzzle solutions
 * @param prompt - User's text prompt describing desired pixel art (e.g., "a cat")
 * @param difficulty - Difficulty level from 1-10 (1=very simple, 10=expert)
 * @param size - Size of the puzzle grid (default: 10 for 10x10)
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise resolving to a complete Puzzle object ready to play
 * @throws Error if API call fails or puzzle generation encounters errors
 */
export async function generatePuzzle(
  apiClient: ApiClient,
  prompt: string,
  difficulty: number,
  size: number = 10,
  maxRetries: number = 3
): Promise<Puzzle> {
  let attempts = 0
  let lastError: Error | null = null

  while (attempts < maxRetries) {
    try {
      // 1. Generate solution from API
      const matrix = await apiClient.generatePuzzle(prompt, difficulty, size)

      // 2. Validate matrix
      if (!validateMatrix(matrix, size)) {
        throw new Error('Generated matrix failed validation')
      }

      // 3. Calculate clues from solution
      const rowClues = calculateRowClues(matrix)
      const columnClues = calculateColumnClues(matrix)

      // 4. Create initial empty grid
      const currentGrid: CellState[][] = Array(size)
        .fill(null)
        .map(() => Array(size).fill('empty'))

      // 5. Generate unique puzzle ID
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // 6. Return complete puzzle object
      return {
        id,
        prompt,
        solution: matrix,
        rowClues,
        columnClues,
        currentGrid,
        startTime: Date.now(),
        hintsUsed: 0
      }
    } catch (error) {
      lastError = error as Error
      attempts++
    }
  }

  throw new Error(`Failed to generate valid puzzle after ${maxRetries} attempts: ${lastError?.message}`)
}
