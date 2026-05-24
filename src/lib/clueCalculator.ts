/**
 * Clue Calculator - Pure functions for computing nonogram clues
 *
 * Computes row and column clues from a binary solution matrix.
 * Clues represent consecutive groups of filled cells (true values).
 *
 * Examples:
 * - [true, true, false, true] → [2, 1]
 * - [false, false, false] → []
 * - [true, true, true] → [3]
 */

/**
 * Calculates clues for a single row or column.
 * Groups consecutive true values and returns their counts.
 *
 * @param cells - Array of boolean values representing filled/empty cells
 * @returns Array of numbers representing consecutive filled cell groups
 */
function calculateCluesForLine(cells: boolean[]): number[] {
  const clues: number[] = [];
  let currentGroup = 0;

  for (const cell of cells) {
    if (cell) {
      currentGroup++;
    } else if (currentGroup > 0) {
      clues.push(currentGroup);
      currentGroup = 0;
    }
  }

  // Don't forget the last group if line ends with filled cells
  if (currentGroup > 0) {
    clues.push(currentGroup);
  }

  // Empty lines return [] per nonogram convention
  return clues;
}

/**
 * Calculates row clues for a puzzle solution.
 *
 * @param solution - 2D boolean matrix representing the puzzle solution
 * @returns Array of clue arrays, one for each row
 */
export function calculateRowClues(solution: boolean[][]): number[][] {
  if (solution.length === 0) {
    return [];
  }

  return solution.map(row => calculateCluesForLine(row));
}

/**
 * Calculates column clues for a puzzle solution.
 * Extracts each column from the 2D matrix and calculates its clues.
 *
 * @param solution - 2D boolean matrix representing the puzzle solution
 * @returns Array of clue arrays, one for each column
 */
export function calculateColumnClues(solution: boolean[][]): number[][] {
  if (solution.length === 0) {
    return [];
  }

  // Handle edge case: empty rows
  if (solution[0].length === 0) {
    return [];
  }

  const numColumns = solution[0].length;
  const columnClues: number[][] = [];

  // Extract each column and calculate clues
  for (let col = 0; col < numColumns; col++) {
    const column: boolean[] = [];

    for (let row = 0; row < solution.length; row++) {
      column.push(solution[row][col]);
    }

    columnClues.push(calculateCluesForLine(column));
  }

  return columnClues;
}
