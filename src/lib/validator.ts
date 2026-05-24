/**
 * Validator - Pure functions for validating puzzle state
 *
 * Validates the current player's grid state against target clues.
 * Checks each row and column independently to determine if they are:
 * - 'valid': Complete and matches clues exactly
 * - 'error': Cannot possibly match clues
 * - 'in-progress': Could still match clues with more input
 */

import type { CellState, ValidationState, ValidationResult } from '@/types';
import { calculateRowClues } from './clueCalculator';

/**
 * Validates a single row against its target clue.
 *
 * @param currentRow - Array of cell states representing current player input
 * @param targetClue - Expected clue numbers for this row
 * @returns ValidationState indicating if row is valid, error, or in-progress
 */
export function validateRow(
  currentRow: CellState[],
  targetClue: number[]
): ValidationState {
  // Convert current row to boolean array (ignore marked cells)
  const filledCells = currentRow.map(cell => cell === 'filled');

  // Calculate current clues
  const currentClues = calculateRowClues([filledCells])[0];

  // Check if current clues match target clues exactly
  const cluesMatch =
    currentClues.length === targetClue.length &&
    currentClues.every((clue, i) => clue === targetClue[i]);

  // If clues match exactly, the row is valid regardless of empty cells
  // (empty cells between groups are fine as long as groups are correct)
  if (cluesMatch) {
    return 'valid';
  }

  // Check if row is complete (no empty cells) but doesn't match
  const isComplete = !currentRow.includes('empty');
  if (isComplete) {
    // Complete but doesn't match clues = error
    return 'error';
  }

  // If not complete, check if current state could lead to target
  // If current clues already exceed target, it's an error
  if (currentClues.length > targetClue.length) {
    return 'error';
  }

  // Check if any current clue exceeds corresponding target clue
  for (let i = 0; i < currentClues.length; i++) {
    if (currentClues[i] > (targetClue[i] || 0)) {
      return 'error';
    }
  }

  return 'in-progress';
}

/**
 * Validates the entire puzzle grid.
 *
 * @param grid - 2D array of cell states representing player's current progress
 * @param rowClues - Target clues for each row
 * @param columnClues - Target clues for each column
 * @returns ValidationResult with row/column states and completion info
 */
export function validateGrid(
  grid: CellState[][],
  rowClues: number[][],
  columnClues: number[][]
): ValidationResult {
  // Validate each row
  const rows = grid.map((row, i) => validateRow(row, rowClues[i]));

  // Transpose grid to get columns
  const numCols = grid[0]?.length || 0;
  const columns: CellState[][] = [];
  for (let col = 0; col < numCols; col++) {
    const column: CellState[] = [];
    for (let row = 0; row < grid.length; row++) {
      column.push(grid[row][col]);
    }
    columns.push(column);
  }

  // Validate each column
  const cols = columns.map((col, i) => validateRow(col, columnClues[i]));

  // Check if grid is complete (no empty cells)
  const isComplete = !grid.flat().includes('empty');

  // Check if all rows and columns are valid
  const isValid =
    rows.every(state => state === 'valid') &&
    cols.every(state => state === 'valid');

  return {
    rows,
    columns: cols,
    isComplete,
    isValid: isComplete && isValid
  };
}
