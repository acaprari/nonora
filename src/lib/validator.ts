/**
 * Validator - Pure functions for validating puzzle state
 *
 * Validates the current player's grid state against the expected puzzle solution.
 * Checks each row and column independently to determine if they are:
 * - 'valid': Complete and matches clues exactly
 * - 'error': Cannot possibly match clues
 * - 'in-progress': Could still match clues with more input
 */

import type { CellState, ValidationState, ValidationResult } from '@/types';
import { calculateRowClues } from './clueCalculator';

/**
 * Validates a single row or column against its target solution.
 *
 * @param currentLine - Array of cell states representing current player input
 * @param targetLine - Expected boolean array from solution
 * @returns ValidationState indicating if line is valid, error, or in-progress
 */
function validateLine(
  currentLine: CellState[],
  targetLine: boolean[]
): ValidationState {
  // Convert current line to boolean array (filled cells only)
  // Treat 'marked' and 'empty' cells as not-filled
  const filledCells = currentLine.map(cell => cell === 'filled');

  // Calculate current clues from filled cells
  const currentClues = calculateRowClues([filledCells])[0];
  const targetClues = calculateRowClues([targetLine])[0];

  // First, check if current clues are impossible to match target
  // If we have more groups than target, it's an error
  if (currentClues.length > targetClues.length) {
    return 'error';
  }

  // Check each current group against target
  for (let i = 0; i < currentClues.length; i++) {
    const currentGroup = currentClues[i];
    const targetGroup = targetClues[i];

    if (currentGroup > targetGroup) {
      // This group is already too large
      return 'error';
    }
  }

  // Now check if the line matches the target solution exactly
  let matchesSolution = true;
  for (let i = 0; i < currentLine.length; i++) {
    const currentCell = currentLine[i];
    const targetCell = targetLine[i];

    if (currentCell === 'filled' && !targetCell) {
      // Filled a cell that should be empty
      return 'error';
    }
    if (currentCell === 'empty' && targetCell) {
      // Haven't filled a cell that should be filled
      matchesSolution = false;
    }
    // Note: 'marked' cells are treated as "player thinks this is empty"
    // If marked but should be filled, that's not filled yet (in-progress)
    // If marked and should be empty, that's correct
    if (currentCell === 'marked' && targetCell) {
      // Marked a cell that should be filled
      matchesSolution = false;
    }
  }

  // If matches solution exactly (all filled cells correct, all empty cells correct)
  if (matchesSolution) {
    return 'valid';
  }

  // Otherwise, current state could still lead to target
  return 'in-progress';
}

/**
 * Validates the entire puzzle grid.
 *
 * @param currentGrid - 2D array of cell states representing player's current progress
 * @param solution - 2D boolean array representing the target solution
 * @returns ValidationResult with row/column states and completion info
 */
export function validatePuzzle(
  currentGrid: CellState[][],
  solution: boolean[][]
): ValidationResult {
  // Validate each row against solution
  const rows = currentGrid.map((row, i) => validateLine(row, solution[i]));

  // Extract and validate each column
  const numCols = solution[0]?.length || 0;
  const columns: ValidationState[] = [];
  for (let col = 0; col < numCols; col++) {
    const currentColumn: CellState[] = [];
    const solutionColumn: boolean[] = [];
    for (let row = 0; row < currentGrid.length; row++) {
      currentColumn.push(currentGrid[row][col]);
      solutionColumn.push(solution[row][col]);
    }
    columns.push(validateLine(currentColumn, solutionColumn));
  }

  // Check if grid is complete: no 'empty' cells remain
  // All cells must be either 'filled' or 'marked' (player has made a decision)
  const isComplete = !currentGrid.flat().includes('empty');

  // Check if all rows and columns are valid
  const allValid =
    rows.every(state => state === 'valid') &&
    columns.every(state => state === 'valid');

  return {
    rows,
    columns,
    isComplete,
    isValid: isComplete && allValid
  };
}
