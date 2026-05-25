import { useMemo } from 'react'
import type { Puzzle, ValidationResult } from '@/types'
import { validateGrid } from '@/lib/validator'
import { calculateRowClues, calculateColumnClues } from '@/lib/clueCalculator'

export interface UseValidationResult {
  validationResult: ValidationResult
  isComplete: boolean
  isValid: boolean
}

/**
 * React hook for validating puzzle state in real-time.
 *
 * Validates the current grid against the solution's clues and
 * provides detailed validation state for each row and column.
 *
 * @param puzzle - Current puzzle state (or null if no puzzle)
 * @returns Validation result with completion and validity flags
 */
export function useValidation(puzzle: Puzzle | null): UseValidationResult {
  const validationResult = useMemo(() => {
    if (!puzzle) {
      return {
        rows: [],
        columns: [],
        isComplete: false,
        isValid: false
      }
    }

    // Calculate clues from solution
    const rowClues = calculateRowClues(puzzle.solution)
    const columnClues = calculateColumnClues(puzzle.solution)

    // Validate grid against calculated clues
    // currentGrid is already in CellState[][] format (strings)
    return validateGrid(puzzle.currentGrid, rowClues, columnClues)
  }, [puzzle])

  return {
    validationResult,
    isComplete: validationResult.isComplete,
    isValid: validationResult.isValid
  }
}
